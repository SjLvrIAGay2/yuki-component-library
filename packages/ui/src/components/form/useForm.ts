import { useRef } from 'react';
import type { Fallback } from '../../locale';

export type NamePath = string | number | Array<string | number>;
export type Store = Record<string, unknown>;

export interface FormRule {
  required?: boolean;
  /** Overrides every generated message. */
  message?: string;
  /** `number` compares values, other types compare lengths. */
  min?: number;
  max?: number;
  len?: number;
  pattern?: RegExp;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'email' | 'url';
  enum?: unknown[];
  /** Reject strings made only of whitespace (implies required). */
  whitespace?: boolean;
  transform?: (value: unknown) => unknown;
  /** Throw / reject with an `Error` (or any string) to fail. */
  validator?: (value: unknown, form: FormInstance) => void | Promise<void>;
}

export interface ValidateError {
  name: NamePath;
  message: string;
}

export interface ValidateOptions {
  /** Only validate these fields. */
  names?: NamePath[];
}

export type ValidateTrigger = 'onChange' | 'onBlur' | 'onSubmit' | 'none';

export interface FieldMeta {
  name: NamePath;
  key: string;
  dependencies: NamePath[];
  initialValue?: unknown;
  /** Runs validation and pushes errors into the owning `Form.Item`. */
  validate: () => Promise<string[]>;
  /** Clears errors inside the owning `Form.Item`. */
  reset: () => void;
  getErrors: () => string[];
  isValidating: () => boolean;
}

export interface FormCallbacks<Values extends Store = Store> {
  onFinish?: (values: Values) => void;
  onFinishFailed?: (errors: ValidateError[], values: Values) => void;
  onValuesChange?: (changed: Store, all: Values) => void;
}

export interface FormInstance<Values extends Store = Store> {
  getFieldValue: (name: NamePath) => unknown;
  getFieldsValue: () => Values;
  setFieldValue: (name: NamePath, value: unknown) => void;
  setFieldsValue: (values: Store) => void;
  resetFields: (names?: NamePath[]) => void;
  clearFields: (names?: NamePath[]) => void;
  validateFields: (options?: ValidateOptions | NamePath[]) => Promise<Values>;
  validateField: (name: NamePath) => Promise<string[]>;
  getFieldError: (name: NamePath) => string[];
  getFieldsError: (names?: NamePath[]) => ValidateError[];
  isFieldValidating: (name: NamePath) => boolean;
  submit: () => void;
  subscribe: (listener: () => void) => () => void;
  /** @internal */
  __register: (meta: FieldMeta) => () => void;
  /** @internal */
  __setInitialValues: (values: Store) => void;
  /** @internal */
  __seedList: (name: NamePath, value: unknown[]) => void;
  /** @internal */
  __setCallbacks: (callbacks: FormCallbacks<Values>) => void;
  /** @internal */
  __setFormElement: (element: HTMLFormElement | null) => void;
  /** @internal */
  __notify: () => void;
}

/* -------------------------------------------------------------------------- */
/* Path helpers                                                               */
/* -------------------------------------------------------------------------- */

export function toPath(name: NamePath): Array<string | number> {
  return Array.isArray(name) ? name : [name];
}

export function nameToKey(name: NamePath): string {
  return JSON.stringify(toPath(name));
}

export function getIn(source: unknown, path: readonly (string | number)[]): unknown {
  let current: unknown = source;
  for (const segment of path) {
    if (current == null || !Object.hasOwn(current, segment)) return undefined;
    current = (current as Store)[segment];
  }
  return current;
}

export function setIn(source: unknown, path: Array<string | number>, value: unknown): unknown {
  if (path.length === 0) return value;
  const head = path[0]!;
  const rest = path.slice(1);
  const current = getIn(source, [head]);
  const bucket = Array.isArray(source) ? [...source] : { ...(source as Store) };
  const next = rest.length === 0 ? value : setIn(current ?? (typeof rest[0] === 'number' ? [] : {}), rest, value);
  // A user-defined field named "__proto__" is an ordinary own property.
  if (head === '__proto__') {
    Object.defineProperty(bucket, head, { value: next, enumerable: true, writable: true, configurable: true });
  } else {
    (bucket as Store)[head] = next;
  }
  return bucket;
}

function fillInitialValues(current: unknown, initial: unknown): unknown {
  if (current === undefined) return initial;
  if (Array.isArray(current) && Array.isArray(initial)) {
    const result = initial.slice();
    current.forEach((value, index) => { result[index] = fillInitialValues(value, initial[index]); });
    return result;
  }
  if (isPlainObject(current) && isPlainObject(initial)) {
    const result = { ...initial, ...current };
    for (const key of Object.keys(initial)) {
      result[key] = fillInitialValues(getIn(current, [key]), initial[key]);
    }
    return result;
  }
  return current;
}

function isPlainObject(value: unknown): value is Store {
  return value != null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}

function isRelated(a: NamePath, b: NamePath): boolean {
  const pa = toPath(a);
  const pb = toPath(b);
  const shorter = pa.length <= pb.length ? pa : pb;
  const longer = pa.length <= pb.length ? pb : pa;
  for (let index = 0; index < shorter.length; index += 1) {
    if (String(shorter[index]) !== String(longer[index])) return false;
  }
  return true;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

type TFunction = (
  key: string,
  fallback?: Fallback,
  vars?: Record<string, string | number>,
) => string;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const URL_PATTERN = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
}

function lengthMessage(size: number, kind: 'min' | 'max' | 'len', numeric: boolean, t: TFunction): string {
  const messages = numeric ? {
    len: ['必须等于 {size}', 'Must equal {size}'],
    min: ['不能小于 {size}', 'Must be no less than {size}'],
    max: ['不能大于 {size}', 'Must be no greater than {size}'],
  } : {
    len: ['长度必须为 {size}', 'Length must be {size}'],
    min: ['长度不能少于 {size}', 'Length must be at least {size}'],
    max: ['长度不能超过 {size}', 'Length must be at most {size}'],
  };
  const [zh, en] = messages[kind];
  return t(`form.rule.${kind}${numeric ? 'Number' : ''}`, { zh, en }, { size });
}

function builtInRuleError(current: unknown, rule: FormRule, t: TFunction): string | undefined {
  if (isEmpty(current) || (rule.whitespace && typeof current === 'string' && !current.trim())) {
    if (rule.required || rule.whitespace) {
      return t('common.required', { zh: '此项为必填项', en: 'This field is required' });
    }
    return undefined;
  }

  if (rule.type) {
    let valid: boolean;
    switch (rule.type) {
      case 'array': valid = Array.isArray(current); break;
      case 'email': valid = typeof current === 'string' && EMAIL_PATTERN.test(current); break;
      case 'url': valid = typeof current === 'string' && URL_PATTERN.test(current); break;
      case 'number': valid = typeof current === 'number' && !Number.isNaN(current); break;
      default: valid = typeof current === rule.type;
    }
    if (!valid) {
      return t('form.rule.type', {
        zh: `格式不正确（应为 ${rule.type}）`, en: `Invalid format (expected ${rule.type})`,
      });
    }
  }
  if (rule.enum && !rule.enum.some(entry => Object.is(entry, current))) {
    return t('form.rule.enum', { zh: '值不在允许范围内', en: 'Value is not allowed' });
  }
  const measure = typeof current === 'number' ? current
    : typeof current === 'string' || Array.isArray(current) ? current.length : undefined;
  if (measure !== undefined) {
    const numeric = typeof current === 'number';
    if (rule.len !== undefined && measure !== rule.len) return lengthMessage(rule.len, 'len', numeric, t);
    if (rule.min !== undefined && measure < rule.min) return lengthMessage(rule.min, 'min', numeric, t);
    if (rule.max !== undefined && measure > rule.max) return lengthMessage(rule.max, 'max', numeric, t);
  }
  if (rule.pattern && typeof current === 'string' && !new RegExp(rule.pattern).test(current)) {
    return t('form.rule.pattern', { zh: '格式不匹配', en: 'The value does not match the required pattern' });
  }
}

/** Validate each transformed value and report the first failure of each rule, in order. */
export async function runRules(
  value: unknown,
  rules: FormRule[],
  form: FormInstance,
  t: TFunction,
): Promise<string[]> {
  const errors: string[] = [];
  for (const rule of rules) {
    try {
      const current = rule.transform ? rule.transform(value) : value;
      const error = builtInRuleError(current, rule, t);
      if (error !== undefined) errors.push(rule.message ?? error);
      else if (rule.validator) await rule.validator(current, form);
    } catch (error) {
      errors.push(rule.message ?? (error instanceof Error ? error.message : String(error)));
    }
  }
  return errors;
}

/* -------------------------------------------------------------------------- */
/* Store                                                                       */
/* -------------------------------------------------------------------------- */

export function createFormInstance<Values extends Store = Store>(): FormInstance<Values> {
  let store: Store = {};
  let initialValues: Store = {};
  const listeners = new Set<() => void>();
  const metas = new Map<string, FieldMeta>();
  let callbacks: FormCallbacks<Values> = {};
  let formElement: HTMLFormElement | null = null;

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const getFieldValue = (name: NamePath) => getIn(store, toPath(name));

  const getFieldsValue = () => ({ ...store }) as Values;

  const publishChanges = (changed: Store, paths: NamePath[]) => {
    callbacks.onValuesChange?.(changed, getFieldsValue());
    notify();
    metas.forEach((meta) => {
      if (meta.dependencies.some(dependency => paths.some(path => isRelated(dependency, path)))) {
        void meta.validate();
      }
    });
  };

  const setFieldValue = (name: NamePath, value: unknown) => {
    if (Object.is(getFieldValue(name), value)) return;
    const path = toPath(name);
    store = setIn(store, path, value) as Store;
    publishChanges(setIn({}, path, value) as Store, [name]);
  };

  const setFieldsValue = (values: Store) => {
    const entries = Object.entries(values).filter(([key, value]) => !Object.is(getFieldValue(key), value));
    if (!entries.length) return;
    const changed = Object.fromEntries(entries);
    store = { ...store, ...changed };
    publishChanges(changed, Object.keys(changed));
  };

  const resetFields = (names?: NamePath[]) => {
    let next = names ? store : { ...initialValues };
    for (const name of names ?? []) {
      const path = toPath(name);
      next = setIn(next, path, getIn(initialValues, path)) as Store;
    }
    metas.forEach(meta => {
      if (names && !names.some(name => isRelated(name, meta.name))) return;
      const resetValue = !names || names.some(name => toPath(name).length <= toPath(meta.name).length && isRelated(name, meta.name));
      if (resetValue && meta.initialValue !== undefined) next = setIn(next, toPath(meta.name), meta.initialValue) as Store;
      meta.reset();
    });
    store = next;
    notify();
  };

  const clearFields = (names?: NamePath[]) => {
    const targets = names
      ? names.map((name) => metas.get(nameToKey(name))).filter(Boolean)
      : [...metas.values()];
    (targets as FieldMeta[]).forEach((meta) => meta.reset());
  };

  const validateField = async (name: NamePath): Promise<string[]> => {
    const meta = metas.get(nameToKey(name));
    if (!meta) return [];
    return meta.validate();
  };

  const validateFields = async (
    options?: ValidateOptions | NamePath[],
  ): Promise<Values> => {
    const names = Array.isArray(options) ? options : options?.names;
    const targets = names
      ? names
          .map((name) => metas.get(nameToKey(name)))
          .filter((meta): meta is FieldMeta => Boolean(meta))
      : [...metas.values()];

    const values = getFieldsValue();
    const results = await Promise.all(targets.map(async meta =>
      (await meta.validate()).map(message => ({ name: meta.name, message })),
    ));
    const errors = results.flat();

    if (errors.length > 0) {
      const error = new Error('Validation failed') as Error & {
        errors: ValidateError[];
        values: Values;
      };
      error.errors = errors;
      error.values = values;
      throw error;
    }
    return values;
  };

  const getFieldsError = (names?: NamePath[]): ValidateError[] => {
    const list = names
      ? names.map((name) => metas.get(nameToKey(name))).filter(Boolean)
      : [...metas.values()];
    const errors: ValidateError[] = [];
    (list as FieldMeta[]).forEach((meta) => {
      meta.getErrors().forEach((message) => errors.push({ name: meta.name, message }));
    });
    return errors;
  };

  const instance: FormInstance<Values> = {
    getFieldValue,
    getFieldsValue,
    setFieldValue,
    setFieldsValue,
    resetFields,
    clearFields,
    validateFields,
    validateField,
    getFieldError: (name) => metas.get(nameToKey(name))?.getErrors() ?? [],
    getFieldsError,
    isFieldValidating: (name) => metas.get(nameToKey(name))?.isValidating() ?? false,
    submit: () => {
      if (formElement) {
        formElement.requestSubmit();
      } else {
        void validateFields()
          .then((values) => callbacks.onFinish?.(values))
          .catch((error: { errors?: ValidateError[]; values?: Values }) => {
            callbacks.onFinishFailed?.(error.errors ?? [], (error.values ?? {}) as Values);
          });
      }
    },
    subscribe,
    __register: (meta) => {
      metas.set(meta.key, meta);
      if (meta.initialValue !== undefined && getIn(store, toPath(meta.name)) === undefined) {
        store = setIn(store, toPath(meta.name), meta.initialValue) as Store;
        notify();
      }
      return () => {
        metas.delete(meta.key);
      };
    },
    __setInitialValues: (values) => {
      initialValues = fillInitialValues(initialValues, values) as Store;
      store = fillInitialValues(store, values) as Store;
      notify();
    },
    __seedList: (name, value) => {
      const path = toPath(name);
      initialValues = setIn(initialValues, path, value) as Store;
      if (getFieldValue(name) === undefined) setFieldValue(name, value);
    },
    __setCallbacks: (next) => {
      callbacks = next;
    },
    __setFormElement: (element) => {
      formElement = element;
    },
    __notify: notify,
  };

  return instance;
}

/**
 * Creates (or adopts) a form store. Call once per form:
 * `const [form] = Form.useForm()` and pass it to `<Form form={form}>`.
 */
export function useForm<Values extends Store = Store>(
  form?: FormInstance<Values>,
): [FormInstance<Values>] {
  const ref = useRef<FormInstance<Values> | null>(null);
  if (ref.current === null) {
    ref.current = form ?? createFormInstance<Values>();
  }
  return [ref.current];
}

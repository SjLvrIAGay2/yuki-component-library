import { useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { FormContext, useFormContext } from './FormContext';
import { getIn, setIn, toPath, type NamePath, type Store } from './useForm';

export interface FormListField {
  /** Use as the React key. Stays with the row during add, remove and move. */
  key: number;
  /** Current index. Append it to the list path for a nested field. */
  name: number;
}

export interface FormListOperations {
  add: (defaultValue?: unknown, index?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}

export interface FormListProps {
  /** Path of the array value inside the form store. */
  name: NamePath;
  /** Seeds the array when the store value is still empty. */
  initialValue?: unknown[];
  children: (fields: FormListField[], operations: FormListOperations) => ReactNode;
}

const EMPTY: unknown[] = [];

/**
 * Sugar for dynamic (repeatable) fields. It subscribes to an array value and
 * hands the current entries plus `add` / `remove` / `move` to the render prop;
 * append the index to the full path, e.g. `['users', field.name, 'email']`.
 */
export function FormList(props: FormListProps) {
  const { name, initialValue, children } = props;
  const context = useFormContext();
  const { form } = context;
  const inherited = getIn(context.initialValues, toPath(name));
  // Descendant fields must see the same initial rows as the list during hydration.
  const scopedContext = useMemo(() => {
    if (inherited !== undefined || initialValue === undefined) return context;
    return { ...context, initialValues: setIn(context.initialValues, toPath(name), initialValue) as Store };
  }, [context, inherited, initialValue, name]);
  const getList = () => {
    const value = form.getFieldValue(name);
    return Array.isArray(value) ? value : EMPTY;
  };
  const list = useSyncExternalStore(form.subscribe, getList, () => {
    if (form.getFieldValue(name) !== undefined) return getList();
    const initial = inherited === undefined ? initialValue : inherited;
    return Array.isArray(initial) ? initial : EMPTY;
  });

  useEffect(() => {
    if (initialValue !== undefined && inherited === undefined && form.getFieldValue(name) === undefined) {
      form.__seedList(name, initialValue);
    }
  }, [form, name, initialValue, inherited]);

  const keys = useRef<number[]>([]);
  const nextKey = useRef(0);
  // External replacement is positional. List operations move the keys with their rows.
  keys.current.length = Math.min(keys.current.length, list.length);
  while (keys.current.length < list.length) keys.current.push(nextKey.current++);
  const fields = list.map((_, index) => ({ key: keys.current[index]!, name: index }));

  const operations: FormListOperations = {
    add: (value, at) => {
      const next = [...getList()];
      const index = at ?? next.length;
      next.splice(index, 0, value);
      keys.current.splice(index, 0, nextKey.current++);
      form.setFieldValue(name, next);
    },
    remove: (index) => {
      const removed = new Set(Array.isArray(index) ? index : [index]);
      keys.current = keys.current.filter((_, position) => !removed.has(position));
      form.setFieldValue(name, getList().filter((_, position) => !removed.has(position)));
    },
    move: (from, to) => {
      const next = [...getList()];
      if (from === to || !Number.isInteger(from) || !Number.isInteger(to)
        || from < 0 || to < 0 || from >= next.length || to >= next.length) return;
      const [row] = next.splice(from, 1);
      const [key] = keys.current.splice(from, 1);
      next.splice(to, 0, row);
      keys.current.splice(to, 0, key!);
      form.setFieldValue(name, next);
    },
  };

  return <FormContext.Provider value={scopedContext}>{children(fields, operations)}</FormContext.Provider>;
}

FormList.displayName = 'FormList';

import { cx } from './cx';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}

/** Merge declared configuration and part props; no mutation of either input. */
export function mergeProps<Props extends object>(
  base: Partial<Props> | undefined,
  instance: Props,
): Props {
  const result = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(instance)) {
    if (value === undefined) continue;
    const previous = result[key];
    if (key === 'className' && typeof value === 'string') {
      result[key] = cx(typeof previous === 'string' ? previous : undefined, value);
    } else if (
      key.startsWith('on') &&
      typeof previous === 'function' &&
      typeof value === 'function' &&
      previous !== value
    ) {
      result[key] = (...args: unknown[]) => {
        const outcome = value(...args);
        const event = args[0];
        if (
          !event ||
          typeof event !== 'object' ||
          !('defaultPrevented' in event) ||
          !event.defaultPrevented
        )
          previous(...args);
        return outcome;
      };
    } else if (isRecord(previous) && isRecord(value) && !('$$typeof' in value)) {
      result[key] = mergeProps(previous, value);
    } else {
      result[key] = value;
    }
  }
  return result as Props;
}

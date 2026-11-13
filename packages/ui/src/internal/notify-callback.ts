/** Consumer callbacks are not part of document parsing; report their exceptions independently. */
export function notifyCallback<Args extends unknown[]>(
  callback: ((...args: Args) => void) | undefined,
  ...args: Args
) {
  try {
    callback?.(...args);
  } catch (cause) {
    if (typeof globalThis.reportError === 'function') globalThis.reportError(cause);
    else
      queueMicrotask(() => {
        throw cause;
      });
  }
}

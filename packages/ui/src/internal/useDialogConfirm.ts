import { useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/** Only the current opening can be closed by an asynchronous confirmation. */
export function useDialogConfirm(open: boolean, confirm: (() => void | Promise<void>) | undefined, close: () => void) {
  const [pending, setPending] = useState(false);
  const request = useRef<Promise<void> | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!open) setPending(false);
    return () => { request.current = null; };
  }, [open]);

  const submit = () => {
    if (request.current) return;
    const result = confirm?.();
    if (!result) {
      close();
      return;
    }
    const current = Promise.resolve(result);
    request.current = current;
    setPending(true);
    const finish = (success: boolean) => {
      if (request.current !== current) return;
      request.current = null;
      setPending(false);
      if (success) close();
    };
    current.then(() => finish(true), () => finish(false));
  };

  return { pending, submit };
}

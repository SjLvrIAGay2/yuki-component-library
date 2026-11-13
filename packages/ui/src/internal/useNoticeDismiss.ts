import { useEffect, useRef, useState } from 'react';
import { useEventCallback } from '../hooks/useEventCallback';

/** A mounted notice can be dismissed once by its timer or by the caller. */
export function useNoticeDismiss(duration = 0, onDismiss?: () => void) {
  const [visible, setVisible] = useState(true);
  const dismissed = useRef(false);
  const dismiss = useEventCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    setVisible(false);
    onDismiss?.();
  });
  useEffect(() => {
    if (!visible || !Number.isFinite(duration) || duration <= 0) return;
    const timer = window.setTimeout(dismiss, duration);
    return () => window.clearTimeout(timer);
  }, [duration, visible, dismiss]);
  return { visible, dismiss };
}

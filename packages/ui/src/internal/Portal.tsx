import { useEffect, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useConfig } from '../theme/ConfigProvider';

export interface PortalProps {
  children: ReactNode;
  /** Override the mount node; defaults to the ConfigProvider popup host. */
  container?: HTMLElement | null;
  /** Anchor used by the provider to choose a mount point for a floating control. */
  anchorRef?: RefObject<HTMLElement | null>;
  /** Render in place (useful for tests / embedded previews). */
  disabled?: boolean;
}

/** Render overlay content into the nearest theme-aware popup host. */
export function Portal({ children, container, anchorRef, disabled = false }: PortalProps): ReactNode {
  const { getPopupContainer } = useConfig();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (disabled) return children;
  if (!mounted || typeof document === 'undefined') return null;

  const target = container ?? getPopupContainer(anchorRef?.current ?? null) ?? document.body;
  return createPortal(children, target);
}

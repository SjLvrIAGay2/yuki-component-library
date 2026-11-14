import { useEffect, useState } from 'react';

export interface UseInViewOptions {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
  disabled?: boolean;
}

/** Observe the attached node, including nodes mounted after the initial render. */
export function useInView<T extends Element = HTMLElement>({
  root = null, rootMargin = '0px', threshold = 0, once = false, disabled = false,
}: UseInViewOptions = {}) {
  const [node, ref] = useState<T | null>(null);
  const [visibleNode, setVisibleNode] = useState<T | null>(null);
  useEffect(() => {
    setVisibleNode(null);
    if (!node || disabled || typeof IntersectionObserver === 'undefined') return;
    let observing = true;
    const observer = new IntersectionObserver(entries => {
      const entry = entries[entries.length - 1];
      if (!observing || !entry) return;
      const visible = entry.isIntersecting && entry.intersectionRatio >= threshold;
      setVisibleNode(visible ? node : null);
      if (once && visible) observer.disconnect();
    }, { root, rootMargin, threshold });
    observer.observe(node);
    return () => { observing = false; observer.disconnect(); };
  }, [node, root, rootMargin, threshold, once, disabled]);
  return { ref, inView: !disabled && node !== null && visibleNode === node };
}

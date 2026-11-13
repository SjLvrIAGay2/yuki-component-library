import { useEffect, useRef, useState } from 'react';

/** Fullscreen chrome follows its own hover region, with explicit interaction holds. */
export function useVideoControlsVisibility(
  container: HTMLElement | null,
  caption: HTMLElement | null,
  enabled: boolean,
  menuOpen = false,
) {
  const [fullscreen, setFullscreen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [touchVisible, setTouchVisible] = useState(false);
  const inputMode = useRef<'keyboard' | 'mouse' | 'touch' | null>(null);
  const menuActive = useRef(menuOpen);
  menuActive.current = menuOpen;
  useEffect(() => {
    const update = () => setFullscreen(!!container && document.fullscreenElement === container);
    const pointer = (event: PointerEvent) => {
      inputMode.current = event.pointerType === 'touch' ? 'touch' : 'mouse';
    };
    const keyboard = (event: KeyboardEvent) => {
      if (
        event.key === 'Tab' ||
        (event.target instanceof Node && container?.contains(event.target))
      )
        inputMode.current = 'keyboard';
    };
    document.addEventListener('fullscreenchange', update);
    document.addEventListener('pointerdown', pointer, true);
    document.addEventListener('keydown', keyboard, true);
    update();
    return () => {
      document.removeEventListener('fullscreenchange', update);
      document.removeEventListener('pointerdown', pointer, true);
      document.removeEventListener('keydown', keyboard, true);
    };
  }, [container]);
  useEffect(() => {
    setHovered(false);
    setKeyboardFocus(false);
    setPressed(false);
    setTouchVisible(false);
    if (!container || !caption || !fullscreen || !enabled) return;
    let alive = true;
    let keyboardMode =
      inputMode.current === 'keyboard' ||
      (inputMode.current === null && !!document.activeElement?.matches(':focus-visible'));
    const pointers = new Set<number>();
    const focused = () => caption.contains(document.activeElement);
    const within = (event: PointerEvent) => {
      const bounds = caption.getBoundingClientRect();
      return (
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom
      );
    };
    // Touch browsers can retain :hover and focus-visible after a tap.
    setHovered(inputMode.current !== 'touch' && caption.matches(':hover'));
    setKeyboardFocus(keyboardMode && focused());
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') setHovered(true);
    };
    const leave = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') setHovered(false);
    };
    const down = (event: PointerEvent) => {
      keyboardMode = false;
      setKeyboardFocus(false);
      const target = event.target instanceof Node ? event.target : null;
      if (!target || !container.contains(target)) return;
      const inCaption = caption.contains(target);
      if (event.pointerType === 'touch')
        setTouchVisible((visible) => inCaption || menuActive.current || !visible);
      else setTouchVisible(false);
      if (inCaption) {
        pointers.add(event.pointerId);
        setPressed(true);
      }
    };
    const up = (event: PointerEvent) => {
      if (pointers.delete(event.pointerId)) setPressed(pointers.size > 0);
      // Portaled menus can suppress pointerleave; resolve the actual bottom region on release.
      if (event.pointerType !== 'touch') setHovered(within(event));
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') setHovered(within(event));
    };
    const windowBlur = () => {
      pointers.clear();
      setPressed(false);
      setHovered(false);
      setKeyboardFocus(false);
      setTouchVisible(false);
    };
    const key = (event: KeyboardEvent) => {
      const target = event.target instanceof Node ? event.target : null;
      if (event.key !== 'Tab' && (!target || !caption.contains(target))) return;
      keyboardMode = true;
      setTouchVisible(false);
      // Reveal before the browser advances Tab focus into the transparent toolbar.
      setKeyboardFocus(true);
    };
    const focus = () => setKeyboardFocus(keyboardMode && focused());
    const blur = () =>
      queueMicrotask(() => {
        if (alive) focus();
      });
    caption.addEventListener('pointerenter', enter);
    caption.addEventListener('pointerleave', leave);
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('pointerup', up, true);
    document.addEventListener('pointercancel', up, true);
    document.addEventListener('pointermove', move, true);
    document.addEventListener('keydown', key, true);
    document.addEventListener('focusin', focus);
    document.addEventListener('focusout', blur);
    window.addEventListener('blur', windowBlur);
    return () => {
      alive = false;
      caption.removeEventListener('pointerenter', enter);
      caption.removeEventListener('pointerleave', leave);
      document.removeEventListener('pointerdown', down, true);
      document.removeEventListener('pointerup', up, true);
      document.removeEventListener('pointercancel', up, true);
      document.removeEventListener('pointermove', move, true);
      document.removeEventListener('keydown', key, true);
      document.removeEventListener('focusin', focus);
      document.removeEventListener('focusout', blur);
      window.removeEventListener('blur', windowBlur);
    };
  }, [container, caption, fullscreen, enabled]);
  return {
    fullscreen,
    hidden:
      fullscreen && enabled && !hovered && !keyboardFocus && !pressed && !touchVisible && !menuOpen,
  };
}

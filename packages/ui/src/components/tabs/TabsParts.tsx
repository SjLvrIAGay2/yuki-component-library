import {
  createContext,
  useContext,
  useRef,
  forwardRef,
  type ComponentPropsWithoutRef,
} from 'react';
import * as Primitive from '@radix-ui/react-tabs';
import { cx } from '../../internal/cx';
import { inertValue } from '../../internal/inert';
import { useComponentSize } from '../../theme';
import { useAnimation, type AnimationOptions } from '../../animation';
interface CompoundTabsProps extends Omit<ComponentPropsWithoutRef<typeof Primitive.Root>, 'value' | 'defaultValue'> {
  value: string;
  variant?: 'line' | 'segmented' | 'card';
  size?: 'sm' | 'md' | 'lg';
  animation?: AnimationOptions | false;
}
const TabsContext = createContext<{ value?: string; animation?: AnimationOptions | false }>({});
export const CompoundTabs = forwardRef<HTMLDivElement, CompoundTabsProps>(function CompoundTabs(input, ref) {
  const {
    variant = 'line',
    size: sizeProp,
    className,
    animation,
    ...props
  } = input;
  const size = useComponentSize(sizeProp);
  const pendingChange = useRef<string>();
  const handleValueChange = (next: string) => {
    // Radix requests activation on both focus and mouse-down during one click.
    if (pendingChange.current === next) return;
    pendingChange.current = next;
    queueMicrotask(() => { pendingChange.current = undefined; });
    props.onValueChange?.(next);
  };
  return (
    <TabsContext.Provider value={{ value: props.value, animation }}>
      <Primitive.Root
        {...props}
        ref={ref}
        onValueChange={handleValueChange}
        className={cx('yuki-tabs', `yuki-tabs--${variant}`, `yuki-tabs--${size}`, `yuki-tabs--${props.orientation ?? 'horizontal'}`, className)}
      />
    </TabsContext.Provider>
  );
});
export const TabsList = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof Primitive.List>>(
  function TabsList({ className, ...props }, ref) {
    return <div className="yuki-tabs__nav"><Primitive.List {...props} ref={ref} className={cx('yuki-tabs__tablist', className)} /></div>;
  },
);
export const TabsTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof Primitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return <Primitive.Trigger {...props} ref={ref} className={cx('yuki-tabs__tab', className)} />;
});
export interface TabsContentProps extends ComponentPropsWithoutRef<typeof Primitive.Content> {
  animation?: AnimationOptions | false;
}
export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { className, style, animation, ...props },
  ref,
) {
  const context = useContext(TabsContext);
  const active = context.value === props.value;
  const { duration, delay, ...motion } = useAnimation(
    animation === undefined ? context.animation : animation,
    'fade',
  );
  return (
    <Primitive.Content
      {...props}
      {...motion}
      ref={ref}
      className={cx('yuki-tabs__content', 'yuki-tabs__panel', motion.className, className)}
      style={{ ...motion.style, ...style }}
      hidden={props.hidden || !active}
      aria-hidden={!active || props['aria-hidden']}
      inert={inertValue(!active || props.inert)}
    />
  );
});

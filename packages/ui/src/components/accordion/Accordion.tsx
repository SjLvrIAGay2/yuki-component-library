import type { WithStyle } from '../../styles/properties';
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import * as Primitive from '@radix-ui/react-accordion';
import { Slottable } from '@radix-ui/react-slot';
import { AccordionContext, AccordionRoot, type RootProps } from './AccordionRoot';
import { AccordionPanels, type PanelOptions } from './AccordionPanels';
import { cx } from '../../internal/cx';
import { Icon } from '../icon';
import { inertValue } from '../../internal/inert';
import { useComponentDefaults } from '../../theme';
import { useAnimation, usePresence, type AnimationOptions } from '../../animation';

export type AccordionProps = RootProps & (
  | (PanelOptions & { children?: never; asChild?: never; animation?: never })
  | { items?: never; animation?: AnimationOptions | false }
);
export type { AccordionPanel, AccordionClassNames, AccordionStyles } from './AccordionPanels';

const ItemContext = createContext(false);

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(input, ref) {
  const props = useComponentDefaults('Accordion', input);
  if (props.items !== undefined) return <AccordionPanels {...props} ref={ref} />;
  return <AccordionRoot {...props} ref={ref} className={cx('yuki-accordion', props.className)} />;
});

export const AccordionItem = forwardRef<
  HTMLDivElement,
  WithStyle<ComponentPropsWithoutRef<typeof Primitive.Item>>
>(function AccordionItem({ className, ...props }, ref) {
  const { values } = useContext(AccordionContext);
  return (
    <ItemContext.Provider value={values.includes(props.value)}>
      <Primitive.Item {...props} ref={ref} className={cx('yuki-accordion-item', className)} />
    </ItemContext.Provider>
  );
});

export interface AccordionTriggerProps extends WithStyle<ComponentPropsWithoutRef<typeof Primitive.Trigger>> {
  headerProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Header>>;
  indicator?: ReactNode;
  indicatorProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
}
export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(
    {
      children,
      className,
      headerProps,
      indicator = <Icon name="chevron-down" />,
      indicatorProps,
      ...props
    },
    ref,
  ) {
    return (
      <Primitive.Header
        {...headerProps}
        className={cx('yuki-accordion-header', headerProps?.className)}
      >
        <Primitive.Trigger {...props} ref={ref} className={cx('yuki-accordion-trigger', className)}>
          <Slottable>{children}</Slottable>
          {indicator !== null && indicator !== false && (
            <span
              {...indicatorProps}
              className={cx('yuki-accordion-indicator', indicatorProps?.className)}
              aria-hidden="true"
            >
              {indicator}
            </span>
          )}
        </Primitive.Trigger>
      </Primitive.Header>
    );
  },
);

export interface AccordionContentProps extends WithStyle<ComponentPropsWithoutRef<typeof Primitive.Content>> {
  bodyProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  animation?: AnimationOptions | false;
}
export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent(
    { className, style, children, asChild, bodyProps, animation, forceMount, hidden, ...props },
    ref,
  ) {
    const open = useContext(ItemContext);
    const parent = useContext(AccordionContext);
    const { duration, delay, ...motion } = useAnimation(animation ?? parent.animation, 'collapse');
    const present = usePresence(open, duration, delay);
    const body = (content: ReactNode) => (
      <div className="yuki-accordion-content__clip">
        <div {...bodyProps} className={cx('yuki-accordion-content__body', bodyProps?.className)}>
          {content}
        </div>
      </div>
    );
    return (
      <Primitive.Content
        {...props}
        {...motion}
        asChild={asChild}
        forceMount={forceMount}
        ref={ref}
        className={cx('yuki-accordion-content', motion.className, className)}
        style={{ ...motion.style, ...style }}
        {...(hidden || (forceMount && !present) ? { hidden: true } : {})}
        inert={inertValue(!open || undefined)}
        aria-hidden={!open || props['aria-hidden']}
      >
        {asChild ? <Slottable child={children}>{body}</Slottable> : body(children)}
      </Primitive.Content>
    );
  },
);

import { forwardRef, useId, type CSSProperties, type ReactNode } from 'react';
import * as Primitive from '@radix-ui/react-accordion';
import { usePrefersReducedMotion } from '../../hooks';
import { cx } from '../../internal/cx';
import { inertValue } from '../../internal/inert';
import { useComponentSize, useTheme, type Size } from '../../theme';
import { Icon } from '../icon';
import { AccordionRoot, usePanelOpen } from './AccordionRoot';
import type { AccordionProps } from './Accordion';

export interface AccordionPanel {
  /** 唯一标识。 */
  value: string;
  /** 面板标题。 */
  title: ReactNode;
  /** 面板内容。 */
  content?: ReactNode;
  /** 标题右侧的附加内容。 */
  extra?: ReactNode;
  /** 是否禁用。 */
  disabled?: boolean;
  /** 是否展示展开图标。 */
  showArrow?: boolean;
  /** 条目的额外类名。 */
  className?: string;
  /** 条目的额外样式。 */
  style?: CSSProperties;
}

export interface AccordionClassNames {
  root?: string;
  item?: string;
  header?: string;
  title?: string;
  extra?: string;
  expandIcon?: string;
  panel?: string;
  panelInner?: string;
  content?: string;
}

export interface AccordionStyles {
  root?: CSSProperties;
  item?: CSSProperties;
  header?: CSSProperties;
  title?: CSSProperties;
  extra?: CSSProperties;
  expandIcon?: CSSProperties;
  panel?: CSSProperties;
  panelInner?: CSSProperties;
  content?: CSSProperties;
}

export interface PanelOptions {
  items: readonly AccordionPanel[];
  /** 是否展示外边框。 */
  bordered?: boolean;
  /** 幽灵模式：无边框无背景。 */
  ghost?: boolean;
  /** 展开图标位置。 */
  expandIconPosition?: 'start' | 'end';
  /** 自定义展开图标；传函数时可按面板与展开状态定制。 */
  expandIcon?: ReactNode | ((item: AccordionPanel, open: boolean) => ReactNode);
  /** 尺寸。 */
  size?: Size;
  classNames?: AccordionClassNames;
  styles?: AccordionStyles;
}

type PanelProps = Extract<AccordionProps, { items: readonly AccordionPanel[] }>;

function Panel({
  item, expandIcon, classNames, styles,
}: Pick<PanelOptions, 'expandIcon' | 'classNames' | 'styles'> & { item: AccordionPanel }) {
  const open = usePanelOpen(item.value);
  const id = useId();
  const headerId = id + '-header';
  const panelId = id + '-panel';
  const icon = typeof expandIcon === 'function' ? expandIcon(item, open) : expandIcon ?? <Icon name="chevron-right" />;
  return (
    <Primitive.Item
      value={item.value}
      disabled={item.disabled}
      data-slot="item"
      data-key={item.value}
      data-open={open || undefined}
      className={cx('yuki-collapse__item', item.className, classNames?.item)}
      style={{ ...styles?.item, ...item.style }}
    >
      <div
        className={cx('yuki-collapse__header', classNames?.header)}
        style={styles?.header}
        data-slot="header"
      >
        <Primitive.Trigger
          id={headerId}
          aria-controls={panelId}
          aria-labelledby={id + '-title'}
          className="yuki-collapse__trigger"
        />
        {item.showArrow !== false && (
          <span
            data-slot="expand-icon"
            aria-hidden="true"
            className={cx('yuki-collapse__expand-icon', classNames?.expandIcon)}
            style={styles?.expandIcon}
          >
            {icon}
          </span>
        )}
        <span
          id={id + '-title'}
          data-slot="title"
          className={cx('yuki-collapse__title', classNames?.title)}
          style={styles?.title}
        >
          {item.title}
        </span>
        {item.extra != null && (
          <span data-slot="extra" className={cx('yuki-collapse__extra', classNames?.extra)} style={styles?.extra}>
            {item.extra}
          </span>
        )}
      </div>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        aria-hidden={!open || undefined}
        inert={inertValue(!open || undefined)}
        data-slot="panel"
        data-open={open || undefined}
        className={cx('yuki-collapse__panel', classNames?.panel)}
        style={styles?.panel}
      >
        <div data-slot="panel-inner" className={cx('yuki-collapse__panel-inner', classNames?.panelInner)}
          style={styles?.panelInner}>
          <div data-slot="content" className={cx('yuki-collapse__content', classNames?.content)} style={styles?.content}>
            {item.content}
          </div>
        </div>
      </div>
    </Primitive.Item>
  );
}

export const AccordionPanels = forwardRef<HTMLDivElement, PanelProps>(function AccordionPanels(
  { items, bordered = true, ghost = false, expandIconPosition = 'start', expandIcon,
    size: sizeProp, classNames, styles, className, style, ...props },
  ref,
) {
  const size = useComponentSize(sizeProp);
  const reducedMotion = usePrefersReducedMotion();
  const { motion } = useTheme();
  return (
    <AccordionRoot
      {...props}
      ref={ref}
      data-slot="accordion"
      data-size={size}
      data-bordered={bordered || undefined}
      data-ghost={ghost || undefined}
      data-expand-icon-position={expandIconPosition}
      data-motion={reducedMotion || motion === 'none' ? 'off' : 'on'}
      className={cx('yuki-collapse', `yuki-collapse--${size}`, `yuki-collapse--expand-${expandIconPosition}`,
        bordered && 'yuki-collapse--bordered', ghost && 'yuki-collapse--ghost', classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      {items.map((item) => (
        <Panel key={item.value} item={item} expandIcon={expandIcon} classNames={classNames} styles={styles} />
      ))}
    </AccordionRoot>
  );
});

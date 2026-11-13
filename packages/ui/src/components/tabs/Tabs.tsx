import { CompoundTabs } from './TabsParts';
import type { AnimationOptions } from '../../animation';
import { useComponentDefaults } from '../../theme';
import {
  forwardRef,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useComponentSize, useLocale, type Size } from '../../theme';

export type TabsVariant = 'line' | 'card' | 'segmented';
export type TabsPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TabItem {
  /** 唯一标识。 */
  key: string;
  /** 标签文案。 */
  label: ReactNode;
  /** 面板内容。 */
  children?: ReactNode;
  /** 标签前缀图标。 */
  icon?: ReactNode;
  /** 是否禁用。 */
  disabled?: boolean;
  /** 条目的额外类名。 */
  className?: string;
  /** 条目的额外样式。 */
  style?: CSSProperties;
}

export interface TabsClassNames {
  root?: string;
  nav?: string;
  tablist?: string;
  tab?: string;
  label?: string;
  icon?: string;
  extra?: string;
  content?: string;
  panel?: string;
}

export interface TabsStyles {
  root?: CSSProperties;
  nav?: CSSProperties;
  tablist?: CSSProperties;
  tab?: CSSProperties;
  label?: CSSProperties;
  icon?: CSSProperties;
  extra?: CSSProperties;
  content?: CSSProperties;
  panel?: CSSProperties;
}

export interface TabsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** 选项卡列表。 */
  items?: readonly TabItem[];
  /** 受控的选中项，对应条目的 key 或触发器的 value。 */
  value?: string;
  /** 非受控的初始选中项。 */
  defaultValue?: string;
  /** 用户请求切换时触发。 */
  onChange?: (value: string) => void;
  /** 组合模式的键盘激活方式。 */
  activationMode?: 'automatic' | 'manual';
  /** 组合模式的键盘导航方向。 */
  orientation?: 'horizontal' | 'vertical';
  /** 组合模式的面板动画。 */
  animation?: AnimationOptions | false;
  /** 视觉变体。 */
  variant?: TabsVariant;
  /** 标签栏位置；left / right 为纵向布局。 */
  tabPosition?: TabsPosition;
  /** 尺寸。 */
  size?: Size;
  /** 标签栏是否居中。 */
  centered?: boolean;
  /** 是否只渲染标签栏。 */
  hideContent?: boolean;
  /** 标签栏右侧的附加内容。 */
  tabBarExtraContent?: ReactNode;
  classNames?: TabsClassNames;
  styles?: TabsStyles;
}

const POSITION_ORIENTATION: Record<TabsPosition, 'horizontal' | 'vertical'> = {
  top: 'horizontal',
  bottom: 'horizontal',
  left: 'vertical',
  right: 'vertical',
};

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  inputProps,
  ref,
) {
  const {
    items = [],
    children,
    value,
    defaultValue,
    onChange,
    activationMode,
    orientation: compoundOrientation,
    animation,
    variant = 'line',
    tabPosition = 'top',
    size: sizeProp,
    centered = false,
    hideContent = false,
    tabBarExtraContent,
    classNames,
    styles,
    className,
    style,
    ...rest
  } = useComponentDefaults('Tabs', inputProps);
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const baseId = useId();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const orientation = POSITION_ORIENTATION[tabPosition];
  const vertical = orientation === 'vertical';

  const enabledItems = items.filter((item) => !item.disabled);
  const firstEnabledKey = enabledItems[0]?.key;
  const [localValue, setLocalValue] = useState(defaultValue ?? firstEnabledKey);
  const isControlled = value !== undefined;
  const selection = isControlled ? value : localValue;
  const selectedItem = items.find((item) => item.key === selection);
  const focusItem = selectedItem && !selectedItem.disabled ? selectedItem : enabledItems[0];
  const focusKey = focusItem?.key;

  // Keep an enabled replacement selected even if the previous tab later returns.
  if (!isControlled && focusKey !== undefined && localValue !== focusKey) {
    setLocalValue(focusKey);
  }

  const activeKey = isControlled || !items.length ? selection : focusKey;
  const selectTab = (next: string) => {
    if (next === activeKey) return;
    if (!isControlled) setLocalValue(next);
    onChange?.(next);
  };

  if (children != null && !items.length) {
    return (
      <CompoundTabs
        {...rest}
        dir={rest.dir === 'rtl' || rest.dir === 'ltr' ? rest.dir : undefined}
        ref={ref}
        value={activeKey ?? ''}
        onValueChange={selectTab}
        size={size}
        variant={variant}
        animation={animation}
        activationMode={activationMode}
        orientation={compoundOrientation ?? orientation}
        className={cx(classNames?.root, className)}
        style={{ ...styles?.root, ...style }}
      >
        {children}
      </CompoundTabs>
    );
  }

  const activeItem = isControlled ? selectedItem : focusItem;

  const focusTab = (key: string) => {
    tabRefs.current.get(key)?.focus();
  };

  const handleKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    itemKey: string,
  ) => {
    const keys = vertical
      ? ['ArrowUp', 'ArrowDown', 'Home', 'End']
      : ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key) || enabledItems.length === 0) return;
    const current = enabledItems.findIndex((item) => item.key === itemKey);
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = enabledItems.length - 1;
    else {
      const delta =
        event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
      next =
        (current + delta + enabledItems.length) % enabledItems.length;
    }
    const target = enabledItems[next];
    if (!target) return;
    event.preventDefault();
    selectTab(target.key);
    focusTab(target.key);
  };

  const tabId = (key: string) =>
    `${baseId}-${encodeURIComponent(key)}-tab`;
  const panelId = (key: string) =>
    `${baseId}-${encodeURIComponent(key)}-panel`;

  const nav = (
    <div
      data-slot="nav"
      className={cx(
        'yuki-tabs__nav',
        centered && 'yuki-tabs__nav--centered',
        classNames?.nav,
      )}
      style={styles?.nav}
    >
      <div
        role="tablist"
        aria-orientation={orientation}
        aria-label={t('tabs.label', {
          'zh-CN': '选项卡',
          en: 'Tabs',
        })}
        data-slot="tablist"
        className={cx('yuki-tabs__tablist', classNames?.tablist)}
        style={styles?.tablist}
      >
        {items.map((item) => {
          const selected = item.key === activeKey;
          return (
            <button
              key={item.key}
              ref={(node) => {
                if (node) tabRefs.current.set(item.key, node);
                else tabRefs.current.delete(item.key);
              }}
              type="button"
              role="tab"
              id={tabId(item.key)}
              data-slot="tab"
              data-key={item.key}
              aria-selected={selected}
              aria-controls={panelId(item.key)}
              tabIndex={item.key === focusKey ? 0 : -1}
              disabled={item.disabled}
              className={cx(
                'yuki-tabs__tab',
                selected && 'yuki-tabs__tab--active',
                item.className,
                classNames?.tab,
              )}
              style={{ ...styles?.tab, ...item.style }}
              onClick={() => selectTab(item.key)}
              onKeyDown={(event) => handleKeyDown(event, item.key)}
            >
              {item.icon !== undefined && item.icon !== null ? (
                <span
                  data-slot="icon"
                  className={cx('yuki-tabs__icon', classNames?.icon)}
                  style={styles?.icon}
                >
                  {item.icon}
                </span>
              ) : null}
              <span
                data-slot="label"
                className={cx('yuki-tabs__label', classNames?.label)}
                style={styles?.label}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {tabBarExtraContent !== undefined && tabBarExtraContent !== null ? (
        <div
          data-slot="extra"
          className={cx('yuki-tabs__extra', classNames?.extra)}
          style={styles?.extra}
        >
          {tabBarExtraContent}
        </div>
      ) : null}
    </div>
  );

  const content =
    !hideContent && activeItem ? (
      <div
        data-slot="content"
        className={cx('yuki-tabs__content', classNames?.content)}
        style={styles?.content}
      >
        <div
          role="tabpanel"
          id={panelId(activeItem.key)}
          aria-labelledby={tabId(activeItem.key)}
          tabIndex={0}
          data-slot="panel"
          className={cx('yuki-tabs__panel', classNames?.panel)}
          style={styles?.panel}
        >
          {activeItem.children}
        </div>
      </div>
    ) : null;

  return (
    <div
      ref={ref}
      {...rest}
      data-slot="tabs"
      data-size={size}
      data-variant={variant}
      data-orientation={orientation}
      data-position={tabPosition}
      data-centered={centered || undefined}
      className={cx(
        'yuki-tabs',
        `yuki-tabs--${size}`,
        `yuki-tabs--${variant}`,
        `yuki-tabs--${orientation}`,
        `yuki-tabs--${tabPosition}`,
        classNames?.root,
        className,
      )}
      style={{ ...styles?.root, ...style }}
    >
      {nav}
      {content}
    </div>
  );
});

Tabs.displayName = 'Tabs';

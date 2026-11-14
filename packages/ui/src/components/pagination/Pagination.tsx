import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useAnimation, type AnimationOptions } from '../../animation';
import { cx } from '../../internal/cx';
import { FormItemControlContext } from '../form/context';
import { integer, usePagination, type PageStateProps } from './usePagination';
import { Icon } from '../icon';
import { Select } from '../select';
import { useConfig, useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';

export interface PaginationClassNames {
  root?: string;
  list?: string;
  item?: string;
  activeItem?: string;
  prev?: string;
  next?: string;
  ellipsis?: string;
  total?: string;
  sizeChanger?: string;
  quickJumper?: string;
  jumpInput?: string;
  simple?: string;
}

export interface PaginationStyles {
  root?: StyleProperties;
  list?: StyleProperties;
  item?: StyleProperties;
  activeItem?: StyleProperties;
  prev?: StyleProperties;
  next?: StyleProperties;
  ellipsis?: StyleProperties;
  total?: StyleProperties;
  sizeChanger?: StyleProperties;
  quickJumper?: StyleProperties;
  jumpInput?: StyleProperties;
  simple?: StyleProperties;
}

export interface PaginationButtonInfo {
  type: 'page' | 'previous' | 'next';
  page: number;
  current: boolean;
  disabled: boolean;
}

export interface PaginationProps extends Omit<
  WithStyle<HTMLAttributes<HTMLElement>>,
  'onChange' | 'defaultValue'
>, PageStateProps {
  previousContent?: ReactNode;
  nextContent?: ReactNode;
  ellipsis?: ReactNode;
  buttonProps?: (item: PaginationButtonInfo) => WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
  boundaryCount?: number;
  animation?: AnimationOptions | false;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean | ((total: number, range: [number, number]) => ReactNode);
  simple?: boolean;
  disabled?: boolean;
  siblingCount?: number;
  size?: Size;
  classNames?: PaginationClassNames;
  styles?: PaginationStyles;
}

type PageToken = number | 'ellipsis-start' | 'ellipsis-end';

function range(start: number, end: number): number[] {
  const values: number[] = [];
  for (let value = start; value <= end; value += 1) values.push(value);
  return values;
}

function getPageTokens(
  page: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number,
): PageToken[] {
  if (boundaryCount !== 1) {
    const pages = new Set([
      ...range(1, Math.min(boundaryCount, totalPages)),
      ...range(Math.max(1, page - siblingCount), Math.min(totalPages, page + siblingCount)),
      ...range(Math.max(1, totalPages - boundaryCount + 1), totalPages),
    ]);
    const tokens: PageToken[] = [];
    let previous = 0;
    for (const number of Array.from(pages).sort((a, b) => a - b)) {
      if (previous && number > previous + 1)
        tokens.push(number <= page ? 'ellipsis-start' : 'ellipsis-end');
      tokens.push(number);
      previous = number;
    }
    return tokens;
  }
  const visibleCount = siblingCount * 2 + 5;
  if (totalPages <= visibleCount) return range(1, totalPages);

  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, totalPages);
  const showLeft = left > 2;
  const showRight = right < totalPages - 1;

  if (!showLeft) {
    return [...range(1, 3 + siblingCount * 2), 'ellipsis-end', totalPages];
  }
  if (!showRight) {
    return [1, 'ellipsis-start', ...range(totalPages - (2 + siblingCount * 2), totalPages)];
  }
  return [1, 'ellipsis-start', ...range(left, right), 'ellipsis-end', totalPages];
}

/** Page navigation with controlled/uncontrolled page and page-size state. */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(inputProps, ref) {
    const {
      total: totalProp,
      totalPages: count,
      page: pageProp,
      defaultPage,
      previousContent = <Icon name="chevron-left" size="1em" />,
      nextContent = <Icon name="chevron-right" size="1em" />,
      ellipsis,
      buttonProps,
      boundaryCount = 1,
      animation,
      pageSize,
      defaultPageSize = 10,
      onChange,
      pageSizeOptions = [10, 20, 50, 100],
      showSizeChanger = false,
      showQuickJumper = false,
      showTotal = false,
      simple = false,
      disabled = false,
      siblingCount = 1,
      size: sizeProp,
      classNames,
      styles,
      className,
      style,
      ...rest
    } = useComponentDefaults('Pagination', inputProps);
    const size = useComponentSize(sizeProp);
    const { t } = useLocale();
    const { duration, delay, ...motion } = useAnimation(animation, 'feedback');
    const customMotion =
      useConfig().animation !== undefined || animation !== undefined ? motion : undefined;
    const { page, pageSize: resolvedPageSize, totalPages, total, changePage } = usePagination({
      page: pageProp, defaultPage, pageSize, defaultPageSize, total: totalProp, totalPages: count, onChange,
    });
    const rangeStart = total === 0 ? 0 : (page - 1) * resolvedPageSize + 1;
    const rangeEnd = Math.min(total, page * resolvedPageSize);

    const handleJump = (event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled || event.key !== 'Enter' || event.nativeEvent.isComposing) return;
      const input = event.currentTarget.value.trim();
      if (/^\d+$/.test(input)) changePage(Number(input));
    };

    const tokens = getPageTokens(
      page,
      totalPages,
      integer(siblingCount, 1, 100),
      integer(boundaryCount, 1, 100),
    );

    const renderButton = (type: PaginationButtonInfo['type'], target: number) => {
      const previous = type === 'previous';
      const active = type === 'page' && target === page;
      const isDisabled = disabled || target < 1 || target > totalPages;
      const custom = buttonProps?.({ type, page: target, current: active, disabled: isDisabled });
      const slot = previous ? 'prev' : 'next';
      const content = type === 'page' ? target : previous ? previousContent : nextContent;
      return (
        <button
          {...customMotion}
          {...custom}
          type="button"
          aria-label={
            custom?.['aria-label'] ??
            (type === 'page'
              ? t('pagination.pageLabel', undefined, { page: target })
              : t(`pagination.${slot}`))
          }
          aria-current={active ? 'page' : undefined}
          disabled={isDisabled || custom?.disabled}
          className={cx(
            'yuki-pagination__item',
            classNames?.item,
            active && 'yuki-pagination__item--active',
            active && classNames?.activeItem,
            type !== 'page' && `yuki-pagination__${slot}`,
            type !== 'page' && classNames?.[slot],
            customMotion?.className,
            custom?.className,
          )}
          style={{
            ...customMotion?.style,
            ...styles?.item,
            ...(active && styles?.activeItem),
            ...(type !== 'page' && styles?.[slot]),
            ...custom?.style,
          }}
          onClick={(event) => {
            custom?.onClick?.(event);
            if (!event.defaultPrevented) changePage(target);
          }}
        >
          {custom?.children === undefined ? content : custom.children}
        </button>
      );
    };
    const validSizes = [...new Set(pageSizeOptions.filter(value => Number.isSafeInteger(value) && value > 0))];
    const sizeOptions = validSizes.includes(resolvedPageSize)
      ? validSizes
      : [...validSizes, resolvedPageSize].sort((a, b) => a - b);

    const totalLabel =
      typeof showTotal === 'function'
        ? showTotal(total, [rangeStart, rangeEnd])
        : t('pagination.total', undefined, { total });

    return (
      <nav
        ref={ref}
        {...rest}
        data-slot="pagination"
        data-size={size}
        data-disabled={disabled || undefined}
        aria-label={rest['aria-label'] ?? t('pagination.label')}
        className={cx(
          'yuki-pagination',
          `yuki-pagination--${size}`,
          disabled && 'yuki-pagination--disabled',
          classNames?.root,
          className,
        )}
        style={{ ...styles?.root, ...style }}
      >
        {showTotal && (
          <span
            data-slot="total"
            className={cx('yuki-pagination__total', classNames?.total)}
            style={styles?.total}
          >
            {totalLabel}
          </span>
        )}

        {simple ? (
          <span
            data-slot="simple"
            className={cx('yuki-pagination__simple', classNames?.simple)}
            style={styles?.simple}
          >
            {renderButton('previous', page - 1)}
            <span className="yuki-pagination__simple-status">
              {page} / {totalPages}
            </span>
            {renderButton('next', page + 1)}
          </span>
        ) : (
          <ul
            data-slot="list"
            className={cx('yuki-pagination__list', classNames?.list)}
            style={styles?.list}
          >
            <li>{renderButton('previous', page - 1)}</li>
            {tokens.map((token) =>
              typeof token === 'number' ? (
                <li key={token}>{renderButton('page', token)}</li>
              ) : (
                <li key={token}>
                  <span
                    aria-hidden="true"
                    data-slot="ellipsis"
                    className={cx('yuki-pagination__ellipsis', classNames?.ellipsis)}
                    style={styles?.ellipsis}
                  >
                    {ellipsis === undefined ? <Icon name="more-horizontal" size="1em" /> : ellipsis}
                  </span>
                </li>
              ),
            )}
            <li>{renderButton('next', page + 1)}</li>
          </ul>
        )}

        {showSizeChanger && (
          <div data-slot="size-changer" className="yuki-pagination__size-changer">
            <FormItemControlContext.Provider value={null}>
              <Select
                aria-label={t('pagination.itemsPerPage')}
                size={size}
                disabled={disabled}
                clearable={false}
                triggerProps={{ className: classNames?.sizeChanger, style: styles?.sizeChanger }}
                value={resolvedPageSize}
                options={sizeOptions.map(value => ({
                  value,
                  label: `${value} ${t('pagination.itemsPerPage')}`,
                }))}
                onChange={value => { if (value !== null) changePage(page, value); }}
              />
            </FormItemControlContext.Provider>
          </div>
        )}

        {showQuickJumper && (
          <span
            data-slot="quick-jumper"
            className={cx('yuki-pagination__quick-jumper', classNames?.quickJumper)}
            style={styles?.quickJumper}
          >
            <span>{t('pagination.jump')}</span>
            <input
              type="text"
              inputMode="numeric"
              aria-label={t('pagination.jump')}
              disabled={disabled}
              className={cx('yuki-pagination__jump-input', classNames?.jumpInput)}
              style={styles?.jumpInput}
              onKeyDown={handleJump}
            />
            <span>{t('pagination.page')}</span>
          </span>
        )}
      </nav>
    );
  },
);

Pagination.displayName = 'Pagination';

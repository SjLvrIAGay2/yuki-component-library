import type { WithStyle } from '../../styles/properties';
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ComponentType,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Button, type ButtonProps } from '../button';
import { Progress } from '../progress';
import { Animation, type AnimationOptions } from '../../animation';
import { cx } from '../../internal/cx';
import { Icon } from '../icon';
import { formatMessage } from '../../locale';
import { useLocale } from '../../theme';
import { useComponentDefaults } from '../../theme';

export type PageLayout = 'compact' | 'illustrated';
export type PageAction =
  | {
      label: ReactNode;
      href: string;
      linkProps?: Omit<WithStyle<AnchorHTMLAttributes<HTMLAnchorElement>>, 'href' | 'children'>;
    }
  | {
      label: ReactNode;
      href?: never;
      onClick?: ButtonProps['onClick'];
      buttonProps?: Omit<ButtonProps, 'children'>;
    };
export interface PagePresetProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  statusCode?: string | number;
  icon?: ReactNode;
  illustration?: ReactNode;
  primaryAction?: PageAction;
  secondaryAction?: PageAction;
  actions?: ReactNode;
  footer?: ReactNode;
  layout?: PageLayout;
  width?: CSSProperties['maxWidth'];
  background?: CSSProperties['background'];
  align?: 'center' | 'start';
  animation?: AnimationOptions | false;
  LinkComponent?: ComponentType<WithStyle<AnchorHTMLAttributes<HTMLAnchorElement>>>;
  contentProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  titleProps?: WithStyle<HTMLAttributes<HTMLHeadingElement>>;
  descriptionProps?: WithStyle<HTMLAttributes<HTMLParagraphElement>>;
  illustrationProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  actionsProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
}
function Action({
  action,
  secondary,
  LinkComponent,
}: {
  action: PageAction;
  secondary?: boolean;
  LinkComponent?: PagePresetProps['LinkComponent'];
}) {
  if (action.href !== undefined) {
    const Link = LinkComponent ?? 'a';
    return (
      <Link
        {...action.linkProps}
        href={action.href}
        className={cx(
          'yuki-page__link yuki-btn yuki-btn--md yuki-btn--primary',
          secondary ? 'yuki-btn--outline' : 'yuki-btn--solid',
          action.linkProps?.className,
        )}
      >
        {action.label}
      </Link>
    );
  }
  return (
    <Button
      variant={secondary ? 'outline' : 'solid'}
      {...action.buttonProps}
      onClick={(event) => {
        action.buttonProps?.onClick?.(event);
        if (!event.defaultPrevented && action.onClick !== action.buttonProps?.onClick)
          action.onClick?.(event);
      }}
    >
      {action.label}
    </Button>
  );
}
export const PagePreset = forwardRef<HTMLDivElement, PagePresetProps>(
  function PagePreset(input, ref) {
    const {
      title,
      description,
      statusCode,
      icon = <Icon name="info" />,
      illustration,
      primaryAction,
      secondaryAction,
      actions,
      footer,
      children,
      layout = 'compact',
      width = 760,
      background,
      align = 'center',
      animation,
      LinkComponent,
      contentProps,
      titleProps,
      descriptionProps,
      illustrationProps,
      actionsProps,
      className,
      style,
      ...props
    } = useComponentDefaults('PagePreset', input);
    const id = useId();
    return (
      <Animation
        {...props}
        ref={ref}
        animation={animation}
        className={cx('yuki-page', `yuki-page--${layout}`, `yuki-page--${align}`, className)}
        style={{ maxWidth: width, background, ...style }}
        aria-labelledby={
          props['aria-labelledby'] ?? (title != null ? (titleProps?.id ?? id) : undefined)
        }
      >
        <div
          {...illustrationProps}
          className={cx('yuki-page__illustration', illustrationProps?.className)}
        >
          {illustration === undefined ? (
            <span className="yuki-page__icon" aria-hidden="true">
              {icon}
            </span>
          ) : (
            illustration
          )}
        </div>
        <div {...contentProps} className={cx('yuki-page__content', contentProps?.className)}>
          {statusCode !== undefined && <span className="yuki-page__code">{statusCode}</span>}
          {title != null && (
            <h1
              {...titleProps}
              id={titleProps?.id ?? id}
              className={cx('yuki-page__title', titleProps?.className)}
            >
              {title}
            </h1>
          )}
          {description != null && (
            <p
              {...descriptionProps}
              className={cx('yuki-page__description', descriptionProps?.className)}
            >
              {description}
            </p>
          )}
          {children}
          {(actions === undefined ? primaryAction || secondaryAction : actions != null) && (
            <div {...actionsProps} className={cx('yuki-page__actions', actionsProps?.className)}>
              {actions === undefined ? (
                <>
                  {primaryAction && <Action action={primaryAction} LinkComponent={LinkComponent} />}
                  {secondaryAction && (
                    <Action action={secondaryAction} LinkComponent={LinkComponent} secondary />
                  )}
                </>
              ) : (
                actions
              )}
            </div>
          )}
          {footer && <div className="yuki-page__footer">{footer}</div>}
        </div>
      </Animation>
    );
  },
);

export interface ErrorPageProps extends PagePresetProps {
  statusCode?: string | number;
}
export const ErrorPage = forwardRef<HTMLDivElement, ErrorPageProps>(function ErrorPage(input, ref) {
  const props = useComponentDefaults('ErrorPage', input);
  const { messages } = useLocale();
  const code = props.statusCode ?? 404;
  const defaults = {
    '401': [messages.pageError401Title, messages.pageError401Description],
    '403': [messages.pageError403Title, messages.pageError403Description],
    '404': [messages.pageError404Title, messages.pageError404Description],
    '500': [messages.pageError500Title, messages.pageError500Description],
    '503': [messages.pageError503Title, messages.pageError503Description],
  };
  const [title, description] = defaults[String(code) as keyof typeof defaults] ?? [
    messages.pageErrorTitle,
    messages.pageErrorDescription,
  ];
  return (
    <PagePreset
      ref={ref}
      icon={<Icon name="alert-triangle" />}
      {...props}
      statusCode={code}
      title={props.title === undefined ? title : props.title}
      description={props.description === undefined ? description : props.description}
    />
  );
});

export interface EmptyPageProps extends PagePresetProps {
  reason?: 'no-data' | 'no-results';
}
export const EmptyPage = forwardRef<HTMLDivElement, EmptyPageProps>(function EmptyPage(input, ref) {
  const { reason = 'no-data', ...props } = useComponentDefaults('EmptyPage', input);
  const { messages } = useLocale();
  return (
    <PagePreset
      ref={ref}
      icon={<Icon name="search" />}
      {...props}
      title={
        props.title === undefined
          ? reason === 'no-results'
            ? messages.pageSearchEmptyTitle
            : messages.pageEmptyTitle
          : props.title
      }
      description={
        props.description === undefined
          ? reason === 'no-results'
            ? messages.pageSearchEmptyDescription
            : messages.pageEmptyDescription
          : props.description
      }
    />
  );
});
export interface ResultPageProps extends PagePresetProps {
  status?: 'success' | 'failure' | 'warning' | 'processing';
}
export const ResultPage = forwardRef<HTMLDivElement, ResultPageProps>(
  function ResultPage(input, ref) {
    const { status = 'success', ...props } = useComponentDefaults('ResultPage', input);
    const { messages } = useLocale();
    const titles = {
      success: messages.pageSuccessTitle,
      failure: messages.pageFailureTitle,
      warning: messages.pageWarningTitle,
      processing: messages.pageProcessingTitle,
    };
    return (
      <PagePreset
        ref={ref}
        icon={
          <Icon
            name={status === 'success' ? 'check' : status === 'processing' ? 'info' : 'alert-triangle'}
          />
        }
        {...props}
        data-status={status}
        title={props.title === undefined ? titles[status] : props.title}
        description={
          props.description === undefined ? messages.pageResultDescription : props.description
        }
      >
        {status === 'processing' && <Progress indeterminate showInfo={false} aria-label={messages.progressLabel} />}
        {props.children}
      </PagePreset>
    );
  },
);

export interface LoadingPageProps extends PagePresetProps {
  value?: number | null;
  max?: number;
  onCancel?: () => void;
  cancelLabel?: ReactNode;
  cancelProps?: Omit<ButtonProps, 'children'>;
}
export const LoadingPage = forwardRef<HTMLDivElement, LoadingPageProps>(
  function LoadingPage(input, ref) {
    const {
      value = null,
      max,
      onCancel,
      cancelLabel,
      cancelProps,
      ...props
    } = useComponentDefaults('LoadingPage', input);
    const { messages } = useLocale();
    const cancelled = useRef(false);
    const [didCancel, setDidCancel] = useState(false);
    return (
      <PagePreset
        ref={ref}
        {...props}
        title={props.title === undefined ? messages.pageLoadingTitle : props.title}
        description={
          props.description === undefined
            ? didCancel
              ? messages.pageCancelled
              : messages.pageLoadingDescription
            : props.description
        }
        primaryAction={
          props.primaryAction ??
          (onCancel
            ? {
                label: cancelLabel === undefined ? messages.pageCancel : cancelLabel,
                buttonProps: {
                  ...cancelProps,
                  'aria-label':
                    cancelProps?.['aria-label'] ??
                    (cancelLabel === null ? messages.pageCancel : undefined),
                  disabled: didCancel || cancelProps?.disabled,
                },
                onClick: () => {
                  if (!cancelled.current) {
                    cancelled.current = true;
                    setDidCancel(true);
                    onCancel();
                  }
                },
              }
            : undefined)
        }
      >
        <Progress
          percent={value === null ? 0 : (value / (max && Number.isFinite(max) && max > 0 ? max : 100)) * 100}
          indeterminate={value === null}
          showInfo={value !== null}
          aria-label={messages.progressLabel}
        />
        {props.children}
      </PagePreset>
    );
  },
);

export type PageRetry = (signal: AbortSignal) => void | Promise<void>;
function useRetry(action?: PageRetry) {
  const current = useRef(action);
  current.current = action;
  const controller = useRef<AbortController | undefined>(undefined);
  const running = useRef(false);
  const [state, setState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  useEffect(() => () => controller.current?.abort(), []);
  const retry = async () => {
    if (!current.current || running.current) return;
    running.current = true;
    const request = new AbortController();
    controller.current?.abort();
    controller.current = request;
    setState('pending');
    try {
      await current.current(request.signal);
      if (!request.signal.aborted) setState('success');
    } catch {
      if (!request.signal.aborted) setState('error');
    } finally {
      if (controller.current === request) running.current = false;
    }
  };
  return { state, retry };
}
export interface MaintenancePageProps extends PagePresetProps {
  recoveryTime?: ReactNode;
  onRetry?: PageRetry;
  retryLabel?: ReactNode;
}
export const MaintenancePage = forwardRef<HTMLDivElement, MaintenancePageProps>(
  function MaintenancePage(input, ref) {
    const { recoveryTime, onRetry, retryLabel, ...props } = useComponentDefaults(
      'MaintenancePage',
      input,
    );
    const { messages } = useLocale();
    const { state, retry } = useRetry(onRetry);
    return (
      <PagePreset
        ref={ref}
        {...props}
        title={props.title === undefined ? messages.pageMaintenanceTitle : props.title}
        description={
          props.description === undefined ? messages.pageMaintenanceDescription : props.description
        }
        primaryAction={
          props.primaryAction ??
          (onRetry
            ? {
                label: retryLabel === undefined ? messages.pageRetry : retryLabel,
                onClick: () => void retry(),
                buttonProps: {
                  'aria-label': retryLabel === null ? messages.pageRetry : undefined,
                  loading: state === 'pending',
                },
              }
            : undefined)
        }
      >
        {recoveryTime != null && recoveryTime !== false && (
          <p>
            {messages.pageRecoveryTime}: {recoveryTime}
          </p>
        )}
        <div role="status">
          {state === 'error'
            ? messages.pageRetryFailed
            : state === 'success'
              ? messages.pageSuccessTitle
              : null}
        </div>
        {props.children}
      </PagePreset>
    );
  },
);
export interface OfflinePageProps extends PagePresetProps {
  online?: boolean;
  onReconnect?: PageRetry;
  retryLabel?: ReactNode;
}
export const OfflinePage = forwardRef<HTMLDivElement, OfflinePageProps>(
  function OfflinePage(input, ref) {
    const { online, onReconnect, retryLabel, ...props } = useComponentDefaults(
      'OfflinePage',
      input,
    );
    const { messages } = useLocale();
    const { state, retry } = useRetry(onReconnect);
    const connected = online ?? state === 'success';
    return (
      <PagePreset
        ref={ref}
        {...props}
        title={
          props.title === undefined
            ? connected
              ? messages.pageReconnected
              : messages.pageOfflineTitle
            : props.title
        }
        description={
          props.description === undefined
            ? connected
              ? messages.pageResultDescription
              : messages.pageOfflineDescription
            : props.description
        }
        primaryAction={
          props.primaryAction ??
          (onReconnect && !connected
            ? {
                label: retryLabel === undefined ? messages.pageRetry : retryLabel,
                onClick: () => void retry(),
                buttonProps: {
                  'aria-label': retryLabel === null ? messages.pageRetry : undefined,
                  loading: state === 'pending',
                },
              }
            : undefined)
        }
      >
        <div role="status">
          {connected
            ? messages.pageReconnected
            : state === 'pending'
              ? messages.pageReconnecting
              : state === 'error'
                ? messages.pageRetryFailed
                : null}
        </div>
        {props.children}
      </PagePreset>
    );
  },
);

export function isValidRedirectTarget(href: string) {
  if (!href.trim() || /[\u0000-\u001f]/.test(href)) return false;
  try {
    return ['http:', 'https:'].includes(
      new URL(href, typeof document === 'undefined' ? 'https://localhost/' : document.baseURI)
        .protocol,
    );
  } catch {
    return false;
  }
}
export interface RedirectPageProps extends PagePresetProps {
  href: string;
  autoRedirect?: boolean;
  delay?: number;
  targetDescription?: ReactNode;
  onNavigate?: (href: string, context: { signal: AbortSignal }) => void | Promise<void>;
  onCancel?: () => void;
  navigateLabel?: ReactNode;
  cancelLabel?: ReactNode;
  renderFallback?: (error: Error, retry: () => void) => ReactNode;
}
export const RedirectPage = forwardRef<HTMLDivElement, RedirectPageProps>(
  function RedirectPage(input, ref) {
    const {
      href,
      autoRedirect = false,
      delay = 5,
      targetDescription,
      onNavigate,
      onCancel,
      navigateLabel,
      cancelLabel,
      renderFallback,
      ...props
    } = useComponentDefaults('RedirectPage', input);
    const { messages } = useLocale();
    const seconds = Number.isFinite(delay) ? Math.min(86400, Math.max(0, delay)) : 5;
    const valid = isValidRedirectTarget(href);
    const [remaining, setRemaining] = useState(Math.ceil(seconds));
    const [state, setState] = useState<'idle' | 'pending' | 'success' | 'error' | 'cancelled'>(
      'idle',
    );
    const [error, setError] = useState<Error>();
    const active = useRef<
      | {
          href: string;
          controller: AbortController;
          attempted: boolean;
          failed?: boolean;
          timer?: number;
        }
      | undefined
    >(undefined);
    const callbacks = useRef({ onNavigate, onCancel });
    callbacks.current = { onNavigate, onCancel };
    const perform = useRef<() => Promise<void>>(async () => {});
    perform.current = async () => {
      const request = active.current;
      if (
        !request ||
        request.href !== href ||
        request.controller.signal.aborted ||
        request.attempted ||
        !valid
      )
        return;
      request.attempted = true;
      request.failed = false;
      window.clearInterval(request.timer);
      setState('pending');
      setError(undefined);
      try {
        if (callbacks.current.onNavigate)
          await callbacks.current.onNavigate(href, { signal: request.controller.signal });
        else window.location.assign(href);
        if (active.current === request && !request.controller.signal.aborted) setState('success');
      } catch (cause) {
        if (active.current !== request || request.controller.signal.aborted) return;
        request.failed = true;
        setError(cause instanceof Error ? cause : new Error(String(cause)));
        setState('error');
      }
    };
    useEffect(() => {
      const request = {
        href,
        controller: new AbortController(),
        attempted: false,
        timer: undefined as number | undefined,
      };
      active.current = request;
      setRemaining(Math.ceil(seconds));
      setState('idle');
      setError(undefined);
      if (autoRedirect && valid) {
        const deadline = Date.now() + seconds * 1000;
        const tick = () => {
          if (request.controller.signal.aborted) return;
          const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
          setRemaining(left);
          if (left === 0) {
            window.clearInterval(request.timer);
            void perform.current();
          }
        };
        // A cancellable task survives StrictMode's effect replay without duplicate navigation.
        request.timer = seconds === 0 ? window.setTimeout(tick, 0) : window.setInterval(tick, 250);
      }
      return () => {
        request.controller.abort();
        window.clearInterval(request.timer);
      };
    }, [href, seconds, autoRedirect, valid]);
    const retry = () => {
      const request = active.current;
      if (state !== 'error' || !request || request.controller.signal.aborted || !request.failed)
        return;
      request.attempted = false;
      void perform.current();
    };
    const cancel = () => {
      const request = active.current;
      if (!request || request.controller.signal.aborted) return;
      request.controller.abort();
      window.clearInterval(request.timer);
      setState('cancelled');
      callbacks.current.onCancel?.();
    };
    const status = !valid
      ? messages.pageRedirectInvalid
      : state === 'cancelled'
        ? messages.pageRedirectCancelled
        : state === 'success'
          ? messages.pageRedirectComplete
          : state === 'error'
            ? messages.pageRedirectFailed
            : autoRedirect
              ? formatMessage(messages.pageRedirectCountdown, { seconds: remaining })
              : null;
    return (
      <PagePreset
        ref={ref}
        {...props}
        title={props.title === undefined ? messages.pageRedirectTitle : props.title}
        description={
          props.description === undefined
            ? targetDescription === undefined
              ? messages.pageRedirectDescription
              : targetDescription
            : props.description
        }
        primaryAction={
          props.primaryAction ?? {
            label:
              navigateLabel === undefined
                ? state === 'error'
                  ? messages.pageRetry
                  : messages.pageRedirectNow
                : navigateLabel,
            onClick: () => (state === 'error' ? retry() : void perform.current()),
            buttonProps: {
              'aria-label':
                navigateLabel === null
                  ? state === 'error'
                    ? messages.pageRetry
                    : messages.pageRedirectNow
                  : undefined,
              disabled: !valid || state === 'success' || state === 'cancelled',
              loading: state === 'pending',
            },
          }
        }
        secondaryAction={
          props.secondaryAction ??
          (autoRedirect && state !== 'success' && state !== 'cancelled'
            ? {
                label: cancelLabel === undefined ? messages.pageCancel : cancelLabel,
                onClick: cancel,
                buttonProps: {
                  'aria-label': cancelLabel === null ? messages.pageCancel : undefined,
                },
              }
            : undefined)
        }
      >
        <p className="yuki-page__target">{href}</p>
        <p role={state === 'error' || !valid ? 'alert' : 'status'}>{status}</p>
        {state === 'error' && error && renderFallback?.(error, retry)}
        {props.children}
      </PagePreset>
    );
  },
);

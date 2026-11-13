import {
  forwardRef,
  useCallback, isValidElement,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { Portal } from '../../internal/Portal';
import { useControllableState, useEscapeKey, useFocusTrap, useScrollLock } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Button, IconButton } from '../button';
import { Icon } from '../icon';
import { Progress } from '../progress';

export type UploadFileStatus = 'ready' | 'uploading' | 'done' | 'error';
export type UploadListType = 'text' | 'picture';

/** Normalised description of one file in the list. */
export interface UploadFile {
  /** Stable identity inside the list; generated for files picked by the user. */
  uid: string;
  name: string;
  size?: number;
  type?: string;
  status?: UploadFileStatus;
  /** 0–100, only meaningful while `status` is `uploading`. */
  percent?: number;
  /** Remote URL; also used by the picture list and the preview overlay. */
  url?: string;
  /** Thumbnail source. Generated for local images when the browser supports it. */
  thumbUrl?: string;
  originFile?: File;
  response?: unknown;
  error?: unknown;
}

/** Everything a `customRequest` implementation receives. */
export interface UploadRequestOptions {
  file: File;
  action?: string;
  method: string;
  headers?: Record<string, string>;
  data?: Record<string, string | Blob>;
  /** Form field name used for the file part. */
  name: string;
  withCredentials: boolean;
  onProgress: (percent: number) => void;
  onSuccess: (response?: unknown) => void;
  onError: (error: unknown) => void;
}

export interface UploadRequestResult {
  /** Stop the in-flight request (called when the item is removed). */
  abort?: () => void;
}

export type UploadRequest = (options: UploadRequestOptions) => UploadRequestResult | void;

export interface UploadClassNames {
  root?: string;
  trigger?: string;
  dropzone?: string;
  icon?: string;
  tip?: string;
  input?: string;
  list?: string;
  item?: string;
  thumbnail?: string;
  file?: string;
  fileName?: string;
  fileSize?: string;
  progress?: string;
  actions?: string;
  preview?: string;
  remove?: string;
  overlay?: string;
  overlayImage?: string;
}

export interface UploadStyles {
  root?: CSSProperties;
  trigger?: CSSProperties;
  dropzone?: CSSProperties;
  icon?: CSSProperties;
  tip?: CSSProperties;
  input?: CSSProperties;
  list?: CSSProperties;
  item?: CSSProperties;
  thumbnail?: CSSProperties;
  file?: CSSProperties;
  fileName?: CSSProperties;
  fileSize?: CSSProperties;
  progress?: CSSProperties;
  actions?: CSSProperties;
  preview?: CSSProperties;
  remove?: CSSProperties;
  overlay?: CSSProperties;
  overlayImage?: CSSProperties;
}

export interface UploadProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'onChange' | 'onError' | 'onDrop' | 'onSelect' | 'onProgress'
  > {
  /** Called with the accepted local files from one picker/drop operation. */
  onFilesChange?: (files: File[]) => void;
  label?: ReactNode;
  /** Native attributes for the default picker button. */
  buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  /** Controlled file list. */
  fileList?: UploadFile[];
  /** Initial file list when uncontrolled. */
  defaultFileList?: UploadFile[];
  /** Fired whenever the list changes (pick, progress, success, error, remove). */
  onChange?: (fileList: UploadFile[], file: UploadFile) => void;
  /** Return `false` to reject a file, or a `File` to upload a replacement. */
  beforeUpload?: (
    file: File,
    fileList: File[],
  ) => boolean | Promise<boolean | File>;
  /** Replaces the built-in XHR request. */
  customRequest?: UploadRequest;
  /** Endpoint for the built-in XHR request. Omit for local-only uploads. */
  action?: string;
  method?: string;
  headers?: Record<string, string>;
  data?: Record<string, string | Blob>;
  /** Form field name for the file part. */
  name?: string;
  withCredentials?: boolean;
  multiple?: boolean;
  accept?: string;
  maxCount?: number;
  /** Render the drop zone instead of a trigger button. */
  drag?: boolean;
  disabled?: boolean;
  /** `picture` shows thumbnails for image files. */
  listType?: UploadListType;
  showUploadList?: boolean;
  showRemoveIcon?: boolean;
  showPreviewIcon?: boolean;
  /** Extra hint rendered inside the drop zone / below the trigger. */
  tip?: ReactNode;
  /** Custom icon inside the drop zone. */
  icon?: ReactNode;
  /** File entry label; defaults to the file name. */
  fileRender?: (file: UploadFile) => ReactNode;
  onRemove?: (file: UploadFile) => boolean | Promise<boolean> | void;
  /** Fired when the preview control is activated. Defaults to a built-in overlay. */
  onPreview?: (file: UploadFile) => void;
  onProgress?: (file: UploadFile, percent: number) => void;
  onSuccess?: (file: UploadFile, response: unknown) => void;
  onError?: (file: UploadFile, error: unknown) => void;
  onExceed?: (files: File[], fileList: UploadFile[]) => void;
  size?: Size;
  classNames?: UploadClassNames;
  styles?: UploadStyles;
}

let uidSeed = 0;

function nextUid(): string {
  uidSeed += 1;
  return `upload-${Date.now().toString(36)}-${uidSeed}`;
}

function collectFiles(list: FileList | null | undefined): File[] {
  if (!list) return [];
  const files: File[] = [];
  for (let index = 0; index < list.length; index += 1) {
    const file = list.item(index);
    if (file) files.push(file);
  }
  return files;
}

function isImageType(type: string | undefined): boolean {
  return typeof type === 'string' && type.startsWith('image/');
}

function createThumbUrl(file: File): string | undefined {
  if (!isImageType(file.type)) return undefined;
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return undefined;
  try {
    return URL.createObjectURL(file);
  } catch {
    return undefined;
  }
}

function revokeUrl(url: string | undefined): void {
  if (!url || !url.startsWith('blob:')) return;
  if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') return;
  try {
    URL.revokeObjectURL(url);
  } catch {
    /* ignore */
  }
}

export function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  const mime = (file.type || '').toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token.endsWith('/*')) return mime.startsWith(token.slice(0, -1));
    return mime === token;
  });
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** exponent;
  const digits = value >= 10 || exponent === 0 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[exponent]}`;
}

const defaultRequest: UploadRequest = (options) => {
  const {
    file,
    action,
    method,
    headers,
    data,
    name,
    withCredentials,
    onProgress,
    onSuccess,
    onError,
  } = options;

  // No endpoint configured — treat the file as accepted locally.
  if (!action) {
    onProgress(100);
    onSuccess();
    return undefined;
  }

  const xhr = new XMLHttpRequest();
  xhr.open(method, action, true);
  xhr.withCredentials = withCredentials;
  for (const [key, value] of Object.entries(headers ?? {})) {
    xhr.setRequestHeader(key, value);
  }
  xhr.upload?.addEventListener('progress', (event) => {
    if (event.lengthComputable && event.total > 0) {
      onProgress(Math.round((event.loaded / event.total) * 100));
    }
  });
  xhr.onload = () => {
    let payload: unknown = xhr.responseText;
    try {
      payload = JSON.parse(xhr.responseText);
    } catch {
      /* keep the raw text */
    }
    if (xhr.status >= 200 && xhr.status < 300) {
      onSuccess(payload);
    } else {
      onError(new Error(`Upload failed with status ${xhr.status}`));
    }
  };
  xhr.onerror = () => onError(new Error('Network error'));
  xhr.onabort = () => onError(new Error('Upload aborted'));

  const form = new FormData();
  for (const [key, value] of Object.entries(data ?? {})) {
    form.append(key, value);
  }
  form.append(name, file);
  xhr.send(form);

  return { abort: () => xhr.abort() };
};

const UploadBase = forwardRef<HTMLDivElement, UploadProps>(function Upload(inputProps, ref) {
  const props = useComponentDefaults('Upload', inputProps);
  const {
    fileList,
    defaultFileList,
    onChange,
    beforeUpload,
    onFilesChange, label, buttonProps,
    customRequest,
    action,
    method = 'POST',
    headers,
    data,
    name = 'file',
    withCredentials = false,
    multiple = false,
    accept,
    maxCount,
    drag = false,
    disabled = false,
    listType = 'text',
    showUploadList = true,
    showRemoveIcon = true,
    showPreviewIcon = true,
    tip,
    icon,
    fileRender,
    onRemove,
    onPreview,
    onProgress,
    onSuccess,
    onError,
    onExceed,
    size: sizeProp,
    classNames,
    styles,
    className,
    style,
    children,
    id,
    ...rest
  } = props;

  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const requestsRef = useRef(new Map<string, UploadRequestResult | void>());
  const ownedThumbs = useRef(new Set<string>());
  const mounted = useRef(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadFile | null>(null);

  const [files, setFiles] = useControllableState<UploadFile[]>({
    value: fileList,
    defaultValue: defaultFileList ?? [],
  });

  // Async upload callbacks need the latest list; effects keep the ref honest.
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const commit = useCallback(
    (next: UploadFile[], changed: UploadFile) => {
      filesRef.current = next;
      setFiles(next);
      onChange?.(next, changed);
    },
    [onChange, setFiles],
  );

  const patchFile = useCallback(
    (uid: string, patch: Partial<UploadFile>): UploadFile | undefined => {
      let changed: UploadFile | undefined;
      const next = filesRef.current.map((item) => {
        if (item.uid !== uid) return item;
        changed = { ...item, ...patch };
        return changed;
      });
      if (changed) commit(next, changed);
      return changed;
    },
    [commit],
  );

  const openDialog = useCallback(() => {
    if (disabled) return;
    const input = inputRef.current;
    if (!input) return;
    // Reset so picking the same file twice still fires `change`.
    input.value = '';
    input.click();
  }, [disabled]);

  const startUpload = useCallback(
    (file: File) => {
      const uid = nextUid();
      const item: UploadFile = {
        uid,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        percent: 0,
        thumbUrl: createThumbUrl(file),
        originFile: file,
      };
      if (item.thumbUrl) ownedThumbs.current.add(item.thumbUrl);
      commit([...filesRef.current, item], item);
      let settled = false;

      const request = customRequest ?? defaultRequest;
      const options: UploadRequestOptions = {
        file,
        action,
        method,
        headers,
        data,
        name,
        withCredentials,
        onProgress: (percent) => {
          if (settled || !mounted.current) return;
          const changed = patchFile(uid, {
            percent: Math.max(0, Math.min(100, Math.round(percent))),
          });
          if (changed) onProgress?.(changed, changed.percent ?? 0);
        },
        onSuccess: (response) => {
          if (settled || !mounted.current) return;
          settled = true;
          const changed = patchFile(uid, { status: 'done', percent: 100, response });
          if (changed) onSuccess?.(changed, response);
          requestsRef.current.delete(uid);
        },
        onError: (error) => {
          if (settled || !mounted.current) return;
          settled = true;
          const changed = patchFile(uid, { status: 'error', error });
          if (changed) onError?.(changed, error);
          requestsRef.current.delete(uid);
        },
      };

      try {
        const handle = request(options);
        if (!settled && handle) requestsRef.current.set(uid, handle);
      } catch (error) {
        options.onError(error);
      }
    },
    [
      action,
      commit,
      customRequest,
      data,
      headers,
      method,
      name,
      onError,
      onProgress,
      onSuccess,
      patchFile,
      withCredentials,
    ],
  );

  const acceptFiles = useCallback(
    async (incoming: File[]) => {
      if (disabled || incoming.length === 0) return;
      let candidates = accept ? incoming.filter((file) => matchesAccept(file, accept)) : incoming;

      if (maxCount !== undefined && maxCount !== null) {
        const room = Math.max(0, maxCount - filesRef.current.length);
        if (candidates.length > room) {
          onExceed?.(candidates.slice(room), filesRef.current);
          candidates = candidates.slice(0, room);
        }
        if (candidates.length === 0) return;
      }

      if (beforeUpload) {
        const resolved: File[] = [];
        for (const file of candidates) {
          try {
            const result = await beforeUpload(file, candidates);
            if (result === false) continue;
            resolved.push(result instanceof File ? result : file);
          } catch {
            /* a throwing beforeUpload rejects the file */
          }
        }
        candidates = resolved;
      }

      if (!mounted.current || candidates.length === 0) return;
      // Another drop may finish async validation while this batch is pending.
      const room = maxCount == null ? candidates.length : Math.max(0, maxCount - filesRef.current.length);
      if (candidates.length > room) onExceed?.(candidates.slice(room), filesRef.current);
      const accepted = candidates.slice(0, room);
      if (accepted.length) onFilesChange?.(accepted);
      for (const file of accepted) startUpload(file);
    },
    [accept, beforeUpload, disabled, maxCount, onExceed, onFilesChange, startUpload],
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = collectFiles(event.target.files);
    event.target.value = '';
    if (picked.length > 0) void acceptFiles(picked);
  };

  const handleRemove = async (file: UploadFile) => {
    if (disabled) return;
    try {
      if ((await onRemove?.(file)) === false) return;
    } catch {
      return;
    }
    if (!mounted.current || !filesRef.current.some(item => item.uid === file.uid)) return;
    const handle = requestsRef.current.get(file.uid);
    requestsRef.current.delete(file.uid);
    // A transport can invoke onError synchronously from abort(). Remove the entry first.
    const next = filesRef.current.filter(item => item.uid !== file.uid);
    filesRef.current = next;
    handle?.abort?.();
    if (file.thumbUrl && ownedThumbs.current.delete(file.thumbUrl)) revokeUrl(file.thumbUrl);
    commit(next, file);
  };

  const handlePreview = (file: UploadFile) => {
    onPreview?.(file);
    if (onPreview) return;
    setPreviewFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = collectFiles(event.dataTransfer?.files);
    if (dropped.length > 0) void acceptFiles(dropped);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      openDialog();
    }
  };

  useEscapeKey(() => setPreviewFile(null), previewFile !== null);
  useFocusTrap(previewRef, { active: previewFile !== null });
  useScrollLock(previewFile !== null);

  // Abort in-flight requests and release object URLs when unmounted.
  useEffect(() => {
    const requests = requestsRef.current;
    mounted.current = true;
    const previews = ownedThumbs.current;
    return () => {
      mounted.current = false;
      for (const handle of requests.values()) handle?.abort?.();
      requests.clear();
      for (const url of previews) revokeUrl(url);
      previews.clear();
    };
  }, []);

  const hasCustomTrigger = children !== undefined && children !== null;
  const childIsButton = isValidElement(children) && (children.type === Button ||
    children.type === IconButton || children.type === 'button' || children.type === 'a' || children.props.role === 'button');
  const needsKeyboardTrigger = hasCustomTrigger && !childIsButton;
  const busy = disabled;

  return (
    <div
      ref={ref}
      {...rest}
      id={id}
      data-slot="upload"
      data-size={size}
      data-disabled={disabled || undefined}
      data-drag={drag || undefined}
      data-list-type={listType}
      data-dragging={dragging || undefined}
      className={cx('yuki-upload', `yuki-upload--${size}`, classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      {drag ? (
        <div
          ref={dropzoneRef}
          data-slot="dropzone"
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          className={cx(
            'yuki-upload__dropzone',
            dragging && 'yuki-upload__dropzone--dragging',
            classNames?.dropzone,
          )}
          style={styles?.dropzone}
          onClick={openDialog}
          onKeyDown={handleTriggerKeyDown}
          onDragEnter={() => {
            if (!disabled) setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <span
            data-slot="icon"
            className={cx('yuki-upload__icon', classNames?.icon)}
            style={styles?.icon}
          >
            {icon ?? <Icon name="upload" />}
          </span>
          <p
            data-slot="tip"
            className={cx('yuki-upload__tip', classNames?.tip)}
            style={styles?.tip}
          >
            {tip ?? t('upload.drag', { zh: '点击或拖拽文件到此区域上传', en: 'Click or drag files here to upload' })}
          </p>
        </div>
      ) : (
        <div
          data-slot="trigger"
          className={cx('yuki-upload__trigger', classNames?.trigger)}
          style={styles?.trigger}
          onClick={hasCustomTrigger ? event => { if (!event.defaultPrevented) openDialog(); } : undefined}
          onKeyDown={needsKeyboardTrigger ? handleTriggerKeyDown : undefined}
          role={needsKeyboardTrigger ? 'button' : undefined}
          tabIndex={needsKeyboardTrigger ? (disabled ? -1 : 0) : undefined}
          aria-disabled={hasCustomTrigger ? disabled || undefined : undefined}
        >
          {hasCustomTrigger ? (
            children
          ) : (
            <Button
              {...buttonProps}
              size={size}
              disabled={disabled || buttonProps?.disabled}
              startIcon={<Icon name="upload" />}
              onClick={(event) => {
                buttonProps?.onClick?.(event);
                if (!event.defaultPrevented) openDialog();
              }}
            >
              {label ?? t('common.upload', { zh: '上传', en: 'Upload' })}
            </Button>
          )}
          {tip !== undefined && tip !== null && (
            <span
              data-slot="tip"
              className={cx('yuki-upload__hint', classNames?.tip)}
              style={styles?.tip}
            >
              {tip}
            </span>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        id={id ? `${id}-input` : undefined}
        data-slot="input"
        className={cx('yuki-upload__input', classNames?.input)}
        style={styles?.input}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={busy}
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleInputChange}
      />

      {showUploadList && files.length > 0 && (
        <ul
          data-slot="list"
          className={cx('yuki-upload__list', classNames?.list)}
          style={styles?.list}
        >
          {files.map((file) => {
            const thumbUrl = file.thumbUrl ?? file.url;
            const hasPreview = Boolean(thumbUrl);
            return (
              <li
                key={file.uid}
                data-slot="item"
                data-status={file.status ?? 'done'}
                className={cx('yuki-upload__item', classNames?.item)}
                style={styles?.item}
              >
                {listType === 'picture' && hasPreview && (
                  <button
                    type="button"
                    data-slot="thumbnail"
                    className={cx('yuki-upload__thumbnail', classNames?.thumbnail)}
                    style={styles?.thumbnail}
                    aria-label={`${t('upload.preview', { zh: '预览', en: 'Preview' })} ${file.name}`}
                    onClick={() => handlePreview(file)}
                  >
                    <img src={thumbUrl} alt="" />
                  </button>
                )}
                <span
                  data-slot="file"
                  className={cx('yuki-upload__file', classNames?.file)}
                  style={styles?.file}
                >
                  <span
                    data-slot="file-name"
                    className={cx('yuki-upload__file-name', classNames?.fileName)}
                    style={styles?.fileName}
                    title={file.name}
                  >
                    {fileRender ? fileRender(file) : file.name}
                  </span>
                  <span
                    data-slot="file-size"
                    className={cx('yuki-upload__file-size', classNames?.fileSize)}
                    style={styles?.fileSize}
                  >
                    {file.status === 'uploading'
                      ? t('upload.uploading', { zh: '上传中', en: 'Uploading' })
                      : file.status === 'error'
                        ? t('upload.failed', { zh: '上传失败', en: 'Upload failed' })
                        : file.size !== undefined
                          ? formatFileSize(file.size)
                          : null}
                  </span>
                </span>
                {file.status === 'uploading' && (
                  <span
                    data-slot="progress"
                    className={cx('yuki-upload__progress', classNames?.progress)}
                    style={styles?.progress}
                  >
                    <Progress
                      percent={file.percent ?? 0}
                      sizePreset="sm"
                      showInfo={false}
                      aria-label={`${file.name} ${t('upload.uploading', { zh: '上传中', en: 'Uploading' })}`}
                    />
                  </span>
                )}
                <span
                  data-slot="actions"
                  className={cx('yuki-upload__actions', classNames?.actions)}
                  style={styles?.actions}
                >
                  {showPreviewIcon && thumbUrl && (
                    <span
                      data-slot="preview"
                      className={cx('yuki-upload__action', classNames?.preview)}
                      style={styles?.preview}
                    >
                      <IconButton
                        size={size}
                        icon={<Icon name="eye" />}
                        aria-label={`${t('upload.preview', { zh: '预览', en: 'Preview' })} ${file.name}`}
                        onClick={() => handlePreview(file)}
                      />
                    </span>
                  )}
                  {showRemoveIcon && (
                    <span
                      data-slot="remove"
                      className={cx('yuki-upload__action', classNames?.remove)}
                      style={styles?.remove}
                    >
                      <IconButton
                        size={size}
                        icon={<Icon name="trash" />}
                        aria-label={`${t('common.remove', { zh: '移除', en: 'Remove' })} ${file.name}`}
                        disabled={disabled}
                        onClick={() => void handleRemove(file)}
                      />
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {previewFile !== null && (
        <Portal>
          <div
            ref={previewRef}
            data-slot="overlay"
            role="dialog"
            aria-modal="true"
            aria-label={t('upload.preview', { zh: '预览', en: 'Preview' })}
            className={cx('yuki-upload__overlay', classNames?.overlay)}
            style={styles?.overlay}
            onClick={(event) => {
              if (event.target === event.currentTarget) setPreviewFile(null);
            }}
          >
            <button
              type="button"
              data-slot="overlay-close"
              className="yuki-upload__overlay-close"
              aria-label={t('common.close', { zh: '关闭', en: 'Close' })}
              onClick={() => setPreviewFile(null)}
            >
              <Icon name="x" />
            </button>
            {(previewFile.url ?? previewFile.thumbUrl) && (
              <img
                data-slot="overlay-image"
                className={cx('yuki-upload__overlay-image', classNames?.overlayImage)}
                style={styles?.overlayImage}
                src={previewFile.url ?? previewFile.thumbUrl}
                alt={previewFile.name}
              />
            )}
          </div>
        </Portal>
      )}
    </div>
  );
});

/**
 * File picker with a managed list, drag & drop, custom requests and image
 * preview. Pass `drag` (or use `UploadDragger`) for a drop zone.
 */
export const Upload = UploadBase;

export type UploadDraggerProps = Omit<UploadProps, 'drag'>;

/** `Upload` with `drag` enabled — the click-or-drop surface. */
export const UploadDragger = forwardRef<HTMLDivElement, UploadDraggerProps>(
  function UploadDragger(props, ref) {
    return <UploadBase ref={ref} drag {...props} />;
  },
);

UploadBase.displayName = 'Upload';
UploadDragger.displayName = 'UploadDragger';

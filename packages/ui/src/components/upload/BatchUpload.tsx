import {
  forwardRef, useEffect, useRef, useState,
  type InputHTMLAttributes, type ReactNode,
} from 'react';
import { useMergedRefs } from '../../hooks';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Icon } from '../icon';
import { formatFileSize, type UploadFileStatus } from './Upload';

export interface BatchUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'value' | 'defaultValue' | 'children'> {
  label?: ReactNode;
  size?: Size;
  action?: string;
  onFilesChange?: (files: File[]) => void;
  onUploaded?: (files: File[], response: Response) => void;
  onUploadError?: (error: Error) => void;
}

/** Submit all files from one selection together. A new selection replaces the batch. */
export const BatchUpload = forwardRef<HTMLInputElement, BatchUploadProps>(function BatchUpload(props, ref) {
  const {
    label, size: sizeProp, action, onFilesChange, onUploaded, onUploadError,
    onChange, name = 'file', className, style, hidden, disabled, ...inputProps
  } = useComponentDefaults('BatchUpload', props);
  const size = useComponentSize(sizeProp);
  const { messages } = useLocale();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<UploadFileStatus>('ready');
  const input = useRef<HTMLInputElement>(null);
  const inputRef = useMergedRefs(input, ref);
  const pending = useRef<AbortController | null>(null);

  useEffect(() => {
    const form = input.current?.form;
    function reset(event: Event) {
      queueMicrotask(() => {
        if (event.defaultPrevented || !input.current) return;
        pending.current?.abort();
        setFiles([]);
        setStatus('ready');
      });
    }
    form?.addEventListener('reset', reset);
    return () => {
      form?.removeEventListener('reset', reset);
      pending.current?.abort();
    };
  }, [inputProps.form]);

  async function submit(batch: File[], endpoint: string) {
    const controller = new AbortController();
    pending.current = controller;
    const body = new FormData();
    for (const file of batch) body.append(name, file);
    setStatus('uploading');
    let response: Response;
    try {
      response = await fetch(endpoint, { method: 'POST', body, signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (controller.signal.aborted) return;
      setStatus('error');
      onUploadError?.(error instanceof Error ? error : new Error(String(error)));
      return;
    }
    if (controller.signal.aborted) return;
    setStatus('done');
    onUploaded?.(batch, response);
  }

  return (
    <div className={cx('yuki-upload', className)} style={style} hidden={hidden} data-slot="batch-upload"
      data-size={size} data-disabled={disabled || undefined}>
      <label className={cx('yuki-batch-upload__trigger', 'yuki-btn', 'yuki-btn--solid', 'yuki-btn--primary', `yuki-btn--${size}`)}
        data-size={size} data-variant="solid" data-tone="primary">
        <Icon name="upload" />
        <span>{label ?? messages.chooseFiles}</span>
        <input {...inputProps} ref={inputRef} type="file" name={name} disabled={disabled}
          onChange={(event) => {
            onChange?.(event);
            if (event.defaultPrevented) return;
            pending.current?.abort();
            const batch = Array.from(event.currentTarget.files ?? []);
            setFiles(batch);
            setStatus('ready');
            onFilesChange?.(batch);
            if (batch.length && action) void submit(batch, action);
          }} />
      </label>
      {files.length > 0 && <ul className="yuki-upload__list">
        {files.map((file, index) => (
          <li className="yuki-upload__item" data-status={status} key={index}>
            <span className="yuki-upload__file">
              <span className="yuki-upload__file-name" title={file.name}>{file.name}</span>
              <span className="yuki-upload__file-size">{formatFileSize(file.size)}</span>
            </span>
          </li>
        ))}
      </ul>}
      {status !== 'ready' && <span role="status" className="yuki-upload__hint">
        {status === 'uploading' ? messages.uploading : status === 'done' ? messages.uploadDone : messages.uploadFailed}
      </span>}
    </div>
  );
});

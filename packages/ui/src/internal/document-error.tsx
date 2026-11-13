import type { ReactNode } from 'react';
import { Button } from '../components/button';
import type { DocumentError } from './documents';
import { formatMessage } from '../locale';
import { useLocale } from '../theme';

export interface DocumentErrorActions {
  retry: () => void;
}
export type DocumentErrorRenderer = (
  error: DocumentError,
  actions: DocumentErrorActions,
) => ReactNode;

export function DocumentErrorView({
  error,
  retry,
  renderError,
}: {
  error: DocumentError;
  retry: () => void;
  renderError?: DocumentErrorRenderer;
}) {
  const { locale, messages } = useLocale();
  if (renderError) return <>{renderError(error, { retry })}</>;
  const size =
    (error.limit ?? 0) < 1024 * 1024
      ? `${Math.floor(error.limit ?? 0)} ${!locale.name.toLowerCase().startsWith('en') ? '字节' : 'bytes'}`
      : `${Math.round(((error.limit ?? 0) / 1024 / 1024) * 10) / 10} MB`;
  const failures = {
    'unsupported-format': messages.documentUnsupported,
    'file-too-large': formatMessage(messages.documentTooLarge, { size }),
    network: messages.documentNetwork,
    http: formatMessage(messages.documentHttp, { status: error.status ?? '' }),
    'read-failed': messages.documentReadFailed,
    'invalid-encoding': messages.documentInvalidEncoding,
    'docx-parse': messages.documentInvalidDocx,
    'pdf-parse': messages.documentInvalidPdf,
    'pdf-render': messages.documentPdfRenderFailed,
    'preview-unavailable': messages.documentUnavailable,
  };
  return (
    <div className="yuki-document-viewer__empty">
      <p role="alert" className="yuki-document-viewer__error">
        {failures[error.code]}
      </p>
      {error.retryable && (
        <Button size="sm" variant="outline" onClick={retry}>
          {messages.documentRetry}
        </Button>
      )}
    </div>
  );
}

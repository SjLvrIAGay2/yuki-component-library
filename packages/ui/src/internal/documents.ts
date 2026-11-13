import { textDocumentType } from './text-formats';

export type DocumentFormat = 'markdown' | 'text' | 'code' | 'pdf' | 'docx';
export type DocumentSource = string | Blob;
export type DocumentErrorCode =
  | 'unsupported-format'
  | 'file-too-large'
  | 'network'
  | 'http'
  | 'read-failed'
  | 'invalid-encoding'
  | 'docx-parse'
  | 'pdf-parse'
  | 'pdf-render'
  | 'preview-unavailable';

/** Safe, actionable preview failure. Original technical details remain available in cause. */
export class DocumentError extends Error {
  readonly code: DocumentErrorCode;
  readonly retryable: boolean;
  readonly status?: number;
  readonly limit?: number;
  constructor(
    code: DocumentErrorCode,
    message: string,
    options: { retryable?: boolean; status?: number; limit?: number; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = 'DocumentError';
    this.code = code;
    this.retryable = options.retryable ?? false;
    this.status = options.status;
    this.limit = options.limit;
  }
}

export function documentFailure(cause: unknown, code: DocumentErrorCode = 'preview-unavailable') {
  if (cause instanceof DocumentError) return cause;
  const messages: Partial<Record<DocumentErrorCode, string>> = {
    network: '文档加载失败，请检查网络连接或文件地址后重试。',
    'read-failed': '无法读取此文件，请重新选择文件后重试。',
    'invalid-encoding': '无法读取文本编码，请将文件转换为 UTF-8 后重试。',
    'docx-parse': '无法预览 Word 文档，文件可能已损坏，请选择有效的 DOCX 文件。',
    'pdf-parse': '无法预览 PDF，文件可能已损坏，请选择有效的 PDF 文件。',
    'pdf-render': 'PDF 页面绘制失败，请重新加载文档，或下载后查看。',
    'preview-unavailable': '文档预览暂不可用，请重新加载文档，或下载后查看。',
  };
  return new DocumentError(code, messages[code] ?? messages['preview-unavailable']!, {
    cause,
    retryable:
      code === 'network' ||
      code === 'read-failed' ||
      code === 'pdf-render' ||
      code === 'preview-unavailable',
  });
}

export function oversizedDocument(limit: number) {
  const size =
    limit < 1024 * 1024
      ? `${Math.floor(limit)} 字节`
      : `${Math.round((limit / 1024 / 1024) * 10) / 10} MB`;
  return new DocumentError(
    'file-too-large',
    `文件超过 ${size} 的预览限制，请选择较小文件或下载后查看。`,
    { limit },
  );
}
export interface DocumentLoadInfo {
  format: DocumentFormat;
  filename?: string;
  size: number;
  pageCount?: number;
  text?: string;
  warnings?: string[];
}

export function sourceFilename(source?: DocumentSource) {
  if (!source) return undefined;
  if (typeof source !== 'string') return 'name' in source ? String(source.name) : undefined;
  try {
    return (
      decodeURIComponent(
        new URL(source, 'https://local.invalid').pathname.split('/').pop() || '',
      ) || undefined
    );
  } catch {
    return undefined;
  }
}
export function inferDocumentFormat(filename = '', mimeType = ''): DocumentFormat | undefined {
  mimeType = mimeType.split(';', 1)[0]!.trim().toLowerCase();
  const extension = filename.split('.').pop()?.toLowerCase() ?? '';
  if (extension === 'pdf') return 'pdf';
  if (extension === 'docx') return 'docx';
  const textType = textDocumentType(filename);
  if (textType) return textType.format;
  if (extension === 'doc') return undefined;
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('wordprocessingml.document')) return 'docx';
  if (mimeType === 'text/markdown') return 'markdown';
  if (mimeType === 'text/plain') return 'text';
  return undefined;
}
export function sourceLanguage(filename = '') {
  return textDocumentType(filename)?.language ?? 'text';
}

/** Bounded, cancellable reads. Remote requests use the browser's normal CORS policy. */
export async function readDocument(source: DocumentSource, signal: AbortSignal, maxBytes: number) {
  signal.throwIfAborted();
  const limit = Number.isFinite(maxBytes) && maxBytes > 0 ? maxBytes : 20 * 1024 * 1024;
  const tooLarge = () => oversizedDocument(limit);
  if (typeof source !== 'string') {
    if (source.size > limit) throw tooLarge();
    let data: ArrayBuffer;
    try {
      data = await source.arrayBuffer();
    } catch (cause) {
      signal.throwIfAborted();
      throw documentFailure(cause, 'read-failed');
    }
    signal.throwIfAborted();
    return { data, mimeType: source.type };
  }
  let response: Response;
  try {
    response = await fetch(source, { signal });
  } catch (cause) {
    signal.throwIfAborted();
    throw documentFailure(cause, 'network');
  }
  if (!response.ok) {
    const status = response.status;
    await response.body?.cancel().catch(() => {});
    throw new DocumentError('http', `文档加载失败（HTTP ${status}），请检查文件地址或访问权限。`, {
      status,
      retryable: status === 408 || status === 429 || status >= 500,
    });
  }
  if (Number(response.headers.get('content-length')) > limit) {
    await response.body?.cancel().catch(() => {});
    throw tooLarge();
  }
  const mimeType = response.headers.get('content-type')?.split(';', 1)[0]?.trim() ?? '';
  if (!response.body) {
    let data: ArrayBuffer;
    try {
      data = await response.arrayBuffer();
    } catch (cause) {
      signal.throwIfAborted();
      throw documentFailure(cause, 'network');
    }
    signal.throwIfAborted();
    if (data.byteLength > limit) throw tooLarge();
    return { data, mimeType };
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      signal.throwIfAborted();
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel().catch(() => {});
        throw tooLarge();
      }
      chunks.push(value);
    }
  } catch (cause) {
    signal.throwIfAborted();
    throw documentFailure(cause, 'network');
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { data: bytes.buffer, mimeType };
}

export function detectDocumentFormat(data: ArrayBuffer, filename = '', mimeType = '') {
  const bytes = new Uint8Array(data, 0, Math.min(8, data.byteLength));
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)
    return 'pdf';
  const inferred = inferDocumentFormat(filename, mimeType);
  if (inferred) return inferred;
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) return 'docx';
  throw new DocumentError(
    'unsupported-format',
    '暂不支持此文件格式，请选择 PDF、DOCX、Markdown、文本或代码文件。',
  );
}

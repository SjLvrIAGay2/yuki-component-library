/* =============================================================================
 * Yuki UI · locale
 * -----------------------------------------------------------------------------
 * Components never hardcode user-facing copy: every string goes through `t()`.
 * A component supplies an inline bilingual fallback, so new components never
 * need to edit this file; ConfigProvider can override any message.
 * ========================================================================== */

import { componentMessages } from './messages';

export type LocaleName = 'zh-CN' | 'en-US';

export interface LocaleConfig {
  /** BCP 47 tag used for Intl formatting and fallback selection. */
  name: LocaleName | (string & {});
  /** Overrides / additions for this locale. */
  messages?: Record<string, string>;
}

export type LocaleInput = LocaleName | LocaleConfig;

/**
 * Inline fallback copy. Components normally pass the compact `{ zh, en }`
 * shape; the long `{ 'zh-CN', 'en-US' }` form is also accepted for callers
 * that build fallbacks dynamically.
 */
export type Fallback =
  | string
  | Partial<Record<LocaleName, string>>
  | { zh?: string; en?: string };

export const zhCN: LocaleConfig = { name: 'zh-CN' };
export const enUS: LocaleConfig = { name: 'en-US' };

const builtinMessages: Record<LocaleName, Record<string, string>> = {
  'zh-CN': {
    'common.ok': '确定',
    'common.cancel': '取消',
    'common.close': '关闭',
    'common.clear': '清除',
    'common.confirm': '确认',
    'common.loading': '加载中',
    'common.search': '搜索',
    'common.noData': '暂无数据',
    'common.retry': '重试',
    'common.copy': '复制',
    'common.copied': '已复制',
    'common.more': '更多',
    'common.select': '请选择',
    'common.all': '全部',
    'common.yes': '是',
    'common.no': '否',
    'common.required': '此项为必填项',
    'common.reset': '重置',
    'common.apply': '应用',
    'common.back': '返回',
    'common.next': '下一步',
    'common.prev': '上一步',
    'common.done': '完成',
    'common.expand': '展开',
    'common.collapse': '收起',
    'common.upload': '上传',
    'common.remove': '移除',
    'common.preview': '预览',
    'common.today': '今天',
    'common.weekdaysShort': '日,一,二,三,四,五,六',
    'common.now': '此刻',
    'pagination.total': '共 {total} 条',
    'pagination.prev': '上一页',
    'pagination.next': '下一页',
    'pagination.jump': '跳至',
    'pagination.page': '页',
    'pagination.itemsPerPage': '条/页',
    'pagination.label': '分页',
    'pagination.pageLabel': '第 {page} 页',
    'table.empty': '暂无数据',
    'table.loading': '正在加载',
    'table.total': '共 {total} 条',
    'form.validationFailed': '请检查表单填写',
    'upload.drag': '点击或拖拽文件到此区域上传',
    'select.placeholder': '请选择',
    'search.placeholder': '搜索',
    'modal.ok': '确定',
    'modal.cancel': '取消',
    'tour.skip': '跳过',
    'tour.prev': '上一步',
    'tour.next': '下一步',
    'tour.finish': '完成',
    'colorPicker.presets': '预设颜色',
    'splitter.resize': '调整面板大小',
  },
  'en-US': {
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.clear': 'Clear',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading',
    'common.search': 'Search',
    'common.noData': 'No data',
    'common.retry': 'Retry',
    'common.copy': 'Copy',
    'common.copied': 'Copied',
    'common.more': 'More',
    'common.select': 'Select',
    'common.all': 'All',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.required': 'This field is required',
    'common.reset': 'Reset',
    'common.apply': 'Apply',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.prev': 'Previous',
    'common.done': 'Done',
    'common.expand': 'Expand',
    'common.collapse': 'Collapse',
    'common.upload': 'Upload',
    'common.remove': 'Remove',
    'common.preview': 'Preview',
    'common.today': 'Today',
    'common.weekdaysShort': 'Su,Mo,Tu,We,Th,Fr,Sa',
    'common.now': 'Now',
    'pagination.total': '{total} items',
    'pagination.prev': 'Previous',
    'pagination.next': 'Next',
    'pagination.jump': 'Go to',
    'pagination.page': 'page',
    'pagination.itemsPerPage': '/ page',
    'pagination.label': 'Pagination',
    'pagination.pageLabel': 'Page {page}',
    'table.empty': 'No data',
    'table.loading': 'Loading',
    'table.total': '{total} items',
    'form.validationFailed': 'Please check the form',
    'upload.drag': 'Click or drag files here to upload',
    'select.placeholder': 'Select',
    'search.placeholder': 'Search',
    'modal.ok': 'OK',
    'modal.cancel': 'Cancel',
    'tour.skip': 'Skip',
    'tour.prev': 'Previous',
    'tour.next': 'Next',
    'tour.finish': 'Finish',
    'colorPicker.presets': 'Presets',
    'splitter.resize': 'Resize panes',
  },
};

export function localeKey(locale: string): LocaleName {
  return locale.toLowerCase().startsWith('en') ? 'en-US' : 'zh-CN';
}

function resolveFallback(fallback: Fallback | undefined, name: LocaleName): string | undefined {
  if (!fallback) return undefined;
  if (typeof fallback === 'string') return fallback;
  const record = fallback as Record<string, string | undefined>;
  return record[name] ?? record[name === 'zh-CN' ? 'zh' : 'en'] ?? record['zh-CN'] ?? record.en;
}

export function formatMessage(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export interface TranslateOptions {
  locale: string;
  messages?: Record<string, string>;
}

/**
 * Resolve copy for a key.
 * Priority: provider messages → built-in dictionary → inline fallback → key.
 */
export function translate(
  key: string,
  options: TranslateOptions,
  fallback?: Fallback,
  vars?: Record<string, string | number>,
): string {
  const name = localeKey(options.locale);
  const message =
    options.messages?.[key] ??
    builtinMessages[name][key] ??
    (componentMessages[name] as Record<string, string>)[key] ??
    builtinMessages['zh-CN'][key] ??
    resolveFallback(fallback, name) ??
    key;
  return formatMessage(message, vars);
}

export function normalizeLocale(input: LocaleInput | undefined): LocaleConfig {
  if (!input) return zhCN;
  if (typeof input === 'string') return { name: input };
  return input;
}

/** Format a date for the active locale without pulling in a date library. */
export function formatDate(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, options).format(date);
}

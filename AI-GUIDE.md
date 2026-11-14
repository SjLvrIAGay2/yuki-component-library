# Yuki UI 组件使用指南

本文供生成 React / TypeScript 界面的 AI 和审查这些界面的开发者使用。按页面任务选择组件，再到对应小节确认数据结构、回调和示例。组件小节内嵌完整 TSX 示例和字段、回调、数据类型。在 GitHub 可展开阅读，安装包内的 Markdown 可直接离线检索。查找组件名如 `TableHead`，或搜索 `api:table` 可定位整个家族。

[接入与全局配置](#接入与全局配置) · [页面组合](#页面组合) · [基础和布局](#基础和布局) · [表单和选择](#表单和选择) · [数据展示](#数据展示) · [内容和媒体](#内容和媒体) · [导航](#导航) · [反馈与浮层](#反馈与浮层) · [公共-hooks](#公共-hooks)

## 接入与全局配置

组件从 `@yuki-ui/react` 具名导入，类型用 `import type`；也可从 `@yuki-ui/react/components/button` 这样的组件子路径导入。应用入口引入一次完整样式。包的 React 和 React DOM 的 peer 范围为 ^18.3.0 或 ^19.0.0。使用源码或 tarball 接入的方法见 [README](README.md)。已安装包可从 `require.resolve('@yuki-ui/react/ai-guide.md')` 找到同一份指南。文中的源码、站点和示例相对链接以仓库根目录为基准。

```tsx
import { Button, ConfigProvider } from '@yuki-ui/react';
import '@yuki-ui/react/styles.css';

export default function App() {
  return (
    <ConfigProvider locale="zh-CN" theme={{ mode: 'system' }}>
      <Button type="button" onClick={() => window.print()}>打印</Button>
    </ConfigProvider>
  );
}
```

**读类型的方法。** `?` 表示可选，`readonly` 数组可传常量元组。继承 `HTMLAttributes` 等 React 类型的组件接受相应元素的原生属性，`Omit` 中列出的字段采用组件自己声明的签名。`Primitive` 指对应 Radix 包，如 Dialog 小节中的 `@radix-ui/react-dialog`。引用的 Yuki 类型可在本文搜索，附带的源码入口列出实际可导入的名字。仅用于描述继承关系的局部类型可以通过公开的 Props 类型索引。示例里的业务回调和媒体文件由应用提供。复用文档站示例时，将 `./samples/` 和 `../../assets/` 中的文件替换为应用自己的资源。

**状态与样式。** 对可编辑数据只选一个状态来源。父组件持有值时将回调中的新值写回，非受控初值使用对应的 `default*` 字段。组件间既有 `value`、`checked`、`open`，也有 `fileList`、`targetKeys`、`page`，按具体签名传递。`undefined` 常用于选择非受控模式，清空时按组件使用空字符串、空数组或 `null`。全局主题决定色板和密度，局部覆写优先使用现有 `--yuki-*` token。只有声明了 `classNames` / `styles` 的组件支持对应语义槽，其他组件通过 `*Props` 或原生属性定制。

### ConfigProvider、ThemeProvider、LocaleProvider

`tokenVar('radius-md')` 返回对应的 CSS 变量引用。`TokenName` 收录内置令牌短名，可用于校验只含内置名称的覆盖表。组件的 `style` 和具名 `styles` 支持 CSS 自定义属性，共享样式对象可使用 `StyleProperties` 类型。

`ConfigProvider` 的缺省配置为浅色、`zh-CN`、`md`、`comfortable`。根层同步文档主题，嵌套配置作用于子树。用 `theme={{mode, primaryColor, tokens}}` 配主题，`components` 按组件名指定默认展示属性，实例 props 优先。`getPopupContainer(trigger)` 可指定浮层挂载点，在对话框和局部主题中优先沿用内置挂载点。

`ThemeProvider` 是子树主题入口，`theme="dark"`、`tokens={{'radius-md':'8px'}}` 和 `motion="none"` 是该入口的写法。`LocaleProvider locale="en-US" messages={{chooseFiles:'Choose attachments'}}` 局部覆盖文案。`useConfig()` 读取完整配置，`useResolvedTheme()` 读取实际明暗模式，`useTheme()` 提供主题、密度与动画设置。自定义浮层可从 `usePortalTheme()` 取得需转交根元素的属性。

<!-- api:theme -->

可导入 `ConfigProvider`、`LocaleProvider`、`ThemeProvider`、`tokenVar`、`useComponentDefaults`、`useComponentSize`、`useConfig`、`useLocale`、`usePortalTheme`、`useResolvedTheme`、`useTheme`。

[类型与导出入口](packages/ui/src/theme/index.ts) · [交互说明](apps/docs/src/content/开始/config-provider.md) · [可运行示例](apps/docs/src/examples/config-provider)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { ConfigProvider, Button, Flex, Typography, type Size } from '@yuki-ui/react';
import { useState } from 'react';

export default function ConfigProviderBasic() {
  const [locale, setLocale] = useState<'zh-CN' | 'en-US'>('zh-CN');
  const [size, setSize] = useState<Size>('md');

  return (
    <Flex direction="column" gap="4">
      <Flex gap="2" wrap align="center">
        <Button size="sm" variant="outline" onClick={() => setLocale('zh-CN')}>
          中文
        </Button>
        <Button size="sm" variant="outline" onClick={() => setLocale('en-US')}>
          English
        </Button>
        <span style={{ width: 'var(--yuki-space-2)' }} />
        {(['sm', 'md', 'lg'] as const).map((item) => (
          <Button
            key={item}
            size="sm"
            variant={size === item ? 'solid' : 'ghost'}
            onClick={() => setSize(item)}
          >
            {item}
          </Button>
        ))}
      </Flex>

      <div
        style={{
          padding: 'var(--yuki-space-4)',
          border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border)',
          borderRadius: 'var(--yuki-radius-lg)',
        }}
      >
        <ConfigProvider locale={locale} size={size}>
          <Flex direction="column" gap="3" align="start">
            <Typography.Text tone="secondary">
              {locale === 'zh-CN'
                ? '嵌套的 ConfigProvider：尺寸与语言只作用于这棵子树。'
                : 'A nested ConfigProvider: size and locale only affect this subtree.'}
            </Typography.Text>
            <Flex gap="2" wrap>
              <Button>确认</Button>
              <Button variant="soft">取消</Button>
              <Button variant="outline">更多</Button>
            </Flex>
          </Flex>
        </ConfigProvider>
      </div>
    </Flex>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
ConfigProvider({ children, theme: requestedTheme, locale: localeInput, size: requestedSize, motion: requestedMotion, density: requestedDensity, components: requestedComponents, animation: requestedAnimation, getPopupContainer: getPopupContainerProp, global: requestedGlobal, className, style, portalClassName, ...rootProps }: ConfigProviderProps): JSX.Element

LocaleProvider({ children, locale: input, messages: overrides }: LocaleProviderProps): JSX.Element

ThemeProvider({ theme, tokens, motion, ...props }: ThemeProviderProps): JSX.Element

tokenVar<Name extends TokenName>(name: Name): `var(--yuki-${Name})`

useComponentDefaults<Props extends object>(name: keyof ComponentDefaults, props: Props): Props

useComponentSize(size?: Size): Size

useConfig(): ConfigContextValue

useLocale(): { locale: LocaleConfig; messages: LocaleMessages; t: (key: string, fallback?: Fallback, vars?: Record<string, string | number>) => string; }

usePortalTheme(): { readonly className: "yuki-ui-root"; readonly 'data-yuki-theme': "light" | "dark"; readonly 'data-yuki-brand': "default" | "custom"; readonly 'data-yuki-density': Density; readonly 'data-yuki-motion': "on" | "off"; readonly style: StyleProperties; }

useResolvedTheme(): "light" | "dark"

useTheme(): { theme: "light" | "dark"; tokens: ThemeTokens | undefined; density: Density; motion: "system" | "none"; animation: false | AnimationOptions | undefined; components: ComponentDefaults; }

interface ComponentDefaults {
    Modal?: Defaults<ModalProps>;
    Dropdown?: Defaults<DropdownProps>;
    Result?: Defaults<ResultProps>;
    Empty?: Defaults<EmptyProps>;
    Divider?: Defaults<DividerProps>;
    Image?: Defaults<ImageProps>;
    Flex?: Defaults<FlexProps>;
    Space?: Defaults<SpaceProps>;
    Grid?: Defaults<GridProps>;
    Container?: Defaults<ContainerProps>;
    AspectRatio?: Defaults<AspectRatioProps>;
    Affix?: Defaults<AffixProps>;
    Scrollbar?: Defaults<ScrollbarProps>;
    Link?: Defaults<LinkProps>;
    Typography?: Defaults<TypographyBaseProps>;
    Spin?: Defaults<SpinProps>;
    Tag?: Defaults<TagProps>;
    Statistic?: Defaults<StatisticProps>;
    Descriptions?: Defaults<DescriptionsProps>;
    List?: Defaults<ListProps<unknown>>;
    Timeline?: Defaults<TimelineProps>;
    Steps?: Defaults<StepsProps>;
    Anchor?: Defaults<AnchorProps>;
    Breadcrumb?: Defaults<BreadcrumbProps>;
    Menu?: Defaults<MenuProps>;
    DatePicker?: Defaults<DatePickerProps>;
    TimePicker?: Defaults<TimePickerProps>;
    InputNumber?: Defaults<InputNumberProps>;
    ColorPicker?: Defaults<ColorPickerProps>;
    Search?: Defaults<SearchProps>;
    DateRangePicker?: Defaults<DateRangePickerProps>;
    Form?: Defaults<FormProps>;
    Radio?: Defaults<RadioProps>;
    Rate?: Defaults<RateProps>;
    Transfer?: Defaults<TransferProps>;
    Upload?: Defaults<UploadProps>;
    BatchUpload?: Defaults<BatchUploadProps>;
    Watermark?: Defaults<WatermarkProps>;
    QRCode?: Defaults<QRCodeProps>;
    Popover?: Defaults<PopoverProps>;
    Popconfirm?: Defaults<PopconfirmProps>;
    Drawer?: Defaults<DrawerProps>;
    BackTop?: Defaults<BackTopProps>;
    Tree?: Defaults<TreeProps>;
    TreeSelect?: Defaults<Omit<TreeSelectProps, 'multiple'>>;
    Cascader?: Defaults<CascaderProps>;
    Mentions?: Defaults<MentionsProps>;
    Calendar?: Defaults<CalendarProps>;
    Carousel?: Defaults<CarouselProps>;
    Splitter?: Defaults<SplitterProps>;
    Tour?: Defaults<TourProps>;
    Message?: Defaults<MessageProps>;
    Notification?: Defaults<NotificationProps>;
    Accordion?: Defaults<AccordionProps>;
    Alert?: Defaults<AlertProps>;
    Avatar?: Defaults<AvatarProps>;
    AvatarGroup?: Defaults<AvatarGroupProps>;
    Badge?: Defaults<BadgeProps>;
    Button?: Defaults<ButtonProps>;
    Card?: Defaults<CardProps>;
    Checkbox?: Defaults<CheckboxProps>;
    Dialog?: Defaults<DialogProps>;
    EmptyState?: Defaults<EmptyStateProps>;
    Input?: Defaults<InputProps>;
    Icon?: Defaults<IconProps>;
    Pagination?: Defaults<PaginationProps>;
    Progress?: Defaults<ProgressProps>;
    RadioGroup?: Defaults<RadioGroupProps>;
    Select?: Defaults<Omit<SelectProps, 'multiple'>>;
    Skeleton?: Defaults<SkeletonProps>;
    Slider?: Defaults<SliderProps>;
    RangeSlider?: Defaults<RangeSliderProps>;
    Switch?: Defaults<SwitchProps>;
    Table?: Defaults<TableProps<unknown>>;
    Tabs?: Defaults<TabsProps>;
    Textarea?: Defaults<TextareaProps>;
    ToastProvider?: Defaults<ToastProviderProps>;
    Tooltip?: Defaults<TooltipProps>;
    CodeBlock?: Defaults<CodeBlockProps>;
    Markdown?: Defaults<MarkdownProps>;
    DocumentViewer?: Defaults<DocumentViewerProps>;
    VideoPlayer?: Defaults<VideoPlayerProps>;
    AudioPlayer?: Defaults<AudioPlayerProps>;
    ContentRenderer?: Defaults<ContentRendererProps>;
    ImageViewer?: Defaults<ImageViewerProps>;
    PagePreset?: Defaults<PagePresetProps>;
    ErrorPage?: Defaults<ErrorPageProps>;
    EmptyPage?: Defaults<EmptyPageProps>;
    ResultPage?: Defaults<ResultPageProps>;
    LoadingPage?: Defaults<LoadingPageProps>;
    MaintenancePage?: Defaults<MaintenancePageProps>;
    OfflinePage?: Defaults<OfflinePageProps>;
    RedirectPage?: Defaults<RedirectPageProps>;
}

interface ConfigContextValue {
    size: Size;
    density: Density;
    components: ComponentDefaults;
    animation?: AnimationOptions | false;
    messages: LocaleMessages;
    themeVars: StyleProperties;
    motion: boolean;
    locale: LocaleConfig;
    theme: ThemeConfig;
    resolvedTheme: 'light' | 'dark';
    t: (key: string, fallback?: Fallback, vars?: Record<string, string | number>) => string;
    getPopupContainer: (trigger?: HTMLElement | null) => HTMLElement;
}

interface ConfigProviderProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
    children: ReactNode;
    theme?: ThemeConfig;
    locale?: LocaleInput;
    size?: Size;
    motion?: boolean;
    density?: Density;
    animation?: AnimationOptions | false;
    components?: ComponentDefaults;
    getPopupContainer?: (trigger: HTMLElement | null) => HTMLElement;
    global?: boolean;
    className?: string;
    style?: StyleProperties;
    portalClassName?: string;
}

type Density = 'comfortable' | 'compact';

interface LocaleProviderProps {
    children: ReactNode;
    locale?: LocaleInput;
    messages?: Partial<LocaleMessages> & Record<string, string | undefined>;
}

type MotionPreference = 'system' | 'none';

type Size = 'sm' | 'md' | 'lg';

type StyleProperties = CSSProperties | (CSSProperties & {
    [variable: `--${string}`]: string | number | undefined;
});

type Theme = ThemeMode;

interface ThemeConfig {
    mode?: ThemeMode;
    primaryColor?: string;
    tokens?: ThemeTokens;
}

type ThemeContextValue = ReturnType<typeof useTheme>;

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeProviderProps extends Omit<ConfigProviderProps, 'theme' | 'motion'> {
    theme?: ThemeMode;
    tokens?: ThemeTokens;
    motion?: MotionPreference;
}

type ThemeTokens = Partial<Record<TokenName | `--yuki-${TokenName}`, string | number>> & Record<string, string | number>;

type TokenName = 'amber-100' | 'amber-200' | 'amber-400' | 'amber-50' | 'amber-500' | 'amber-600' | 'backdrop-blur' | 'backdrop-blur-xs' | 'border-width-medium' | 'border-width-thick' | 'border-width-thin' | 'breakpoint-2xl' | 'breakpoint-lg' | 'breakpoint-md' | 'breakpoint-sm' | 'breakpoint-xl' | 'breakpoint-xs' | 'color-bg-active' | 'color-bg-canvas' | 'color-bg-disabled' | 'color-bg-elevated' | 'color-bg-glass' | 'color-bg-hover' | 'color-bg-inverse' | 'color-bg-muted' | 'color-bg-overlay' | 'color-bg-subtle' | 'color-bg-surface' | 'color-border' | 'color-border-inverse' | 'color-border-strong' | 'color-border-subtle' | 'color-danger' | 'color-danger-border' | 'color-danger-contrast' | 'color-danger-hover' | 'color-danger-subtle' | 'color-divider' | 'color-info' | 'color-info-border' | 'color-info-contrast' | 'color-info-hover' | 'color-info-subtle' | 'color-primary' | 'color-primary-active' | 'color-primary-border' | 'color-primary-contrast' | 'color-primary-hover' | 'color-primary-ring' | 'color-primary-subtle' | 'color-primary-subtle-hover' | 'color-success' | 'color-success-border' | 'color-success-contrast' | 'color-success-hover' | 'color-success-subtle' | 'color-text' | 'color-text-disabled' | 'color-text-inverse' | 'color-text-link' | 'color-text-link-hover' | 'color-text-placeholder' | 'color-text-secondary' | 'color-text-tertiary' | 'color-warning' | 'color-warning-border' | 'color-warning-contrast' | 'color-warning-hover' | 'color-warning-subtle' | 'control-gap-lg' | 'control-gap-md' | 'control-gap-sm' | 'control-gap-xs' | 'control-height-lg' | 'control-height-md' | 'control-height-sm' | 'control-height-xl' | 'control-height-xs' | 'control-padding-lg' | 'control-padding-md' | 'control-padding-sm' | 'control-padding-xs' | 'cyan-100' | 'cyan-200' | 'cyan-400' | 'cyan-50' | 'cyan-500' | 'cyan-600' | 'density-content-padding' | 'density-gap' | 'duration-base' | 'duration-fast' | 'duration-instant' | 'duration-slow' | 'duration-slower' | 'easing-bounce' | 'easing-enter' | 'easing-exit' | 'easing-standard' | 'emerald-100' | 'emerald-200' | 'emerald-400' | 'emerald-50' | 'emerald-500' | 'emerald-600' | 'focus-ring-color' | 'focus-ring-offset' | 'focus-ring-width' | 'font-family-mono' | 'font-family-sans' | 'font-size-2xl' | 'font-size-2xs' | 'font-size-3xl' | 'font-size-4xl' | 'font-size-5xl' | 'font-size-lg' | 'font-size-md' | 'font-size-sm' | 'font-size-xl' | 'font-size-xs' | 'font-weight-bold' | 'font-weight-medium' | 'font-weight-regular' | 'font-weight-semibold' | 'graphite-0' | 'graphite-100' | 'graphite-200' | 'graphite-300' | 'graphite-400' | 'graphite-50' | 'graphite-500' | 'graphite-600' | 'graphite-700' | 'graphite-800' | 'graphite-900' | 'graphite-950' | 'icon-size-2xl' | 'icon-size-2xs' | 'icon-size-3xl' | 'icon-size-lg' | 'icon-size-md' | 'icon-size-sm' | 'icon-size-xl' | 'icon-size-xs' | 'iris-100' | 'iris-200' | 'iris-300' | 'iris-400' | 'iris-50' | 'iris-500' | 'iris-600' | 'iris-700' | 'iris-800' | 'iris-900' | 'iris-950' | 'letter-spacing-normal' | 'letter-spacing-tight' | 'letter-spacing-wide' | 'letter-spacing-wider' | 'line-height-loose' | 'line-height-none' | 'line-height-normal' | 'line-height-relaxed' | 'line-height-snug' | 'line-height-tight' | 'mask-color' | 'opacity-disabled' | 'opacity-muted' | 'opacity-overlay' | 'popup-bg' | 'popup-border' | 'popup-radius' | 'popup-shadow' | 'popup-width-lg' | 'popup-width-md' | 'popup-width-sm' | 'popup-width-xs' | 'radius-2xl' | 'radius-3xl' | 'radius-full' | 'radius-lg' | 'radius-md' | 'radius-none' | 'radius-sm' | 'radius-xl' | 'radius-xs' | 'red-100' | 'red-200' | 'red-400' | 'red-50' | 'red-500' | 'red-600' | 'scrollbar-size' | 'scrollbar-thumb' | 'scrollbar-thumb-hover' | 'shadow-focus' | 'shadow-inner' | 'shadow-lg' | 'shadow-md' | 'shadow-sm' | 'shadow-xl' | 'shadow-xs' | 'space-0' | 'space-0-5' | 'space-1' | 'space-1-5' | 'space-10' | 'space-12' | 'space-14' | 'space-16' | 'space-2' | 'space-2-5' | 'space-20' | 'space-24' | 'space-28' | 'space-3' | 'space-3-5' | 'space-4' | 'space-40' | 'space-5' | 'space-6' | 'space-64' | 'space-7' | 'space-8' | 'space-9' | 'transition-colors' | 'transition-opacity' | 'transition-transform' | 'z-base' | 'z-dropdown' | 'z-max' | 'z-modal' | 'z-overlay' | 'z-popover' | 'z-sticky' | 'z-toast' | 'z-tooltip' | 'z-tour';

type Defaults<Props> = {
    [Key in keyof Props as Key extends `on${string}` | 'children' | 'value' | 'defaultValue' | 'checked' | 'defaultChecked' | 'open' | 'defaultOpen' | 'src' | 'options' | 'page' | 'totalPages' | 'trigger' | 'title' | 'content' | 'name' | 'id' | 'href' | 'autoRedirect' ? never : Key]?: Props[Key];
};

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### 语言与翻译

`useLocale()` 返回 `{locale, messages, t}`，例如 `t('project.new', {zh:'新项目', en:'New project'})`。已有语言包可以从 `zhCN`、`enUS` 开始。组件树外用 `translate(key, {locale, messages}, fallback, vars)`，占位值放入 `vars`。需要按用户区域格式化日期时用 `formatDate(date, locale.name, options)`。

<!-- api:locale -->

可导入 `LocaleProvider`、`enUS`、`formatDate`、`formatMessage`、`localeKey`、`normalizeLocale`、`translate`、`useLocale`、`zhCN`。

[类型与导出入口](packages/ui/src/locale/index.ts)

<details>
<summary>字段、回调与数据类型</summary>

```ts
LocaleProvider({ children, locale: input, messages: overrides }: LocaleProviderProps): JSX.Element

formatDate(date: Date, locale: string, options: Intl.DateTimeFormatOptions): string

formatMessage(template: string, vars?: Record<string, string | number>): string

localeKey(locale: string): LocaleName

normalizeLocale(input: LocaleInput | undefined): LocaleConfig

translate(key: string, options: TranslateOptions, fallback?: Fallback, vars?: Record<string, string | number>): string

useLocale(): { locale: LocaleConfig; messages: LocaleMessages; t: (key: string, fallback?: Fallback, vars?: Record<string, string | number>) => string; }

type Fallback = string | Partial<Record<LocaleName, string>> | {
    zh?: string;
    en?: string;
};

type Locale = 'zh-CN' | 'en-US';

interface LocaleConfig {
    name: LocaleName | (string & {});
    messages?: Record<string, string>;
}

type LocaleInput = LocaleName | LocaleConfig;

type LocaleMessages = { uploading: string;
    uploadDone: string;
    uploadFailed: string;
    remove: string;
    add: string;
    startDate: string;
    endDate: string;
    available: string;
    chosen: string;
    filterOptions: string;
    chooseFiles: string;
    confirm: string;
    backTop: string;
    level: string;
    previousMonth: string;
    nextMonth: string;
    resize: string;
    done: string;
    pageError401Title: string;
    pageError401Description: string;
    pageError403Title: string;
    pageError403Description: string;
    pageError404Title: string;
    pageError404Description: string;
    pageError500Title: string;
    pageError500Description: string;
    pageError503Title: string;
    pageError503Description: string;
    pageErrorTitle: string;
    pageErrorDescription: string;
    pageRedirectTitle: string;
    pageRedirectDescription: string;
    pageRedirectCountdown: string;
    pageRedirectNow: string;
    pageRedirectInvalid: string;
    pageRedirectFailed: string;
    pageRedirectCancelled: string;
    pageRedirectComplete: string;
    pageLoadingTitle: string;
    pageLoadingDescription: string;
    pageEmptyTitle: string;
    pageEmptyDescription: string;
    pageSearchEmptyTitle: string;
    pageSearchEmptyDescription: string;
    pageMaintenanceTitle: string;
    pageMaintenanceDescription: string;
    pageRecoveryTime: string;
    pageOfflineTitle: string;
    pageOfflineDescription: string;
    pageReconnecting: string;
    pageReconnected: string;
    pageRetryFailed: string;
    pageSuccessTitle: string;
    pageFailureTitle: string;
    pageWarningTitle: string;
    pageProcessingTitle: string;
    pageResultDescription: string;
    pageRetry: string;
    pageCancel: string;
    pageCancelled: string;
    selectPlaceholder: string;
    sliderValue: string;
    progressLabel: string;
    paginationLabel: string;
    previousPage: string;
    nextPage: string;
    page: string;
    tableRegion: string;
    tableSortColumn: string;
    tableSortAscending: string;
    tableSortDescending: string;
    tableSortClear: string;
    dialogClose: string;
    alertClose: string;
    toastLabel: string;
    toastClose: string;
    copyCode: string;
    copied: string;
    copyFailed: string;
    copySuccessStatus: string;
    copyErrorStatus: string;
    codeLabel: string;
    renderLimit: string;
    markdownLimit: string;
    taskState: string;
    markdownTable: string;
    imageFallback: string;
    documentTitle: string;
    documentChoose: string;
    documentReading: string;
    documentRetry: string;
    documentWord: string;
    documentUnsupported: string;
    documentTooLarge: string;
    documentNetwork: string;
    documentHttp: string;
    documentReadFailed: string;
    documentInvalidEncoding: string;
    documentInvalidDocx: string;
    documentInvalidPdf: string;
    documentPdfRenderFailed: string;
    documentUnavailable: string;
    pdfLoading: string;
    pdfPassword: string;
    pdfPasswordHint: string;
    pdfUnlock: string;
    pdfPrevious: string;
    pdfNext: string;
    pdfZoomOut: string;
    pdfResetZoom: string;
    pdfZoomIn: string;
    pdfPageCount: string;
    pdfPage: string;
    pdfRendering: string;
    pdfRendered: string;
    audioTitle: string;
    videoTitle: string;
    mediaPreparing: string;
    mediaPlaying: string;
    mediaEnded: string;
    audioChoose: string;
    videoChoose: string;
    mediaMetadataLoading: string;
    mediaBuffering: string;
    mediaControls: string;
    mediaProgress: string;
    play: string;
    pause: string;
    replay: string;
    playVideo: string;
    replayVideo: string;
    skipBackward: string;
    skipForward: string;
    mute: string;
    unmute: string;
    volume: string;
    playbackRate: string;
    captions: string;
    captionsOff: string;
    caption: string;
    fullscreen: string;
    exitFullscreen: string;
    fullscreenFailure: string;
    mediaPlayFailure: string;
    mediaSeekFailure: string;
    mediaAborted: string;
    mediaNetwork: string;
    mediaDecode: string;
    mediaUnsupported: string;
    mediaFailure: string; };

type LocaleName = 'zh-CN' | 'en-US';

interface LocaleProviderProps {
    children: ReactNode;
    locale?: LocaleInput;
    messages?: Partial<LocaleMessages> & Record<string, string | undefined>;
}

interface TranslateOptions {
    locale: string;
    messages?: Record<string, string>;
}
```

</details>

<!-- /api -->

## 页面组合

### 需要校验的编辑对话框

让 `Form` 管字段和校验，让父组件管 `Dialog.open`。给弹窗起可访问的标题，提交按钮显式设置 `type="submit"`。异步保存时业务代码可以在成功后关闭，在失败时保留草稿并展示原因。

```tsx
import { useState } from 'react';
import { Alert, Button, Dialog, Form, Input, Select } from '@yuki-ui/react';

export function ProjectEditor({ save }: { save: (name: string, teams: string[]) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit({ name, teams }: { name: string; teams: string[] }) {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      await save(name.trim(), teams);
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => {
      if (!saving) { setError(''); setOpen(next); }
    }} title="创建项目" trigger={<Button>新建</Button>}>
      <Form<{ name: string; teams: string[] }>
        layout="vertical"
        disabled={saving}
        initialValues={{ name: '', teams: [] }}
        onFinish={submit}
      >
        <Form.Item name="name" label="项目名" rules={[{ required: true, whitespace: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="teams" label="参与团队">
          <Select multiple searchable options={[{ value: 'design', label: '设计' }, { value: 'dev', label: '工程' }]} />
        </Form.Item>
        {error && <Alert tone="danger" title="无法保存项目" description={error} />}
        <Button type="submit" loading={saving}>创建</Button>
      </Form>
    </Dialog>
  );
}
```

### 带检索和分页的数据表

搜索输入持有查询串，页码以 1 为起点。改变查询时一起重置页码。客户端分页把过滤后的完整数组交给 Table；服务端分页传当前页数据，设置 `pagination.serverSide`、`total` 并在 `onChange(page, pageSize)` 发新请求。行使用稳定的业务主键以便跨页跟踪选中项。

```tsx
import { useState } from 'react';
import { EmptyState, Input, Table, type TableColumn } from '@yuki-ui/react';

type Project = { id: number; name: string };
const columns: TableColumn<Project>[] = [{ key: 'name', dataIndex: 'name', title: '项目' }];

export function ProjectTable({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  return <>
    <Input aria-label="查找项目" value={query} onChange={s => { setQuery(s); setPage(1); }} />
    <Table columns={columns} rowKey="id" data={projects.filter(row => row.name.includes(query))}
      empty={<EmptyState title="没有匹配的项目" />}
      pagination={{ page, pageSize: 10, onChange: setPage }} />
  </>;
}
```

### 本地附件预览

让 Upload 管理选择，让 ContentRenderer 或 DocumentViewer 渲染原始 File。用 `fileList` / `onChange` 同步当前列表；传输由 `action` 或 `customRequest` 启用。本地文件预览可以省略上传地址。持续挂载的标签页面把可见性传给媒体播放器或 PDF 预览的 `active`。

```tsx
import { useState } from 'react';
import { ContentRenderer, EmptyState, Upload, type UploadFile } from '@yuki-ui/react';

export function AttachmentPreview() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const file = files[0]?.originFile;
  return <>
    <Upload accept=".pdf,.docx,.md,.txt,image/*,video/*,audio/*" maxCount={1}
      fileList={files} onChange={setFiles} label="选择附件" />
    {!file ? <EmptyState title="请选择要查看的附件" />
      : file.type.startsWith('image/') ? <ContentRenderer type="image" src={file} alt={file.name} />
      : file.type.startsWith('audio/') ? <ContentRenderer type="audio" src={file} title={file.name} />
      : file.type.startsWith('video/') ? <ContentRenderer type="video" src={file} title={file.name} />
      : <ContentRenderer type="document" src={file} filename={file.name} />}
  </>;
}
```

### 页面状态与交互选择

| 任务 | 组合与状态归属 |
| --- | --- |
| 详情工作台 | Container 包 Grid，GridItem 在小屏占满再用 responsive 分栏。Card 内放 Descriptions、Timeline，Tabs 分离互斥内容，Accordion 可同时展开多个分区。 |
| 权限或成员分配 | 少量固定选项用 CheckboxGroup 或 RadioGroup，需搜索用 Select，路径提交用 Cascader，明确展示已分配区域用 Transfer。将 ID 写入表单，显示名称留在选项数据中。 |
| 删除与提交 | 行内二次确认用 Popconfirm，表单任务用 Dialog，保留列表上下文的侧面板用 Drawer。请求成功后刷新列表，短反馈用 Message，需要用户稍后操作的通知可提供 action。 |
| 异步内容 | 首次载入用 Skeleton，已有内容上的刷新用 Spin，已知进度用 Progress，未知进度用 value={null}。首次空数据和过滤后零结果应提供对应 Empty 或 EmptyState 说明。显式区分读取错误和空结果。 |
| 大量数据 | 优先选择 List、Table 或 Tree 自带的虚拟滚动，设置可测量的视口与固定行高。网格列表、可变高度的展开行选择普通分页。 |
| 可访问交互 | IconButton 提供 aria-label，表单控件提供 label 或关联的 Form.Item，纯装饰性分隔线用 Divider decorative。浮层触发器使用可聚焦并转交 ref/事件的元素。 |

## 基础和布局

### Button、IconButton

`<Button variant="outline" tone="danger" startIcon={<Icon name="trash" />}>移除</Button>` 中 variant 定义表面样式，tone 定义语义色。省略时为 solid / primary。满宽用 block，左右图标用 startIcon / endIcon。loading 可配 loadingText 和 loadingIndicator，并在等待时阻止再次点击。默认按钮类型为 button。`<IconButton icon={<Icon name="search" />} aria-label="搜索" />` 适用于仅图标的操作。

<!-- api:button -->

可导入 `Button`、`IconButton`。

[类型与导出入口](packages/ui/src/components/button/index.ts) · [交互说明](apps/docs/src/content/基础/button.md) · [可运行示例](apps/docs/src/examples/button)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Button, Icon } from '@yuki-ui/react';

export default function BasicButton() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 'var(--yuki-space-3)',
      }}
    >
      <Button startIcon={<Icon name="sparkles" />}>生成摘要</Button>
      <Button variant="soft" tone="neutral">
        次要操作
      </Button>
      <Button variant="outline" tone="neutral">
        描边按钮
      </Button>
      <Button variant="ghost" tone="neutral">
        幽灵按钮
      </Button>
      <Button variant="link">文字链接</Button>
      <Button tone="danger" startIcon={<Icon name="trash" />}>
        删除
      </Button>
      <Button loading loadingText="保存中">
        保存
      </Button>
      <Button disabled>不可用</Button>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Button(props: ButtonProps & RefAttributes<HTMLButtonElement>): ReactNode

IconButton(props: IconButtonProps & RefAttributes<HTMLButtonElement>): ReactNode

type ButtonClassNames = Partial<Record<'root' | 'icon' | 'label' | 'spinner', string>>;

interface ButtonProps extends Omit<WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>, 'color'> {
    variant?: ButtonVariant;
    tone?: ButtonTone;
    size?: Size;
    shape?: ButtonShape;
    block?: boolean;
    loading?: boolean;
    loadingText?: ReactNode;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    loadingIndicator?: ReactNode;
    spinnerProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    animation?: AnimationOptions | false;
    iconOnly?: boolean;
    classNames?: ButtonClassNames;
    styles?: ButtonStyles;
}

type ButtonShape = 'default' | 'round' | 'circle' | 'square';

type ButtonStyles = Partial<Record<'root' | 'icon' | 'label' | 'spinner', StyleProperties>>;

type ButtonTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'text' | 'link';

interface IconButtonProps extends Omit<ButtonProps, 'iconOnly' | 'children' | 'startIcon' | 'endIcon'> {
    icon: ReactNode;
    'aria-label': string;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Icon

`<Icon name="calendar" size={20} />` 随文字颜色绘制。装饰图标默认隐藏于读屏，需要独立说明时传 label。可把 path 等 SVG 子节点作为 children 提供给 Icon；可用名称来自 IconName 或运行时 iconNames。

<!-- api:icon -->

可导入 `Icon`、`iconNames`、`iconNodes`。

[类型与导出入口](packages/ui/src/components/icon/index.ts) · [交互说明](apps/docs/src/content/基础/icon.md) · [可运行示例](apps/docs/src/examples/icon)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Icon, iconNames } from '@yuki-ui/react';

const FEATURED = [
  'sparkles',
  'search',
  'settings',
  'bell',
  'calendar',
  'folder',
  'trash',
  'download',
  'heart',
  'star',
  'user',
  'mail',
  'lock',
  'sun',
  'moon',
  'monitor',
] as const;

export default function BasicIcon() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-4)' }}>
        {FEATURED.map((name) => (
          <span
            key={name}
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--yuki-space-1-5)',
              width: '4rem',
              color: 'var(--yuki-color-text-secondary)',
              fontSize: 'var(--yuki-font-size-2xs)',
            }}
          >
            <Icon name={name} size="1.25rem" />
            {name}
          </span>
        ))}
      </div>
      <p style={{ margin: 0, color: 'var(--yuki-color-text-tertiary)', fontSize: 'var(--yuki-font-size-xs)' }}>
        内置 {iconNames.length} 个图标，均可通过 <code>IconName</code> 获得类型提示。
      </p>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Icon(props: Omit<IconProps, "ref"> & RefAttributes<SVGSVGElement>): ReactNode

type IconName = "play" | "pause" | "type" | "text" | "link" | "circle" | "filter" | "x" | "pdf" | "audio" | "video" | "archive" | "document" | "spreadsheet" | "presentation" | "close" | "arrow-up" | "arrow-down" | "arrow-left" | "arrow-right" | "arrow-up-right" | "arrow-down-left" | "arrow-left-right" | "arrow-up-down" | "chevron-up" | "chevron-down" | "chevron-left" | "chevron-right" | "chevrons-up" | "chevrons-down" | "chevrons-left" | "chevrons-right" | "corner-down-left" | "check" | "check-circle" | "x-circle" | "plus" | "plus-circle" | "minus" | "minus-circle" | "search" | "info" | "alert-circle" | "alert-triangle" | "help-circle" | "lock" | "unlock" | "eye" | "eye-off" | "calendar" | "clock" | "upload" | "download" | "trash" | "edit" | "copy" | "external-link" | "more-horizontal" | "more-vertical" | "grip-vertical" | "menu" | "settings" | "user" | "users" | "mail" | "star" | "heart" | "sliders" | "refresh" | "home" | "folder" | "file" | "image" | "sun" | "moon" | "monitor" | "palette" | "grid" | "list" | "loader" | "maximize" | "minimize" | "sort" | "sort-asc" | "sort-desc" | "code" | "terminal" | "layers" | "database" | "bell" | "bookmark" | "camera" | "map-pin" | "phone" | "send" | "share" | "shield" | "tag" | "wifi" | "zoom-in" | "zoom-out" | "sparkles" | "dot" | "layout" | "inbox" | "snowflake";

interface IconProps extends Omit<WithStyle<SVGProps<SVGSVGElement>>, 'name' | 'children'> {
    name?: IconName;
    size?: number | string;
    label?: string;
    spin?: boolean;
    children?: ReactNode;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Typography、Title、Text、Paragraph

用 `<Title level={1}>项目</Title>` 写标题，level 决定 h1–h6 和默认字号。Text 默认行内，Paragraph 默认为 p，Typography 是容器，静态成员 Typography.Title / Text / Paragraph 亦可用。tone、weight、size 控制文本样式，`truncate={2}` 限两行。需要不同元素时传 as，并核对实际文档层级。

<!-- api:typography -->

可导入 `Paragraph`、`Text`、`Title`、`Typography`。

[类型与导出入口](packages/ui/src/components/typography/index.ts) · [交互说明](apps/docs/src/content/基础/typography.md) · [可运行示例](apps/docs/src/examples/typography)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Paragraph, Text, Title } from '@yuki-ui/react';

export default function BasicTypography() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <Title level={1}>静谧的界面语言</Title>
      <Title level={2}>区块标题</Title>
      <Title level={3}>小节标题</Title>
      <Title level={4}>更小的标题</Title>
      <Title level={5}>最小标题</Title>

      <Paragraph>
        正文默认使用舒展的行高，适合连续阅读。字号、行高与颜色都来自全局 token，
        因此明暗主题切换时不需要任何组件改动。
      </Paragraph>
      <Text tone="secondary">次级说明文字，用于补充标题之上的上下文。</Text>
      <Text tone="tertiary" size="sm">
        三级文字，用于时间戳、来源与低频元信息。
      </Text>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Paragraph(props: ParagraphProps & RefAttributes<HTMLElement>): ReactNode

Text(props: TextProps & RefAttributes<HTMLElement>): ReactNode

Title(props: TitleProps & RefAttributes<HTMLElement>): ReactNode

Typography(props: TypographyBaseProps & RefAttributes<HTMLElement>): ReactNode

interface ParagraphProps extends Omit<TextProps, 'as'> {
    as?: ElementType;
}

interface TextProps extends TypographyBaseProps {
    children?: ReactNode;
}

interface TitleProps extends Omit<TypographyBaseProps, 'size' | 'as'> {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    size?: TypographySize;
    as?: ElementType;
    plain?: boolean;
}

type TypographyAlign = 'start' | 'center' | 'end' | 'justify';

interface TypographyBaseProps extends Omit<WithStyle<HTMLAttributes<HTMLElement>>, 'color'> {
    as?: ElementType;
    size?: TypographySize;
    weight?: TypographyWeight;
    tone?: TypographyTone;
    align?: TypographyAlign;
    truncate?: boolean | number;
    gutterBottom?: boolean;
    strong?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
    mark?: boolean;
    classNames?: TypographyClassNames;
    styles?: TypographyStyles;
    children?: ReactNode;
}

type TypographyClassNames = Partial<Record<'root', string>>;

type TypographyProps = TypographyBaseProps;

type TypographySize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

type TypographyStyles = Partial<Record<'root', StyleProperties>>;

type TypographyTone = 'default' | 'secondary' | 'tertiary' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'inverse';

type TypographyWeight = 'regular' | 'medium' | 'semibold' | 'bold';

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Link

`<Link href="/projects">项目</Link>` 用于页面跳转。external 提供外链处理，underline 决定何时显示下划线，disabled 阻止激活。需要改变数据的操作使用 Button。

<!-- api:link -->

可导入 `Link`。

[类型与导出入口](packages/ui/src/components/link/index.ts) · [交互说明](apps/docs/src/content/基础/link.md) · [可运行示例](apps/docs/src/examples/link)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Link, Text } from '@yuki-ui/react';

export default function BasicLink() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <Text>
        阅读 <Link href="#/c/typography">排版指南</Link> 了解字号阶梯，或查看{' '}
        <Link href="#/tokens">设计令牌</Link>。
      </Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-4)' }}>
        <Link href="#" underline="always">
          始终下划线
        </Link>
        <Link href="#" underline="hover">
          悬停下划线
        </Link>
        <Link href="#" underline="none">
          无下划线
        </Link>
        <Link href="#" tone="subtle">
          低调链接
        </Link>
        <Link href="#" tone="danger">
          危险操作
        </Link>
      </div>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Link(props: LinkProps & RefAttributes<HTMLAnchorElement>): ReactNode

type LinkClassNames = Partial<Record<'root' | 'icon', string>>;

interface LinkProps extends Omit<WithStyle<AnchorHTMLAttributes<HTMLAnchorElement>>, 'color'> {
    underline?: LinkUnderline;
    tone?: LinkTone;
    size?: LinkSize;
    external?: boolean;
    icon?: ReactNode;
    disabled?: boolean;
    classNames?: LinkClassNames;
    styles?: LinkStyles;
}

type LinkSize = 'sm' | 'md' | 'lg';

type LinkStyles = Partial<Record<'root' | 'icon', StyleProperties>>;

type LinkTone = 'default' | 'subtle' | 'danger';

type LinkUnderline = 'auto' | 'always' | 'hover' | 'none';

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Divider

`<Divider>或</Divider>` 分组内容，labelPosition 控制文字位置，orientation 切换方向。工具栏图标之间可放 `<Divider orientation="vertical" decorative />`。默认 decorative 为 false，读屏可以识别内容分界。

<!-- api:divider -->

可导入 `Divider`。

[类型与导出入口](packages/ui/src/components/divider/index.ts) · [交互说明](apps/docs/src/content/基础/divider.md) · [可运行示例](apps/docs/src/examples/divider)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Divider, Text } from '@yuki-ui/react';

export default function BasicDivider() {
  return (
    <div>
      <Text>账户信息与安全设置属于不同的心理分组，用一条克制的水平线提示边界。</Text>
      <Divider />
      <Text tone="secondary">默认分隔，无标签。</Text>
      <Divider>或</Divider>
      <Text tone="secondary">居中标签，适合登录/注册之间的切换提示。</Text>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Divider(props: DividerProps & RefAttributes<HTMLDivElement>): ReactNode

type DividerClassNames = Partial<Record<'root' | 'label', string>>;

type DividerLabelPosition = 'start' | 'center' | 'end';

type DividerOrientation = 'horizontal' | 'vertical';

interface DividerProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
    decorative?: boolean;
    orientation?: DividerOrientation;
    variant?: DividerVariant;
    labelPosition?: DividerLabelPosition;
    strong?: boolean;
    classNames?: DividerClassNames;
    styles?: DividerStyles;
    children?: ReactNode;
}

type DividerStyles = Partial<Record<'root' | 'label', StyleProperties>>;

type DividerVariant = 'solid' | 'dashed' | 'dotted';

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Animation

`<Animation open={visible} animation={{preset:'slide', direction:'down', duration:160}}>…</Animation>`。duration 和 delay 单位为毫秒。forceMount 适合关合后还要保留子组件状态的内容；自定义 keyframes 用 custom 及 enterName / exitName。组件会考虑全局 motion 与系统减少动效偏好。自定义部件可以使用 useAnimation、usePresence、useReducedMotion。

<!-- api:animation -->

可导入 `Animation`、`useAnimation`、`usePresence`、`useReducedMotion`。

[类型与导出入口](packages/ui/src/animation/index.ts) · [交互说明](apps/docs/src/content/基础/animation.md) · [可运行示例](apps/docs/src/examples/animation)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Animation, Button } from '@yuki-ui/react';

export default function ToggleDetails() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button variant="outline" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '收起详情' : '查看详情'}</Button>
      <Animation open={open} animation={{ preset: 'slide', direction: 'down', distance: 8, duration: 180 }}>
        <p>此版本包含新的文档阅读和文件预览组件。</p>
      </Animation>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Animation(props: AnimationProps & RefAttributes<HTMLDivElement>): ReactNode

useAnimation(options: AnimationOptions | false | undefined, fallback?: AnimationPreset): { readonly className: "yuki-motion"; readonly style: CSSProperties & Record<`--yuki-${string}`, string | number>; readonly 'data-yuki-motion-preset': AnimationPreset; readonly 'data-yuki-direction': AnimationDirection; readonly 'data-yuki-presence': "" | undefined; readonly duration: number; readonly delay: number; }

usePresence(open: boolean, duration: number, delay?: number): boolean

useReducedMotion(): boolean

type AnimationDirection = 'up' | 'down' | 'left' | 'right';

interface AnimationOptions {
    preset?: AnimationPreset;
    duration?: number;
    delay?: number;
    easing?: string;
    direction?: AnimationDirection;
    distance?: number;
    scale?: number;
    enterName?: string;
    exitName?: string;
}

type AnimationPreset = 'none' | 'fade' | 'scale' | 'slide' | 'collapse' | 'feedback' | 'spin' | 'shimmer' | 'custom';

interface AnimationProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
    animation?: AnimationOptions | false;
    open?: boolean;
    forceMount?: boolean;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Container

`<Container size="md" gutter="4">…</Container>` 约束页面宽度，默认居中。显式 maxWidth 设最大宽度，fluid 随父容器延展。列表页与详情页共用 Container 可对齐左右留白。

<!-- api:container -->

可导入 `Container`。

[类型与导出入口](packages/ui/src/components/container/index.ts) · [交互说明](apps/docs/src/content/布局/container.md) · [可运行示例](apps/docs/src/examples/container)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Container, Text } from '@yuki-ui/react';

export default function BasicContainer() {
  return (
    <div
      style={{
        background: 'var(--yuki-color-bg-subtle)',
        border: '1px dashed var(--yuki-color-border)',
        borderRadius: 'var(--yuki-radius-md)',
        paddingBlock: 'var(--yuki-space-4)',
      }}
    >
      <Container size="md" gutter="4">
        <div
          style={{
            padding: 'var(--yuki-space-4)',
            borderRadius: 'var(--yuki-radius-sm)',
            background: 'var(--yuki-color-bg-surface)',
            border: '1px solid var(--yuki-color-border-subtle)',
          }}
        >
          <Text weight="semibold" gutterBottom>
            页面正文宽度
          </Text>
          <Text tone="secondary" size="sm">
            Container 在宽屏下把内容限制在可读宽度，在窄屏下保留安全边距。
            把浏览器拉宽，可以看到内容不再无限延伸。
          </Text>
        </div>
      </Container>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Container(props: ContainerProps & RefAttributes<HTMLDivElement>): ReactNode

type ContainerClassNames = Partial<Record<'root', string>>;

interface ContainerProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
    size?: ContainerSize;
    fluid?: boolean;
    maxWidth?: CSSProperties['maxWidth'];
    gutter?: SpaceSize;
    center?: boolean;
    classNames?: ContainerClassNames;
    styles?: ContainerStyles;
}

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

type ContainerStyles = Partial<Record<'root', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};

type SpaceSize = '0' | '0-5' | '1' | '1-5' | '2' | '2-5' | '3' | '3-5' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '12' | '14' | '16' | '20' | '24';
```

</details>

<!-- /api -->

### Flex、Stack

`<Flex align="center" justify="between" gap="3">…</Flex>` 用于标题与操作区。gap 使用间距 token 名，如字符串 '3'。`<Stack gap="4">…</Stack>` 默认纵向排列；Flex 的 direction 使用 row/column 族，Stack 使用 horizontal/vertical。wrap 可放置宽度不固定的标签。

<!-- api:flex -->

可导入 `Flex`、`Stack`。

[类型与导出入口](packages/ui/src/components/flex/index.ts) · [交互说明](apps/docs/src/content/布局/flex.md) · [可运行示例](apps/docs/src/examples/flex)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Flex, Text } from '@yuki-ui/react';

const chipStyle: React.CSSProperties = {
  padding: 'var(--yuki-space-1) var(--yuki-space-3)',
  borderRadius: 'var(--yuki-radius-full)',
  background: 'var(--yuki-color-bg-subtle)',
  border: '1px solid var(--yuki-color-border)',
  fontSize: 'var(--yuki-font-size-sm)',
};

export default function BasicFlex() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-5)' }}>
      <div>
        <Text size="sm" tone="tertiary" style={{ display: 'block', marginBottom: 'var(--yuki-space-2)' }}>
          justify="between" + align="center"
        </Text>
        <Flex justify="between" align="center" gap="3">
          <Text weight="medium">本月使用量</Text>
          <span style={{ color: 'var(--yuki-color-text-secondary)', fontSize: 'var(--yuki-font-size-sm)' }}>
            12,480 / 20,000
          </span>
        </Flex>
      </div>

      <div>
        <Text size="sm" tone="tertiary" style={{ display: 'block', marginBottom: 'var(--yuki-space-2)' }}>
          wrap + gap
        </Text>
        <Flex wrap gap="2">
          {['设计', '工程', '文档', '无障碍', '主题', '国际化', '动效', '测试'].map((item) => (
            <span key={item} style={chipStyle}>
              {item}
            </span>
          ))}
        </Flex>
      </div>

      <div>
        <Text size="sm" tone="tertiary" style={{ display: 'block', marginBottom: 'var(--yuki-space-2)' }}>
          justify="center" + gap
        </Text>
        <Flex justify="center" gap="4">
          <span style={chipStyle}>左</span>
          <span style={chipStyle}>中</span>
          <span style={chipStyle}>右</span>
        </Flex>
      </div>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Flex(props: FlexProps & RefAttributes<HTMLDivElement>): ReactNode

Stack(props: StackProps & RefAttributes<HTMLDivElement>): ReactNode

type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

type FlexClassNames = Partial<Record<'root', string>>;

type FlexDirection = 'row' | 'column';

type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

interface FlexProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
    direction?: FlexDirection;
    align?: FlexAlign;
    justify?: FlexJustify;
    wrap?: boolean;
    gap?: SpaceSize;
    inline?: boolean;
    classNames?: FlexClassNames;
    styles?: FlexStyles;
}

type FlexStyles = Partial<Record<'root', StyleProperties>>;

interface StackProps extends Omit<FlexProps, 'direction'> {
    direction?: 'vertical' | 'horizontal';
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};

type SpaceSize = '0' | '0-5' | '1' | '1-5' | '2' | '2-5' | '3' | '3-5' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '12' | '14' | '16' | '20' | '24';
```

</details>

<!-- /api -->

### Grid、GridItem

`<Grid gap="4"><GridItem span={12} responsive={{md:6}}>…</GridItem></Grid>`。默认 12 列，span 表示跨列数，start 从 1 开始；responsive 按 sm、md、lg、xl 覆盖基础跨度。放并列指标卡时小屏给 12，较宽时按卡片数缩小。

<!-- api:grid -->

可导入 `Grid`、`GridItem`。

[类型与导出入口](packages/ui/src/components/grid/index.ts) · [交互说明](apps/docs/src/content/布局/grid.md) · [可运行示例](apps/docs/src/examples/grid)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Grid, GridItem, Text } from '@yuki-ui/react';

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '3.5rem',
        padding: 'var(--yuki-space-2)',
        borderRadius: 'var(--yuki-radius-sm)',
        background: 'var(--yuki-color-bg-subtle)',
        border: '1px solid var(--yuki-color-border-subtle)',
        color: 'var(--yuki-color-text-secondary)',
        fontSize: 'var(--yuki-font-size-sm)',
      }}
    >
      {children}
    </div>
  );
}

export default function BasicGrid() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <Grid gap="3">
        <GridItem span={12}>
          <Cell>12 / 12</Cell>
        </GridItem>
      </Grid>

      <Grid gap="3">
        <GridItem span={6}>
          <Cell>6</Cell>
        </GridItem>
        <GridItem span={6}>
          <Cell>6</Cell>
        </GridItem>
      </Grid>

      <Grid gap="3">
        <GridItem span={4}>
          <Cell>4</Cell>
        </GridItem>
        <GridItem span={4}>
          <Cell>4</Cell>
        </GridItem>
        <GridItem span={4}>
          <Cell>4</Cell>
        </GridItem>
      </Grid>

      <Grid gap="3">
        <GridItem span={3}>
          <Cell>3</Cell>
        </GridItem>
        <GridItem span={6}>
          <Cell>6（居中列）</Cell>
        </GridItem>
        <GridItem span={3}>
          <Cell>3</Cell>
        </GridItem>
      </Grid>

      <Text size="sm" tone="tertiary">
        间距全部来自 <code>--yuki-space-*</code>，栅格本身不产生任何硬编码尺寸。
      </Text>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Grid(props: GridProps & RefAttributes<HTMLDivElement>): ReactNode

GridItem(props: GridItemProps & RefAttributes<HTMLDivElement>): ReactNode

type GridAlign = 'start' | 'center' | 'end' | 'stretch';

type GridClassNames = Partial<Record<'root' | 'item', string>>;

interface GridItemProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
    span?: number;
    start?: number;
    responsive?: GridItemSpan;
    classNames?: GridClassNames;
    styles?: GridStyles;
}

interface GridItemSpan {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
}

type GridJustify = 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around';

interface GridProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
    columns?: number;
    gap?: SpaceSize;
    rowGap?: SpaceSize;
    columnGap?: SpaceSize;
    align?: GridAlign;
    justify?: GridJustify;
    classNames?: GridClassNames;
    styles?: GridStyles;
}

type GridStyles = Partial<Record<'root' | 'item', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};

type SpaceSize = '0' | '0-5' | '1' | '1-5' | '2' | '2-5' | '3' | '3-5' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '12' | '14' | '16' | '20' | '24';
```

</details>

<!-- /api -->

### Space

`<Space wrap size="2" split={<Divider orientation="vertical" decorative />}>…</Space>` 在相邻子项之间插入分隔元素。size 也接受 [水平间距, 垂直间距]，direction 可选 vertical。对已有 Flex / Grid 布局直接调整 gap 即可。

<!-- api:space -->

可导入 `Space`。

[类型与导出入口](packages/ui/src/components/space/index.ts) · [交互说明](apps/docs/src/content/布局/space.md) · [可运行示例](apps/docs/src/examples/space)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Button, Divider, Space } from '@yuki-ui/react';

export default function BasicSpace() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-5)' }}>
      <Space size="2">
        <Button size="sm">取消</Button>
        <Button size="sm" variant="outline">
          保存草稿
        </Button>
        <Button size="sm">发布</Button>
      </Space>

      <Space size="3" split={<Divider orientation="vertical" />}>
        <span style={{ fontSize: 'var(--yuki-font-size-sm)' }}>概览</span>
        <span style={{ fontSize: 'var(--yuki-font-size-sm)' }}>成员</span>
        <span style={{ fontSize: 'var(--yuki-font-size-sm)' }}>账单</span>
      </Space>

      <Space size="2" wrap>
        {Array.from({ length: 8 }, (_, index) => (
          <span
            key={index}
            style={{
              padding: 'var(--yuki-space-1) var(--yuki-space-2)',
              borderRadius: 'var(--yuki-radius-sm)',
              background: 'var(--yuki-color-bg-subtle)',
              fontSize: 'var(--yuki-font-size-xs)',
              color: 'var(--yuki-color-text-secondary)',
            }}
          >
            标签 {index + 1}
          </span>
        ))}
      </Space>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Space(props: SpaceProps & RefAttributes<HTMLDivElement>): ReactNode

type SpaceAlign = 'start' | 'center' | 'end' | 'baseline';

type SpaceClassNames = Partial<Record<'root' | 'item' | 'split', string>>;

type SpaceDirection = 'horizontal' | 'vertical';

interface SpaceProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
    direction?: SpaceDirection;
    vertical?: boolean;
    gap?: CSSProperties['gap'];
    size?: SpaceSize | [
        SpaceSize,
        SpaceSize
    ];
    align?: SpaceAlign;
    wrap?: boolean;
    split?: ReactNode;
    classNames?: SpaceClassNames;
    styles?: SpaceStyles;
}

type SpaceStyles = Partial<Record<'root' | 'item' | 'split', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};

type SpaceSize = '0' | '0-5' | '1' | '1-5' | '2' | '2-5' | '3' | '3-5' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '12' | '14' | '16' | '20' | '24';
```

</details>

<!-- /api -->

### AspectRatio

`<AspectRatio ratio={16 / 9}><ImageViewer src={cover} alt="封面" /></AspectRatio>` 按父容器宽度保留媒体高度。ratio 为宽除以高的正数；需要裁切时配合子图片的 objectFit。

<!-- api:aspect-ratio -->

可导入 `AspectRatio`。

[类型与导出入口](packages/ui/src/components/aspect-ratio/index.ts) · [交互说明](apps/docs/src/content/布局/aspect-ratio.md) · [可运行示例](apps/docs/src/examples/aspect-ratio)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { AspectRatio, Text } from '@yuki-ui/react';

export default function BasicAspectRatio() {
  return (
    <div style={{ maxWidth: '28rem' }}>
      <AspectRatio
        ratio={16 / 9}
        style={{
          borderRadius: 'var(--yuki-radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--yuki-color-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(135deg, var(--yuki-color-primary-subtle), var(--yuki-color-bg-muted))',
            color: 'var(--yuki-color-text-secondary)',
            fontSize: 'var(--yuki-font-size-sm)',
          }}
        >
          16 : 9 媒体占位
        </div>
      </AspectRatio>
      <Text size="xs" tone="tertiary" style={{ display: 'block', marginTop: 'var(--yuki-space-2)' }}>
        高度由宽度推导，媒体加载前后不会发生布局跳动。
      </Text>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
AspectRatio(props: AspectRatioProps & RefAttributes<HTMLDivElement>): ReactNode

type AspectRatioClassNames = Partial<Record<'root' | 'content', string>>;

interface AspectRatioProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
    ratio?: number | string;
    classNames?: AspectRatioClassNames;
    styles?: AspectRatioStyles;
}

type AspectRatioStyles = Partial<Record<'root' | 'content', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Splitter

两个 children 对应前后面板。`<Splitter defaultSize={35} min={20} max={75}><aside>目录</aside><main>正文</main></Splitter>` 以第一面板的百分比表示尺寸。受控使用 size / onResize，持久化可放 onResizeEnd；垂直分隔时给外部可测量高度。

<!-- api:splitter -->

可导入 `Splitter`。

[类型与导出入口](packages/ui/src/components/splitter/index.ts) · [交互说明](apps/docs/src/content/布局/splitter.md) · [可运行示例](apps/docs/src/examples/splitter)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Splitter, Text } from '@yuki-ui/react';

const paneStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  fontSize: 'var(--yuki-font-size-sm)',
  color: 'var(--yuki-color-text-secondary)',
};

export default function BasicSplitter() {
  return (
    <Splitter
      defaultSize={38}
      style={{
        height: '11rem',
        border: '1px solid var(--yuki-color-border)',
        borderRadius: 'var(--yuki-radius-md)',
        overflow: 'hidden',
      }}
    >
      <div style={{ ...paneStyle, background: 'var(--yuki-color-bg-subtle)' }}>
        <Text size="sm">左面板 · 目录</Text>
      </div>
      <div style={paneStyle}>
        <Text size="sm" tone="secondary">
          右面板 · 内容
        </Text>
      </div>
    </Splitter>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Splitter(props: SplitterProps & RefAttributes<HTMLDivElement>): ReactNode

type SplitterClassNames = Partial<Record<'root' | 'pane' | 'firstPane' | 'secondPane' | 'handle' | 'line', string>>;

type SplitterDirection = 'horizontal' | 'vertical';

interface SplitterProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'children'> {
    direction?: SplitterDirection;
    size?: number;
    defaultSize?: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    onResize?: (size: number) => void;
    onResizeEnd?: (size: number) => void;
    handle?: ReactNode;
    classNames?: SplitterClassNames;
    styles?: SplitterStyles;
    children?: [
        ReactNode,
        ReactNode
    ];
}

type SplitterStyles = Partial<Record<'root' | 'pane' | 'firstPane' | 'secondPane' | 'handle' | 'line', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Scrollbar

`<Scrollbar maxHeight={280}>…</Scrollbar>` 使内容在自己的视口内滚动。direction 指定轴，visibility 控制显示策略。默认视口可获得键盘焦点。对已经创建滚动视口的虚拟 List 等组件优先使用其内置视口。

<!-- api:scrollbar -->

可导入 `Scrollbar`。

[类型与导出入口](packages/ui/src/components/scrollbar/index.ts) · [交互说明](apps/docs/src/content/其他/scrollbar.md) · [可运行示例](apps/docs/src/examples/scrollbar)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Scrollbar, Text } from '@yuki-ui/react';

export default function BasicScrollbar() {
  return (
    <div
      style={{
        blockSize: 200,
        border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border-subtle)',
        borderRadius: 'var(--yuki-radius-md)',
      }}
    >
      <Scrollbar style={{ blockSize: '100%' }}>
        <div style={{ padding: 'var(--yuki-space-4)' }}>
          {Array.from({ length: 12 }, (_, index) => (
            <Text key={index} as="p" size="sm" tone="secondary" style={{ marginBlock: 'var(--yuki-space-3)' }}>
              自定义滚动条会在右侧显示，原生滚动条已隐藏。段落 {index + 1}。
            </Text>
          ))}
        </div>
      </Scrollbar>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Scrollbar(props: ScrollbarProps & RefAttributes<HTMLDivElement>): ReactNode

type ScrollbarClassNames = Partial<Record<'root' | 'view' | 'track' | 'trackX' | 'trackY' | 'thumb' | 'thumbX' | 'thumbY', string>>;

type ScrollbarDirection = 'vertical' | 'horizontal' | 'both';

interface ScrollbarProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onScroll'> {
    direction?: ScrollbarDirection;
    visibility?: ScrollbarVisibility;
    size?: number;
    focusable?: boolean;
    maxHeight?: CSSProperties['maxHeight'];
    onScroll?: (event: ReactUIEvent<HTMLDivElement>) => void;
    children?: ReactNode;
    classNames?: ScrollbarClassNames;
    styles?: ScrollbarStyles;
}

type ScrollbarStyles = Partial<Record<'root' | 'view' | 'track' | 'trackX' | 'trackY' | 'thumb' | 'thumbX' | 'thumbY', StyleProperties>>;

type ScrollbarVisibility = 'always' | 'hover';

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Watermark

`<Watermark content={['内部资料','设计组']}>…</Watermark>` 覆盖子内容。图片水印传 image，可配 width、height、gap、offset、rotate 定位图案；对导出文件的水印需在文件生成流程处理。

<!-- api:watermark -->

可导入 `Watermark`。

[类型与导出入口](packages/ui/src/components/watermark/index.ts) · [交互说明](apps/docs/src/content/其他/watermark.md) · [可运行示例](apps/docs/src/examples/watermark)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Text, Watermark } from '@yuki-ui/react';

export default function BasicWatermark() {
  return (
    <Watermark content="Yuki UI 内部资料">
      <div
        style={{
          blockSize: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--yuki-space-4)',
          background: 'var(--yuki-color-bg-subtle)',
          border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border-subtle)',
          borderRadius: 'var(--yuki-radius-lg)',
        }}
      >
        <Text tone="secondary">所有内容都会覆盖重复水印，水印不参与交互。</Text>
      </div>
    </Watermark>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Watermark(props: WatermarkProps & RefAttributes<HTMLDivElement>): ReactNode

type WatermarkClassNames = Partial<Record<'root' | 'canvas' | 'content', string>>;

interface WatermarkProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'content'> {
    content?: string | string[];
    text?: string;
    image?: string;
    width?: number;
    height?: number;
    rotate?: number;
    gap?: [
        number,
        number
    ];
    offset?: [
        number,
        number
    ];
    opacity?: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    zIndex?: number;
    children?: ReactNode;
    classNames?: WatermarkClassNames;
    styles?: WatermarkStyles;
}

type WatermarkStyles = Partial<Record<'root' | 'canvas' | 'content', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

## 表单和选择

### Form、FormItem、FormList

表单容器接收 initialValues，`<Form.Item name={['account','email']} label="邮箱" rules={[{required:true,type:'email'}]}><Input /></Form.Item>` 把值保存到嵌套对象。带点的字符串按单个字段名处理。默认横向布局并在 onChange 校验，通过后触发 onFinish(values)，失败时 onFinishFailed(errors, values)。required 属性控制标记与可访问状态，真正的必填校验写入 rules。跨字段比较用 dependencies 加 validator；异步 validator 通过抛出 Error 或拒绝 Promise 报错。

`const [form] = Form.useForm()`，将实例传给 Form 后可用 getFieldsValue、setFieldsValue、validateFields、resetFields、submit。命名字段下由适配了表单上下文的控件读取值；集中设置初值，避免再为同一字段维护外部 state。Form.Item 的函数子节点接收 value / onChange / onBlur / id / disabled / ariaProps，可桥接第三方输入或具有不同数据结构的控件。自定义输入应把 id 和 ariaProps 交给实际可聚焦元素。`Form.List name="members"` 的函数接收 fields 和 {add,remove,move}，子字段请写完整路径 `['members', field.name, 'email']`。

适配业务控件时可以创建一个字段组件，在其中调用 `useFieldControl<T>()`。例如，下方的原生输入从 Form.Item 读取命名字段、表单禁用状态和可访问属性，在修改和失焦时写回表单。用户数据异步就绪时通过 form.setFieldsValue 填充；initialValues 在表单实例首次接入时生效。

```tsx
import { Form, useFieldControl } from '@yuki-ui/react';

function TicketField() {
  const field = useFieldControl<string>();
  return <input {...field.ariaProps} id={field.id} disabled={field.disabled}
    value={field.value ?? ''} onBlur={field.onBlur}
    onChange={event => field.onChange?.(event.currentTarget.value)} />;
}

export function TicketForm() {
  return <Form><Form.Item name="ticket" label="工单号"><TicketField /></Form.Item></Form>;
}
```

<!-- api:form -->

可导入 `Form`、`FormItem`、`FormList`、`useFieldControl`、`useForm`、`useFormContext`、`useFormInstance`。

[类型与导出入口](packages/ui/src/components/form/index.ts) · [交互说明](apps/docs/src/content/表单/form.md) · [可运行示例](apps/docs/src/examples/form)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Button, Form, Input } from '@yuki-ui/react';

export default function BasicForm() {
  return (
    <Form
      layout="vertical"
      style={{ maxWidth: 360 }}
      initialValues={{ email: '', password: '' }}
      onFinish={(values) => {
        window.alert(`登录成功：${JSON.stringify(values)}`);
      }}
      onFinishFailed={(errors) => {
        if (errors[0]) window.alert(errors[0].message);
      }}
    >
      <Form.Item
        name="email"
        label="邮箱"
        extra="我们只会用它发送登录验证码。"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '邮箱格式不正确' },
        ]}
      >
        <Input placeholder="dev@yuki.design" />
      </Form.Item>
      <Form.Item
        name="password"
        label="密码"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少 6 位' },
        ]}
      >
        <Input type="password" placeholder="至少 6 位" />
      </Form.Item>
      <Form.Item>
        <Button type="submit">登录</Button>
      </Form.Item>
    </Form>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Form<Values extends Store = Store>(props: FormProps<Values> & { ref?: Ref<HTMLFormElement>; }): ReactElement | null

FormItem(props: FormItemProps & RefAttributes<HTMLDivElement>): ReactNode

FormList(props: FormListProps): JSX.Element

useFieldControl<T>(options?: FieldControlOptions<T>): FieldControlBinding<T>

useForm<Values extends Store = Store>(form?: FormInstance<Values>): [FormInstance<Values>]

useFormContext(): FormContextValue

useFormInstance<Values extends Record<string, unknown> = Record<string, unknown>>(): FormInstance<Values>

interface FieldControlBinding<T> {
    bound: boolean;
    id: string | undefined;
    labelId?: string;
    value: T | undefined;
    onChange: ((value: T) => void) | undefined;
    onBlur: (() => void) | undefined;
    disabled: boolean;
    status: FieldStatus;
    required: boolean;
    ariaProps: {
        'aria-invalid'?: boolean;
        'aria-describedby'?: string;
        'aria-required'?: boolean;
        'aria-busy'?: boolean;
    };
}

interface FieldControlOptions<T> {
    value?: T;
    onChange?: (value: T) => void;
    onBlur?: () => void;
    id?: string;
    disabled?: boolean;
    status?: FieldStatus;
}

interface FieldMeta {
    name: NamePath;
    key: string;
    dependencies: NamePath[];
    initialValue?: unknown;
    validate: () => Promise<string[]>;
    reset: () => void;
    getErrors: () => string[];
    isValidating: () => boolean;
}

type FieldStatus = 'default' | 'error' | 'warning' | 'success';

interface FormCallbacks<Values extends Store = Store> {
    onFinish?: (values: Values) => void;
    onFinishFailed?: (errors: ValidateError[], values: Values) => void;
    onValuesChange?: (changed: Store, all: Values) => void;
}

type FormClassNames = Partial<Record<'root', string>>;

interface FormComponent {
    <Values extends Store = Store>(props: FormProps<Values> & {
        ref?: Ref<HTMLFormElement>;
    }): ReactElement | null;
    displayName?: string;
    Item: typeof FormItem;
    List: typeof FormList;
    useForm: typeof useForm;
    useFormInstance: typeof useFormInstance;
}

interface FormInstance<Values extends Store = Store> {
    getFieldValue: (name: NamePath) => unknown;
    getFieldsValue: () => Values;
    setFieldValue: (name: NamePath, value: unknown) => void;
    setFieldsValue: (values: Store) => void;
    resetFields: (names?: NamePath[]) => void;
    clearFields: (names?: NamePath[]) => void;
    validateFields: (options?: ValidateOptions | NamePath[]) => Promise<Values>;
    validateField: (name: NamePath) => Promise<string[]>;
    getFieldError: (name: NamePath) => string[];
    getFieldsError: (names?: NamePath[]) => ValidateError[];
    isFieldValidating: (name: NamePath) => boolean;
    submit: () => void;
    subscribe: (listener: () => void) => () => void;
}

type FormItemClassNames = Partial<Record<'root' | 'label' | 'control' | 'help' | 'extra', string>>;

interface FormItemProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children'> {
    name?: NamePath;
    label?: ReactNode;
    extra?: ReactNode;
    help?: ReactNode;
    rules?: FormRule[];
    required?: boolean;
    dependencies?: NamePath[];
    validateTrigger?: ValidateTrigger | ValidateTrigger[];
    initialValue?: unknown;
    validateStatus?: FieldStatus;
    hasFeedback?: boolean;
    noStyle?: boolean;
    layout?: 'horizontal' | 'vertical' | 'inline';
    colon?: boolean;
    size?: Size;
    classNames?: FormItemClassNames;
    styles?: FormItemStyles;
    children?: ReactNode | ((control: FormItemRenderProps) => ReactNode);
}

interface FormItemRenderProps {
    id: string;
    status: FieldStatus;
    disabled: boolean;
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    ariaProps: {
        'aria-invalid'?: boolean;
        'aria-describedby'?: string;
        'aria-required'?: boolean;
        'aria-busy'?: boolean;
    };
}

type FormItemStyles = Partial<Record<'root' | 'label' | 'control' | 'help' | 'extra', StyleProperties>>;

type FormLayout = 'horizontal' | 'vertical' | 'inline';

interface FormListField {
    key: number;
    name: number;
}

interface FormListOperations {
    add: (defaultValue?: unknown, index?: number) => void;
    remove: (index: number | number[]) => void;
    move: (from: number, to: number) => void;
}

interface FormListProps {
    name: NamePath;
    initialValue?: unknown[];
    children: (fields: FormListField[], operations: FormListOperations) => ReactNode;
}

interface FormProps<Values extends Store = Store> extends Omit<WithStyle<FormHTMLAttributes<HTMLFormElement>>, 'onFinish' | 'children' | 'onValuesChange'> {
    form?: FormInstance<Values>;
    initialValues?: Partial<Values>;
    onFinish?: (values: Values) => void;
    onFinishFailed?: (errors: ValidateError[], values: Values) => void;
    onValuesChange?: (changed: Store, all: Values) => void;
    layout?: FormLayout;
    size?: Size;
    disabled?: boolean;
    requiredMark?: boolean;
    colon?: boolean;
    labelWidth?: string | number;
    validateTrigger?: ValidateTrigger;
    children?: ReactNode;
    classNames?: FormClassNames;
    styles?: FormStyles;
}

interface FormRule {
    required?: boolean;
    message?: string;
    min?: number;
    max?: number;
    len?: number;
    pattern?: RegExp;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'email' | 'url';
    enum?: unknown[];
    whitespace?: boolean;
    transform?: (value: unknown) => unknown;
    validator?: (value: unknown, form: FormInstance) => void | Promise<void>;
}

type FormStyles = Partial<Record<'root', StyleProperties>>;

type NamePath = string | number | Array<string | number>;

type Store = Record<string, unknown>;

interface ValidateError {
    name: NamePath;
    message: string;
}

interface ValidateOptions {
    names?: NamePath[];
}

type ValidateTrigger = 'onChange' | 'onBlur' | 'onSubmit' | 'none';

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};

interface FormContextValue {
    form: FormInstance;
    layout: FormLayout;
    size: Size;
    initialValues?: Store;
    disabled: boolean;
    requiredMark: boolean;
    colon: boolean;
    validateTrigger: ValidateTrigger;
    labelWidth?: string | number;
}
```

</details>

<!-- /api -->

### Input

`<Input label="项目名" value={name} onChange={setName} allowClear />`。回调的首参是字符串，第二参为可选原生 React 事件；清空时亦会收到空串。prefix / suffix 放框内元素，addonBefore / addonAfter 放框外附加区，showCount 搭配 maxLength。独立字段用 label、description、error；在 Form.Item 中由表单生成标签及校验说明。

<!-- api:input -->

可导入 `Input`。

[类型与导出入口](packages/ui/src/components/input/index.ts) · [交互说明](apps/docs/src/content/表单/input.md) · [可运行示例](apps/docs/src/examples/input)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Icon, Input } from '@yuki-ui/react';

export default function BasicInput() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', width: '100%', gap: 'var(--yuki-space-3)', maxWidth: 360 }}>
      <Input placeholder="请输入用户名" />
      <Input
        placeholder="搜索关键词"
        prefix={<Icon name="search" />}
        allowClear
        defaultValue="设计系统"
      />
      <Input placeholder="密码" type="password" />
      <div style={{ display: 'flex', gap: 'var(--yuki-space-2)' }}>
        <Input size="sm" placeholder="小尺寸" />
        <Input size="md" placeholder="中尺寸" />
        <Input size="lg" placeholder="大尺寸" />
      </div>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Input(props: InputProps & RefAttributes<HTMLInputElement>): ReactNode

type InputClassNames = Partial<Record<'root' | 'group' | 'prefix' | 'input' | 'suffix' | 'clear' | 'addonBefore' | 'addonAfter' | 'count', string>>;

interface InputProps extends StandaloneFieldProps, Omit<WithStyle<InputHTMLAttributes<HTMLInputElement>>, 'size' | 'prefix' | 'onChange' | 'value' | 'defaultValue'> {
    size?: Size;
    status?: FieldStatus;
    prefix?: ReactNode;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    wrapperProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    startIconProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    endIconProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    suffix?: ReactNode;
    addonBefore?: ReactNode;
    addonAfter?: ReactNode;
    bordered?: boolean;
    allowClear?: boolean;
    onClear?: () => void;
    showCount?: boolean;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string, event?: ChangeEvent<HTMLInputElement>) => void;
    classNames?: InputClassNames;
    styles?: InputStyles;
}

type InputStyles = Partial<Record<'root' | 'group' | 'prefix' | 'input' | 'suffix' | 'clear' | 'addonBefore' | 'addonAfter' | 'count', StyleProperties>>;

interface StandaloneFieldProps {
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    fieldProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    labelProps?: WithStyle<LabelHTMLAttributes<HTMLLabelElement>>;
    messageProps?: WithStyle<HTMLAttributes<HTMLParagraphElement>>;
    controlClassName?: string;
    controlStyle?: StyleProperties;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Textarea

`<Textarea label="备注" autoSize={{minRows:2,maxRows:6}} showCount maxLength={500} />`。value / onChange 操作字符串，allowClear 归为空串。autoSize 根据输入与行数约束调整高度，可在 footer 放置辅助操作。

<!-- api:textarea -->

可导入 `Textarea`。

[类型与导出入口](packages/ui/src/components/textarea/index.ts) · [交互说明](apps/docs/src/content/表单/textarea.md) · [可运行示例](apps/docs/src/examples/textarea)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Textarea } from '@yuki-ui/react';

export default function BasicTextarea() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 420 }}>
      <Textarea placeholder="写点备注…" rows={3} />
      <Textarea defaultValue="随内容自动增高的文本域。" autoSize />
      <Textarea
        placeholder="带字数统计"
        maxLength={100}
        showCount
        allowClear
        autoSize={{ minRows: 2, maxRows: 5 }}
      />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Textarea(props: TextareaProps & RefAttributes<HTMLTextAreaElement>): ReactNode

interface TextareaAutoSize {
    minRows?: number;
    maxRows?: number;
}

type TextareaClassNames = Partial<Record<'root' | 'control' | 'clear' | 'count', string>>;

interface TextareaProps extends StandaloneFieldProps, Omit<WithStyle<TextareaHTMLAttributes<HTMLTextAreaElement>>, 'size' | 'onChange' | 'value' | 'defaultValue'> {
    size?: Size;
    status?: FieldStatus;
    autoSize?: boolean | TextareaAutoSize;
    footer?: ReactNode;
    allowClear?: boolean;
    onClear?: () => void;
    showCount?: boolean;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string, event?: ChangeEvent<HTMLTextAreaElement>) => void;
    classNames?: TextareaClassNames;
    styles?: TextareaStyles;
}

type TextareaStyles = Partial<Record<'root' | 'control' | 'clear' | 'count', StyleProperties>>;

interface StandaloneFieldProps {
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    fieldProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    labelProps?: WithStyle<LabelHTMLAttributes<HTMLLabelElement>>;
    messageProps?: WithStyle<HTMLAttributes<HTMLParagraphElement>>;
    controlClassName?: string;
    controlStyle?: StyleProperties;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Search

`<Search aria-label="搜索工单" enterButton="查找" onSearch={query => runSearch(query)} />`。onChange 在输入时返回字符串，onSearch 在回车或按搜索按钮时触发；用前者本地实时过滤，用后者发起显式查询。默认显示清除按钮，enterButton 默认关闭；loading、disabled 和输入法组词期间会阻止提交查询。

<!-- api:search -->

可导入 `Search`。

[类型与导出入口](packages/ui/src/components/search/index.ts) · [交互说明](apps/docs/src/content/表单/search.md) · [可运行示例](apps/docs/src/examples/search)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Search } from '@yuki-ui/react';

export default function BasicSearch() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 420 }}>
      <Search placeholder="搜索组件…" onSearch={(value) => window.alert(`搜索：${value}`)} />
      <Search placeholder="按下回车触发 onSearch" defaultValue="Button" allowClear />
      <Search placeholder="禁用" disabled />
      <Search placeholder="小尺寸" size="sm" />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Search(props: SearchProps & RefAttributes<HTMLInputElement>): ReactNode

type SearchClassNames = Partial<Record<'root' | 'input' | 'button', string>>;

interface SearchProps extends Omit<InputProps, 'suffix' | 'children' | 'onChange' | 'value' | 'defaultValue'> {
    prefix?: ReactNode;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string, event?: ChangeEvent<HTMLInputElement>) => void;
    onSearch?: (value: string, event?: KeyboardEvent<HTMLInputElement>) => void;
    enterButton?: boolean | ReactNode;
    loading?: boolean;
    classNames?: SearchClassNames;
    styles?: SearchStyles;
}

type SearchStyles = Partial<Record<'root' | 'input' | 'button', StyleProperties>>;
```

</details>

<!-- /api -->

### InputNumber

`<InputNumber label="数量" min={0} step={1} value={quantity} onChange={setQuantity} />`，值为 number 或 null。formatter 返回展示字符串，parser 负责还原数字；含货币符号或本地化千分位时成对提供。键盘或步进按钮可触发 onStep(value, info)，precision 限制小数位。允许输入中的过渡文本，失焦后提交边界内数值。

<!-- api:input-number -->

可导入 `InputNumber`。

[类型与导出入口](packages/ui/src/components/input-number/index.ts) · [交互说明](apps/docs/src/content/表单/input-number.md) · [可运行示例](apps/docs/src/examples/input-number)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { InputNumber } from '@yuki-ui/react';

export default function BasicInputNumber() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 320 }}>
      <InputNumber aria-label="数量" defaultValue={3} min={0} max={99} />
      <InputNumber aria-label="价格" defaultValue={19.9} step={0.1} precision={1} />
      <InputNumber aria-label="禁用" defaultValue={12} disabled />
      <InputNumber aria-label="大尺寸" size="lg" defaultValue={128} />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
InputNumber(props: InputNumberProps & RefAttributes<HTMLInputElement>): ReactNode

type InputNumberClassNames = Partial<Record<'root' | 'group' | 'prefix' | 'input' | 'suffix' | 'controls' | 'up' | 'down', string>>;

interface InputNumberProps extends StandaloneFieldProps, Omit<WithStyle<InputHTMLAttributes<HTMLInputElement>>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'prefix' | 'min' | 'max' | 'step'> {
    size?: Size;
    status?: FieldStatus;
    value?: number | null;
    defaultValue?: number | null;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    controls?: boolean;
    keyboard?: boolean;
    formatter?: (value: number | null) => string;
    parser?: (text: string) => number | null;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    wrapperProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    startIconProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    endIconProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    prefix?: ReactNode;
    suffix?: ReactNode;
    onChange?: (value: number | null) => void;
    onStep?: (value: number, info: InputNumberStepInfo) => void;
    classNames?: InputNumberClassNames;
    styles?: InputNumberStyles;
}

interface InputNumberStepInfo {
    type: 'up' | 'down';
}

type InputNumberStyles = Partial<Record<'root' | 'group' | 'prefix' | 'input' | 'suffix' | 'controls' | 'up' | 'down', StyleProperties>>;

interface StandaloneFieldProps {
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    fieldProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    labelProps?: WithStyle<LabelHTMLAttributes<HTMLLabelElement>>;
    messageProps?: WithStyle<HTMLAttributes<HTMLParagraphElement>>;
    controlClassName?: string;
    controlStyle?: StyleProperties;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Select

`<Select options={[{value:1,label:'设计'}]} value={team} onChange={setTeam} clearable />`。默认单选，onChange 的参数为单值和选项，清空得到 null / null。多选写 `<Select multiple options={teams} value={ids} onChange={setIds} maxTagCount={2} />`，回调提供值数组及选项数组，清空得到空数组。让每个 value 唯一，优先用字符串或数字；对象值使用稳定的引用。

组结构为 `{label, options:[…]}`。searchable 启用搜索，自定义 JSX 标签提供 textValue 以便匹配。单选用 renderValue，多选用 renderTag、onRemove、maxTagPlaceholder。标签渲染回调只在允许移除时提供 remove，可在按钮上调用它。name 将选值带入原生表单，多选可用 FormData.getAll(name)。open / onOpenChange 管弹层，forceMount 保留面板，portalContainer 指定挂载元素。优先复用 Form.Item 或组件自身的 label / error。

<!-- api:select -->

可导入 `Select`。

[类型与导出入口](packages/ui/src/components/select/index.ts) · [交互说明](apps/docs/src/content/表单/select.md) · [可运行示例](apps/docs/src/examples/select)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Select } from '@yuki-ui/react';

const options = [
  { value: 'frontend', label: '前端工程师' },
  { value: 'backend', label: '后端工程师' },
  { value: 'designer', label: '产品设计师' },
  { value: 'qa', label: '测试工程师', disabled: true },
];

export default function BasicSelect() {
  const [value, setValue] = useState<string | null>('frontend');

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-sm)' }}>
      <Select
        options={options}
        value={value}
        onChange={(next, option) => setValue(option ? option.value : null)}
        placeholder="请选择岗位"
        clearable
      />
      <Select options={options} defaultValue="backend" placeholder="非受控，默认选中后端" />
      <Select options={options} placeholder="禁用状态" disabled />
      <Select options={options} placeholder="只读状态" readOnly defaultValue="designer" />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Select<T = string>(props: SelectProps<T> & { ref?: Ref<HTMLDivElement>; }): ReactElement

interface MultipleSelectProps<T = string> extends CommonSelectProps<T>, SelectTagOptions<T> {
    multiple: true;
    value?: readonly T[] | null;
    defaultValue?: readonly T[];
    onChange?: (values: NoInfer<T>[], options: SelectOption<NoInfer<T>>[]) => void;
    renderValue?: never;
}

type SelectClassNames = Partial<Record<'root' | 'trigger' | 'value' | 'placeholder' | 'prefix' | 'suffix' | 'clear' | 'arrow' | 'panel' | 'search' | 'list' | 'option' | 'optionLabel' | 'optionDescription' | 'optionCheck' | 'group' | 'tags' | 'tag' | 'tagLabel' | 'tagRemove' | 'more' | 'empty' | 'loading', string>>;

interface SelectOption<T = string> {
    value: T;
    label: ReactNode;
    disabled?: boolean;
    textValue?: string;
    description?: ReactNode;
}

interface SelectOptionGroup<T = string> {
    label: ReactNode;
    options: readonly SelectOption<T>[];
}

type SelectOptionInput<T = string> = SelectOption<T> | SelectOptionGroup<T>;

interface SelectOptionRenderState {
    selected: boolean;
    active: boolean;
    disabled: boolean;
}

type SelectProps<T = string> = SingleSelectProps<T> | MultipleSelectProps<T>;

type SelectStatus = 'error' | 'warning' | 'success';

type SelectStyles = Partial<Record<'root' | 'tags' | 'trigger' | 'panel' | 'list' | 'option' | 'search', StyleProperties>>;

type SingleSelectProps<T = string> = CommonSelectProps<T> & {
    [K in keyof SelectTagOptions<T>]?: never;
} & {
    multiple?: false;
    value?: T | null;
    defaultValue?: T | null;
    onChange?: (value: NoInfer<T> | null, option: SelectOption<NoInfer<T>> | null) => void;
    renderValue?: (option: SelectOption<T>) => ReactNode;
};

interface CommonSelectProps<T> extends StandaloneFieldProps, Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue' | 'value' | 'prefix'> {
    options: readonly SelectOptionInput<T>[];
    onClear?: () => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    size?: Size;
    placeholder?: ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    status?: SelectStatus;
    clearable?: boolean;
    searchable?: boolean;
    filterOption?: (query: string, option: SelectOption<T>) => boolean;
    onSearch?: (query: string) => void;
    searchPlaceholder?: string;
    emptyText?: ReactNode;
    loading?: boolean;
    loadingText?: ReactNode;
    prefix?: ReactNode;
    suffix?: ReactNode;
    showArrow?: boolean;
    borderless?: boolean;
    placement?: Placement;
    popupWidth?: 'trigger' | 'content';
    portalContainer?: HTMLElement | null;
    forceMount?: boolean;
    animation?: AnimationOptions | false;
    triggerProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    contentProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    viewportProps?: WithStyle<HTMLAttributes<HTMLUListElement>>;
    valueProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    optionProps?: (option: SelectOption<T>, index: number) => WithStyle<HTMLAttributes<HTMLLIElement>>;
    icon?: ReactNode;
    indicator?: ReactNode;
    renderOption?: (option: SelectOption<T>, state: SelectOptionRenderState) => ReactNode;
    name?: string;
    required?: boolean;
    classNames?: SelectClassNames;
    styles?: SelectStyles;
}

interface StandaloneFieldProps {
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    fieldProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    labelProps?: WithStyle<LabelHTMLAttributes<HTMLLabelElement>>;
    messageProps?: WithStyle<HTMLAttributes<HTMLParagraphElement>>;
    controlClassName?: string;
    controlStyle?: StyleProperties;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};

interface SelectTagOptions<T> {
    onRemove?: (value: T) => void;
    removable?: boolean;
    removeLabel?: (option: SelectOption<T>) => string;
    renderTag?: (option: SelectOption<T>, remove: (() => void) | undefined) => ReactNode;
    maxTagCount?: number;
    maxTagPlaceholder?: (hiddenOptions: SelectOption<T>[]) => ReactNode;
}
```

</details>

<!-- /api -->

### Checkbox、CheckboxGroup

`<Checkbox checked={enabled} onChange={setEnabled}>启用</Checkbox>`。单个框的 checked 表示布尔状态，value 用于标识组内选项。indeterminate 适合“仅部分选中”的汇总框，汇总值由业务计算。`<CheckboxGroup options={['阅读','编辑']} defaultValue={['阅读']} />` 返回值数组，也支持 Checkbox 子项。

<!-- api:checkbox -->

可导入 `Checkbox`、`CheckboxGroup`。

[类型与导出入口](packages/ui/src/components/checkbox/index.ts) · [交互说明](apps/docs/src/content/表单/checkbox.md) · [可运行示例](apps/docs/src/examples/checkbox)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Checkbox } from '@yuki-ui/react';

export default function BasicCheckbox() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)' }}>
      <Checkbox defaultChecked>接收产品更新邮件</Checkbox>
      <Checkbox>订阅每周设计周刊</Checkbox>
      <Checkbox defaultChecked disabled>
        已在管理后台锁定
      </Checkbox>
      <Checkbox size="lg">大尺寸复选框</Checkbox>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Checkbox(props: CheckboxProps & RefAttributes<HTMLInputElement>): ReactNode

CheckboxGroup(props: CheckboxGroupProps & RefAttributes<HTMLDivElement>): ReactNode

type CheckboxClassNames = Partial<Record<'root' | 'input' | 'control' | 'label', string>>;

type CheckboxGroupClassNames = Partial<Record<'root' | 'item', string>>;

interface CheckboxGroupProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue' | 'value' | 'children'> {
    value?: CheckboxValue[];
    defaultValue?: CheckboxValue[];
    options?: Array<CheckboxOption | string | number>;
    direction?: 'horizontal' | 'vertical';
    disabled?: boolean;
    size?: Size;
    name?: string;
    onChange?: (values: CheckboxValue[], event?: ChangeEvent<HTMLInputElement>) => void;
    children?: ReactNode;
    classNames?: CheckboxGroupClassNames;
    styles?: CheckboxGroupStyles;
}

type CheckboxGroupStyles = Partial<Record<'root' | 'item', StyleProperties>>;

interface CheckboxOption {
    label: ReactNode;
    value: CheckboxValue;
    disabled?: boolean;
}

interface CheckboxProps extends StandaloneFieldProps, Omit<WithStyle<InputHTMLAttributes<HTMLInputElement>>, 'size' | 'type' | 'onChange' | 'value' | 'defaultChecked' | 'checked' | 'children'> {
    indicator?: ReactNode;
    indicatorProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    descriptionProps?: WithStyle<HTMLAttributes<HTMLParagraphElement>>;
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
    value?: CheckboxValue;
    disabled?: boolean;
    size?: Size;
    children?: ReactNode;
    classNames?: CheckboxClassNames;
    styles?: CheckboxStyles;
}

type CheckboxStyles = Partial<Record<'root' | 'input' | 'control' | 'label', StyleProperties>>;

type CheckboxValue = string | number | boolean;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};

interface StandaloneFieldProps {
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    fieldProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    labelProps?: WithStyle<LabelHTMLAttributes<HTMLLabelElement>>;
    messageProps?: WithStyle<HTMLAttributes<HTMLParagraphElement>>;
    controlClassName?: string;
    controlStyle?: StyleProperties;
}
```

</details>

<!-- /api -->

### Radio、RadioGroup

单个 Radio 通过 checked / onChange 读写选中状态。互斥选择用 `<RadioGroup label="可见范围" options={[{value:'team',label:'团队'}]} defaultValue="team" />`。组接收单值和选中值回调，同组 Radio 自动共享 name。自定义项可写 `<Radio value="team">团队</Radio>`；独立布局可配置选项说明、组错误、排列方向。

<!-- api:radio -->

可导入 `Radio`、`RadioGroup`。

[类型与导出入口](packages/ui/src/components/radio/index.ts) · [交互说明](apps/docs/src/content/表单/radio.md) · [可运行示例](apps/docs/src/examples/radio)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Radio, RadioGroup } from '@yuki-ui/react';

export default function BasicRadio() {
  return (
    <RadioGroup defaultValue="pro" name="plan">
      <Radio value="free">免费版</Radio>
      <Radio value="pro">专业版</Radio>
      <Radio value="enterprise">企业版</Radio>
    </RadioGroup>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Radio(props: RadioProps & RefAttributes<HTMLInputElement>): ReactNode

RadioGroup(props: RadioGroupProps & RefAttributes<HTMLDivElement>): ReactNode

type RadioClassNames = Partial<Record<'root' | 'input' | 'control' | 'dot' | 'label', string>>;

type RadioGroupClassNames = Partial<Record<'root' | 'item', string>>;

interface RadioGroupProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue' | 'value' | 'children'> {
    value?: RadioValue;
    defaultValue?: RadioValue;
    options?: Array<RadioOption | string | number>;
    direction?: 'horizontal' | 'vertical';
    orientation?: 'horizontal' | 'vertical';
    label?: string;
    description?: ReactNode;
    error?: ReactNode;
    onValueChange?: (value: RadioValue) => void;
    optionProps?: (option: RadioOption, index: number) => WithStyle<HTMLAttributes<HTMLSpanElement>>;
    itemProps?: (option: RadioOption, index: number) => Partial<RadioProps>;
    descriptionProps?: (option: RadioOption, index: number) => WithStyle<HTMLAttributes<HTMLSpanElement>>;
    messageProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    disabled?: boolean;
    size?: Size;
    name?: string;
    onChange?: (value: RadioValue, event?: ChangeEvent<HTMLInputElement>) => void;
    children?: ReactNode;
    classNames?: RadioGroupClassNames;
    styles?: RadioGroupStyles;
}

type RadioGroupStyles = Partial<Record<'root' | 'item', StyleProperties>>;

interface RadioOption {
    label: ReactNode;
    value: RadioValue;
    disabled?: boolean;
    description?: ReactNode;
}

interface RadioProps extends Omit<WithStyle<InputHTMLAttributes<HTMLInputElement>>, 'size' | 'type' | 'onChange' | 'value' | 'checked' | 'defaultChecked' | 'children'> {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
    value?: RadioValue;
    disabled?: boolean;
    size?: Size;
    children?: ReactNode;
    classNames?: RadioClassNames;
    styles?: RadioStyles;
}

type RadioStyles = Partial<Record<'root' | 'input' | 'control' | 'dot' | 'label', StyleProperties>>;

type RadioValue = string | number | boolean;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### RadioGroup 子路径

radio-group 提供 RadioGroup 的具名子路径导入。组的完整字段及 RadioOption 数据模型见上一节。给组一个 label，让屏幕阅读器能够说出各选项回答的问题。

<!-- api:radio-group -->

可导入 `RadioGroup`。

[类型与导出入口](packages/ui/src/components/radio-group/index.ts) · [交互说明](apps/docs/src/content/表单/radio-group.md) · [可运行示例](apps/docs/src/examples/radio-group)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { RadioGroup } from '@yuki-ui/react';

export default function Permissions() {
  return (
    <RadioGroup label="成员权限" orientation="vertical" defaultValue="read" options={[
      { value: 'read', label: '查看', description: '可以打开和下载文件。' },
      { value: 'write', label: '编辑', description: '还可以修改项目内容。' },
    ]} />
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
RadioGroup(props: RadioGroupProps & RefAttributes<HTMLDivElement>): ReactNode

interface RadioGroupProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue' | 'value' | 'children'> {
    value?: RadioValue;
    defaultValue?: RadioValue;
    options?: Array<RadioOption | string | number>;
    direction?: 'horizontal' | 'vertical';
    orientation?: 'horizontal' | 'vertical';
    label?: string;
    description?: ReactNode;
    error?: ReactNode;
    onValueChange?: (value: RadioValue) => void;
    optionProps?: (option: RadioOption, index: number) => WithStyle<HTMLAttributes<HTMLSpanElement>>;
    itemProps?: (option: RadioOption, index: number) => Partial<RadioProps>;
    descriptionProps?: (option: RadioOption, index: number) => WithStyle<HTMLAttributes<HTMLSpanElement>>;
    messageProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    disabled?: boolean;
    size?: Size;
    name?: string;
    onChange?: (value: RadioValue, event?: ChangeEvent<HTMLInputElement>) => void;
    children?: ReactNode;
    classNames?: RadioGroupClassNames;
    styles?: RadioGroupStyles;
}

interface RadioOption {
    label: ReactNode;
    value: RadioValue;
    disabled?: boolean;
    description?: ReactNode;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Switch

`<Switch label="接收通知" checked={enabled} onChange={setEnabled} />`。首参为 checked 布尔值，第二参为事件；checkedChildren / unCheckedChildren 是开关内部的短文案。即时保存期间可传 loading 阻止重复操作；通用文字说明放 label 或 description。

<!-- api:switch -->

可导入 `Switch`。

[类型与导出入口](packages/ui/src/components/switch/index.ts) · [交互说明](apps/docs/src/content/表单/switch.md) · [可运行示例](apps/docs/src/examples/switch)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Switch } from '@yuki-ui/react';

export default function BasicSwitch() {
  const [on, setOn] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)' }}>
      <Switch checked={on} onChange={setOn} />
      <Switch defaultChecked checkedChildren="开" unCheckedChildren="关" />
      <Switch size="sm" defaultChecked checkedChildren="小" />
      <Switch disabled defaultChecked />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Switch(props: SwitchProps & RefAttributes<HTMLInputElement>): ReactNode

type SwitchClassNames = Partial<Record<'root' | 'input' | 'track' | 'handle' | 'label' | 'loading', string>>;

interface SwitchProps extends StandaloneFieldProps, Omit<WithStyle<InputHTMLAttributes<HTMLInputElement>>, 'size' | 'type' | 'onChange' | 'checked' | 'defaultChecked' | 'children'> {
    animation?: AnimationOptions | false;
    thumbProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
    size?: Size;
    disabled?: boolean;
    loading?: boolean;
    checkedChildren?: ReactNode;
    unCheckedChildren?: ReactNode;
    classNames?: SwitchClassNames;
    styles?: SwitchStyles;
}

type SwitchStyles = Partial<Record<'root' | 'input' | 'track' | 'handle' | 'label' | 'loading', StyleProperties>>;

interface StandaloneFieldProps {
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    fieldProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    labelProps?: WithStyle<LabelHTMLAttributes<HTMLLabelElement>>;
    messageProps?: WithStyle<HTMLAttributes<HTMLParagraphElement>>;
    controlClassName?: string;
    controlStyle?: StyleProperties;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Slider、RangeSlider

`<Slider aria-label="亮度" min={0} max={100} step={5} showValue />` 的值为单个数字；onChange 跟随拖动，onChangeComplete 用于一次交互结束后的提交。`<RangeSlider label="价格" defaultValue={[20,80]} thumbLabels={['最低价','最高价']} />` 接受有序数值数组，使用 onValueChange 和 onValueCommit。拇指数随数组长度；明确 min、max、step 及对应的可访问标签。

<!-- api:slider -->

可导入 `RangeSlider`、`Slider`。

[类型与导出入口](packages/ui/src/components/slider/index.ts) · [交互说明](apps/docs/src/content/表单/slider.md) · [可运行示例](apps/docs/src/examples/slider)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Slider } from '@yuki-ui/react';

export default function BasicSlider() {
  const [value, setValue] = useState(40);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-4)', maxWidth: 420 }}>
      <Slider aria-label="音量" value={value} onChange={setValue} showValue />
      <Slider aria-label="透明度" defaultValue={65} />
      <Slider aria-label="禁用" defaultValue={30} disabled />
      <Slider aria-label="小尺寸" defaultValue={10} size="sm" />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
RangeSlider(props: RangeSliderProps & RefAttributes<HTMLSpanElement>): ReactNode

Slider(props: SliderProps & RefAttributes<HTMLInputElement>): ReactNode

interface RangeSliderProps extends WithStyle<ComponentPropsWithoutRef<typeof Primitive.Root>> {
    value?: number[];
    defaultValue?: number[];
    label?: ReactNode;
    showValue?: boolean;
    formatValue?: (value: number) => string;
    thumbLabels?: string[];
    fieldProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    controlClassName?: string;
    controlStyle?: StyleProperties;
    size?: 'sm' | 'md' | 'lg';
    trackProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Track>>;
    rangeProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Range>>;
    thumbProps?: Omit<WithStyle<ComponentPropsWithoutRef<typeof Primitive.Thumb>>, 'children' | 'asChild'> | ((index: number) => Omit<WithStyle<ComponentPropsWithoutRef<typeof Primitive.Thumb>>, 'children' | 'asChild'>);
    labelProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    valueProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    animation?: AnimationOptions | false;
}

type SliderClassNames = Partial<Record<'root' | 'input' | 'marks' | 'mark' | 'value', string>>;

interface SliderMark {
    label: ReactNode;
}

interface SliderProps extends Omit<WithStyle<InputHTMLAttributes<HTMLInputElement>>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step' | 'type'> {
    size?: Size;
    status?: FieldStatus;
    value?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    marks?: Record<number, ReactNode>;
    showValue?: boolean;
    formatValue?: (value: number) => string;
    reverse?: boolean;
    onChange?: (value: number) => void;
    onChangeComplete?: (value: number) => void;
    classNames?: SliderClassNames;
    styles?: SliderStyles;
}

type SliderStyles = Partial<Record<'root' | 'input' | 'marks' | 'mark' | 'value', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Rate

`<Rate aria-label="满意度" allowHalf value={rating} onChange={setRating} />`。默认五项、0 分、整星；allowClear 可再次点击当前值回到 0。onHoverChange 适合临时预览分值，onChange 保存最终选择。character 可按从 1 开始的项目编号返回自定义符号。

<!-- api:rate -->

可导入 `Rate`。

[类型与导出入口](packages/ui/src/components/rate/index.ts) · [交互说明](apps/docs/src/content/表单/rate.md) · [可运行示例](apps/docs/src/examples/rate)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Rate } from '@yuki-ui/react';

export default function BasicRate() {
  const [value, setValue] = useState(3);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)' }}>
      <Rate value={value} onChange={setValue} />
      <Rate defaultValue={4} allowClear />
      <Rate defaultValue={2} disabled />
      <Rate defaultValue={5} size="lg" />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Rate(props: RateProps & RefAttributes<HTMLDivElement>): ReactNode

type RateClassNames = Partial<Record<'root' | 'item' | 'star' | 'fill', string>>;

interface RateProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue'> {
    value?: number;
    defaultValue?: number;
    count?: number;
    name?: string;
    allowHalf?: boolean;
    allowClear?: boolean;
    disabled?: boolean;
    size?: Size;
    character?: ReactNode | ((index: number) => ReactNode);
    onChange?: (value: number) => void;
    onHoverChange?: (value: number) => void;
    classNames?: RateClassNames;
    styles?: RateStyles;
}

type RateStyles = Partial<Record<'root' | 'item' | 'star' | 'fill', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### DatePicker

`<DatePicker label="到期日" value={date} onChange={setDate} clearable />`。值为本地日历的 Date 或 null，min / max 接受 Date 且包含端点；disabledDate 屏蔽例外。weekStartsOn=0 表示周日，format 改显示文本，renderDay 改格子内容。需要 API 字符串时在存取边界按业务时区转换。

<!-- api:date-picker -->

可导入 `DatePicker`。

[类型与导出入口](packages/ui/src/components/date-picker/index.ts) · [交互说明](apps/docs/src/content/表单/date-picker.md) · [可运行示例](apps/docs/src/examples/date-picker)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { DatePicker } from '@yuki-ui/react';

export default function BasicDatePicker() {
  const [value, setValue] = useState<Date | null>(new Date(2024, 2, 15));

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-sm)' }}>
      <DatePicker
        value={value}
        onChange={setValue}
        placeholder="选择日期"
        clearable
        onClear={() => setValue(null)}
      />
      <DatePicker defaultValue={new Date(2024, 2, 1)} placeholder="非受控，默认 3 月 1 日" />
      <DatePicker placeholder="禁用状态" disabled />
      <DatePicker placeholder="只读状态" readOnly defaultValue={new Date(2024, 2, 20)} />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
DatePicker(props: DatePickerProps & { ref?: Ref<HTMLDivElement>; }): ReactElement

interface DatePickerClassNames {
    root?: string;
    trigger?: string;
    panel?: string;
    footer?: string;
    today?: string;
    value?: string;
    placeholder?: string;
    prefix?: string;
    suffix?: string;
    clear?: string;
    arrow?: string;
    calendar?: DateCalendarClassNames;
}

interface DatePickerProps extends StandaloneFieldProps, Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue' | 'value' | 'prefix'> {
    value?: DatePickerValue;
    defaultValue?: DatePickerValue;
    onChange?: (value: Date | null) => void;
    onClear?: () => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    size?: Size;
    placeholder?: ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    status?: SelectStatus;
    clearable?: boolean;
    min?: Date;
    max?: Date;
    disabledDate?: (date: Date) => boolean;
    weekStartsOn?: number;
    format?: (date: Date) => string;
    renderDay?: (date: Date, state: DateCalendarDayState) => ReactNode;
    showToday?: boolean;
    prefix?: ReactNode;
    suffix?: ReactNode;
    showArrow?: boolean;
    borderless?: boolean;
    placement?: Placement;
    name?: string;
    required?: boolean;
    classNames?: DatePickerClassNames;
    styles?: DatePickerStyles;
}

interface DatePickerStyles {
    root?: StyleProperties;
    trigger?: StyleProperties;
    panel?: StyleProperties;
    calendar?: DateCalendarStyles;
}

type DatePickerValue = Date | null;

interface DateRange {
    start: Date | null;
    end: Date | null;
}

type DateCalendarClassNames = Partial<Record<'root' | 'header' | 'nav' | 'title' | 'weekdays' | 'weekday' | 'grid' | 'row' | 'cell' | 'day' | 'footer', string>>;

interface StandaloneFieldProps {
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    fieldProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    labelProps?: WithStyle<LabelHTMLAttributes<HTMLLabelElement>>;
    messageProps?: WithStyle<HTMLAttributes<HTMLParagraphElement>>;
    controlClassName?: string;
    controlStyle?: StyleProperties;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};

interface DateCalendarDayState {
    selected: boolean;
    rangeStart: boolean;
    rangeEnd: boolean;
    inRange: boolean;
    today: boolean;
    outside: boolean;
    disabled: boolean;
    active: boolean;
}

type DateCalendarStyles = Partial<Record<'root' | 'grid' | 'day', StyleProperties>>;
```

</details>

<!-- /api -->

### DateRangePicker

`<DateRangePicker value={period} onChange={setPeriod} clearable />`。传 {start, end} 的日期对象或 null；选择完成时回调含两个 Date，清空时为 null。presets 提供快捷区间，min / max / disabledDate 约束日期，startPlaceholder 和 endPlaceholder 分别描述两端。命名的 Form.Item 可直接绑定完整区间；独立使用 name 生成的原生表单值是 YYYY-MM-DD~YYYY-MM-DD。

<!-- api:date-range-picker -->

可导入 `DateRangePicker`。

[类型与导出入口](packages/ui/src/components/date-range-picker/index.ts) · [交互说明](apps/docs/src/content/表单/date-range-picker.md) · [可运行示例](apps/docs/src/examples/date-range-picker)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { DateRangePicker, Typography, type DateRange } from '@yuki-ui/react';

const defaultRange: DateRange = {
  start: new Date(2024, 2, 5),
  end: new Date(2024, 2, 10),
};

export default function BasicDateRangePicker() {
  const [value, setValue] = useState<DateRange | null>(defaultRange);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-md)' }}>
      <DateRangePicker
        value={value}
        onChange={setValue}
        startPlaceholder="开始日期"
        endPlaceholder="结束日期"
        clearable
        onClear={() => setValue(null)}
      />
      <DateRangePicker defaultValue={defaultRange} startPlaceholder="开始日期" endPlaceholder="结束日期" />
      <DateRangePicker startPlaceholder="禁用状态" endPlaceholder="禁用状态" disabled />
      <Typography.Text tone="secondary">
        受控值：{value ? `${value.start?.toLocaleDateString()} ~ ${value.end?.toLocaleDateString()}` : '未选择'}
      </Typography.Text>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
DateRangePicker(props: DateRangePickerProps & { ref?: Ref<HTMLDivElement>; }): ReactElement

interface DateRange {
    start: Date | null;
    end: Date | null;
}

interface DateRangePickerClassNames {
    root?: string;
    trigger?: string;
    panel?: string;
    presets?: string;
    preset?: string;
    summary?: string;
    separator?: string;
    start?: string;
    end?: string;
    value?: string;
    placeholder?: string;
    prefix?: string;
    suffix?: string;
    clear?: string;
    arrow?: string;
    calendar?: DateCalendarClassNames;
}

interface DateRangePickerPreset {
    label: ReactNode;
    value: DateRange;
}

interface DateRangePickerProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue' | 'value' | 'prefix'> {
    value?: DateRange | null;
    defaultValue?: DateRange | null;
    onChange?: (range: {
        start: Date;
        end: Date;
    } | null) => void;
    onClear?: () => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    size?: Size;
    startPlaceholder?: ReactNode;
    endPlaceholder?: ReactNode;
    separator?: ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    status?: SelectStatus;
    clearable?: boolean;
    min?: Date;
    max?: Date;
    disabledDate?: (date: Date) => boolean;
    weekStartsOn?: number;
    format?: (date: Date) => string;
    renderDay?: (date: Date, state: DateCalendarDayState) => ReactNode;
    presets?: DateRangePickerPreset[];
    prefix?: ReactNode;
    suffix?: ReactNode;
    showArrow?: boolean;
    borderless?: boolean;
    placement?: Placement;
    name?: string;
    required?: boolean;
    classNames?: DateRangePickerClassNames;
    styles?: DateRangePickerStyles;
}

interface DateRangePickerStyles {
    root?: StyleProperties;
    trigger?: StyleProperties;
    panel?: StyleProperties;
    calendar?: DateCalendarStyles;
}

type DateCalendarClassNames = Partial<Record<'root' | 'header' | 'nav' | 'title' | 'weekdays' | 'weekday' | 'grid' | 'row' | 'cell' | 'day' | 'footer', string>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};

interface DateCalendarDayState {
    selected: boolean;
    rangeStart: boolean;
    rangeEnd: boolean;
    inRange: boolean;
    today: boolean;
    outside: boolean;
    disabled: boolean;
    active: boolean;
}

type DateCalendarStyles = Partial<Record<'root' | 'grid' | 'day', StyleProperties>>;
```

</details>

<!-- /api -->

### TimePicker

`<TimePicker label="提醒时间" defaultValue="09:30" minuteStep={5} />`。值是 HH:mm 字符串或 null，开启 showSeconds 后含秒。min / max 表示当日边界，format 只影响触发器文字。需要日期和时间一起提交时，分别收集两个字段后在提交时组合。

<!-- api:time-picker -->

可导入 `TimePicker`。

[类型与导出入口](packages/ui/src/components/time-picker/index.ts) · [交互说明](apps/docs/src/content/表单/time-picker.md) · [可运行示例](apps/docs/src/examples/time-picker)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { TimePicker } from '@yuki-ui/react';

export default function BasicTimePicker() {
  const [value, setValue] = useState<string | null>('09:30');

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-xs)' }}>
      <TimePicker
        value={value}
        onChange={setValue}
        placeholder="选择时间"
        clearable
        onClear={() => setValue(null)}
      />
      <TimePicker defaultValue="18:45" showSeconds placeholder="含秒的时间" />
      <TimePicker placeholder="禁用状态" disabled />
      <TimePicker placeholder="只读状态" readOnly defaultValue="08:00" />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
TimePicker(props: TimePickerProps & { ref?: Ref<HTMLDivElement>; }): ReactElement

type TimePickerClassNames = Partial<Record<'root' | 'trigger' | 'panel' | 'header' | 'columns' | 'column' | 'columnTitle' | 'columnList' | 'option' | 'footer' | 'now' | 'value' | 'placeholder' | 'prefix' | 'suffix' | 'clear' | 'arrow', string>>;

interface TimePickerProps extends StandaloneFieldProps, Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue' | 'value' | 'prefix'> {
    value?: string | null;
    defaultValue?: string | null;
    onChange?: (value: string | null) => void;
    onClear?: () => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    size?: Size;
    placeholder?: ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    status?: SelectStatus;
    clearable?: boolean;
    showSeconds?: boolean;
    minuteStep?: number;
    secondStep?: number;
    min?: string;
    max?: string;
    format?: (value: string) => string;
    showNow?: boolean;
    prefix?: ReactNode;
    suffix?: ReactNode;
    showArrow?: boolean;
    borderless?: boolean;
    placement?: Placement;
    name?: string;
    required?: boolean;
    classNames?: TimePickerClassNames;
    styles?: TimePickerStyles;
}

type TimePickerStyles = Partial<Record<'root' | 'trigger' | 'panel' | 'columns', StyleProperties>>;

interface StandaloneFieldProps {
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    fieldProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    labelProps?: WithStyle<LabelHTMLAttributes<HTMLLabelElement>>;
    messageProps?: WithStyle<HTMLAttributes<HTMLParagraphElement>>;
    controlClassName?: string;
    controlStyle?: StyleProperties;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### ColorPicker

`<ColorPicker defaultValue="#6554c0" alpha onChange={(text, rgba) => apply(text)} />`。format 控制输出格式，默认 hex。onChange 供连续预览，onChangeComplete 处理完成状态；允许清空时注意空字符串和 null 颜色值。可指定 presets，parseColor / formatColor / toHex / toRgb 等导出可复用同一套转换。

<!-- api:color-picker -->

可导入 `ColorPicker`、`colorPickerPresets`、`formatColor`、`isValidColor`、`parseColor`、`toCssColor`、`toHex`、`toRgb`。

[类型与导出入口](packages/ui/src/components/color-picker/index.ts) · [交互说明](apps/docs/src/content/表单/color-picker.md) · [可运行示例](apps/docs/src/examples/color-picker)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { ColorPicker } from '@yuki-ui/react';

export default function BasicColorPicker() {
  const [color, setColor] = useState('#3b82f6');

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 360 }}>
      <ColorPicker value={color} onChange={(next) => setColor(next)} />
      <ColorPicker defaultValue="#22c55e" />
      <ColorPicker size="sm" allowClear placeholder="选择颜色" />
      <ColorPicker alpha defaultValue="#6366f1" />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
ColorPicker(props: ColorPickerProps & RefAttributes<HTMLDivElement>): ReactNode

formatColor(color: RgbaColor, format?: ColorPickerFormat, alpha?: boolean): string

isValidColor(input: string): boolean

parseColor(input: string): RgbaColor | null

toCssColor(input: string): string | undefined

toHex(color: RgbaColor, alpha?: boolean): string

toRgb(color: RgbaColor): string

type ColorPickerClassNames = Partial<Record<'root' | 'trigger' | 'swatch' | 'value' | 'indicator' | 'panel' | 'presets' | 'preset' | 'inputRow' | 'preview' | 'input' | 'alpha' | 'alphaInput' | 'alphaValue' | 'footer' | 'clear', string>>;

type ColorPickerFormat = 'hex' | 'rgb';

interface ColorPickerProps extends StandaloneFieldProps, Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue'> {
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string, color: RgbaColor | null) => void;
    onChangeComplete?: (value: string, color: RgbaColor | null) => void;
    format?: ColorPickerFormat;
    alpha?: boolean;
    presets?: string[];
    allowClear?: boolean;
    disabled?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placeholder?: string;
    size?: Size;
    classNames?: ColorPickerClassNames;
    styles?: ColorPickerStyles;
}

type ColorPickerStyles = Partial<Record<'root' | 'trigger' | 'swatch' | 'value' | 'indicator' | 'panel' | 'presets' | 'preset' | 'inputRow' | 'preview' | 'input' | 'alpha' | 'alphaInput' | 'alphaValue' | 'footer' | 'clear', StyleProperties>>;

interface RgbaColor {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface StandaloneFieldProps {
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    fieldProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    labelProps?: WithStyle<LabelHTMLAttributes<HTMLLabelElement>>;
    messageProps?: WithStyle<HTMLAttributes<HTMLParagraphElement>>;
    controlClassName?: string;
    controlStyle?: StyleProperties;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Cascader

`<Cascader options={[{value:'cn',label:'中国',children:[{value:'hz',label:'杭州'}]}]} defaultValue={['cn','hz']} />`。值为每一层 value 组成的路径，onChange(path, selectedOptions)，清空得 null。默认选择到叶子才提交，changeOnSelect 允许中间层提交。searchable 搜索整条叶路径，displayRender 决定触发器上的面包屑文案。命名的 Form.Item 直接收集值数组，原生表单的 name 则输出逗号分隔路径。

<!-- api:cascader -->

可导入 `Cascader`。

[类型与导出入口](packages/ui/src/components/cascader/index.ts) · [交互说明](apps/docs/src/content/表单/cascader.md) · [可运行示例](apps/docs/src/examples/cascader)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Cascader, type CascaderOption } from '@yuki-ui/react';

const options: CascaderOption<string>[] = [
  {
    value: 'zj',
    label: '浙江',
    children: [
      { value: 'hangzhou', label: '杭州' },
      { value: 'ningbo', label: '宁波' },
      { value: 'wenzhou', label: '温州' },
    ],
  },
  {
    value: 'js',
    label: '江苏',
    children: [
      { value: 'nanjing', label: '南京' },
      { value: 'suzhou', label: '苏州' },
    ],
  },
  {
    value: 'sh',
    label: '上海',
    children: [{ value: 'pudong', label: '浦东新区' }],
  },
];

export default function BasicCascader() {
  const [value, setValue] = useState<readonly string[] | null>(['zj', 'hangzhou']);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-md)' }}>
      <Cascader
        options={options}
        value={value}
        onChange={setValue}
        placeholder="选择省市"
        clearable
        onClear={() => setValue(null)}
      />
      <Cascader options={options} defaultValue={['js', 'suzhou']} placeholder="非受控" />
      <Cascader options={options} placeholder="禁用状态" disabled />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Cascader<T = string>(props: CascaderProps<T> & { ref?: Ref<HTMLDivElement>; }): ReactElement

type CascaderClassNames = Partial<Record<'root' | 'trigger' | 'panel' | 'columns' | 'column' | 'option' | 'optionLabel' | 'optionCheck' | 'search' | 'searchInput' | 'status' | 'value' | 'placeholder' | 'prefix' | 'suffix' | 'clear' | 'arrow', string>>;

interface CascaderLeaf<T = string> {
    path: T[];
    nodes: CascaderOption<T>[];
    labels: ReactNode[];
    option: CascaderOption<T>;
}

interface CascaderOption<T = string> {
    value: T;
    label: ReactNode;
    disabled?: boolean;
    children?: readonly CascaderOption<T>[];
    isLeaf?: boolean;
}

interface CascaderOptionRenderState {
    depth: number;
    active: boolean;
    selected: boolean;
    disabled: boolean;
    expandable: boolean;
}

interface CascaderProps<T = string> extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue' | 'value' | 'prefix'> {
    options: readonly CascaderOption<T>[];
    value?: CascaderValue<T> | null;
    defaultValue?: CascaderValue<T> | null;
    onChange?: (value: CascaderValue<T> | null, selectedOptions: CascaderOption<T>[]) => void;
    onClear?: () => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    size?: Size;
    placeholder?: ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    status?: SelectStatus;
    clearable?: boolean;
    changeOnSelect?: boolean;
    searchable?: boolean;
    filterOption?: (query: string, leaf: CascaderLeaf<T>) => boolean;
    onSearch?: (query: string) => void;
    searchPlaceholder?: string;
    emptyText?: ReactNode;
    displayRender?: (labels: ReactNode[], selectedOptions: CascaderOption<T>[]) => ReactNode;
    renderOption?: (option: CascaderOption<T>, state: CascaderOptionRenderState) => ReactNode;
    showArrow?: boolean;
    borderless?: boolean;
    placement?: Placement;
    name?: string;
    required?: boolean;
    classNames?: CascaderClassNames;
    styles?: CascaderStyles;
}

type CascaderStyles = Partial<Record<'root' | 'trigger' | 'panel' | 'columns', StyleProperties>>;

type CascaderValue<T = string> = readonly T[];

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### TreeSelect

`<TreeSelect options={departments} multiple searchable maxTagCount={3} />`。以 {value,label,children?} 表示层级。提交节点值，单选为 T 或 null，多选为数组，回调第二参是节点数组。multiple 确定回调的值类型；portalContainer 指定挂载点，forceMount 决定是否保留面板。expandedKeys / onExpandedChange 与选择状态独立；inheritDisabled 控制禁用父级对子项的影响。若业务存储整条祖先路径，使用 Cascader。

<!-- api:tree-select -->

可导入 `TreeSelect`。

[类型与导出入口](packages/ui/src/components/tree-select/index.ts) · [交互说明](apps/docs/src/content/表单/tree-select.md) · [可运行示例](apps/docs/src/examples/tree-select)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { TreeSelect, type TreeNodeOption } from '@yuki-ui/react';

const options: TreeNodeOption<string>[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      { value: 'hangzhou', label: '杭州' },
      { value: 'ningbo', label: '宁波' },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      { value: 'nanjing', label: '南京' },
      { value: 'suzhou', label: '苏州' },
    ],
  },
];

export default function BasicTreeSelect() {
  const [value, setValue] = useState<string | null>('hangzhou');
  const [cities, setCities] = useState<string[]>(['hangzhou', 'nanjing']);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-md)' }}>
      <TreeSelect
        options={options}
        value={value}
        onChange={setValue}
        placeholder="选择城市"
        clearable
      />
      <TreeSelect options={options} multiple value={cities} onChange={setCities} placeholder="多选" />
      <TreeSelect options={options} placeholder="禁用状态" disabled />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
TreeSelect<T = string>(props: TreeSelectProps<T> & { ref?: Ref<HTMLDivElement>; }): ReactElement

interface TreeNodeOption<T = string> {
    value: T;
    label: ReactNode;
    disabled?: boolean;
    isLeaf?: boolean;
    children?: readonly TreeNodeOption<T>[];
}

type TreeSelectClassNames = Partial<Record<'root' | 'trigger' | 'panel' | 'search' | 'searchInput' | 'tree' | 'node' | 'nodeContent' | 'nodeLabel' | 'nodeToggle' | 'nodeCheckbox' | 'empty' | 'tags' | 'tag' | 'tagLabel' | 'tagRemove' | 'value' | 'placeholder' | 'prefix' | 'suffix' | 'clear' | 'arrow', string>>;

interface TreeSelectNodeState {
    depth: number;
    expanded: boolean;
    selected: boolean;
    active: boolean;
    disabled: boolean;
    leaf: boolean;
}

type TreeSelectProps<T = string> = TreeSelectCommonProps<T> & ({
    multiple?: false;
    value?: T | null;
    defaultValue?: T | null;
    onChange?: (value: NoInfer<T> | null, nodes: TreeNodeOption<NoInfer<T>>[]) => void;
} | {
    multiple: true;
    value?: readonly T[] | null;
    defaultValue?: readonly T[] | null;
    onChange?: (values: NoInfer<T>[], nodes: TreeNodeOption<NoInfer<T>>[]) => void;
});

type TreeSelectStyles = Partial<Record<'root' | 'trigger' | 'panel' | 'tree', StyleProperties>>;

type TreeSelectValue<T> = T | readonly T[] | null;

interface TreeSelectCommonProps<T> extends StandaloneFieldProps, Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue' | 'value' | 'prefix'> {
    options: readonly TreeNodeOption<T>[];
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    size?: Size;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    status?: SelectStatus;
    clearable?: boolean;
    onClear?: () => void;
    searchable?: boolean;
    filterTreeNode?: (query: string, node: TreeNodeOption<T>) => boolean;
    onSearch?: (query: string) => void;
    searchPlaceholder?: string;
    emptyText?: ReactNode;
    defaultExpandAll?: boolean;
    defaultExpandedKeys?: readonly T[];
    expandedKeys?: readonly T[];
    onExpandedChange?: (keys: readonly T[]) => void;
    maxTagCount?: number;
    maxTagPlaceholder?: (hidden: readonly TreeNodeOption<T>[]) => ReactNode;
    removeLabel?: (node: TreeNodeOption<T>) => string;
    inheritDisabled?: boolean;
    animation?: AnimationOptions | false;
    icon?: ReactNode;
    indicator?: ReactNode;
    triggerProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    contentProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    valueProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    viewportProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    optionProps?: (node: TreeNodeOption<T>, index: number) => WithStyle<HTMLAttributes<HTMLDivElement>>;
    portalContainer?: HTMLElement | null;
    forceMount?: boolean;
    renderNode?: (node: TreeNodeOption<T>, state: TreeSelectNodeState) => ReactNode;
    showArrow?: boolean;
    borderless?: boolean;
    placement?: Placement;
    name?: string;
    required?: boolean;
    classNames?: TreeSelectClassNames;
    styles?: TreeSelectStyles;
}

interface StandaloneFieldProps {
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    fieldProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    labelProps?: WithStyle<LabelHTMLAttributes<HTMLLabelElement>>;
    messageProps?: WithStyle<HTMLAttributes<HTMLParagraphElement>>;
    controlClassName?: string;
    controlStyle?: StyleProperties;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Mentions

`<Mentions options={[{value:'lin',label:'林舟'}]} onSelect={(option,prefix) => track(option.value)} />`。value 是完整文本，onChange 收到替换提及后的整段字符串。默认 @ 触发，以空格分隔；loadOptions(keyword) 可返回异步候选并优先于静态 options。把 onSelect 用于解析实体或埋点。

<!-- api:mentions -->

可导入 `Mentions`。

[类型与导出入口](packages/ui/src/components/mentions/index.ts) · [交互说明](apps/docs/src/content/表单/mentions.md) · [可运行示例](apps/docs/src/examples/mentions)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Mentions, type MentionOption } from '@yuki-ui/react';

const members: MentionOption[] = [
  { value: 'alice', label: 'Alice Chen' },
  { value: 'bob', label: 'Bob Li' },
  { value: 'carol', label: 'Carol Wang' },
  { value: 'dave', label: 'Dave Zhang' },
  { value: 'erin', label: 'Erin Sun', disabled: true },
];

export default function BasicMentions() {
  const [value, setValue] = useState('');

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 480 }}>
      <Mentions
        value={value}
        onChange={(next) => setValue(next)}
        options={members}
        placeholder="输入 @ 提及成员"
      />
      <Mentions defaultValue="你好 " options={members} rows={2} placeholder="继续输入以提及" />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Mentions(props: MentionsProps & RefAttributes<HTMLDivElement>): ReactNode

type MentionFilter = (keyword: string, option: MentionOption) => boolean;

interface MentionOption {
    value: string;
    label?: ReactNode;
    disabled?: boolean;
}

type MentionsClassNames = Partial<Record<'root' | 'textarea' | 'dropdown' | 'list' | 'option' | 'optionLabel' | 'empty' | 'loading', string>>;

interface MentionsProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue' | 'onSelect'> {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onSelect?: (option: MentionOption, prefix: string) => void;
    options?: MentionOption[];
    loadOptions?: (keyword: string) => MentionOption[] | Promise<MentionOption[]>;
    filterOption?: MentionFilter;
    prefix?: string;
    split?: string;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
    disabled?: boolean;
    size?: Size;
    classNames?: MentionsClassNames;
    styles?: MentionsStyles;
}

type MentionsStyles = Partial<Record<'root' | 'textarea' | 'dropdown' | 'list' | 'option' | 'optionLabel' | 'empty' | 'loading', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Transfer

双栏成员分配用 `<Transfer dataSource={members} targetKeys={ids} onChange={setIds} searchable />`。每项给稳定的字符串 key，title 用于显示和默认搜索。右栏的 targetKeys 是最终选集，回调第二参为方向，第三参为本次移动的键。disabledKeys 禁止移动特定项，oneWay 用于只向右分配。

<!-- api:transfer -->

可导入 `Transfer`。

[类型与导出入口](packages/ui/src/components/transfer/index.ts) · [交互说明](apps/docs/src/content/其他/transfer.md) · [可运行示例](apps/docs/src/examples/transfer)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Transfer, type TransferItem } from '@yuki-ui/react';

const members: TransferItem[] = [
  { key: 'alice', title: 'Alice Chen', description: '产品设计' },
  { key: 'bob', title: 'Bob Li', description: '前端开发' },
  { key: 'carol', title: 'Carol Wang', description: '后端开发' },
  { key: 'dave', title: 'Dave Zhang', description: '测试' },
  { key: 'erin', title: 'Erin Sun', description: '运营' },
];

export default function BasicTransfer() {
  const [targetKeys, setTargetKeys] = useState<string[]>(['carol']);

  return (
    <Transfer
      dataSource={members}
      targetKeys={targetKeys}
      onChange={(next) => setTargetKeys(next)}
      titles={['待选成员', '已选成员']}
      searchable
    />
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Transfer<T extends TransferItem = TransferItem>(props: TransferProps<T> & { ref?: Ref<HTMLDivElement>; }): ReactElement

type TransferClassNames = Partial<Record<'root' | 'column' | 'header' | 'title' | 'count' | 'selectAll' | 'search' | 'body' | 'list' | 'item' | 'itemCheckbox' | 'itemLabel' | 'itemDescription' | 'empty' | 'operations' | 'operation', string>>;

type TransferDirection = 'left' | 'right';

interface TransferItem {
    key: string;
    title?: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
}

interface TransferProps<T extends TransferItem = TransferItem> extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'title'> {
    dataSource: T[];
    targetKeys?: string[];
    defaultTargetKeys?: string[];
    onChange?: (targetKeys: string[], direction: TransferDirection, movedKeys: string[]) => void;
    titles?: [
        ReactNode,
        ReactNode
    ];
    searchable?: boolean;
    filterOption?: (input: string, item: T) => boolean;
    selectAll?: boolean;
    renderItem?: (item: T) => ReactNode;
    disabled?: boolean;
    disabledKeys?: string[];
    oneWay?: boolean;
    emptyText?: ReactNode;
    size?: Size;
    classNames?: TransferClassNames;
    styles?: TransferStyles;
}

type TransferStyles = Partial<Record<'root' | 'column' | 'header' | 'title' | 'count' | 'selectAll' | 'search' | 'body' | 'list' | 'item' | 'itemCheckbox' | 'itemLabel' | 'itemDescription' | 'empty' | 'operations' | 'operation', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Upload、UploadDragger、BatchUpload

`<Upload fileList={files} onChange={setFiles} multiple accept="image/*" />` 中 fileList 是 UploadFile[]，含 uid、name、status 和可选 originFile；onChange(list, changedFile) 也报告进度和删除。onFilesChange 给本次接受的原始 File[]。beforeUpload 可异步校验或替换文件，maxCount 及 onExceed 处理上限。内置传输用 action 与 method/headers/data，自定义传输通过 customRequest 通知进度、成功或失败，并可返回 abort。UploadDragger 是拖放版。

`<BatchUpload multiple name="attachments" action="/api/batches" onUploaded={(files,response) => …} />` 把本次选择的文件放在同一 FormData 内进行一次 POST，重新选择会替换整批。需要每文件进度、列表编辑或不同上传任务时用 Upload。

<!-- api:upload -->

可导入 `BatchUpload`、`Upload`、`UploadDragger`、`formatFileSize`、`matchesAccept`。

[类型与导出入口](packages/ui/src/components/upload/index.ts) · [交互说明](apps/docs/src/content/表单/upload.md) · [可运行示例](apps/docs/src/examples/upload)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Upload, type UploadFile } from '@yuki-ui/react';

export default function BasicUpload() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)', maxWidth: 520 }}>
      <Upload
        fileList={files}
        onChange={(next) => setFiles(next)}
        multiple
        accept="image/*,.pdf"
        tip="支持图片与 PDF，可多选"
      />
      <Upload maxCount={2} accept="image/*" tip="最多上传 2 个文件" />
      <Upload size="sm" disabled tip="禁用状态" />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
BatchUpload(props: BatchUploadProps & RefAttributes<HTMLInputElement>): ReactNode

Upload(props: UploadProps & RefAttributes<HTMLDivElement>): ReactNode

UploadDragger(props: UploadDraggerProps & RefAttributes<HTMLDivElement>): ReactNode

formatFileSize(bytes: number): string

matchesAccept(file: File, accept?: string): boolean

interface BatchUploadProps extends Omit<WithStyle<InputHTMLAttributes<HTMLInputElement>>, 'type' | 'size' | 'value' | 'defaultValue' | 'children'> {
    label?: ReactNode;
    size?: Size;
    action?: string;
    onFilesChange?: (files: File[]) => void;
    onUploaded?: (files: File[], response: Response) => void;
    onUploadError?: (error: Error) => void;
}

type UploadClassNames = Partial<Record<'root' | 'trigger' | 'dropzone' | 'icon' | 'tip' | 'input' | 'list' | 'item' | 'thumbnail' | 'file' | 'fileName' | 'fileSize' | 'progress' | 'actions' | 'preview' | 'remove' | 'overlay' | 'overlayImage', string>>;

type UploadDraggerProps = Omit<UploadProps, 'drag'>;

interface UploadFile {
    uid: string;
    name: string;
    size?: number;
    type?: string;
    status?: UploadFileStatus;
    percent?: number;
    url?: string;
    thumbUrl?: string;
    originFile?: File;
    response?: unknown;
    error?: unknown;
}

type UploadFileStatus = 'ready' | 'uploading' | 'done' | 'error';

type UploadListType = 'text' | 'picture';

interface UploadProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'onError' | 'onDrop' | 'onSelect' | 'onProgress'> {
    onFilesChange?: (files: File[]) => void;
    label?: ReactNode;
    buttonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
    fileList?: UploadFile[];
    defaultFileList?: UploadFile[];
    onChange?: (fileList: UploadFile[], file: UploadFile) => void;
    beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<boolean | File>;
    customRequest?: UploadRequest;
    action?: string;
    method?: string;
    headers?: Record<string, string>;
    data?: Record<string, string | Blob>;
    name?: string;
    withCredentials?: boolean;
    multiple?: boolean;
    accept?: string;
    maxCount?: number;
    drag?: boolean;
    disabled?: boolean;
    listType?: UploadListType;
    showUploadList?: boolean;
    showRemoveIcon?: boolean;
    showPreviewIcon?: boolean;
    tip?: ReactNode;
    icon?: ReactNode;
    fileRender?: (file: UploadFile) => ReactNode;
    onRemove?: (file: UploadFile) => boolean | Promise<boolean> | void;
    onPreview?: (file: UploadFile) => void;
    onProgress?: (file: UploadFile, percent: number) => void;
    onSuccess?: (file: UploadFile, response: unknown) => void;
    onError?: (file: UploadFile, error: unknown) => void;
    onExceed?: (files: File[], fileList: UploadFile[]) => void;
    size?: Size;
    classNames?: UploadClassNames;
    styles?: UploadStyles;
}

type UploadRequest = (options: UploadRequestOptions) => UploadRequestResult | void;

interface UploadRequestOptions {
    file: File;
    action?: string;
    method: string;
    headers?: Record<string, string>;
    data?: Record<string, string | Blob>;
    name: string;
    withCredentials: boolean;
    onProgress: (percent: number) => void;
    onSuccess: (response?: unknown) => void;
    onError: (error: unknown) => void;
}

interface UploadRequestResult {
    abort?: () => void;
}

type UploadStyles = Partial<Record<'root' | 'trigger' | 'dropzone' | 'icon' | 'tip' | 'input' | 'list' | 'item' | 'thumbnail' | 'file' | 'fileName' | 'fileSize' | 'progress' | 'actions' | 'preview' | 'remove' | 'overlay' | 'overlayImage', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

## 数据展示

### Card 及卡片部件

`<Card title="团队" extra={<Link href="/team">查看</Link>} footer="3 位成员">…</Card>` 适合结构固定的卡片，actions 为底部等分操作列表。自定义结构按 Card → CardHeader（CardTitle、CardDescription）→ CardContent → CardFooter 排列。CardTitle 的 as 可选语义标题级别，loading 展示内置占位。

<!-- api:card -->

可导入 `Card`、`CardContent`、`CardDescription`、`CardFooter`、`CardHeader`、`CardTitle`。

[类型与导出入口](packages/ui/src/components/card/index.ts) · [交互说明](apps/docs/src/content/数据展示/card.md) · [可运行示例](apps/docs/src/examples/card)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Button, Card } from '@yuki-ui/react';

export default function BasicCard() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-5)', maxWidth: 420 }}>
      <Card title="项目概览">
        本周共合入 12 个变更，组件覆盖率提升至 87%。
      </Card>
      <Card
        title="待办事项"
        extra={<Button size="sm" variant="ghost">全部</Button>}
        actions={['查看', '编辑', '归档'].map((label) => (
          <span key={label}>{label}</span>
        ))}
      >
        还有 3 个页面等待视觉走查。
      </Card>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Card(props: CardProps & RefAttributes<HTMLDivElement>): ReactNode

CardContent(props: HTMLAttributes<HTMLDivElement> & { style?: StyleProperties | undefined; } & RefAttributes<HTMLDivElement>): ReactNode

CardDescription(props: HTMLAttributes<HTMLParagraphElement> & { style?: StyleProperties | undefined; } & RefAttributes<HTMLParagraphElement>): ReactNode

CardFooter(props: HTMLAttributes<HTMLDivElement> & { style?: StyleProperties | undefined; } & RefAttributes<HTMLDivElement>): ReactNode

CardHeader(props: HTMLAttributes<HTMLDivElement> & { style?: StyleProperties | undefined; } & RefAttributes<HTMLDivElement>): ReactNode

CardTitle(props: CardTitleProps & RefAttributes<HTMLHeadingElement>): ReactNode

type CardClassNames = Partial<Record<'root' | 'cover' | 'header' | 'title' | 'extra' | 'body' | 'footer' | 'actions' | 'action' | 'loading', string>>;

interface CardProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title'> {
    title?: ReactNode;
    extra?: ReactNode;
    cover?: ReactNode;
    footer?: ReactNode;
    actions?: ReactNode[];
    hoverable?: boolean;
    loading?: boolean;
    size?: Size;
    variant?: CardVariant;
    classNames?: CardClassNames;
    styles?: CardStyles;
}

type CardStyles = Partial<Record<'root' | 'cover' | 'header' | 'title' | 'extra' | 'body' | 'footer' | 'actions' | 'action' | 'loading', StyleProperties>>;

interface CardTitleProps extends WithStyle<HTMLAttributes<HTMLHeadingElement>> {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

type CardVariant = 'default' | 'elevated' | 'ghost';

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Avatar、AvatarGroup

`<Avatar src={photo} alt="林舟" fallback="林" status="online" />`。图片失败时用 fallback 或本地内容，statusLabel 可描述状态点。多成员用 `<AvatarGroup maxCount={4}>…</AvatarGroup>` 折叠超额头像，overlap 控制相邻头像覆盖的像素数。

<!-- api:avatar -->

可导入 `Avatar`、`AvatarGroup`。

[类型与导出入口](packages/ui/src/components/avatar/index.ts) · [交互说明](apps/docs/src/content/数据展示/avatar.md) · [可运行示例](apps/docs/src/examples/avatar)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Avatar, Icon } from '@yuki-ui/react';

export default function BasicAvatar() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 'var(--yuki-space-3)',
      }}
    >
      <Avatar src="https://i.pravatar.cc/80?img=12" alt="李明" />
      <Avatar>小明</Avatar>
      <Avatar icon={<Icon name="user" />} />
      <Avatar fallback="访客" />
      <Avatar
        size={48}
        shape="square"
        src="https://i.pravatar.cc/80?img=32"
        alt="设计团队"
      />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Avatar(props: AvatarProps & RefAttributes<HTMLSpanElement>): ReactNode

AvatarGroup(props: AvatarGroupProps & RefAttributes<HTMLDivElement>): ReactNode

type AvatarClassNames = Partial<Record<'root' | 'image' | 'fallback', string>>;

type AvatarGroupClassNames = Partial<Record<'root' | 'overflow', string>>;

interface AvatarGroupProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children'> {
    children?: ReactNode;
    maxCount?: number;
    overlap?: number;
    overflowSize?: AvatarSize;
    shape?: AvatarShape;
    overflowRender?: (restCount: number) => ReactNode;
    classNames?: AvatarGroupClassNames;
    styles?: AvatarGroupStyles;
}

type AvatarGroupStyles = Partial<Record<'root' | 'overflow', StyleProperties>>;

interface AvatarProps extends Omit<WithStyle<HTMLAttributes<HTMLSpanElement>>, 'children'> {
    src?: string;
    status?: 'online' | 'offline' | 'busy';
    statusLabel?: string;
    imageProps?: Omit<WithStyle<ImgHTMLAttributes<HTMLImageElement>>, 'src' | 'alt' | 'children'>;
    fallbackProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    statusProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    srcSet?: string;
    alt?: string;
    size?: AvatarSize;
    shape?: AvatarShape;
    icon?: ReactNode;
    fallback?: ReactNode;
    children?: ReactNode;
    onImageLoad?: WithStyle<ImgHTMLAttributes<HTMLImageElement>>['onLoad'];
    onImageError?: WithStyle<ImgHTMLAttributes<HTMLImageElement>>['onError'];
    imgProps?: Omit<WithStyle<ImgHTMLAttributes<HTMLImageElement>>, 'src' | 'srcSet' | 'alt' | 'onLoad' | 'onError'>;
    classNames?: AvatarClassNames;
    styles?: AvatarStyles;
}

type AvatarShape = 'circle' | 'square';

type AvatarSize = number | Size;

type AvatarStyles = Partial<Record<'root' | 'image' | 'fallback', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Badge

`<Badge count={unread} max={99}><Icon name="bell" /></Badge>` 给内容叠加数字。dot 为点状提示，showZero 让零可见；独立的业务状态用 `<Badge status="success" text="已发布" />`，保留状态文案供所有用户识别。

<!-- api:badge -->

可导入 `Badge`、`badgeStatuses`。

[类型与导出入口](packages/ui/src/components/badge/index.ts) · [交互说明](apps/docs/src/content/数据展示/badge.md) · [可运行示例](apps/docs/src/examples/badge)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Badge, Button } from '@yuki-ui/react';

export default function BasicBadge() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 'var(--yuki-space-6)',
      }}
    >
      <Badge count={5}>
        <Button variant="soft">收件箱</Button>
      </Badge>
      <Badge count={128} max={99}>
        <Button variant="soft">通知</Button>
      </Badge>
      <Badge dot>
        <Button variant="soft">消息</Button>
      </Badge>
      <Badge count={0} showZero>
        <Button variant="outline">待办</Button>
      </Badge>
      <Badge status="success" text="服务正常" />
      <Badge status="danger" text="5 条告警" />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Badge(props: BadgeProps & RefAttributes<HTMLSpanElement>): ReactNode

type BadgeClassNames = Partial<Record<'root' | 'indicator' | 'count' | 'dot' | 'text', string>>;

interface BadgeProps extends Omit<WithStyle<HTMLAttributes<HTMLSpanElement>>, 'content'> {
    count?: number;
    dot?: boolean;
    dotProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    status?: BadgeStatus;
    text?: ReactNode;
    max?: number;
    showZero?: boolean;
    color?: string;
    offset?: [
        number,
        number
    ];
    size?: Size;
    classNames?: BadgeClassNames;
    styles?: BadgeStyles;
}

type BadgeStatus = 'default' | 'processing' | 'success' | 'warning' | 'danger' | 'info';

type BadgeStyles = Partial<Record<'root' | 'indicator' | 'count' | 'dot' | 'text', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Tag

`<Tag tone="success">已完成</Tag>` 表示分类或状态。checkable 搭配 checked / onCheckedChange 用于筛选；onRemove 或 closable / onClose 用于移除，父级更新对应数组。removeLabel 给每个关闭按钮提供有区别的名称。

<!-- api:tag -->

可导入 `Tag`。

[类型与导出入口](packages/ui/src/components/tag/index.ts) · [交互说明](apps/docs/src/content/数据展示/tag.md) · [可运行示例](apps/docs/src/examples/tag)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Tag } from '@yuki-ui/react';

export default function BasicTag() {
  return (
    <div
      style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-2)' }}
    >
      <Tag>默认</Tag>
      <Tag tone="primary">主要</Tag>
      <Tag tone="success">已完成</Tag>
      <Tag tone="warning">待处理</Tag>
      <Tag tone="danger">已拒绝</Tag>
      <Tag tone="info">信息</Tag>
      <Tag variant="solid" tone="primary">
        实心
      </Tag>
      <Tag variant="outline" tone="success">
        描边
      </Tag>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Tag(props: TagProps & RefAttributes<HTMLSpanElement>): ReactNode

type TagClassNames = Partial<Record<'root' | 'icon' | 'content' | 'close', string>>;

interface TagProps extends Omit<WithStyle<HTMLAttributes<HTMLSpanElement>>, 'onChange'> {
    variant?: TagVariant;
    tone?: TagTone;
    size?: Size;
    shape?: TagShape;
    icon?: ReactNode;
    closable?: boolean;
    removeLabel?: string;
    onRemove?: () => void;
    onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
    closeIcon?: ReactNode;
    checkable?: boolean;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    classNames?: TagClassNames;
    styles?: TagStyles;
}

type TagShape = 'default' | 'round';

type TagStyles = Partial<Record<'root' | 'icon' | 'content' | 'close', StyleProperties>>;

type TagTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

type TagVariant = 'soft' | 'solid' | 'outline';

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Statistic

`<Statistic title="通过率" value={98.2} precision={1} suffix="%" />`。value 传已经换算到展示单位的数值。格式化用 formatter，装修已有文本用 valueRender；计数动画用 countUp、countDuration，加载态用 loading。

<!-- api:statistic -->

可导入 `Statistic`。

[类型与导出入口](packages/ui/src/components/statistic/index.ts) · [交互说明](apps/docs/src/content/数据展示/statistic.md) · [可运行示例](apps/docs/src/examples/statistic)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Statistic } from '@yuki-ui/react';

export default function BasicStatistic() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--yuki-space-8)',
      }}
    >
      <Statistic title="活跃用户" value={12480} />
      <Statistic title="转化率" value={0.1876} precision={2} suffix="%" />
      <Statistic title="营收" value={1289560} prefix="¥" precision={2} />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Statistic(props: StatisticProps & RefAttributes<HTMLDivElement>): ReactNode

type StatisticClassNames = Partial<Record<'root' | 'title' | 'content' | 'prefix' | 'value' | 'suffix' | 'loading', string>>;

interface StatisticProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title' | 'prefix'> {
    value: StatisticValue;
    title?: ReactNode;
    label?: ReactNode;
    prefix?: ReactNode;
    suffix?: ReactNode;
    precision?: number;
    groupSeparator?: string;
    decimalSeparator?: string;
    formatter?: (value: StatisticValue) => ReactNode;
    valueRender?: (formatted: ReactNode, value: StatisticValue) => ReactNode;
    countUp?: boolean;
    countDuration?: number;
    loading?: boolean;
    size?: Size;
    valueStyle?: StyleProperties;
    classNames?: StatisticClassNames;
    styles?: StatisticStyles;
}

type StatisticStyles = Partial<Record<'root' | 'title' | 'content' | 'prefix' | 'value' | 'suffix' | 'loading', StyleProperties>>;

type StatisticValue = number | string;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Descriptions

`<Descriptions title="项目详情" column={2} items={[{key:'owner',label:'负责人',children:'林舟'}]} />`。column 表示每行栏目数，条目 span 可跨栏。labelRender / contentRender 统一渲染字段标签和内容；只读业务信息可放于 Drawer 或 Card。

<!-- api:descriptions -->

可导入 `Descriptions`。

[类型与导出入口](packages/ui/src/components/descriptions/index.ts) · [交互说明](apps/docs/src/content/数据展示/descriptions.md) · [可运行示例](apps/docs/src/examples/descriptions)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Descriptions } from '@yuki-ui/react';

const items = [
  { key: 'name', label: '项目名称', children: 'Yuki UI' },
  { key: 'owner', label: '负责人', children: '李明' },
  { key: 'status', label: '状态', children: '开发中' },
  { key: 'version', label: '版本', children: '0.4.0' },
  { key: 'stack', label: '技术栈', children: 'React 18 + TypeScript' },
];

export default function BasicDescriptions() {
  return <Descriptions title="基本信息" items={items} column={3} />;
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Descriptions(props: DescriptionsProps & RefAttributes<HTMLDivElement>): ReactNode

interface DescriptionItem {
    key?: string | number;
    label?: ReactNode;
    children?: ReactNode;
    value?: ReactNode;
    span?: number;
    labelStyle?: StyleProperties;
    contentStyle?: StyleProperties;
    className?: string;
}

type DescriptionsClassNames = Partial<Record<'root' | 'header' | 'title' | 'extra' | 'table' | 'item' | 'label' | 'content', string>>;

type DescriptionsLayout = 'horizontal' | 'vertical';

interface DescriptionsProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title' | 'children'> {
    items?: DescriptionItem[];
    title?: ReactNode;
    extra?: ReactNode;
    column?: number;
    bordered?: boolean;
    layout?: DescriptionsLayout;
    colon?: boolean;
    size?: Size;
    labelRender?: (item: DescriptionItem, index: number) => ReactNode;
    contentRender?: (item: DescriptionItem, index: number) => ReactNode;
    classNames?: DescriptionsClassNames;
    styles?: DescriptionsStyles;
}

type DescriptionsStyles = Partial<Record<'root' | 'header' | 'title' | 'extra' | 'table' | 'item' | 'label' | 'content', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Timeline

`<Timeline items={[{key:'sent',label:'09:30',children:'提交申请',color:'success'}]} pending="审批中" />` 用于事件记录。mode 控制轴与内容位置，reverse 反转顺序，pendingDot 可标注尾部进度。分步编辑流程用 Steps 管当前步骤。

<!-- api:timeline -->

可导入 `Timeline`。

[类型与导出入口](packages/ui/src/components/timeline/index.ts) · [交互说明](apps/docs/src/content/数据展示/timeline.md) · [可运行示例](apps/docs/src/examples/timeline)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Timeline } from '@yuki-ui/react';

const items = [
  { key: '1', children: '提交需求评审', label: '09:20' },
  { key: '2', children: '完成交互稿', label: '11:05', color: 'primary' as const },
  { key: '3', children: '开发自测通过', label: '16:40', color: 'success' as const },
];

export default function BasicTimeline() {
  return <Timeline items={items} />;
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Timeline(props: TimelineProps & RefAttributes<HTMLUListElement>): ReactNode

type TimelineClassNames = Partial<Record<'root' | 'item' | 'rail' | 'dot' | 'line' | 'content' | 'label' | 'body' | 'pending', string>>;

type TimelineColor = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface TimelineItem {
    key?: string | number;
    color?: TimelineColor | (string & {});
    dot?: ReactNode;
    label?: ReactNode;
    children?: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    position?: 'left' | 'right';
    className?: string;
    style?: StyleProperties;
}

type TimelineMode = 'start' | 'alternate';

interface TimelineProps extends Omit<WithStyle<HTMLAttributes<HTMLUListElement>>, 'children'> {
    items?: TimelineItem[];
    mode?: TimelineMode;
    reverse?: boolean;
    pending?: ReactNode | boolean;
    pendingDot?: ReactNode;
    size?: Size;
    children?: ReactNode;
    classNames?: TimelineClassNames;
    styles?: TimelineStyles;
}

type TimelineStyles = Partial<Record<'root' | 'item' | 'rail' | 'dot' | 'line' | 'content' | 'label' | 'body' | 'pending', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### List

`<List items={records} rowKey="id" renderItem={row => row.name} empty={<Empty />} />`。省略 renderItem 时可显示常见标题、描述和补充信息。pagination 提供客户端切片，grid 提供多列，virtual={{height:320,itemSize:48}} 给定视口与固定行高；grid 和 virtual 选择一项。需要区分读取中与空结果时分别传 loading 和 empty，empty 可直接传节点或无参渲染函数。

<!-- api:list -->

可导入 `List`。

[类型与导出入口](packages/ui/src/components/list/index.ts) · [交互说明](apps/docs/src/content/数据展示/list.md) · [可运行示例](apps/docs/src/examples/list)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { List } from '@yuki-ui/react';

interface Member {
  id: number;
  name: string;
  description: string;
  extra: string;
}

const data: Member[] = [
  { id: 1, name: '林舟', description: '前端工程师 · 杭州', extra: '在线' },
  { id: 2, name: '沈星', description: '设计师 · 上海', extra: '忙碌' },
  { id: 3, name: '陈默', description: '产品经理 · 深圳', extra: '离线' },
  { id: 4, name: '苏晚', description: '数据分析师 · 北京', extra: '在线' },
];

export default function BasicList() {
  return (
    <List
      items={data}
      rowKey="id"
      header={<span>项目成员</span>}
      footer={<span>共 {data.length} 位成员</span>}
      bordered
    />
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
List<T>(props: ListProps<T> & { ref?: Ref<HTMLDivElement>; }): ReactElement

type ListClassNames = Partial<Record<'root' | 'header' | 'body' | 'item' | 'avatar' | 'itemMain' | 'itemTitle' | 'itemDescription' | 'itemMeta' | 'itemExtra' | 'itemAction' | 'footer' | 'empty' | 'loading' | 'spinner' | 'pagination', string>>;

interface ListGridConfig {
    columns?: number;
    gutter?: number;
}

type ListItemLayout = 'horizontal' | 'vertical';

type ListKey = string | number;

type ListPaginationConfig = Pick<PaginationProps, 'page' | 'defaultPage' | 'pageSize' | 'defaultPageSize' | 'total' | 'onChange' | 'showSizeChanger' | 'showTotal' | 'simple' | 'pageSizeOptions'>;

interface ListProps<T> extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children' | 'onChange'> {
    items?: readonly T[];
    renderItem?: (item: T, index: number) => ReactNode;
    rowKey?: keyof T | ((item: T, index: number) => ListKey);
    header?: ReactNode;
    footer?: ReactNode;
    bordered?: boolean;
    split?: boolean;
    itemLayout?: ListItemLayout;
    grid?: number | ListGridConfig;
    pagination?: false | ListPaginationConfig;
    loading?: boolean;
    empty?: ReactNode | (() => ReactNode);
    size?: Size;
    virtual?: {
        height: number;
        itemSize?: number;
        overscan?: number;
    };
    classNames?: ListClassNames;
    styles?: ListStyles;
}

type ListStyles = Partial<Record<'root' | 'header' | 'body' | 'item' | 'avatar' | 'itemMain' | 'itemTitle' | 'itemDescription' | 'itemMeta' | 'itemExtra' | 'itemAction' | 'footer' | 'empty' | 'loading' | 'spinner' | 'pagination', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Table 及表格部件

数据模式传 columns、data 和 rowKey。列的 dataIndex 可写嵌套路径，`render: ({value,row}) => …` 返回单元格内容。列 sorter 接收两行记录；sortState 使用 {columnKey, order:'ascend'|'descend'} 或 null；筛选的 filterState 按列 key 保存选值数组。rowSelection 使用 selectedRowKeys / onChange，expandable 提供 expandedRowRender。表头全选作用于当前页可选行。虚拟滚动用 virtual、scroll.y、rowHeight；需展开不定高内容时使用普通分页。pagination.serverSide 控制切片，表头的排序和筛选逻辑仍针对传入的数据。

组合模式下省略 columns，直接传 TableCaption、TableHeader / TableBody → TableRow → TableHead / TableCell，可透传 colSpan、rowSpan 等原生属性。`<TableHead sortable sortDirection={direction} onSortChange={setDirection}>大小</TableHead>` 的方向是 'asc' / 'desc' / null，此模式下行排序由调用方实现。

<!-- api:table -->

可导入 `Table`、`TableBody`、`TableCaption`、`TableCell`、`TableHead`、`TableHeader`、`TableRow`。

[类型与导出入口](packages/ui/src/components/table/index.ts) · [交互说明](apps/docs/src/content/数据展示/table.md) · [可运行示例](apps/docs/src/examples/table)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Table } from '@yuki-ui/react';

interface Member {
  id: number;
  name: string;
  role: string;
  age: number;
  city: string;
}

const data: Member[] = [
  { id: 1, name: '林舟', role: '前端工程师', age: 27, city: '杭州' },
  { id: 2, name: '沈星', role: '设计师', age: 31, city: '上海' },
  { id: 3, name: '陈默', role: '产品经理', age: 29, city: '深圳' },
  { id: 4, name: '苏晚', role: '数据分析师', age: 26, city: '北京' },
  { id: 5, name: '顾言', role: '后端工程师', age: 34, city: '成都' },
];

export default function BasicTable() {
  return (
    <Table<Member>
      rowKey="id"
      columns={[
        { key: 'name', title: '姓名', dataIndex: 'name' },
        { key: 'role', title: '角色', dataIndex: 'role' },
        { key: 'age', title: '年龄', dataIndex: 'age', width: 96, align: 'right' },
        { key: 'city', title: '城市', dataIndex: 'city', width: 120 },
      ]}
      data={data}
      bordered
    />
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Table<T>(props: TableProps<T> & { ref?: Ref<HTMLDivElement>; }): ReactElement

Table(props: CompoundTableProps & { ref?: Ref<HTMLTableElement>; }): ReactElement

TableBody(props: WithStyle<HTMLAttributes<HTMLTableSectionElement>>): JSX.Element

TableCaption(props: WithStyle<HTMLAttributes<HTMLTableCaptionElement>>): JSX.Element

TableCell(props: WithStyle<TdHTMLAttributes<HTMLTableCellElement>>): JSX.Element

TableHead(props: TableHeadProps & RefAttributes<HTMLTableCellElement>): ReactNode

TableHeader(props: WithStyle<HTMLAttributes<HTMLTableSectionElement>>): JSX.Element

TableRow(props: WithStyle<HTMLAttributes<HTMLTableRowElement>>): JSX.Element

interface CompoundTableProps extends WithStyle<TableHTMLAttributes<HTMLTableElement>> {
    containerProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    size?: 'sm' | 'md' | 'lg';
    striped?: boolean;
    hoverable?: boolean;
    bordered?: boolean;
}

type TableAlign = 'left' | 'center' | 'right';

interface TableCellContext<T> {
    row: T;
    rowIndex: number;
    column: TableColumn<T>;
    columnKey: string;
    value: unknown;
}

type TableClassNames = Partial<Record<'root' | 'content' | 'container' | 'table' | 'header' | 'headerRow' | 'headerCell' | 'headerInner' | 'sortTrigger' | 'sortIcon' | 'filterTrigger' | 'filterIcon' | 'filterPanel' | 'filterOption' | 'filterCheck' | 'filterFooter' | 'filterReset' | 'body' | 'row' | 'rowExpanded' | 'cell' | 'cellEllipsis' | 'selectionCell' | 'selectionHeaderCell' | 'selectionCheckbox' | 'selectionRadio' | 'expandCell' | 'expandHeaderCell' | 'expandButton' | 'expandIcon' | 'expandedRow' | 'expandedCell' | 'expandedContent' | 'footer' | 'pagination' | 'empty' | 'loading' | 'spinner', string>>;

interface TableColumn<T> {
    key?: string;
    title?: ReactNode;
    dataIndex?: keyof T | string | readonly (string | number)[];
    width?: number | string;
    minWidth?: number | string;
    align?: TableAlign;
    fixed?: 'left' | 'right';
    sortable?: boolean;
    sorter?: (a: T, b: T) => number;
    defaultSortOrder?: TableSortOrder;
    sortDirections?: readonly TableSortOrder[];
    filters?: readonly TableFilterOption[];
    filterMultiple?: boolean;
    onFilter?: (value: TableFilterValue, row: T) => boolean;
    render?: (context: TableCellContext<T>) => ReactNode;
    ellipsis?: boolean;
    className?: string;
}

interface TableExpandIconContext<T> {
    expanded: boolean;
    row: T;
    rowIndex: number;
    toggle: () => void;
}

interface TableExpandable<T> {
    expandedRowKeys?: readonly TableKey[];
    defaultExpandedRowKeys?: readonly TableKey[];
    onExpandedRowsChange?: (expandedRowKeys: TableKey[]) => void;
    expandedRowRender: (row: T, rowIndex: number) => ReactNode;
    rowExpandable?: (row: T) => boolean;
    expandIcon?: (context: TableExpandIconContext<T>) => ReactNode;
    columnWidth?: number | string;
    fixed?: boolean;
    expandedRowClassName?: string;
}

interface TableFilterOption {
    label: ReactNode;
    value: TableFilterValue;
}

interface TableFilterState {
    [columnKey: string]: TableFilterValue[];
}

type TableFilterValue = string | number | boolean;

interface TableHeadProps extends WithStyle<ThHTMLAttributes<HTMLTableCellElement>> {
    sortable?: boolean;
    sortDirection?: TableSortDirection;
    onSortChange?: (next: TableSortDirection, event: MouseEvent<HTMLButtonElement>) => void;
    sortLabel?: string;
    sortButtonProps?: Omit<WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>, 'type'>;
    sortIcon?: ReactNode;
}

type TableKey = string | number;

interface TablePaginationConfig extends Pick<PaginationProps, 'page' | 'defaultPage' | 'pageSize' | 'defaultPageSize' | 'total' | 'onChange' | 'showSizeChanger' | 'showTotal' | 'simple' | 'pageSizeOptions'> {
    serverSide?: boolean;
}

interface TableProps<T> extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children' | 'onChange'> {
    columns: readonly TableColumn<T>[];
    data?: readonly T[];
    rowKey?: keyof T | ((row: T, index: number) => TableKey);
    size?: Size;
    bordered?: boolean;
    striped?: boolean;
    hover?: boolean;
    scroll?: {
        x?: number | string;
        y?: number | string;
    };
    stickyHeader?: boolean;
    virtual?: boolean;
    rowHeight?: number;
    pagination?: false | TablePaginationConfig;
    loading?: boolean;
    empty?: ReactNode | (() => ReactNode);
    footerRender?: (data: readonly T[]) => ReactNode;
    renderCell?: (context: TableCellContext<T>) => ReactNode;
    rowClassName?: string | ((row: T, index: number) => string);
    onRow?: (row: T, index: number) => WithStyle<HTMLAttributes<HTMLTableRowElement>>;
    rowSelection?: TableRowSelection<T>;
    expandable?: TableExpandable<T>;
    sortState?: TableSortState | null;
    defaultSortState?: TableSortState | null;
    onSortChange?: (state: TableSortState | null) => void;
    filterState?: TableFilterState;
    defaultFilterState?: TableFilterState;
    onFilterChange?: (state: TableFilterState, changedColumnKey: string) => void;
    classNames?: TableClassNames;
    styles?: TableStyles;
}

interface TableRowSelection<T> {
    type?: 'checkbox' | 'radio';
    selectedRowKeys?: readonly TableKey[];
    defaultSelectedRowKeys?: readonly TableKey[];
    onChange?: (selectedRowKeys: TableKey[], selectedRows: T[]) => void;
    getCheckboxProps?: (row: T, index: number) => {
        disabled?: boolean;
        name?: string;
        'aria-label'?: string;
    };
    columnWidth?: number | string;
    fixed?: boolean;
    hideSelectAll?: boolean;
    renderCell?: (context: TableSelectionCellContext<T>) => ReactNode;
}

interface TableSelectionCellContext<T> {
    row: T;
    rowIndex: number;
    selected: boolean;
    control: ReactNode;
}

type TableSortDirection = 'asc' | 'desc' | null;

type TableSortOrder = 'ascend' | 'descend';

interface TableSortState {
    columnKey: string;
    order: TableSortOrder;
}

type TableStyles = Partial<Record<'root' | 'content' | 'container' | 'table' | 'header' | 'headerRow' | 'headerCell' | 'headerInner' | 'sortTrigger' | 'sortIcon' | 'filterTrigger' | 'filterIcon' | 'filterPanel' | 'filterOption' | 'filterCheck' | 'filterFooter' | 'filterReset' | 'body' | 'row' | 'rowExpanded' | 'cell' | 'cellEllipsis' | 'selectionCell' | 'selectionHeaderCell' | 'selectionCheckbox' | 'selectionRadio' | 'expandCell' | 'expandHeaderCell' | 'expandButton' | 'expandIcon' | 'expandedRow' | 'expandedCell' | 'expandedContent' | 'footer' | 'pagination' | 'empty' | 'loading' | 'spinner', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Tree

高级数据用 `<Tree treeData={nodes} checkable />`，节点为 {key,title,children?} 或由 fieldNames 映射业务字段。展开、选中、勾选是各自的键数组，分别对应 onExpand、onSelect、onCheck；checkStrictly 让父子独立。virtual 配视口高度及行高，大量节点下 renderTitle 保持同高。轻量单选目录可用 `<Tree options={options} defaultValue="doc" onValueChange={selectDoc} />`，以 {value:string,label,children?} 表示树并选择叶子。

<!-- api:tree -->

可导入 `Tree`。

[类型与导出入口](packages/ui/src/components/tree/index.ts) · [交互说明](apps/docs/src/content/数据展示/tree.md) · [可运行示例](apps/docs/src/examples/tree)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Tree } from '@yuki-ui/react';

interface Dept {
  key: string;
  title: string;
  children?: Dept[];
}

const treeData: Dept[] = [
  {
    key: 'design',
    title: '设计中心',
    children: [
      { key: 'design-ui', title: 'UI 设计' },
      { key: 'design-ux', title: '交互设计' },
      {
        key: 'design-brand',
        title: '品牌设计',
        children: [
          { key: 'design-brand-vi', title: '视觉识别' },
          { key: 'design-brand-motion', title: '动效规范' },
        ],
      },
    ],
  },
  {
    key: 'engineering',
    title: '研发中心',
    children: [
      {
        key: 'engineering-web',
        title: '前端团队',
        children: [
          { key: 'engineering-web-core', title: '基础架构' },
          { key: 'engineering-web-business', title: '业务开发' },
        ],
      },
      { key: 'engineering-server', title: '服务端团队' },
    ],
  },
  {
    key: 'product',
    title: '产品中心',
    children: [
      { key: 'product-growth', title: '增长产品' },
      { key: 'product-platform', title: '平台产品' },
    ],
  },
];

export default function BasicTree() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['engineering-web-core']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <Tree
        treeData={treeData}
        defaultExpandAll
        selectedKeys={selectedKeys}
        onSelect={(keys) => setSelectedKeys(keys as string[])}
      />
      <span style={{ fontSize: 'var(--yuki-font-size-sm)', color: 'var(--yuki-color-text-secondary)' }}>
        当前选中：{selectedKeys.length > 0 ? selectedKeys.join('、') : '无'}
      </span>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Tree<T extends object = TreeNodeData>(props: TreeProps<T> & { ref?: Ref<HTMLDivElement>; }): ReactElement

Tree(props: TreeOptionsProps & { ref?: Ref<HTMLDivElement>; }): ReactElement

interface TreeCheckInfo<T> {
    node: T;
    checked: boolean;
    checkedNodes: T[];
}

type TreeClassNames = Partial<Record<'root' | 'viewport' | 'list' | 'virtualContent' | 'item' | 'switcher' | 'switcherIcon' | 'checkbox' | 'title' | 'titleText' | 'empty' | 'loading' | 'spinner', string>>;

interface TreeExpandInfo<T> {
    node: T;
    expanded: boolean;
}

interface TreeFieldNames<T> {
    key?: keyof T & string;
    title?: keyof T & string;
    children?: keyof T & string;
    disabled?: keyof T & string;
    disableCheckbox?: keyof T & string;
    isLeaf?: keyof T & string;
}

type TreeKey = string | number;

interface TreeNodeData {
    key: TreeKey;
    title?: ReactNode;
    children?: readonly TreeNodeData[];
    disabled?: boolean;
    disableCheckbox?: boolean;
    isLeaf?: boolean;
}

interface TreeOption {
    value: string;
    label: ReactNode;
    disabled?: boolean;
    children?: readonly TreeOption[];
}

interface TreeOptionsProps extends Omit<TreeProps<TreeOption>, 'treeData' | 'fieldNames' | 'multiple' | 'checkable' | 'checkStrictly' | 'checkedKeys' | 'defaultCheckedKeys' | 'onCheck' | 'selectedKeys' | 'defaultSelectedKeys' | 'onSelect'> {
    options: readonly TreeOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}

interface TreeProps<T extends object = TreeNodeData> extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'children' | 'onSelect'> {
    treeData: readonly T[];
    fieldNames?: TreeFieldNames<T>;
    size?: Size;
    disabled?: boolean;
    checkable?: boolean;
    checkStrictly?: boolean;
    selectable?: boolean;
    multiple?: boolean;
    expandedKeys?: readonly TreeKey[];
    defaultExpandedKeys?: readonly TreeKey[];
    defaultExpandAll?: boolean;
    onExpand?: (expandedKeys: TreeKey[], info: TreeExpandInfo<T>) => void;
    checkedKeys?: readonly TreeKey[];
    defaultCheckedKeys?: readonly TreeKey[];
    onCheck?: (checkedKeys: TreeKey[], info: TreeCheckInfo<T>) => void;
    selectedKeys?: readonly TreeKey[];
    defaultSelectedKeys?: readonly TreeKey[];
    onSelect?: (selectedKeys: TreeKey[], info: TreeSelectInfo<T>) => void;
    renderTitle?: (node: T, info: TreeTitleInfo) => ReactNode;
    switcherIcon?: ReactNode;
    virtual?: TreeVirtualConfig;
    loading?: boolean;
    emptyRender?: () => ReactNode;
    classNames?: TreeClassNames;
    styles?: TreeStyles;
}

interface TreeSelectInfo<T> {
    node: T;
    selected: boolean;
    selectedNodes: T[];
}

type TreeStyles = Partial<Record<'root' | 'viewport' | 'list' | 'virtualContent' | 'item' | 'switcher' | 'switcherIcon' | 'checkbox' | 'title' | 'titleText' | 'empty' | 'loading' | 'spinner', StyleProperties>>;

interface TreeTitleInfo {
    key: TreeKey;
    depth: number;
    expanded: boolean;
    selected: boolean;
    checked: boolean;
    indeterminate: boolean;
}

interface TreeVirtualConfig {
    height: number;
    itemSize?: number;
    overscan?: number;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Accordion 及折叠面板部件

`<Accordion items={[{value:'access',title:'访问权限',content:<Input label="备注" />}]} defaultValue={['access']} />` 是数据写法，面板收起后保留子项状态，bordered、ghost、expandIconPosition 改数据面板的呈现。单开写 type="single"，value / onValueChange 使用字符串，collapsible 允许关闭当前项并回到空串。默认 type="multiple" 接受字符串数组。

手写嵌套时用 Accordion → AccordionItem(value) → AccordionTrigger + AccordionContent。trigger 可设 indicator；内容中的表单需要保留挂载时设 forceMount。组合动效由 animation 配置。

<!-- api:accordion -->

可导入 `Accordion`、`AccordionContent`、`AccordionItem`、`AccordionTrigger`。

[类型与导出入口](packages/ui/src/components/accordion/index.ts) · [交互说明](apps/docs/src/content/数据展示/accordion.md) · [可运行示例](apps/docs/src/examples/accordion)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@yuki-ui/react';

export default function ProjectAccess() {
  return (
    <Accordion type="multiple" defaultValue={['viewer']}>
      <AccordionItem value="viewer">
        <AccordionTrigger>查看者</AccordionTrigger>
        <AccordionContent>可以查看项目文件和发布记录。</AccordionContent>
      </AccordionItem>
      <AccordionItem value="editor">
        <AccordionTrigger>编辑者</AccordionTrigger>
        <AccordionContent>可以更新文件、邀请成员和创建发布版本。</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Accordion(props: AccordionProps & RefAttributes<HTMLDivElement>): ReactNode

AccordionContent(props: AccordionContentProps & RefAttributes<HTMLDivElement>): ReactNode

AccordionItem(props: Omit<Primitive.AccordionItemProps & RefAttributes<HTMLDivElement>, "ref"> & { style?: StyleProperties | undefined; } & RefAttributes<HTMLDivElement>): ReactNode

AccordionTrigger(props: AccordionTriggerProps & RefAttributes<HTMLButtonElement>): ReactNode

type AccordionClassNames = Partial<Record<'root' | 'item' | 'header' | 'title' | 'extra' | 'expandIcon' | 'panel' | 'panelInner' | 'content', string>>;

interface AccordionContentProps extends WithStyle<ComponentPropsWithoutRef<typeof Primitive.Content>> {
    bodyProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    animation?: AnimationOptions | false;
}

interface AccordionPanel {
    value: string;
    title: ReactNode;
    content?: ReactNode;
    extra?: ReactNode;
    disabled?: boolean;
    showArrow?: boolean;
    className?: string;
    style?: StyleProperties;
}

type AccordionProps = RootProps & ((PanelOptions & {
    children?: never;
    asChild?: never;
    animation?: never;
}) | {
    items?: never;
    animation?: AnimationOptions | false;
});

type AccordionStyles = Partial<Record<'root' | 'item' | 'header' | 'title' | 'extra' | 'expandIcon' | 'panel' | 'panelInner' | 'content', StyleProperties>>;

interface AccordionTriggerProps extends WithStyle<ComponentPropsWithoutRef<typeof Primitive.Trigger>> {
    headerProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Header>>;
    indicator?: ReactNode;
    indicatorProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};

type RootProps = MultipleProps | Extract<PrimitiveProps, {
    type: 'single';
}>;

type MultipleProps = Omit<Extract<PrimitiveProps, {
    type: 'multiple';
}>, 'type'> & {
    type?: 'multiple';
};

type PrimitiveProps = WithStyle<ComponentPropsWithoutRef<typeof Primitive.Root>>;

interface PanelOptions {
    items: readonly AccordionPanel[];
    bordered?: boolean;
    ghost?: boolean;
    expandIconPosition?: 'start' | 'end';
    expandIcon?: ReactNode | ((item: AccordionPanel, open: boolean) => ReactNode);
    size?: Size;
    classNames?: AccordionClassNames;
    styles?: AccordionStyles;
}
```

</details>

<!-- /api -->

### Tabs、TabsList、TabsTrigger、TabsContent

固定栏目传 `items={[{key:'summary',label:'概览',children:<Summary />}]}`。两种模式均用 `value` / `onChange(value)` 同步路由或页面状态，用 `defaultValue` 设置非受控初值。数据模式会在条目到达或选中项失效时选择首个可用项。若已传入受控值，值缺失时没有面板，值对应禁用项时保留该面板，键盘仍能进入首个可用标签。数据变化不会触发切换回调。

自定义结构用 `<Tabs defaultValue="a"><TabsList aria-label="详情"><TabsTrigger value="a">摘要</TabsTrigger></TabsList><TabsContent value="a">…</TabsContent></Tabs>`。配对触发器和内容的 value。`activationMode="manual"` 让方向键移动焦点、Enter 或空格切换面板。`<TabsContent forceMount>` 保留隐藏面板中的输入草稿。后台媒体显式传 active 管理播放。

<!-- api:tabs -->

可导入 `Tabs`、`TabsContent`、`TabsList`、`TabsTrigger`。

[类型与导出入口](packages/ui/src/components/tabs/index.ts) · [交互说明](apps/docs/src/content/数据展示/tabs.md) · [可运行示例](apps/docs/src/examples/tabs)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Tabs } from '@yuki-ui/react';

const items = [
  { key: 'overview', label: '概览', children: '项目当前处于开发阶段，核心组件已完成 15 个。' },
  { key: 'activity', label: '动态', children: '最近 24 小时共有 3 次提交。' },
  { key: 'members', label: '成员', children: '设计 2 人、前端 3 人、测试 1 人。' },
];

export default function BasicTabs() {
  return <Tabs items={items} defaultValue="overview" />;
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Tabs(props: TabsProps & RefAttributes<HTMLDivElement>): ReactNode

TabsContent(props: TabsContentProps & RefAttributes<HTMLDivElement>): ReactNode

TabsList(props: Omit<Primitive.TabsListProps & RefAttributes<HTMLDivElement>, "ref"> & { style?: StyleProperties | undefined; } & RefAttributes<HTMLDivElement>): ReactNode

TabsTrigger(props: Omit<Primitive.TabsTriggerProps & RefAttributes<HTMLButtonElement>, "ref"> & { style?: StyleProperties | undefined; } & RefAttributes<HTMLButtonElement>): ReactNode

interface TabItem {
    key: string;
    label: ReactNode;
    children?: ReactNode;
    icon?: ReactNode;
    disabled?: boolean;
    className?: string;
    style?: StyleProperties;
}

type TabsClassNames = Partial<Record<'root' | 'nav' | 'tablist' | 'tab' | 'label' | 'icon' | 'extra' | 'content' | 'panel', string>>;

interface TabsContentProps extends WithStyle<ComponentPropsWithoutRef<typeof Primitive.Content>> {
    animation?: AnimationOptions | false;
}

type TabsPosition = 'top' | 'bottom' | 'left' | 'right';

interface TabsProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue'> {
    items?: readonly TabItem[];
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    activationMode?: 'automatic' | 'manual';
    orientation?: 'horizontal' | 'vertical';
    animation?: AnimationOptions | false;
    variant?: TabsVariant;
    tabPosition?: TabsPosition;
    size?: Size;
    centered?: boolean;
    hideContent?: boolean;
    tabBarExtraContent?: ReactNode;
    classNames?: TabsClassNames;
    styles?: TabsStyles;
}

type TabsStyles = Partial<Record<'root' | 'nav' | 'tablist' | 'tab' | 'label' | 'icon' | 'extra' | 'content' | 'panel', StyleProperties>>;

type TabsVariant = 'line' | 'card' | 'segmented';

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Carousel

`<Carousel ariaLabel="项目相册" items={images.map(item => <ImageViewer key={item.id} src={item.url} alt={item.alt} />)} />`。索引从 0 开始，受控使用 activeIndex / onChange；autoplayInterval 单位为毫秒。effect、vertical、arrows、dots、swipe 控制切换与导航，持续播放的内容使用 pauseOnHover 并让用户能切换。

<!-- api:carousel -->

可导入 `Carousel`。

[类型与导出入口](packages/ui/src/components/carousel/index.ts) · [交互说明](apps/docs/src/content/数据展示/carousel.md) · [可运行示例](apps/docs/src/examples/carousel)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Carousel } from '@yuki-ui/react';

const colors = [
  'var(--yuki-color-primary-subtle)',
  'var(--yuki-color-bg-muted)',
  'var(--yuki-color-bg-subtle)',
];

const slideStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 180,
  color: 'var(--yuki-color-text-secondary)',
  fontSize: 'var(--yuki-font-size-lg)',
};

export default function BasicCarousel() {
  return (
    <Carousel>
      {colors.map((background, index) => (
        <div key={background} style={{ ...slideStyle, background }}>
          第 {index + 1} 张
        </div>
      ))}
    </Carousel>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Carousel(props: CarouselProps & RefAttributes<HTMLDivElement>): ReactNode

type CarouselClassNames = Partial<Record<'root' | 'viewport' | 'track' | 'slide' | 'arrow' | 'dots' | 'dot', string>>;

type CarouselEffect = 'slide' | 'fade';

interface CarouselProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'children'> {
    items?: ReactNode[];
    children?: ReactNode;
    activeIndex?: number;
    defaultActiveIndex?: number;
    onChange?: (activeIndex: number) => void;
    autoplay?: boolean;
    autoplayInterval?: number;
    pauseOnHover?: boolean;
    loop?: boolean;
    dots?: boolean;
    arrows?: boolean;
    swipe?: boolean;
    effect?: CarouselEffect;
    vertical?: boolean;
    size?: Size;
    ariaLabel?: string;
    classNames?: CarouselClassNames;
    styles?: CarouselStyles;
}

type CarouselStyles = Partial<Record<'root' | 'viewport' | 'track' | 'slide' | 'arrow' | 'dots' | 'dot', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Calendar

`<Calendar value={day} onSelect={setDay} month={month} onMonthChange={setMonth} />`。选中日期与当前浏览月份分别管理。weekStart 指定每周首日，min / max 支持 Date 或本地 YYYY-MM-DD。cellRender 在日格内显示日程，headerRender 决定标题和月导航。作为小型表单输入时 DatePicker 提供触发器和收起的弹层。

<!-- api:calendar -->

可导入 `Calendar`。

[类型与导出入口](packages/ui/src/components/calendar/index.ts) · [交互说明](apps/docs/src/content/数据展示/calendar.md) · [可运行示例](apps/docs/src/examples/calendar)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Calendar } from '@yuki-ui/react';

export default function BasicCalendar() {
  return <Calendar defaultValue={new Date(2024, 10, 14)} />;
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Calendar(props: CalendarProps & RefAttributes<HTMLDivElement>): ReactNode

interface CalendarCellInfo {
    date: Date;
    inCurrentMonth: boolean;
    selected: boolean;
    today: boolean;
    disabled: boolean;
}

type CalendarClassNames = Partial<Record<'root' | 'header' | 'title' | 'nav' | 'prev' | 'next' | 'weekdays' | 'weekday' | 'grid' | 'row' | 'cell' | 'button', string>>;

interface CalendarHeaderInfo {
    month: Date;
    title: ReactNode;
    prev: () => void;
    next: () => void;
}

type CalendarHeaderRender = (info: CalendarHeaderInfo) => ReactNode;

interface CalendarProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'onSelect' | 'defaultValue' | 'value'> {
    value?: Date | null;
    defaultValue?: Date | null;
    onSelect?: (date: Date) => void;
    month?: Date;
    defaultMonth?: Date;
    onMonthChange?: (month: Date) => void;
    weekStart?: number;
    min?: Date | string;
    max?: Date | string;
    disabledDate?: (date: Date) => boolean;
    cellRender?: (date: Date, info: CalendarCellInfo) => ReactNode;
    headerRender?: CalendarHeaderRender;
    size?: Size;
    bordered?: boolean;
    classNames?: CalendarClassNames;
    styles?: CalendarStyles;
}

type CalendarStyles = Partial<Record<'root' | 'header' | 'title' | 'nav' | 'prev' | 'next' | 'weekdays' | 'weekday' | 'grid' | 'row' | 'cell' | 'button', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Image

`<Image src={photo} alt="湖面倒影" width={240} height={150} preview />`。支持 URL 和 Blob，fit 默认 cover，placeholder 用于加载中，fallback 用于错误；通过 preview 对象控制灯箱的可见性及操作，mask 控制悬停提示。需要原生 img 属性时使用 imgProps。

<!-- api:image -->

可导入 `Image`。

[类型与导出入口](packages/ui/src/components/image/index.ts) · [交互说明](apps/docs/src/content/数据展示/image.md) · [可运行示例](apps/docs/src/examples/image)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import lake from '../../assets/alpine-lake.jpg';
import { Image } from '@yuki-ui/react';

export default function BasicImage() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-4)' }}>
      <Image src={lake} alt="山间湖泊" width={240} height={150} />
      <Image src="./samples/yuki-motion.png" alt="动效封面" width={240} height={150} preview />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Image(props: ImageProps & RefAttributes<HTMLSpanElement>): ReactNode

type ImageClassNames = Partial<Record<'root' | 'img' | 'mask' | 'fallback' | 'placeholder' | 'preview' | 'previewClose' | 'previewImage', string>>;

type ImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

interface ImagePreviewConfig {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    src?: MediaSource;
    closable?: boolean;
    maskClosable?: boolean;
    closeIcon?: ReactNode;
}

interface ImageProps extends Omit<WithStyle<HTMLAttributes<HTMLSpanElement>>, 'onLoad' | 'onError'> {
    src: MediaSource;
    alt?: string;
    width?: number | string;
    height?: number | string;
    fit?: ImageFit;
    fallback?: ReactNode;
    placeholder?: ReactNode;
    preview?: boolean | ImagePreviewConfig;
    mask?: ReactNode | false;
    size?: Size;
    imgProps?: Omit<WithStyle<ImgHTMLAttributes<HTMLImageElement>>, 'src' | 'alt' | 'width' | 'height'>;
    onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
    onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
    classNames?: ImageClassNames;
    styles?: ImageStyles;
}

type ImageStatus = 'loading' | 'loaded' | 'error';

type ImageStyles = Partial<Record<'root' | 'img' | 'mask' | 'fallback' | 'placeholder' | 'preview' | 'previewClose' | 'previewImage', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### QRCode

`<QRCode value={shareUrl} level="M" size={160} />`，value 传要编码的完整文本。level 提升纠错同时减少可编码容量；marginSize 按模块数留出静区。临时二维码过期时设 status="expired"，onRefresh 更新实际 value；二维码旁可并列可复制的链接。

<!-- api:qr-code -->

可导入 `QRCode`。

[类型与导出入口](packages/ui/src/components/qr-code/index.ts) · [交互说明](apps/docs/src/content/数据展示/qr-code.md) · [可运行示例](apps/docs/src/examples/qr-code)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { QRCode } from '@yuki-ui/react';

export default function BasicQRCode() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-6)' }}>
      <QRCode value="https://yuki-ui.dev" />
      <QRCode value="https://yuki-ui.dev" size={120} level="H" bordered />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
QRCode(props: QRCodeProps & RefAttributes<HTMLDivElement>): ReactNode

type QRCodeClassNames = Partial<Record<'root' | 'canvas' | 'logo' | 'status' | 'refresh', string>>;

type QRCodeErrorLevel = 'L' | 'M' | 'Q' | 'H';

interface QRCodeProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'color' | 'children'> {
    value: string;
    size?: number;
    level?: QRCodeErrorLevel;
    color?: string;
    bgColor?: string;
    bordered?: boolean;
    status?: QRCodeStatus;
    statusRender?: (status: 'loading' | 'expired') => ReactNode;
    onRefresh?: () => void;
    icon?: ReactNode;
    ariaLabel?: string;
    label?: string;
    marginSize?: number;
    classNames?: QRCodeClassNames;
    styles?: QRCodeStyles;
}

type QRCodeStatus = 'active' | 'loading' | 'expired';

type QRCodeStyles = Partial<Record<'root' | 'canvas' | 'logo' | 'status' | 'refresh', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Skeleton

`<Skeleton loading={loading} avatar paragraph={{rows:2}}><Card>…</Card></Skeleton>`。loading=false 时显示子内容。整块占位可传 width、height、circle；active 控制呼吸效果。根据真实内容稳定设置占位尺寸。

<!-- api:skeleton -->

可导入 `Skeleton`。

[类型与导出入口](packages/ui/src/components/skeleton/index.ts) · [交互说明](apps/docs/src/content/数据展示/skeleton.md) · [可运行示例](apps/docs/src/examples/skeleton)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Skeleton } from '@yuki-ui/react';

export default function BasicSkeleton() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)', maxWidth: 360 }}>
      <Skeleton />
      <Skeleton avatar title={false} paragraph={{ rows: 2 }} />
      <Skeleton active={false} paragraph={{ rows: 3 }} />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Skeleton(props: SkeletonProps & RefAttributes<HTMLDivElement>): ReactNode

interface SkeletonAvatarProps {
    size?: number | Size;
    shape?: SkeletonAvatarShape;
}

type SkeletonAvatarShape = 'circle' | 'square';

type SkeletonClassNames = Partial<Record<'root' | 'avatar' | 'content' | 'title' | 'paragraph' | 'row', string>>;

interface SkeletonParagraphProps {
    rows?: number;
    width?: number | string | Array<number | string>;
}

interface SkeletonProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title'> {
    loading?: boolean;
    width?: CSSProperties['width'];
    height?: CSSProperties['height'];
    circle?: boolean;
    animation?: AnimationOptions | false;
    active?: boolean;
    avatar?: boolean | SkeletonAvatarProps;
    title?: boolean | string | SkeletonTitleProps;
    paragraph?: boolean | SkeletonParagraphProps;
    round?: boolean;
    classNames?: SkeletonClassNames;
    styles?: SkeletonStyles;
}

type SkeletonStyles = Partial<Record<'root' | 'avatar' | 'content' | 'title' | 'paragraph' | 'row', StyleProperties>>;

interface SkeletonTitleProps {
    width?: number | string;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Empty

`<Empty description="还没有项目"><Button>创建项目</Button></Empty>`。默认含插图，image 可传图片 URL、节点或 null，icon 可换为图标，children 为操作区；size="sm" 便于嵌入列表。需要标题及分立的操作槽时查看 EmptyState。

<!-- api:empty -->

可导入 `Empty`。

[类型与导出入口](packages/ui/src/components/empty/index.ts) · [交互说明](apps/docs/src/content/数据展示/empty.md) · [可运行示例](apps/docs/src/examples/empty)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Empty } from '@yuki-ui/react';

export default function BasicEmpty() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)' }}>
      <Empty />
      <Empty description="暂无搜索结果，换个关键词试试" size="sm" />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Empty(props: EmptyProps & RefAttributes<HTMLDivElement>): ReactNode

type EmptyClassNames = Partial<Record<'root' | 'image' | 'description' | 'footer', string>>;

interface EmptyProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children'> {
    image?: ReactNode;
    icon?: ReactNode;
    description?: ReactNode;
    size?: Size;
    imageStyle?: StyleProperties;
    children?: ReactNode;
    classNames?: EmptyClassNames;
    styles?: EmptyStyles;
}

type EmptyStyles = Partial<Record<'root' | 'image' | 'description' | 'footer', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

## 内容和媒体

### ContentRenderer

通过 type 判别属性。code 传 code 字符串，markdown 传字符串 children，document 传 src 或 content，audio/video/image 传 src，image 需要 alt。`<ContentRenderer type="code" language="ts" code="const ready = true" />`。业务层根据 MIME 或资源类型选择分支，每个分支直接使用对应组件的参数和事件。

<!-- api:content-renderer -->

可导入 `ContentRenderer`。

[类型与导出入口](packages/ui/src/components/content-renderer/index.ts) · [交互说明](apps/docs/src/content/内容与媒体/content-renderer.md) · [可运行示例](apps/docs/src/examples/content-renderer)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { ContentRenderer } from '@yuki-ui/react';

export default function CodeContent() {
  return <ContentRenderer type="code" filename="package.json" language="json"
    code={'{\n  "name": "yuki-ui",\n  "private": true\n}'} />;
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
ContentRenderer(input: ContentRendererProps): JSX.Element

type ContentRendererProps = ({
    type: 'code';
} & CodeBlockProps) | ({
    type: 'markdown';
} & MarkdownProps) | ({
    type: 'document';
} & DocumentViewerProps) | ({
    type: 'video';
} & VideoPlayerProps) | ({
    type: 'audio';
} & AudioPlayerProps) | ({
    type: 'image';
} & ImageViewerProps);
```

</details>

<!-- /api -->

### Markdown

`<Markdown allowImages={false}>{article}</Markdown>` 接收 Markdown 字符串，支持 GFM 表格、任务列表和围栏代码，跳过文内 HTML。renderCodeBlock 可替换围栏的渲染，components 提供受信任的 React 节点定制。maxRenderedLines 控制输出规模；要展示纯文本源码请用 CodeBlock。

<!-- api:markdown -->

可导入 `Markdown`。

[类型与导出入口](packages/ui/src/components/markdown/index.ts) · [交互说明](apps/docs/src/content/内容与媒体/markdown.md) · [可运行示例](apps/docs/src/examples/markdown)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Markdown } from '@yuki-ui/react';

const text = [
  '### 发布前检查',
  '- [x] 更新版本号',
  '- [ ] 运行回归测试',
  '',
  '| 版本 | 状态 |',
  '| --- | --- |',
  '| v1.0 | 已发布 |',
  '| v1.1 | 待发布 |',
].join('\n');

export default function BasicMarkdown() {
  return <Markdown>{text}</Markdown>;
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Markdown(props: MarkdownProps & RefAttributes<HTMLDivElement>): ReactNode

interface MarkdownProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children'> {
    children: string;
    components?: Components;
    renderCodeBlock?: (props: CodeBlockProps) => ReactNode;
    maxRenderedLines?: number;
    openLinksInNewTab?: boolean;
    codeLineNumbers?: boolean;
    allowImages?: boolean;
    codeBlockProps?: Omit<CodeBlockProps, 'code' | 'language'>;
    tableScrollProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    truncationMessage?: ReactNode;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### CodeBlock

`<CodeBlock code={source} language="tsx" filename="App.tsx" highlightLines={[3]} />`。行号默认显示，从 startLine（默认 1）编号。maxRenderedLines 限制预览行数，复制操作仍使用完整原文。wrap、maxHeight 约束布局；onCopy 收到源码，onCopyError 收到异常，可提示用户手动复制。

<!-- api:code-block -->

可导入 `CodeBlock`。

[类型与导出入口](packages/ui/src/components/code-block/index.ts) · [交互说明](apps/docs/src/content/内容与媒体/code-block.md) · [可运行示例](apps/docs/src/examples/code-block)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { CodeBlock } from '@yuki-ui/react';

const source = [
  'import { Button } from "@yuki-ui/react";',
  '',
  'export const Save = () => <Button>保存</Button>;',
].join('\n');

export default function BasicCodeBlock() {
  return <CodeBlock code={source} language="tsx" filename="Save.tsx" highlightLines={[3]} />;
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
CodeBlock(props: CodeBlockProps & RefAttributes<HTMLDivElement>): ReactNode

interface CodeBlockProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children' | 'onCopy'> {
    code: string;
    language?: string;
    filename?: string;
    showLineNumbers?: boolean;
    startLine?: number;
    highlightLines?: readonly number[];
    wrap?: boolean;
    maxHeight?: CSSProperties['maxHeight'];
    maxRenderedLines?: number;
    copyable?: boolean;
    onCopy?: (code: string) => void;
    onCopyError?: (error: Error) => void;
    showToolbar?: boolean;
    toolbar?: ReactNode;
    toolbarProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    viewportProps?: WithStyle<HTMLAttributes<HTMLPreElement>>;
    copyButtonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
    truncationMessage?: ReactNode;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### DocumentViewer

`<DocumentViewer src={file} filename={file.name} />` 支持 PDF、DOCX、Markdown、文本及源码。src 是 URL 或 Blob/File，自持文本可传 `content={text} format="markdown"`。扩展名不明确时指定 filename 或 format。默认 maxFileSize 为 20 MiB，maxRenderedLines 限文本行数。远程 URL 需要能从浏览器读取。onLoad 收到格式、文件大小等信息，onError 收到 DocumentError；renderError(error,{retry}) 可为可重试错误提供重试操作。

PDF 页码与缩放分别放在 pdfOptions.page/onPageChange、zoom/onZoomChange；页码从 1 开始。遇到密码或额外字体、码表数据，用 pdfOptions 配置。隐藏但保留挂载的 PDF 面板传 active={false} 可暂停其渲染。

<!-- api:document-viewer -->

可导入 `DocumentError`、`DocumentViewer`、`inferDocumentFormat`。

[类型与导出入口](packages/ui/src/components/document-viewer/index.ts) · [交互说明](apps/docs/src/content/内容与媒体/document-viewer.md) · [可运行示例](apps/docs/src/examples/document-viewer)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Button, DocumentViewer, Flex } from '@yuki-ui/react';

const samples = [
  { label: 'PDF', path: './samples/yuki-guide.pdf' },
  { label: 'Word', path: './samples/yuki-guide.docx' },
  { label: 'Markdown', path: './samples/yuki-readme.md' },
];

export default function SampleDocuments() {
  const [src, setSrc] = useState('./samples/yuki-guide.pdf');
  return (
    <Flex direction="column" gap="3" style={{ width: '100%' }}>
      <Flex gap="2" wrap>
        {samples.map(({ label, path }) => (
          <Button key={path} size="sm" aria-pressed={src === path}
            variant={src === path ? 'soft' : 'outline'} onClick={() => setSrc(path)}>
            {label}
          </Button>
        ))}
      </Flex>
      <DocumentViewer src={src} />
    </Flex>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
DocumentViewer(props: DocumentViewerProps & RefAttributes<HTMLDivElement>): ReactNode

inferDocumentFormat(filename?: string, mimeType?: string): DocumentFormat | undefined

interface DocumentErrorActions {
    retry: () => void;
}

type DocumentErrorCode = 'unsupported-format' | 'file-too-large' | 'network' | 'http' | 'read-failed' | 'invalid-encoding' | 'docx-parse' | 'pdf-parse' | 'pdf-render' | 'preview-unavailable';

type DocumentErrorRenderer = (error: DocumentError, actions: DocumentErrorActions) => ReactNode;

type DocumentFormat = 'markdown' | 'text' | 'code' | 'pdf' | 'docx';

interface DocumentLoadInfo {
    format: DocumentFormat;
    filename?: string;
    size: number;
    pageCount?: number;
    text?: string;
    warnings?: string[];
}

type DocumentSource = string | Blob;

interface DocumentViewerProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children' | 'onLoad' | 'onError'> {
    src?: DocumentSource;
    content?: string;
    format?: DocumentFormat | 'auto';
    filename?: string;
    language?: string;
    maxFileSize?: number;
    maxRenderedLines?: number;
    showHeader?: boolean;
    pdfOptions?: PdfOptions;
    markdownOptions?: Omit<MarkdownProps, 'children'>;
    codeBlockProps?: Omit<CodeBlockProps, 'code' | 'language'>;
    header?: ReactNode;
    headerProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    bodyProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    renderLoading?: () => ReactNode;
    renderEmpty?: () => ReactNode;
    active?: boolean;
    onLoad?: (info: DocumentLoadInfo) => void;
    onError?: (error: DocumentError) => void;
    renderError?: DocumentErrorRenderer;
}

interface PdfOptions {
    password?: string;
    cMapUrl?: string;
    standardFontDataUrl?: string;
    wasmUrl?: string;
    page?: number;
    defaultPage?: number;
    onPageChange?: (page: number) => void;
    zoom?: number;
    defaultZoom?: number;
    onZoomChange?: (zoom: number) => void;
    showToolbar?: boolean;
    toolbar?: ReactNode;
    toolbarProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    viewportProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    previousButtonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
    nextButtonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
    zoomOutButtonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
    zoomInButtonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
    resetZoomButtonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### ImageViewer

`<ImageViewer src={file} alt="所选附件" loading="lazy" />` 直接渲染 img 并管理 Blob URL。ref 指向 img，可传原生 onLoad、onError、decoding 等。需要灯箱、遮罩或加载占位时用 Image。

<!-- api:image-viewer -->

可导入 `ImageViewer`。

[类型与导出入口](packages/ui/src/components/image-viewer/index.ts) · [交互说明](apps/docs/src/content/内容与媒体/image-viewer.md) · [可运行示例](apps/docs/src/examples/image-viewer)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import lake from '../../assets/alpine-lake.jpg';
import { ImageViewer } from '@yuki-ui/react';

export default function ImageViewerExample() {
  return <ImageViewer src={lake} alt="山峰在湖面的倒影" />;
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
ImageViewer(props: ImageViewerProps & RefAttributes<HTMLImageElement>): ReactNode

interface ImageViewerProps extends Omit<WithStyle<ImgHTMLAttributes<HTMLImageElement>>, 'src'> {
    src?: MediaSource;
    alt: string;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### AudioPlayer

`<AudioPlayer src={audioFile} title="语音回顾" description="会议纪要" />`。src 接受 URL / Blob / File。controlsVariant 默认 custom，native 使用浏览器控件；playbackRates、controlOptions、renderControls 界定操作。onMetadata 提供时长，onMediaError 提供失败详情，renderError 可执行 retry。active=false 会暂停，恢复可见后由用户再次播放。

<!-- api:audio-player -->

可导入 `AudioPlayer`、`formatMediaTime`、`parseMediaMetadata`。

[类型与导出入口](packages/ui/src/components/audio-player/index.ts) · [交互说明](apps/docs/src/content/内容与媒体/audio-player.md) · [可运行示例](apps/docs/src/examples/audio-player)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { AudioPlayer } from '@yuki-ui/react';

export default function AudioExample() {
  return <AudioPlayer src="./samples/yuki-notes.wav" title="提示音试听" description="WAV · 本地示例" />;
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
AudioPlayer(props: AudioPlayerProps & RefAttributes<HTMLAudioElement>): ReactNode

formatMediaTime(seconds: number | null): string

parseMediaMetadata(source: MediaSource, { kind, signal, timeout, }: { kind: "video" | "audio"; signal?: AbortSignal; timeout?: number; }): Promise<MediaMetadata>

interface AudioPlayerProps extends Omit<WithStyle<AudioHTMLAttributes<HTMLAudioElement>>, 'src'>, PlayerControlOptions {
    src?: MediaSource;
    description?: string;
    cover?: string;
    showMetadata?: boolean;
    onMetadata?: (metadata: MediaMetadata) => void;
    onMediaError?: (error: MediaFailure) => void;
    active?: boolean;
    animation?: AnimationOptions | false;
    captionProps?: WithStyle<HTMLAttributes<HTMLElement>>;
    renderEmpty?: () => ReactNode;
    renderLoading?: () => ReactNode;
    renderError?: (error: MediaFailure, actions: {
        retry: () => void;
    }) => ReactNode;
    mediaProps?: WithStyle<AudioHTMLAttributes<HTMLAudioElement>>;
    coverProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
}

interface MediaFailure {
    code: number;
    message: string;
}

interface MediaMetadata {
    duration: number | null;
    width?: number;
    height?: number;
    src: string;
    mimeType?: string;
    size?: number;
    filename?: string;
}

type MediaSource = string | Blob;

interface PlayerControlOptions {
    controlsVariant?: 'custom' | 'native';
    playbackRates?: readonly number[];
    controlOptions?: {
        timeline?: boolean;
        skip?: boolean;
        volume?: boolean;
        playbackRate?: boolean;
        captions?: boolean;
        fullscreen?: boolean;
        skipSeconds?: number;
    };
    controlsProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    playButtonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
    timelineProps?: WithStyle<InputHTMLAttributes<HTMLInputElement>>;
    volumeProps?: WithStyle<InputHTMLAttributes<HTMLInputElement>>;
    renderControls?: (state: PlayerControlsState) => ReactNode;
}

type PlayerControlsState = { waiting: boolean;
    error: string;
    toggle: () => Promise<void>;
    seek: (value: number) => void;
    volumeTo: (value: number) => void;
    toggleMute: () => void;
    rateTo: (value: number) => void;
    playing: boolean;
    time: number;
    duration: number;
    buffered: number;
    volume: number;
    muted: boolean;
    rate: number;
    ended: boolean; } & { enabled: boolean; };

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### VideoPlayer

`<VideoPlayer src={url} poster={cover} tracks={[{src:vtt,srcLang:'zh',label:'中文',default:true}]} />`。tracks 指向 WebVTT 等字幕资源。与 AudioPlayer 共享播放、跳转、静音、倍速及错误接口；视频可提供全屏与字幕控制。ref 指向 video，mediaProps 设播放器原生属性。parseMediaMetadata 可读取本地/远程媒体的元信息，formatMediaTime 格式化秒数。

<!-- api:video-player -->

可导入 `VideoPlayer`、`formatMediaTime`、`parseMediaMetadata`。

[类型与导出入口](packages/ui/src/components/video-player/index.ts) · [交互说明](apps/docs/src/content/内容与媒体/video-player.md) · [可运行示例](apps/docs/src/examples/video-player)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { VideoPlayer } from '@yuki-ui/react';

export default function VideoExample() {
  return (
    <VideoPlayer
      src="./samples/yuki-motion.webm"
      poster="./samples/yuki-motion.png"
      title="动效演示"
      tracks={[{ src: './samples/yuki-captions.vtt', srcLang: 'zh', label: '中文', default: true }]}
    />
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
VideoPlayer(props: VideoPlayerProps & RefAttributes<HTMLVideoElement>): ReactNode

formatMediaTime(seconds: number | null): string

parseMediaMetadata(source: MediaSource, { kind, signal, timeout, }: { kind: "video" | "audio"; signal?: AbortSignal; timeout?: number; }): Promise<MediaMetadata>

interface MediaFailure {
    code: number;
    message: string;
}

interface MediaMetadata {
    duration: number | null;
    width?: number;
    height?: number;
    src: string;
    mimeType?: string;
    size?: number;
    filename?: string;
}

type MediaSource = string | Blob;

interface PlayerControlOptions {
    controlsVariant?: 'custom' | 'native';
    playbackRates?: readonly number[];
    controlOptions?: {
        timeline?: boolean;
        skip?: boolean;
        volume?: boolean;
        playbackRate?: boolean;
        captions?: boolean;
        fullscreen?: boolean;
        skipSeconds?: number;
    };
    controlsProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    playButtonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
    timelineProps?: WithStyle<InputHTMLAttributes<HTMLInputElement>>;
    volumeProps?: WithStyle<InputHTMLAttributes<HTMLInputElement>>;
    renderControls?: (state: PlayerControlsState) => ReactNode;
}

type PlayerControlsState = { waiting: boolean;
    error: string;
    toggle: () => Promise<void>;
    seek: (value: number) => void;
    volumeTo: (value: number) => void;
    toggleMute: () => void;
    rateTo: (value: number) => void;
    playing: boolean;
    time: number;
    duration: number;
    buffered: number;
    volume: number;
    muted: boolean;
    rate: number;
    ended: boolean; } & { enabled: boolean; };

interface VideoPlayerProps extends Omit<WithStyle<VideoHTMLAttributes<HTMLVideoElement>>, 'src'>, PlayerControlOptions {
    src?: MediaSource;
    tracks?: readonly VideoTrack[];
    showMetadata?: boolean;
    onMetadata?: (metadata: MediaMetadata) => void;
    onMediaError?: (error: MediaFailure) => void;
    active?: boolean;
    animation?: AnimationOptions | false;
    captionProps?: WithStyle<ComponentPropsWithRef<'figcaption'>>;
    renderEmpty?: () => ReactNode;
    renderLoading?: () => ReactNode;
    renderError?: (error: MediaFailure, actions: {
        retry: () => void;
    }) => ReactNode;
    mediaProps?: WithStyle<VideoHTMLAttributes<HTMLVideoElement>>;
    stageProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    startButtonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
}

interface VideoTrack {
    src: string;
    label: string;
    srcLang: string;
    kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
    default?: boolean;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

## 导航

### Menu

`<Menu items={[{key:'home',label:'工作台'},{key:'docs',label:'文档',children:pages}]} selectedKeys={selected} onSelect={key => navigate(key)} />`。selectedKeys 表示当前项，openKeys 表示展开分支。multiple 允许多项选择。inlineCollapsed 在 inline 模式把导航收窄为图标栏；路由应用用业务路由更新 selectedKeys。

<!-- api:menu -->

可导入 `Menu`。

[类型与导出入口](packages/ui/src/components/menu/index.ts) · [交互说明](apps/docs/src/content/导航/menu.md) · [可运行示例](apps/docs/src/examples/menu)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Menu, Text } from '@yuki-ui/react';

export default function BasicMenu() {
  const [selected, setSelected] = useState<string[]>(['home']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <div style={{ inlineSize: 240 }}>
        <Menu
          defaultSelectedKeys={['home']}
          defaultOpenKeys={['docs']}
          onSelect={(key) => setSelected([key])}
          items={[
            { key: 'home', label: '工作台' },
            { key: 'projects', label: '项目' },
            {
              key: 'docs',
              label: '文档',
              children: [
                { key: 'guide', label: '使用指南' },
                { key: 'api', label: 'API 参考' },
                { key: 'changelog', label: '更新日志' },
              ],
            },
            { type: 'divider', key: 'divider-1' },
            { key: 'settings', label: '设置' },
          ]}
        />
      </div>
      <Text size="sm" tone="tertiary">
        当前选中：{selected[0]}
      </Text>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Menu(props: MenuProps & RefAttributes<HTMLUListElement>): ReactNode

type MenuClassNames = Partial<Record<'root' | 'item' | 'itemIcon' | 'itemLabel' | 'itemExtra' | 'submenu' | 'submenuTrigger' | 'submenuArrow' | 'submenuList' | 'popup' | 'group' | 'groupTitle' | 'divider', string>>;

interface MenuItemConfig {
    key: string;
    label?: ReactNode;
    icon?: ReactNode;
    extra?: ReactNode;
    disabled?: boolean;
    danger?: boolean;
    type?: MenuItemType;
    href?: string;
    onClick?: (info: {
        key: string;
        item: MenuItemConfig;
        event: MouseEvent<HTMLElement>;
    }) => void;
    children?: MenuItemConfig[];
}

type MenuItemType = 'item' | 'divider' | 'group';

type MenuMode = 'horizontal' | 'vertical' | 'inline';

interface MenuProps extends Omit<WithStyle<HTMLAttributes<HTMLUListElement>>, 'children' | 'onSelect'> {
    items: MenuItemConfig[];
    mode?: MenuMode;
    selectedKeys?: string[];
    defaultSelectedKeys?: string[];
    onSelect?: (key: string, item: MenuItemConfig) => void;
    openKeys?: string[];
    defaultOpenKeys?: string[];
    onOpenChange?: (openKeys: string[]) => void;
    inlineCollapsed?: boolean;
    multiple?: boolean;
    selectable?: boolean;
    size?: Size;
    classNames?: MenuClassNames;
    styles?: MenuStyles;
}

type MenuStyles = Partial<Record<'root' | 'item' | 'itemIcon' | 'itemLabel' | 'itemExtra' | 'submenu' | 'submenuTrigger' | 'submenuArrow' | 'submenuList' | 'popup' | 'group' | 'groupTitle' | 'divider', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Breadcrumb

`<Breadcrumb items={[{title:'项目',href:'/projects'},{title:'冬季发布'}]} />`。前置节点通向父级页面，末项表示当前位置。separator 自定义分隔符，itemRender 可接入路由的 Link。与页面 Title 配合分别说明路径和当前内容。

<!-- api:breadcrumb -->

可导入 `Breadcrumb`。

[类型与导出入口](packages/ui/src/components/breadcrumb/index.ts) · [交互说明](apps/docs/src/content/导航/breadcrumb.md) · [可运行示例](apps/docs/src/examples/breadcrumb)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Breadcrumb } from '@yuki-ui/react';

export default function BreadcrumbBasicDemo() {
  return (
    <Breadcrumb
      items={[
        { title: '首页', href: '/' },
        { title: '组件', href: '/components' },
        { title: '面包屑' },
      ]}
    />
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Breadcrumb(props: BreadcrumbProps & RefAttributes<HTMLElement>): ReactNode

type BreadcrumbClassNames = Partial<Record<'root' | 'list' | 'item' | 'link' | 'icon' | 'separator' | 'current', string>>;

interface BreadcrumbItem {
    key?: string;
    title?: ReactNode;
    label?: ReactNode;
    href?: string;
    icon?: ReactNode;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    disabled?: boolean;
}

interface BreadcrumbProps extends Omit<WithStyle<HTMLAttributes<HTMLElement>>, 'children'> {
    items: BreadcrumbItem[];
    current?: string;
    separator?: ReactNode;
    itemRender?: (item: BreadcrumbItem, index: number, items: BreadcrumbItem[]) => ReactNode;
    classNames?: BreadcrumbClassNames;
    styles?: BreadcrumbStyles;
}

type BreadcrumbStyles = Partial<Record<'root' | 'list' | 'item' | 'link' | 'icon' | 'separator' | 'current', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Anchor

`<Anchor items={[{key:'usage',href:'#usage',title:'用法'}]} />` 配 `<section id="usage">`。activeKey / onChange 可同步外部目录，滚动监听默认在 window。局部滚动容器用 getContainer 返回元素，offsetTop 参与高亮计算，targetOffset 决定实际滚到哪一位置。

<!-- api:anchor -->

可导入 `Anchor`。

[类型与导出入口](packages/ui/src/components/anchor/index.ts) · [交互说明](apps/docs/src/content/导航/anchor.md) · [可运行示例](apps/docs/src/examples/anchor)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useRef } from 'react';
import { Anchor, Text } from '@yuki-ui/react';

const items = [
  { key: 'intro', href: '#intro', title: '介绍' },
  { key: 'usage', href: '#usage', title: '基础用法' },
  { key: 'api', href: '#api', title: 'API' },
  { key: 'faq', href: '#faq', title: '常见问题' },
];

const sections: Record<string, string> = {
  intro: '锚点会随着内容滚动自动高亮，点击可平滑滚动到对应标题。',
  usage: '将 Anchor 放在内容侧边，传入 items 即可。',
  api: '支持 offsetTop、targetOffset、getContainer 等滚动控制参数。',
  faq: '在固定头部布局中，把 offsetTop 设置为头部高度即可避开遮挡。',
};

export default function BasicAnchor() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: 'flex', gap: 'var(--yuki-space-6)' }}>
      <Anchor
        items={items}
        getContainer={() => containerRef.current}
        offsetTop={8}
        style={{ inlineSize: 160, flex: 'none' }}
      />
      <div
        ref={containerRef}
        style={{
          blockSize: 260,
          overflow: 'auto',
          flex: 1,
          paddingInlineEnd: 'var(--yuki-space-4)',
          border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border-subtle)',
          borderRadius: 'var(--yuki-radius-md)',
        }}
      >
        {items.map((item) => (
          <section key={item.key} id={item.key} style={{ padding: 'var(--yuki-space-4)', minBlockSize: 180 }}>
            <h3 style={{ marginBlockEnd: 'var(--yuki-space-2)' }}>{item.title}</h3>
            <Text size="sm" tone="secondary">
              {sections[item.key]}
            </Text>
          </section>
        ))}
      </div>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Anchor(props: AnchorProps & RefAttributes<HTMLElement>): ReactNode

type AnchorClassNames = Partial<Record<'root' | 'list' | 'item' | 'link' | 'activeLink' | 'subList', string>>;

interface AnchorItem {
    key?: string;
    href: string;
    title?: ReactNode;
    label?: ReactNode;
    children?: AnchorItem[];
}

interface AnchorProps extends Omit<WithStyle<HTMLAttributes<HTMLElement>>, 'onChange'> {
    items: AnchorItem[];
    activeKey?: string;
    current?: string;
    defaultActiveKey?: string;
    offsetTop?: number;
    targetOffset?: number;
    getContainer?: () => HTMLElement | Window | null;
    onChange?: (activeKey: string) => void;
    classNames?: AnchorClassNames;
    styles?: AnchorStyles;
}

type AnchorStyles = Partial<Record<'root' | 'list' | 'item' | 'link' | 'activeLink' | 'subList', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Affix

`<Affix offsetTop={8}><Button>保存草稿</Button></Affix>`。用顶部或底部偏移量固定一块内容，target 可指定一个滚动元素。固定工具栏和 Anchor 共用同一滚动容器时，锚点预留工具栏高度。

<!-- api:affix -->

可导入 `Affix`。

[类型与导出入口](packages/ui/src/components/affix/index.ts) · [交互说明](apps/docs/src/content/导航/affix.md) · [可运行示例](apps/docs/src/examples/affix)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useRef } from 'react';
import { Affix, Text } from '@yuki-ui/react';

export default function BasicAffix() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      style={{
        blockSize: 220,
        overflow: 'auto',
        padding: 'var(--yuki-space-4)',
        border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border-subtle)',
        borderRadius: 'var(--yuki-radius-md)',
      }}
    >
      <Affix offsetTop={8} target={() => containerRef.current}>
        <div
          style={{
            padding: 'var(--yuki-space-2) var(--yuki-space-3)',
            background: 'var(--yuki-color-bg-elevated)',
            border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border-subtle)',
            borderRadius: 'var(--yuki-radius-md)',
          }}
        >
          <Text size="sm" weight="medium">
            固定操作条
          </Text>
        </div>
      </Affix>
      {Array.from({ length: 8 }, (_, index) => (
        <Text key={index} as="p" size="sm" tone="secondary" style={{ marginBlock: 'var(--yuki-space-5)' }}>
          向下滚动，操作条会在距顶部 8px 处固定，并为原位置保留占位。
        </Text>
      ))}
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Affix(props: AffixProps & RefAttributes<HTMLDivElement>): ReactNode

type AffixClassNames = Partial<Record<'root' | 'affix', string>>;

interface AffixProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange'> {
    offsetTop?: number;
    offsetBottom?: number;
    target?: () => HTMLElement | Window | null;
    onChange?: (affixed: boolean) => void;
    children?: ReactNode;
    classNames?: AffixClassNames;
    styles?: AffixStyles;
}

type AffixStyles = Partial<Record<'root' | 'affix', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### BackTop

`<BackTop target={() => scrollRef.current} visibilityHeight={240} />`。阈值单位为像素，默认监听窗口。提供稳定的滚动目标并给容器限定高度；children 可替换按钮内容。

<!-- api:back-top -->

可导入 `BackTop`。

[类型与导出入口](packages/ui/src/components/back-top/index.ts) · [交互说明](apps/docs/src/content/导航/back-top.md) · [可运行示例](apps/docs/src/examples/back-top)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useRef } from 'react';
import { BackTop, Text } from '@yuki-ui/react';

export default function BasicBackTop() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <div
        ref={containerRef}
        style={{
          blockSize: 220,
          overflow: 'auto',
          padding: 'var(--yuki-space-4)',
          border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border-subtle)',
          borderRadius: 'var(--yuki-radius-md)',
        }}
      >
        {Array.from({ length: 12 }, (_, index) => (
          <Text key={index} as="p" size="sm" tone="secondary" style={{ marginBlock: 'var(--yuki-space-4)' }}>
            第 {index + 1} 段内容：滚动超过阈值后，右下角会出现回到顶部按钮。
          </Text>
        ))}
      </div>
      <BackTop visibilityHeight={160} target={() => containerRef.current} />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
BackTop(props: BackTopProps & RefAttributes<HTMLButtonElement>): ReactNode

type BackTopClassNames = Partial<Record<'root' | 'arrow' | 'content', string>>;

interface BackTopProps extends WithStyle<ButtonHTMLAttributes<HTMLButtonElement>> {
    visibilityHeight?: number;
    threshold?: number;
    target?: HTMLElement | null | (() => HTMLElement | Window | null);
    children?: ReactNode;
    size?: Size;
    classNames?: BackTopClassNames;
    styles?: BackTopStyles;
}

type BackTopStyles = Partial<Record<'root' | 'arrow' | 'content', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Dropdown、DropdownItem、DropdownLabel、DropdownSeparator

数据模式写 `<Dropdown trigger={<Button>更多</Button>} items={[{key:'copy',label:'复制'}]} onSelect={(key,item,event) => run(key)} />`。triggerMode 控制 click 或 hover，closeOnSelect 控制选择后是否收起，placement 控制位置。item.type 可表示分组和分隔，href 可导航。

组合模式继续使用同一 trigger，传入 DropdownLabel、DropdownSeparator、DropdownItem 子节点。`<DropdownItem onSelect={copy}>复制</DropdownItem>` 可放图标、快捷键或通过 asChild 注入链接；open / defaultOpen / onOpenChange 管整体显隐。portalProps / contentProps 和 animation 可以控制组合菜单的挂载与过渡。

<!-- api:dropdown -->

可导入 `Dropdown`、`DropdownItem`、`DropdownLabel`、`DropdownSeparator`。

[类型与导出入口](packages/ui/src/components/dropdown/index.ts) · [交互说明](apps/docs/src/content/导航/dropdown.md) · [可运行示例](apps/docs/src/examples/dropdown)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Button, Dropdown, Icon, Text } from '@yuki-ui/react';

export default function BasicDropdown() {
  const [last, setLast] = useState('—');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--yuki-space-4)' }}>
      <Dropdown
        onSelect={(key) => setLast(String(key))}
        items={[
          { key: 'edit', label: '编辑', icon: <Icon name="edit" size={16} /> },
          { key: 'copy', label: '复制', icon: <Icon name="copy" size={16} />, extra: '⌘C' },
          { key: 'delete', label: '删除', icon: <Icon name="trash" size={16} />, danger: true },
        ]}
        trigger={<Button variant="outline" startIcon={<Icon name="settings" size={16} />}>
          更多操作
        </Button>}
      />
      <Text size="sm" tone="tertiary">
        最近选择：{last}
      </Text>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Dropdown(props: (ItemsDropdownProps & RefAttributes<HTMLSpanElement>) | (ComposedDropdownProps & { items?: never; })): ReactNode

DropdownItem(props: DropdownItemProps & RefAttributes<HTMLDivElement>): ReactNode

DropdownLabel(props: Omit<Primitive.DropdownMenuLabelProps & RefAttributes<HTMLDivElement>, "ref"> & { style?: StyleProperties | undefined; } & RefAttributes<HTMLDivElement>): ReactNode

DropdownSeparator(props: Omit<Primitive.DropdownMenuSeparatorProps & RefAttributes<HTMLDivElement>, "ref"> & { style?: StyleProperties | undefined; } & RefAttributes<HTMLDivElement>): ReactNode

interface ComposedDropdownProps extends ComponentPropsWithoutRef<typeof Primitive.Root> {
    trigger: ReactElement;
    align?: 'start' | 'center' | 'end';
    className?: string;
    portalContainer?: HTMLElement | null;
    portalProps?: Omit<ComponentPropsWithoutRef<typeof Primitive.Portal>, 'children'>;
    contentProps?: Omit<WithStyle<ComponentPropsWithoutRef<typeof Primitive.Content>>, 'children' | 'asChild'>;
    animation?: AnimationOptions | false;
}

type DropdownClassNames = Partial<Record<'trigger' | 'popup' | 'list' | 'item' | 'itemIcon' | 'itemLabel' | 'itemExtra' | 'divider' | 'group' | 'groupTitle', string>>;

interface DropdownItemConfig {
    key: string;
    label?: ReactNode;
    icon?: ReactNode;
    extra?: ReactNode;
    danger?: boolean;
    disabled?: boolean;
    type?: DropdownItemType;
    href?: string;
    children?: readonly DropdownItemConfig[];
    onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
}

interface DropdownItemProps extends WithStyle<ComponentPropsWithoutRef<typeof Primitive.Item>> {
    destructive?: boolean;
    icon?: ReactNode;
    shortcut?: string;
    textProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    shortcutProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
}

type DropdownItemType = 'item' | 'divider' | 'group';

type DropdownProps = ItemsDropdownProps | (ComposedDropdownProps & {
    items?: never;
});

type DropdownStyles = Partial<Record<'trigger' | 'popup' | 'list' | 'item' | 'itemIcon' | 'itemLabel' | 'itemExtra' | 'divider' | 'group' | 'groupTitle', StyleProperties>>;

type DropdownTriggerMode = 'click' | 'hover';

interface ItemsDropdownProps extends Omit<WithStyle<HTMLAttributes<HTMLSpanElement>>, 'children' | 'onSelect'> {
    trigger: ReactElement;
    children?: never;
    items: readonly DropdownItemConfig[];
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    triggerMode?: DropdownTriggerMode;
    placement?: Placement;
    disabled?: boolean;
    arrow?: boolean;
    closeOnSelect?: boolean;
    size?: Size;
    onSelect?: (key: string, item: DropdownItemConfig, event: ReactMouseEvent<HTMLElement>) => void;
    classNames?: DropdownClassNames;
    styles?: DropdownStyles;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Pagination

`<Pagination total={recordCount} page={page} pageSize={size} showSizeChanger onChange={(p,s) => {setPage(p);setSize(s)}} />`。page 从 1 开始，onChange 同时报告目标页及每页条数；服务端仅提供页数时使用 totalPages。非受控用 defaultPage / defaultPageSize，simple 为简洁模式，showQuickJumper 支持跳页。Table 和 List 的 pagination 配置沿用相同的状态字段，避免重复渲染分页器。

<!-- api:pagination -->

可导入 `Pagination`。

[类型与导出入口](packages/ui/src/components/pagination/index.ts) · [交互说明](apps/docs/src/content/导航/pagination.md) · [可运行示例](apps/docs/src/examples/pagination)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Pagination } from '@yuki-ui/react';

export default function BasicPagination() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <Pagination total={120} defaultPage={1} />
      <Pagination total={120} defaultPage={6} showTotal={(total, range) => `${range[0]}–${range[1]} / 共 ${total} 条`} />
      <Pagination total={120} defaultPage={3} simple showTotal />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Pagination(props: PaginationProps & RefAttributes<HTMLElement>): ReactNode

interface PaginationButtonInfo {
    type: 'page' | 'previous' | 'next';
    page: number;
    current: boolean;
    disabled: boolean;
}

type PaginationClassNames = Partial<Record<'root' | 'list' | 'item' | 'activeItem' | 'prev' | 'next' | 'ellipsis' | 'total' | 'sizeChanger' | 'quickJumper' | 'jumpInput' | 'simple', string>>;

interface PaginationProps extends Omit<WithStyle<HTMLAttributes<HTMLElement>>, 'onChange' | 'defaultValue'>, PageStateProps {
    previousContent?: ReactNode;
    nextContent?: ReactNode;
    ellipsis?: ReactNode;
    buttonProps?: (item: PaginationButtonInfo) => WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
    boundaryCount?: number;
    animation?: AnimationOptions | false;
    pageSizeOptions?: number[];
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: boolean | ((total: number, range: [
        number,
        number
    ]) => ReactNode);
    simple?: boolean;
    disabled?: boolean;
    siblingCount?: number;
    size?: Size;
    classNames?: PaginationClassNames;
    styles?: PaginationStyles;
}

type PaginationStyles = Partial<Record<'root' | 'list' | 'item' | 'activeItem' | 'prev' | 'next' | 'ellipsis' | 'total' | 'sizeChanger' | 'quickJumper' | 'jumpInput' | 'simple', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};

interface PageStateProps {
    total?: number;
    totalPages?: number;
    page?: number;
    defaultPage?: number;
    pageSize?: number;
    defaultPageSize?: number;
    onChange?: (page: number, pageSize: number) => void;
}
```

</details>

<!-- /api -->

### Steps

`<Steps items={[{title:'资料'},{title:'审核'}]} current={step} clickable onChange={setStep} />`。current 是从 0 开始的索引，其之前的步骤显示已完成。配合 Form 时在进入下一步前用 validateFields 校验当前页，使用 disabled 或由父层控制可跳转的步骤。

<!-- api:steps -->

可导入 `Steps`。

[类型与导出入口](packages/ui/src/components/steps/index.ts) · [交互说明](apps/docs/src/content/导航/steps.md) · [可运行示例](apps/docs/src/examples/steps)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Steps, Text } from '@yuki-ui/react';

export default function BasicSteps() {
  const [current, setCurrent] = useState(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-5)' }}>
      <Steps
        current={current}
        clickable
        onChange={setCurrent}
        items={[
          { title: '填写信息', description: '基础资料与联系方式' },
          { title: '确认订单', description: '核对商品与金额' },
          { title: '支付', description: '选择支付方式' },
          { title: '完成', description: '等待发货' },
        ]}
      />
      <div style={{ display: 'flex', gap: 'var(--yuki-space-2)' }}>
        <Text size="sm" tone="tertiary">
          当前第 {current + 1} 步
        </Text>
      </div>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Steps(props: StepsProps & RefAttributes<HTMLOListElement>): ReactNode

interface StepItem {
    key?: string | number;
    title?: ReactNode;
    description?: ReactNode;
    subTitle?: ReactNode;
    icon?: ReactNode;
    status?: StepStatus;
    disabled?: boolean;
}

type StepStatus = 'wait' | 'process' | 'finish' | 'error';

type StepsClassNames = Partial<Record<'root' | 'item' | 'icon' | 'tail' | 'content' | 'title' | 'description' | 'dot', string>>;

type StepsDirection = 'horizontal' | 'vertical';

interface StepsProps extends Omit<WithStyle<HTMLAttributes<HTMLOListElement>>, 'onChange'> {
    items: StepItem[];
    current?: number;
    defaultCurrent?: number;
    onChange?: (index: number) => void;
    direction?: StepsDirection;
    status?: StepStatus;
    size?: Size;
    clickable?: boolean;
    progressDot?: boolean;
    classNames?: StepsClassNames;
    styles?: StepsStyles;
}

type StepsStyles = Partial<Record<'root' | 'item' | 'icon' | 'tail' | 'content' | 'title' | 'description' | 'dot', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

## 反馈与浮层

### Alert

`<Alert tone="warning" title="已离线" description="修改会保存在本机" />` 持续展示页面问题；action 可放“重新连接”按钮。tone 表达语义，variant 控制表面，banner 跨区显示。可关闭的提示用 closable 与 onClose，由父层决定移除或继续显示。

<!-- api:alert -->

可导入 `Alert`。

[类型与导出入口](packages/ui/src/components/alert/index.ts) · [交互说明](apps/docs/src/content/反馈/alert.md) · [可运行示例](apps/docs/src/examples/alert)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Alert } from '@yuki-ui/react';

export default function BasicAlert() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)' }}>
      <Alert
        tone="info"
        title="版本更新"
        description="组件库将于本周五发布 1.4.0，包含 Tour 与 Drawer 两个新组件。"
      />
      <Alert
        tone="success"
        title="发布成功"
        description="站点已同步到边缘节点，预计 30 秒内全球生效。"
        closable
      />
      <Alert tone="warning" title="配额即将用尽" description="本月 API 调用额度已使用 88%，请及时扩容。" />
      <Alert
        tone="danger"
        title="构建失败"
        description="packages/ui 的 TypeScript 检查未通过，请查看流水线日志。"
        action={
          <a href="#build" style={{ color: 'inherit', fontWeight: 500 }}>
            查看日志
          </a>
        }
      />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Alert(props: AlertProps & RefAttributes<HTMLDivElement>): ReactNode

type AlertClassNames = Partial<Record<'root' | 'icon' | 'content' | 'title' | 'description' | 'action' | 'close', string>>;

interface AlertProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title' | 'children'> {
    title?: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    tone?: AlertTone;
    variant?: AlertVariant | AlertTone;
    closeLabel?: string;
    bodyProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    titleProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    descriptionProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    closeProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
    showIcon?: boolean;
    icon?: ReactNode;
    closable?: boolean;
    closeIcon?: ReactNode;
    action?: ReactNode;
    banner?: boolean;
    size?: Size;
    classNames?: AlertClassNames;
    styles?: AlertStyles;
    onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
}

type AlertStyles = Partial<Record<'root' | 'icon' | 'content' | 'title' | 'description' | 'action' | 'close', StyleProperties>>;

type AlertTone = 'info' | 'success' | 'warning' | 'danger';

type AlertVariant = 'subtle' | 'outline' | 'solid';

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Tooltip

`<Tooltip content="复制链接"><IconButton icon={<Icon name="copy" />} aria-label="复制链接" /></Tooltip>`。为简短补充信息设置悬停/聚焦提示，默认悬停打开延迟 200ms，关闭 100ms。placement、arrow、offset 可调位置；需要可点击内容时使用 Popover。触发器仍需提供自己的可访问名称。

<!-- api:tooltip -->

可导入 `Tooltip`。

[类型与导出入口](packages/ui/src/components/tooltip/index.ts) · [交互说明](apps/docs/src/content/反馈/tooltip.md) · [可运行示例](apps/docs/src/examples/tooltip)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Button, Icon, Space, Tooltip } from '@yuki-ui/react';

export default function BasicTooltip() {
  return (
    <Space size="3" wrap>
      <Tooltip content="新建文件">
        <Button variant="outline" iconOnly aria-label="新建文件">
          <Icon name="plus" />
        </Button>
      </Tooltip>
      <Tooltip content="刷新数据">
        <Button variant="ghost" iconOnly aria-label="刷新数据">
          <Icon name="refresh" />
        </Button>
      </Tooltip>
      <Tooltip content="设置（⌘ ,）">
        <Button variant="ghost" iconOnly aria-label="设置">
          <Icon name="settings" />
        </Button>
      </Tooltip>
      <Tooltip content="这段被截断的文字的完整内容会在这里显示出来">
        <span style={{ fontSize: 'var(--yuki-font-size-sm)', borderBottom: '1px dashed var(--yuki-color-border-strong)' }}>
          悬停查看完整文字
        </span>
      </Tooltip>
    </Space>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Tooltip(props: TooltipProps & RefAttributes<HTMLSpanElement>): ReactNode

type TooltipClassNames = Partial<Record<'root' | 'popup' | 'arrow', string>>;

interface TooltipProps extends Omit<WithStyle<HTMLAttributes<HTMLSpanElement>>, 'content' | 'title'> {
    content: ReactNode;
    placement?: Placement;
    side?: 'top' | 'bottom' | 'left' | 'right';
    hideArrow?: boolean;
    animation?: AnimationOptions | false;
    delayDuration?: number;
    providerProps?: {
        delayDuration?: number;
        skipDelayDuration?: number;
        disableHoverableContent?: boolean;
    };
    portalContainer?: HTMLElement | null;
    portalProps?: {
        container?: HTMLElement | null;
        forceMount?: boolean;
    };
    arrowProps?: WithStyle<HTMLAttributes<HTMLSpanElement>> & {
        width?: number | string;
        height?: number | string;
    };
    contentProps?: WithStyle<HTMLAttributes<HTMLDivElement>> & {
        forceMount?: boolean;
        side?: 'top' | 'bottom' | 'left' | 'right';
        align?: 'start' | 'center' | 'end';
        sideOffset?: number;
        alignOffset?: number;
        avoidCollisions?: boolean;
        onEscapeKeyDown?: (event: KeyboardEvent) => void;
    };
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    arrow?: boolean;
    offset?: number;
    disabled?: boolean;
    openDelay?: number;
    closeDelay?: number;
    classNames?: TooltipClassNames;
    styles?: TooltipStyles;
    children: ReactNode;
}

type TooltipStyles = Partial<Record<'root' | 'popup' | 'arrow', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Popover

`<Popover title="筛选" content={<Checkbox>仅看我的</Checkbox>}><Button>筛选</Button></Popover>`。默认点击触发，也可按 trigger 选择其他交互；open / onOpenChange 可受控。自定义挂载点用 portalContainer。弹层中需要明确确认或取消时可以用 Popconfirm，复杂录入可用 Dialog。

<!-- api:popover -->

可导入 `Popover`。

[类型与导出入口](packages/ui/src/components/popover/index.ts) · [交互说明](apps/docs/src/content/反馈/popover.md) · [可运行示例](apps/docs/src/examples/popover)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Button, Icon, Popover, Space, Text } from '@yuki-ui/react';

export default function BasicPopover() {
  return (
    <Space size="4" wrap>
      <Popover
        content={
          <div style={{ maxWidth: '16rem' }}>
            <Text size="sm" tone="secondary">
              这里是浮层内容。它可以包含多段文字、链接或按钮，而不打断当前页面。
            </Text>
          </div>
        }
      >
        <Button variant="outline">点击查看说明</Button>
      </Popover>

      <Popover
        title="快捷操作"
        content={
          <Space direction="vertical" size="2" align="start">
            <Button size="sm" variant="ghost">
              复制链接
            </Button>
            <Button size="sm" variant="ghost">
              导出为 Markdown
            </Button>
            <Button size="sm" variant="ghost" tone="danger">
              删除草稿
            </Button>
          </Space>
        }
      >
        <Button variant="ghost" iconOnly aria-label="更多操作">
          <Icon name="more-horizontal" />
        </Button>
      </Popover>
    </Space>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Popover(props: PopoverProps & RefAttributes<HTMLSpanElement>): ReactNode

type PopoverClassNames = Partial<Record<'root' | 'popup' | 'arrow' | 'title' | 'content', string>>;

interface PopoverProps extends Omit<WithStyle<HTMLAttributes<HTMLSpanElement>>, 'content' | 'title' | 'onChange'> {
    content?: ReactNode;
    title?: ReactNode;
    trigger?: PopoverTrigger | ReactElement;
    portalContainer?: HTMLElement | null;
    side?: Placement;
    placement?: Placement;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    arrow?: boolean;
    offset?: number;
    disabled?: boolean;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    classNames?: PopoverClassNames;
    styles?: PopoverStyles;
    children?: ReactNode;
}

type PopoverStyles = Partial<Record<'root' | 'popup' | 'arrow' | 'title' | 'content', StyleProperties>>;

type PopoverTrigger = 'click' | 'hover' | 'focus';

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Popconfirm

`<Popconfirm title="移除成员？" okTone="danger" onConfirm={remove}><Button>移除</Button></Popconfirm>`。description 描述影响，okText / cancelText 命名操作。onConfirm 可返回 Promise 来等待异步执行；在业务中处理失败说明，成功后更新数据。onCancel 用于用户取消。

<!-- api:popconfirm -->

可导入 `Popconfirm`。

[类型与导出入口](packages/ui/src/components/popconfirm/index.ts) · [交互说明](apps/docs/src/content/反馈/popconfirm.md) · [可运行示例](apps/docs/src/examples/popconfirm)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Button, Popconfirm, Space, message } from '@yuki-ui/react';

export default function BasicPopconfirm() {
  return (
    <Space wrap size="3">
      <Popconfirm
        title="删除该文件？"
        description="文件会移入回收站，30 天后自动清理。"
        onConfirm={() => {
          message.success('已移入回收站');
        }}
      >
        <Button tone="danger" variant="soft">
          删除文件
        </Button>
      </Popconfirm>

      <Popconfirm
        title="退出当前账号？"
        description="未同步的草稿会保留在本机。"
        okText="退出"
        onConfirm={() => {
          message.info('已退出');
        }}
        onCancel={() => {
          message.info('已取消');
        }}
      >
        <Button variant="outline">退出登录</Button>
      </Popconfirm>
    </Space>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Popconfirm(props: PopconfirmProps & RefAttributes<HTMLSpanElement>): ReactNode

type PopconfirmClassNames = Partial<Record<'root' | 'popup' | 'arrow' | 'body' | 'icon' | 'title' | 'description' | 'actions' | 'ok' | 'cancel', string>>;

interface PopconfirmProps extends Omit<PopoverProps, 'content' | 'title'> {
    title?: ReactNode;
    prompt?: ReactNode;
    confirmLabel?: ReactNode;
    cancelLabel?: ReactNode;
    description?: ReactNode;
    okText?: ReactNode;
    cancelText?: ReactNode;
    okTone?: 'primary' | 'danger';
    icon?: ReactNode | null;
    confirmLoading?: boolean;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
    classNames?: PopconfirmClassNames;
    styles?: PopconfirmStyles;
}

type PopconfirmStyles = Partial<Record<'root' | 'popup' | 'arrow' | 'body' | 'icon' | 'title' | 'description' | 'actions' | 'ok' | 'cancel', StyleProperties>>;
```

</details>

<!-- /api -->

### Dialog、DialogClose

`<Dialog title="编辑项目" trigger={<Button>编辑</Button>}>…</Dialog>` 提供打开和关闭焦点处理。open / onOpenChange 可以由父层控制，默认 modal=true。footer 放业务按钮，内部用 `<DialogClose asChild><Button>取消</Button></DialogClose>` 关闭。contentProps / overlayProps / portalProps 支持对应的 Radix 部位属性，需保留编辑状态时可使用 forceMount 部位选项。onOpenChange 反映请求的显隐，父层负责在受控模式写回。

<!-- api:dialog -->

可导入 `Dialog`、`DialogClose`。

[类型与导出入口](packages/ui/src/components/dialog/index.ts) · [交互说明](apps/docs/src/content/反馈/dialog.md) · [可运行示例](apps/docs/src/examples/dialog)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Button, Dialog, DialogClose, Input } from '@yuki-ui/react';

export default function EditProject() {
  const [project, setProject] = useState('设计系统');
  const [draft, setDraft] = useState(project);
  return (
    <Dialog
      title="项目名称"
      description="保存后将更新项目列表中的名称。"
      trigger={<Button variant="outline">重命名「{project}」</Button>}
      onOpenChange={(open) => { if (open) setDraft(project); }}
      footer={
        <DialogClose asChild>
          <Button disabled={!draft.trim()} onClick={() => setProject(draft.trim())}>保存</Button>
        </DialogClose>
      }
    >
      <Input aria-label="项目名称" value={draft} onChange={setDraft} />
    </Dialog>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Dialog(props: DialogProps & RefAttributes<HTMLDivElement>): ReactNode

DialogClose(props: WithStyle<Primitive.DialogCloseProps & RefAttributes<HTMLButtonElement>>): ReactNode

interface DialogProps extends ComponentPropsWithoutRef<typeof Primitive.Root> {
    trigger?: ReactElement;
    title: ReactNode;
    description?: ReactNode;
    footer?: ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    closeLabel?: string;
    portalContainer?: HTMLElement | null;
    portalProps?: Omit<ComponentPropsWithoutRef<typeof Primitive.Portal>, 'children'>;
    contentProps?: Omit<WithStyle<ComponentPropsWithoutRef<typeof Primitive.Content>>, 'children' | 'asChild'>;
    overlayProps?: Omit<WithStyle<ComponentPropsWithoutRef<typeof Primitive.Overlay>>, 'children' | 'asChild'>;
    titleProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Title>>;
    descriptionProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Description>>;
    bodyProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    footerProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    closeProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Close>>;
    showClose?: boolean;
    closeIcon?: ReactNode;
    animation?: AnimationOptions | false;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Modal

内置确认/取消页脚的任务用 `<Modal open={open} onOpenChange={setOpen} title="确认发布" onOk={publish}>…</Modal>`。onOk 返回的 Promise 成功后请求关闭，拒绝时对话框保持打开，错误文案由业务提供。footer={null} 可移除默认页脚。一次性确认可调用 `const handle = Modal.confirm({title:'删除？',onOk:remove})`，handle.update 或 handle.destroy 操作该实例；Modal.info / success / warning / error 显示相应提示。

<!-- api:modal -->

可导入 `Modal`。

[类型与导出入口](packages/ui/src/components/modal/index.ts) · [交互说明](apps/docs/src/content/反馈/modal.md) · [可运行示例](apps/docs/src/examples/modal)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Button, Modal, Space, Text } from '@yuki-ui/react';

export default function BasicModal() {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Space wrap size="3">
      <Button onClick={() => setOpen(true)}>打开对话框</Button>
      <Button variant="outline" onClick={() => setConfirmOpen(true)}>
        确认操作
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="重命名项目"
        description="名称会同步到所有协作者的工作区。"
        onOk={() => setOpen(false)}
      >
        <Text size="sm" tone="secondary">
          项目 ID 保持不变，历史提交与链接不会失效。
        </Text>
      </Modal>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="删除该草稿？"
        description="删除后无法恢复，此操作不可撤销。"
        okTone="danger"
        okText="删除"
        onOk={() => setConfirmOpen(false)}
      >
        <Text size="sm" tone="secondary">
          草稿包含 12 张图片与 3 个附件，删除后将从存储中移除。
        </Text>
      </Modal>
    </Space>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Modal.confirm(options: ModalMethodOptions): ModalMethodHandle

Modal.info(options: ModalMethodOptions): ModalMethodHandle

Modal.success(options: ModalMethodOptions): ModalMethodHandle

Modal.warning(options: ModalMethodOptions): ModalMethodHandle

Modal.error(options: ModalMethodOptions): ModalMethodHandle

Modal.destroy(id?: string): void

Modal(props: ModalProps & RefAttributes<HTMLDivElement>): ReactNode

type ModalClassNames = Partial<Record<'root' | 'mask' | 'dialog' | 'header' | 'title' | 'close' | 'body' | 'footer' | 'ok' | 'cancel', string>>;

interface ModalMethodHandle {
    id: string;
    destroy: () => void;
    update: (options: Partial<ModalMethodOptions>) => void;
}

interface ModalMethodOptions {
    title?: ReactNode;
    content?: ReactNode;
    description?: ReactNode;
    icon?: ReactNode | null;
    okText?: ReactNode;
    cancelText?: ReactNode;
    okTone?: ButtonTone;
    closable?: boolean;
    maskClosable?: boolean;
    size?: ModalSize;
    key?: string;
    className?: string;
    style?: StyleProperties;
    classNames?: ModalClassNames;
    styles?: ModalStyles;
    onOk?: () => void | Promise<void>;
    onCancel?: () => void;
}

interface ModalProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title' | 'content'> {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode | null;
    okText?: ReactNode;
    cancelText?: ReactNode;
    okTone?: ButtonTone;
    okLoading?: boolean;
    onOk?: () => void | Promise<void>;
    onCancel?: () => void;
    closable?: boolean;
    maskClosable?: boolean;
    closeOnEscape?: boolean;
    showMask?: boolean;
    centered?: boolean;
    size?: ModalSize;
    container?: HTMLElement | null;
    classNames?: ModalClassNames;
    styles?: ModalStyles;
}

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

type ModalStyles = Partial<Record<'root' | 'mask' | 'dialog' | 'header' | 'title' | 'close' | 'body' | 'footer' | 'ok' | 'cancel', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Drawer

`<Drawer title="筛选" trigger={<Button>打开筛选</Button>} placement="right" forceMount footer={null}>…</Drawer>`。侧面上下文适合编辑和浏览详情，默认从右侧打开。由 open/onOpenChange 控制显隐，内置页脚的 onOk 支持 Promise。forceMount 便于跨打开保留草稿，大型媒体子项可将 open 传给 active。

<!-- api:drawer -->

可导入 `Drawer`。

[类型与导出入口](packages/ui/src/components/drawer/index.ts) · [交互说明](apps/docs/src/content/反馈/drawer.md) · [可运行示例](apps/docs/src/examples/drawer)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Button, Drawer, Space, Text } from '@yuki-ui/react';

export default function BasicDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>打开抽屉</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="筛选条件"
        description="调整后立即应用于当前列表。"
        onOk={() => setOpen(false)}
      >
        <Space direction="vertical" size="4">
          <Text size="sm" tone="secondary">
            左侧面板承载轻量任务，不打断用户对列表上下文的感知。
          </Text>
          <div style={{ display: 'grid', gap: 'var(--yuki-space-2)' }}>
            <label style={{ fontSize: 'var(--yuki-font-size-sm)' }}>
              <input type="checkbox" defaultChecked /> 仅显示已归档
            </label>
            <label style={{ fontSize: 'var(--yuki-font-size-sm)' }}>
              <input type="checkbox" /> 仅显示我的关注
            </label>
            <label style={{ fontSize: 'var(--yuki-font-size-sm)' }}>
              <input type="checkbox" defaultChecked /> 包含子项目
            </label>
          </div>
        </Space>
      </Drawer>
    </>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Drawer(props: DrawerProps & RefAttributes<HTMLDivElement>): ReactNode

type DrawerClassNames = Partial<Record<'root' | 'mask' | 'panel' | 'header' | 'title' | 'close' | 'body' | 'footer' | 'ok' | 'cancel', string>>;

type DrawerPlacement = 'right' | 'left' | 'top' | 'bottom';

interface DrawerProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title' | 'content'> {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode | null;
    okText?: ReactNode;
    cancelText?: ReactNode;
    okTone?: ButtonTone;
    okLoading?: boolean;
    onOk?: () => void | Promise<void>;
    onCancel?: () => void;
    closable?: boolean;
    maskClosable?: boolean;
    closeOnEscape?: boolean;
    showMask?: boolean;
    placement?: DrawerPlacement;
    side?: DrawerPlacement;
    size?: DrawerSize;
    container?: HTMLElement | null;
    portalContainer?: HTMLElement | null;
    portalProps?: {
        container?: HTMLElement | null;
        forceMount?: boolean;
    };
    trigger?: ReactElement;
    forceMount?: boolean;
    classNames?: DrawerClassNames;
    styles?: DrawerStyles;
}

type DrawerSize = 'sm' | 'md' | 'lg';

type DrawerStyles = Partial<Record<'root' | 'mask' | 'panel' | 'header' | 'title' | 'close' | 'body' | 'footer' | 'ok' | 'cancel', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Message、MessageStack 与 message

`message.success('已保存')` 发全局短消息；message.open 接受内容或选项，message.loading 返回 {id,close,update} 便于更新同一任务。相同 key 再次 open 会替换现有项目，handle.update 的多次局部修改可累加。duration 以毫秒计算，0 为常驻。声明式 `<Message tone="info">正在同步</Message>` 可随业务组件生命周期渲染，MessageStack 接受 items / requestClose。Toast 和 toast 分别是 Message 和 message 的导出别名；全局命令式 API 使用独立的 React 根，优先挂载到首个 Provider 的浮层节点并继承该 DOM 位置的 CSS 变量。局部语言和行为默认值可用树内的 Message 或 ToastProvider / useToast。

<!-- api:message -->

可导入 `Message`、`MessageStack`、`Toast`、`message`、`toast`。

[类型与导出入口](packages/ui/src/components/message/index.ts) · [交互说明](apps/docs/src/content/反馈/message.md) · [可运行示例](apps/docs/src/examples/message)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Button, Space, message } from '@yuki-ui/react';

export default function BasicMessage() {
  return (
    <Space wrap size="3">
      <Button
        variant="soft"
        tone="success"
        onClick={() => message.success('提交成功，我们会尽快处理。')}
      >
        成功提示
      </Button>
      <Button variant="soft" tone="danger" onClick={() => message.error('网络异常，请稍后重试。')}>
        失败提示
      </Button>
      <Button variant="soft" tone="info" onClick={() => message.info('已复制到剪贴板。')}>
        普通提示
      </Button>
      <Button variant="soft" tone="warning" onClick={() => message.warning('当前内容尚未保存。')}>
        警告提示
      </Button>
      <Button
        variant="soft"
        onClick={() => {
          const handle = message.loading('正在同步数据…');
          window.setTimeout(() => handle.update({ tone: 'success', content: '同步完成', duration: 2000 }), 1200);
        }}
      >
        加载提示
      </Button>
    </Space>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Message(props: MessageProps & RefAttributes<HTMLDivElement>): ReactNode

MessageStack({ items, requestClose }: MessageStackProps): JSX.Element | null

Toast(props: MessageProps & RefAttributes<HTMLDivElement>): ReactNode

message.open(input: MessageOptions | ReactNode): MessageHandle

message.success(content: ReactNode, options?: MessageOptions): MessageHandle

message.error(content: ReactNode, options?: MessageOptions): MessageHandle

message.info(content: ReactNode, options?: MessageOptions): MessageHandle

message.warning(content: ReactNode, options?: MessageOptions): MessageHandle

message.loading(content: ReactNode, options?: MessageOptions): MessageHandle

message.destroy(id?: string): void

message.config(next: MessageConfig): void

toast.open(input: MessageOptions | ReactNode): MessageHandle

toast.success(content: ReactNode, options?: MessageOptions): MessageHandle

toast.error(content: ReactNode, options?: MessageOptions): MessageHandle

toast.info(content: ReactNode, options?: MessageOptions): MessageHandle

toast.warning(content: ReactNode, options?: MessageOptions): MessageHandle

toast.loading(content: ReactNode, options?: MessageOptions): MessageHandle

toast.destroy(id?: string): void

toast.config(next: MessageConfig): void

type MessageClassNames = Partial<Record<'root' | 'icon' | 'content' | 'action' | 'close', string>>;

interface MessageConfig {
    duration?: number;
    placement?: MessagePlacement;
    maxCount?: number;
    closable?: boolean;
}

interface MessageHandle {
    id: string;
    close: () => void;
    update: (options: Omit<MessageOptions, 'key'>) => void;
}

interface MessageOptions {
    content?: ReactNode;
    tone?: MessageTone;
    duration?: number;
    closable?: boolean;
    showIcon?: boolean;
    icon?: ReactNode;
    action?: ReactNode;
    placement?: MessagePlacement;
    key?: string;
    className?: string;
    style?: StyleProperties;
    classNames?: MessageClassNames;
    styles?: MessageStyles;
    onClose?: () => void;
}

type MessagePlacement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';

interface MessageProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title' | 'content'> {
    title?: ReactNode;
    duration?: number;
    onDismiss?: () => void;
    tone?: MessageTone;
    icon?: ReactNode;
    showIcon?: boolean;
    closable?: boolean;
    closeIcon?: ReactNode;
    action?: ReactNode;
    classNames?: MessageClassNames;
    styles?: MessageStyles;
    onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
}

interface MessageStackItem {
    id: string;
    content?: ReactNode;
    tone?: MessageTone;
    duration: number;
    closable?: boolean;
    showIcon?: boolean;
    icon?: ReactNode;
    action?: ReactNode;
    placement?: MessagePlacement;
    className?: string;
    style?: StyleProperties;
    classNames?: MessageClassNames;
    styles?: MessageStyles;
    onClose?: () => void;
}

interface MessageStackProps {
    items: readonly MessageStackItem[];
    requestClose: (id: string) => void;
}

type MessageStyles = Partial<Record<'root' | 'icon' | 'content' | 'action' | 'close', StyleProperties>>;

type MessageTone = 'success' | 'error' | 'info' | 'warning' | 'loading';

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Notification、NotificationStack 与 notification

`notification.info({title:'审批请求',description:'有一项变更需要复核',action:<Link href="/reviews">查看</Link>})`。通知卡支持指定角落、常驻、关闭及更新句柄。默认全局停留 4500ms，duration=0 常驻。声明式可用 `<Notification title="同步完成" />`，队列用 `<NotificationStack items={items} requestClose={removeById} />`。命令式调用可以放在业务事件完成处；局部主题、语言或自定义上下文需要精确随树传递时，在该子树内渲染通知组件。

<!-- api:notification -->

可导入 `Notification`、`NotificationStack`、`notification`。

[类型与导出入口](packages/ui/src/components/notification/index.ts) · [交互说明](apps/docs/src/content/反馈/notification.md) · [可运行示例](apps/docs/src/examples/notification)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Button, Space, notification } from '@yuki-ui/react';

export default function BasicNotification() {
  return (
    <Space wrap size="3">
      <Button
        variant="soft"
        tone="success"
        onClick={() =>
          notification.success({
            title: '部署成功',
            description: 'production 环境已更新到提交 9f2c1a3。',
          })
        }
      >
        成功通知
      </Button>
      <Button
        variant="soft"
        tone="danger"
        onClick={() =>
          notification.error({
            title: '同步失败',
            description: '无法连接到远端仓库，请检查凭据。',
          })
        }
      >
        错误通知
      </Button>
      <Button
        variant="soft"
        tone="info"
        onClick={() =>
          notification.info({
            title: '收到新评论',
            description: '林夏在《组件规范》中提到了你。',
          })
        }
      >
        消息通知
      </Button>
      <Button
        variant="soft"
        tone="warning"
        onClick={() =>
          notification.warning({
            title: '证书即将过期',
            description: 'SSL 证书将在 7 天后过期。',
          })
        }
      >
        警告通知
      </Button>
    </Space>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Notification(props: NotificationProps & RefAttributes<HTMLDivElement>): ReactNode

NotificationStack({ items, requestClose }: NotificationStackProps): JSX.Element | null

notification.open(input: NotificationOptions | ReactNode): NotificationHandle

notification.success(options: NotificationOptions): NotificationHandle

notification.error(options: NotificationOptions): NotificationHandle

notification.info(options: NotificationOptions): NotificationHandle

notification.warning(options: NotificationOptions): NotificationHandle

notification.loading(options: NotificationOptions): NotificationHandle

notification.destroy(id?: string): void

notification.config(next: NotificationConfig): void

type NotificationClassNames = Partial<Record<'root' | 'icon' | 'content' | 'title' | 'description' | 'action' | 'close', string>>;

interface NotificationConfig {
    duration?: number;
    placement?: NotificationPlacement;
    maxCount?: number;
    closable?: boolean;
}

interface NotificationHandle {
    id: string;
    close: () => void;
    update: (options: Omit<NotificationOptions, 'key'>) => void;
}

interface NotificationOptions {
    title?: ReactNode;
    description?: ReactNode;
    tone?: NotificationTone;
    duration?: number;
    closable?: boolean;
    showIcon?: boolean;
    icon?: ReactNode;
    action?: ReactNode;
    placement?: NotificationPlacement;
    key?: string;
    className?: string;
    style?: StyleProperties;
    classNames?: NotificationClassNames;
    styles?: NotificationStyles;
    onClose?: () => void;
}

type NotificationPlacement = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' | 'top' | 'bottom';

interface NotificationProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title' | 'content'> {
    title?: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    duration?: number;
    onDismiss?: () => void;
    tone?: NotificationTone;
    icon?: ReactNode;
    showIcon?: boolean;
    closable?: boolean;
    closeIcon?: ReactNode;
    action?: ReactNode;
    classNames?: NotificationClassNames;
    styles?: NotificationStyles;
    onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
}

interface NotificationStackItem {
    id: string;
    title?: ReactNode;
    description?: ReactNode;
    tone?: NotificationTone;
    duration: number;
    closable?: boolean;
    showIcon?: boolean;
    icon?: ReactNode;
    action?: ReactNode;
    placement?: NotificationPlacement;
    className?: string;
    style?: StyleProperties;
    classNames?: NotificationClassNames;
    styles?: NotificationStyles;
    onClose?: () => void;
}

interface NotificationStackProps {
    items: readonly NotificationStackItem[];
    requestClose: (id: string) => void;
}

type NotificationStyles = Partial<Record<'root' | 'icon' | 'content' | 'title' | 'description' | 'action' | 'close', StyleProperties>>;

type NotificationTone = 'success' | 'error' | 'info' | 'warning' | 'loading';

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### ToastProvider、useToast

在 ConfigProvider 下包一层 `<ToastProvider position="bottom-right" maxToasts={5}>…</ToastProvider>`。后代组件调用 `const {toast,dismiss}=useToast()`，`const id=toast({title:'已复制',variant:'success'})`，需要时 `dismiss(id,{animate:true})`。队列有自己独立的作用范围和位置，支持标题、说明、滑动关闭和自定义 action。useToast 应在 Provider 内调用。

<!-- api:toast -->

可导入 `ToastProvider`、`useToast`。

[类型与导出入口](packages/ui/src/components/toast/index.ts) · [交互说明](apps/docs/src/content/反馈/toast.md) · [可运行示例](apps/docs/src/examples/toast)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Button, ToastProvider, useToast } from '@yuki-ui/react';

function SaveChanges() {
  const { toast } = useToast();
  return <Button onClick={() => toast({ title: '更改已保存', description: '团队成员将在下一次打开项目时看到更新。', variant: 'success' })}>保存更改</Button>;
}

export default function ProjectNotice() {
  return <ToastProvider position="bottom-right" duration={5000} maxToasts={3}><SaveChanges /></ToastProvider>;
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
ToastProvider(input: ToastProviderProps): JSX.Element

useToast(): ToastContextValue

interface ToastContextValue {
    toast: (options: ToastOptions) => string;
    dismiss: (id: string, options?: ToastDismissOptions) => void;
}

interface ToastDismissOptions {
    animate?: boolean;
}

interface ToastOptions {
    title: ReactNode;
    description?: ReactNode;
    variant?: 'info' | 'success' | 'danger' | 'warning';
    duration?: number;
    icon?: ReactNode;
    action?: ReactNode;
    animation?: AnimationOptions | false;
    rootProps?: ToastRootProps;
    titleProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Title>>;
    descriptionProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Description>>;
    closeProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Close>>;
    hideClose?: boolean;
}

type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface ToastProviderProps {
    children: ReactNode;
    duration?: number;
    label?: string;
    closeLabel?: string;
    position?: ToastPosition;
    maxToasts?: number;
    portalContainer?: HTMLElement | null;
    providerProps?: Omit<WithStyle<ComponentPropsWithoutRef<typeof Primitive.Provider>>, 'children'>;
    viewportProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Viewport>>;
    toastProps?: Omit<ToastOptions, 'title' | 'description' | 'duration'>;
    animation?: AnimationOptions | false;
}

type ToastRootProps = Omit<ComponentPropsWithoutRef<typeof Primitive.Root>, 'children' | 'asChild' | 'open' | 'defaultOpen' | 'duration' | 'forceMount'>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Spin

`<Spin spinning={fetching} delay={150} tip="正在刷新"><Table … /></Spin>` 以遮罩反馈内容更新。delay 以毫秒计算，快速完成的请求可以避开闪烁。独立 Spin 用于空区域，fullscreen 用于没有 children 时覆盖整个视口。

<!-- api:spin -->

可导入 `Spin`。

[类型与导出入口](packages/ui/src/components/spin/index.ts) · [交互说明](apps/docs/src/content/反馈/spin.md) · [可运行示例](apps/docs/src/examples/spin)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Button, Space, Spin, Text } from '@yuki-ui/react';

export default function BasicSpin() {
  const [spinning, setSpinning] = useState(true);

  return (
    <Space direction="vertical" size="6">
      <Space wrap size="6" align="center">
        <Spin size="sm" />
        <Spin />
        <Spin size="lg" />
        <Spin tip="正在加载数据…" />
      </Space>

      <Space size="3">
        <Button onClick={() => setSpinning((value) => !value)}>
          {spinning ? '停止加载' : '开始加载'}
        </Button>
      </Space>

      <Spin spinning={spinning} tip="正在刷新列表…">
        <div
          style={{
            padding: 'var(--yuki-space-6)',
            border: '1px solid var(--yuki-color-border-subtle)',
            borderRadius: 'var(--yuki-radius-lg)',
          }}
        >
          <Text size="sm" tone="secondary">
            被遮罩的内容会保留布局尺寸，加载时不会发生跳动。
          </Text>
        </div>
      </Spin>
    </Space>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Spin(props: SpinProps & RefAttributes<HTMLDivElement>): ReactNode

type SpinClassNames = Partial<Record<'root' | 'content' | 'mask' | 'indicator' | 'tip', string>>;

interface SpinProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children'> {
    spinning?: boolean;
    size?: SpinSize;
    tip?: ReactNode;
    delay?: number;
    fullscreen?: boolean;
    icon?: ReactNode;
    label?: string;
    children?: ReactNode;
    classNames?: SpinClassNames;
    styles?: SpinStyles;
}

type SpinSize = 'sm' | 'md' | 'lg';

type SpinStyles = Partial<Record<'root' | 'content' | 'mask' | 'indicator' | 'tip', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Progress

`<Progress value={32} max={80} label="文件转换" />` 用业务单位表示完成量。`value={null}` 表示未知进度，已有百分数可直接传 percent。type 支持 line 或 circle；status 表示成功、异常等，formatValue 订制原始值/max 文案，format 接收百分比。若使用 value/max，就让它们作为单一计算来源。

<!-- api:progress -->

可导入 `Progress`。

[类型与导出入口](packages/ui/src/components/progress/index.ts) · [交互说明](apps/docs/src/content/反馈/progress.md) · [可运行示例](apps/docs/src/examples/progress)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Progress, Space } from '@yuki-ui/react';

export default function BasicProgress() {
  return (
    <Space direction="vertical" size="4">
      <Progress percent={32} />
      <Progress percent={68} tone="info" />
      <Progress percent={100} status="success" />
      <Progress percent={46} status="exception" strokeWidth={12} />
      <Progress percent={84} format={(value) => `${value} / 100 项`} showInfo />
    </Space>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Progress(props: ProgressProps & RefAttributes<HTMLDivElement>): ReactNode

type ProgressClassNames = Partial<Record<'root' | 'track' | 'bar' | 'text', string>>;

interface ProgressProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children'> {
    percent?: number;
    value?: number | null;
    max?: number;
    label?: ReactNode;
    showValue?: boolean;
    formatValue?: (value: number | null, max: number) => ReactNode;
    fieldProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    controlClassName?: string;
    controlStyle?: StyleProperties;
    fillProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    labelProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
    valueProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    animation?: AnimationOptions | false;
    type?: ProgressType;
    status?: ProgressStatus;
    tone?: ProgressTone;
    showInfo?: boolean;
    format?: (percent: number) => ReactNode;
    strokeWidth?: number;
    size?: number | Size;
    indeterminate?: boolean;
    sizePreset?: Size;
    classNames?: ProgressClassNames;
    styles?: ProgressStyles;
}

type ProgressStatus = 'normal' | 'success' | 'exception';

type ProgressStyles = Partial<Record<'root' | 'track' | 'bar' | 'text', StyleProperties>>;

type ProgressTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

type ProgressType = 'line' | 'circle';

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### EmptyState

`<EmptyState title="没有匹配记录" description="请调整筛选条件" action={<Button onClick={reset}>清除筛选</Button>} />`。title 必填，icon 和各部位 props 可以定制。适合直接传入 Table.empty 或 List.empty，使“无数据”与“无搜索结果”的原因和后续操作各自清晰。

<!-- api:empty-state -->

可导入 `EmptyState`。

[类型与导出入口](packages/ui/src/components/empty-state/index.ts) · [交互说明](apps/docs/src/content/反馈/empty-state.md) · [可运行示例](apps/docs/src/examples/empty-state)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Button, EmptyState } from '@yuki-ui/react';

export default function ProjectFilter() {
  const [filtered, setFiltered] = useState(true);
  return filtered ? (
    <EmptyState title="没有匹配的项目" description="当前仅显示已归档的项目。"
      action={<Button variant="outline" onClick={() => setFiltered(false)}>清除筛选</Button>} />
  ) : <div><p>设计系统</p><Button variant="ghost" onClick={() => setFiltered(true)}>仅看已归档</Button></div>;
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
EmptyState(props: EmptyStateProps & RefAttributes<HTMLDivElement>): ReactNode

interface EmptyStateProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title'> {
    title: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    action?: ReactNode;
    iconProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
    titleProps?: WithStyle<HTMLAttributes<HTMLHeadingElement>>;
    descriptionProps?: WithStyle<HTMLAttributes<HTMLParagraphElement>>;
    actionProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Result

`<Result status="success" title="已提交" subTitle="审批人将收到通知" extra={<Link href="/history">查看记录</Link>} />`。适合在步骤结束处呈现状态，支持常用 HTTP 错误码及自定义图标、内容和操作。需要整页重试、离线恢复、跳转倒计时等行为时选对应 PagePreset 组件。

<!-- api:result -->

可导入 `Result`。

[类型与导出入口](packages/ui/src/components/result/index.ts) · [交互说明](apps/docs/src/content/反馈/result.md) · [可运行示例](apps/docs/src/examples/result)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { Button, Result, Space } from '@yuki-ui/react';

export default function BasicResult() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)' }}>
      <Result
        status="success"
        title="发布成功"
        subTitle="站点已部署到 production 环境，预计 1 分钟内生效。"
        extra={
          <Space size="2">
            <Button>查看站点</Button>
            <Button variant="ghost">返回项目</Button>
          </Space>
        }
      />
      <Result
        status="warning"
        title="存在未保存的更改"
        subTitle="离开前请保存，否则本次编辑将丢失。"
        extra={<Button variant="outline">继续编辑</Button>}
      />
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Result(props: ResultProps & RefAttributes<HTMLDivElement>): ReactNode

type ResultClassNames = Partial<Record<'root' | 'icon' | 'content' | 'title' | 'subtitle' | 'extra', string>>;

interface ResultProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title' | 'children'> {
    status?: ResultStatus;
    title?: ReactNode;
    subTitle?: ReactNode;
    icon?: ReactNode;
    extra?: ReactNode;
    size?: Size;
    classNames?: ResultClassNames;
    styles?: ResultStyles;
}

type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '403' | '404' | '500';

type ResultStyles = Partial<Record<'root' | 'icon' | 'content' | 'title' | 'subtitle' | 'extra', StyleProperties>>;

type ResultTone = 'success' | 'danger' | 'warning' | 'info';

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### PagePreset 及状态页面

共享布局通过 title / description / illustration / footer / actions 定制。`primaryAction={{label:'项目列表',href:'/projects'}}` 生成链接，{label,onClick} 生成动作按钮。LinkComponent 可接入路由，layout 可选 compact 或 illustrated。

| 组件 | 最小调用与行为 |
| --- | --- |
| PagePreset | `<PagePreset title="准备就绪" description="现在可以开始" />` 组装应用专用状态页。 |
| ErrorPage | `<ErrorPage statusCode={403} />` 采用本地化权限提示，内置 401、403、404、500、503，默认 404。 |
| EmptyPage | `<EmptyPage reason="no-results" />` 表示无匹配，默认 no-data 表示尚无数据。 |
| ResultPage | `<ResultPage status="processing" />`，可选 success、failure、warning、processing。 |
| LoadingPage | `<LoadingPage value={done} max={total} onCancel={cancel} />`，value=null 为未知进度。由父层处理取消实际任务。 |
| MaintenancePage | `<MaintenancePage recoveryTime="18:00" onRetry={retry} />`。retry 接收 AbortSignal，传给 fetch 并在失败时拒绝 Promise。 |
| OfflinePage | `<OfflinePage online={online} onReconnect={reconnect} />`。可以显式传连接结果，也可用 Promise 结果驱动重连反馈。 |
| RedirectPage | `<RedirectPage href="/projects" autoRedirect delay={5} />`。默认由用户手动跳转，delay 单位为秒；onNavigate(href,{signal}) 可接路由，renderFallback(error,retry) 可呈现失败后的操作。 |

<!-- api:page-presets -->

可导入 `EmptyPage`、`ErrorPage`、`LoadingPage`、`MaintenancePage`、`OfflinePage`、`PagePreset`、`RedirectPage`、`ResultPage`、`isValidRedirectTarget`。

[类型与导出入口](packages/ui/src/components/page-presets/index.ts) · [交互说明](apps/docs/src/content/反馈/page-presets.md) · [可运行示例](apps/docs/src/examples/page-presets)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Button, EmptyPage, ErrorPage, LoadingPage, MaintenancePage, OfflinePage, RedirectPage, ResultPage, Space } from '@yuki-ui/react';

const states = ['错误', '空结果', '处理结果', '加载', '维护', '离线', '跳转'] as const;
type State = typeof states[number];

export default function PageStates() {
  const [state, setState] = useState<State>('错误');
  const [online, setOnline] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const preset = {
    错误: <ErrorPage statusCode={404} primaryAction={{ label: '返回项目', onClick: () => setState('空结果') }} />,
    空结果: <EmptyPage reason="no-results" />,
    处理结果: <ResultPage status="success" />,
    加载: <LoadingPage value={45} onCancel={() => setState('空结果')} />,
    维护: <MaintenancePage recoveryTime="18:00" onRetry={() => setState('处理结果')} />,
    离线: <OfflinePage online={online} onReconnect={() => setOnline(true)} />,
    跳转: <RedirectPage href="#/c/button" onNavigate={(href) => { window.location.hash = href; }} />,
  };
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-4)', width: '100%' }}>
      <Space wrap>
        {states.map((name) => (
          <Button key={name} size="sm" variant={name === state ? 'soft' : 'ghost'} aria-pressed={name === state}
            onClick={() => { setState(name); setOnline(false); setRefresh((n) => n + 1); }}>
            {name}
          </Button>
        ))}
      </Space>
      <div key={refresh}>{preset[state]}</div>
    </div>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
EmptyPage(props: EmptyPageProps & RefAttributes<HTMLDivElement>): ReactNode

ErrorPage(props: ErrorPageProps & RefAttributes<HTMLDivElement>): ReactNode

LoadingPage(props: LoadingPageProps & RefAttributes<HTMLDivElement>): ReactNode

MaintenancePage(props: MaintenancePageProps & RefAttributes<HTMLDivElement>): ReactNode

OfflinePage(props: OfflinePageProps & RefAttributes<HTMLDivElement>): ReactNode

PagePreset(props: PagePresetProps & RefAttributes<HTMLDivElement>): ReactNode

RedirectPage(props: RedirectPageProps & RefAttributes<HTMLDivElement>): ReactNode

ResultPage(props: ResultPageProps & RefAttributes<HTMLDivElement>): ReactNode

isValidRedirectTarget(href: string): boolean

interface EmptyPageProps extends PagePresetProps {
    reason?: 'no-data' | 'no-results';
}

interface ErrorPageProps extends PagePresetProps {
    statusCode?: string | number;
}

interface LoadingPageProps extends PagePresetProps {
    value?: number | null;
    max?: number;
    onCancel?: () => void;
    cancelLabel?: ReactNode;
    cancelProps?: Omit<ButtonProps, 'children'>;
}

interface MaintenancePageProps extends PagePresetProps {
    recoveryTime?: ReactNode;
    onRetry?: PageRetry;
    retryLabel?: ReactNode;
}

interface OfflinePageProps extends PagePresetProps {
    online?: boolean;
    onReconnect?: PageRetry;
    retryLabel?: ReactNode;
}

type PageAction = {
    label: ReactNode;
    href: string;
    linkProps?: Omit<WithStyle<AnchorHTMLAttributes<HTMLAnchorElement>>, 'href' | 'children'>;
} | {
    label: ReactNode;
    href?: never;
    onClick?: ButtonProps['onClick'];
    buttonProps?: Omit<ButtonProps, 'children'>;
};

type PageLayout = 'compact' | 'illustrated';

interface PagePresetProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title'> {
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

type PageRetry = (signal: AbortSignal) => void | Promise<void>;

interface RedirectPageProps extends PagePresetProps {
    href: string;
    autoRedirect?: boolean;
    delay?: number;
    targetDescription?: ReactNode;
    onNavigate?: (href: string, context: {
        signal: AbortSignal;
    }) => void | Promise<void>;
    onCancel?: () => void;
    navigateLabel?: ReactNode;
    cancelLabel?: ReactNode;
    renderFallback?: (error: Error, retry: () => void) => ReactNode;
}

interface ResultPageProps extends PagePresetProps {
    status?: 'success' | 'failure' | 'warning' | 'processing';
}

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

### Tour

`<Tour trigger={<Button>查看引导</Button>} steps={[{target:'#save',title:'保存',description:'提交当前修改'}]} />`。target 可用 CSS 选择器或返回节点的函数。current 从 0 开始，onCurrentChange 管步骤，onOpenChange 管导览显隐；onFinish 和 onSkip 分别记录完成或跳过。等目标元素已经挂载后再打开，保证遮罩定位准确。

<!-- api:tour -->

可导入 `Tour`。

[类型与导出入口](packages/ui/src/components/tour/index.ts) · [交互说明](apps/docs/src/content/反馈/tour.md) · [可运行示例](apps/docs/src/examples/tour)

<details>
<summary>完整 TSX 示例</summary>

```tsx
import { useState } from 'react';
import { Button, Space, Tour } from '@yuki-ui/react';

const steps = [
  {
    target: '#tour-basic-create',
    title: '创建项目',
    description: '从这里开始一个新的项目，模板会自动初始化目录结构。',
    placement: 'bottom' as const,
  },
  {
    target: '#tour-basic-search',
    title: '全局搜索',
    description: '按 ⌘K 搜索项目、成员与文档。',
    placement: 'bottom' as const,
  },
  {
    target: '#tour-basic-account',
    title: '账号与设置',
    description: '在这里管理通知偏好、快捷键与主题。',
    placement: 'left' as const,
  },
];

export default function BasicTour() {
  const [open, setOpen] = useState(false);
  const [finished, setFinished] = useState(false);

  return (
    <Space direction="vertical" size="6">
      <Space wrap size="3">
        <Button id="tour-basic-create" onClick={() => setOpen(true)}>
          创建项目
        </Button>
        <Button id="tour-basic-search" variant="outline">
          全局搜索
        </Button>
        <Button id="tour-basic-account" variant="ghost">
          账号设置
        </Button>
      </Space>

      <p style={{ margin: 0, fontSize: 'var(--yuki-font-size-sm)', color: 'var(--yuki-color-text-secondary)' }}>
        {finished ? '导览已完成，可随时重新开始。' : '点击「创建项目」开始三步导览。'}
      </p>

      <Tour
        open={open}
        onOpenChange={setOpen}
        steps={steps}
        onFinish={() => setFinished(true)}
        onSkip={() => setFinished(false)}
      />
    </Space>
  );
}
```

</details>

<details>
<summary>字段、回调与数据类型</summary>

```ts
Tour(props: TourProps & RefAttributes<HTMLDivElement>): ReactNode

type TourClassNames = Partial<Record<'root' | 'mask' | 'spotlight' | 'popup' | 'arrow' | 'header' | 'cover' | 'title' | 'description' | 'footer' | 'indicator' | 'actions' | 'skip' | 'prev' | 'next', string>>;

interface TourProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title' | 'content'> {
    steps: readonly TourStep[];
    trigger?: ReactElement<{
        onClick?: (event: MouseEvent<HTMLElement>) => void;
        'aria-haspopup'?: 'dialog';
        'aria-expanded'?: boolean;
    }>;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    current?: number;
    defaultCurrent?: number;
    onCurrentChange?: (current: number) => void;
    onFinish?: () => void;
    onSkip?: () => void;
    closeOnEscape?: boolean;
    mask?: boolean;
    maskClosable?: boolean;
    arrow?: boolean;
    keyboard?: boolean;
    scrollIntoView?: boolean;
    padding?: number;
    skipText?: ReactNode;
    prevText?: ReactNode;
    nextText?: ReactNode;
    finishText?: ReactNode;
    container?: HTMLElement | null;
    classNames?: TourClassNames;
    styles?: TourStyles;
}

interface TourStep {
    target?: string | (() => HTMLElement | null | undefined);
    title?: ReactNode;
    description?: ReactNode;
    cover?: ReactNode;
    placement?: Placement;
    className?: string;
    style?: StyleProperties;
}

type TourStyles = Partial<Record<'root' | 'mask' | 'spotlight' | 'popup' | 'arrow' | 'header' | 'cover' | 'title' | 'description' | 'footer' | 'indicator' | 'actions' | 'skip' | 'prev' | 'next', StyleProperties>>;

type WithStyle<Props> = Props & {
    style?: StyleProperties | undefined;
};
```

</details>

<!-- /api -->

## 公共 Hooks

公共 hooks 从包根具名导入。实现业务弹层时可用 useFloating 测量锚点和浮层，转交返回的 floatingStyles、arrowStyles 并根据 isPositioned 决定是否显示；useClickOutside 接受触发器和面板的 ref 列表，useEscapeKey 管 Escape，useFocusTrap / useScrollLock 按 active 开关启停。直接用内置弹层时由组件管理这些行为。

useControllableState 用于自建受控/非受控组件，返回当前值、更新函数和是否受控。useVirtualList 接收 count、固定 itemSize、scrollRef 和可选 overscan，返回 virtualItems、totalSize 以及滚动方法。useMergedRefs 合并内部 ref 与调用者 ref，useResizeObserver 读取尺寸，useMediaQuery / usePrefersReducedMotion 读取浏览器偏好，useEventCallback 为最新回调提供稳定入口。表单字段绑定 useFieldControl 的签名见 Form 节。

<!-- api:hooks -->

可导入 `useClickOutside`、`useControllableState`、`useEscapeKey`、`useEventCallback`、`useFloating`、`useFocusTrap`、`useMediaQuery`、`useMergedRefs`、`usePrefersReducedMotion`、`useResizeObserver`、`useScrollLock`、`useVirtualList`。

[类型与导出入口](packages/ui/src/hooks/index.ts)

<details>
<summary>字段、回调与数据类型</summary>

```ts
useClickOutside(refs: Array<RefObject<HTMLElement | null>>, handler: (event: PointerEvent) => void, enabled?: boolean): void

useControllableState<T>({ value, defaultValue, onChange }: UseControllableStateProps<T>): readonly [T, (next: T | ((previous: T) => T)) => void, boolean]

useEscapeKey(handler: EscapeHandler, enabled?: boolean, target?: HTMLElement | Document): void

useEventCallback<T extends (...args: never[]) => unknown>(callback: T): T

useFloating(options: UseFloatingOptions): UseFloatingResult

useFocusTrap(containerRef: RefObject<HTMLElement | null>, options: UseFocusTrapOptions): void

useMediaQuery(query: string): boolean

useMergedRefs<T>(...refs: PossibleRef<T>[]): RefCallback<T>

usePrefersReducedMotion(): boolean

useResizeObserver(ref: RefObject<HTMLElement | null>, callback?: (size: ElementSize) => void): ElementSize

useScrollLock(active: boolean): void

useVirtualList(options: UseVirtualListOptions): UseVirtualListResult

type Alignment = 'start' | 'center' | 'end';

interface ElementSize {
    width: number;
    height: number;
}

type Placement = Side | `${Side}-${Exclude<Alignment, 'center'>}`;

type Side = 'top' | 'right' | 'bottom' | 'left';

interface UseControllableStateProps<T> {
    value?: T;
    defaultValue: T | (() => T);
    onChange?: (value: T) => void;
}

interface UseFloatingOptions {
    open: boolean;
    anchorRef: RefObject<HTMLElement | null>;
    floatingRef: RefObject<HTMLElement | null>;
    placement?: Placement;
    offset?: number;
    alignOffset?: number;
    flip?: boolean;
    shift?: boolean;
    viewportPadding?: number;
    matchAnchorWidth?: boolean | 'minimum';
    arrowSize?: number;
}

interface UseFloatingResult {
    floatingStyles: StyleProperties;
    arrowStyles: StyleProperties;
    actualPlacement: Placement;
    isPositioned: boolean;
    update: () => void;
    measure: () => void;
}

interface UseFocusTrapOptions {
    active: boolean;
    initialFocus?: RefObject<HTMLElement | null> | (() => HTMLElement | null) | null;
    restoreFocus?: boolean;
    onDeactivate?: () => void;
}

interface UseVirtualListOptions {
    count: number;
    itemSize: number;
    overscan?: number;
    scrollRef: RefObject<HTMLElement | null>;
    enabled?: boolean;
}

interface UseVirtualListResult {
    virtualItems: VirtualItem[];
    totalSize: number;
    range: {
        start: number;
        end: number;
    };
    scrollToIndex: (index: number, align?: 'start' | 'center' | 'end' | 'auto' | 'nearest') => void;
    scrollToOffset: (offset: number) => void;
}

interface VirtualItem {
    index: number;
    start: number;
    size: number;
    end: number;
}

type EscapeHandler = (event: KeyboardEvent) => void;

type PossibleRef<T> = Ref<T> | undefined | null;
```

</details>

<!-- /api -->

维护本文时编辑各小节的示例与说明，在仓库根目录运行 `node scripts/ai-guide.mjs` 同步入口及字段。`node scripts/ai-guide.mjs --check` 检查组件目录覆盖和签名漂移。

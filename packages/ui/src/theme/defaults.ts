import type { ModalProps } from '../components/modal';
import type { DropdownProps } from '../components/dropdown';
import type { ResultProps } from '../components/result';
import type { EmptyProps } from '../components/empty';
import type { DividerProps } from '../components/divider';
import type { ImageProps } from '../components/image';
import type { FlexProps } from '../components/flex';
import type { SpaceProps } from '../components/space';
import type { GridProps } from '../components/grid';
import type { ContainerProps } from '../components/container';
import type { AspectRatioProps } from '../components/aspect-ratio';
import type { AffixProps } from '../components/affix';
import type { ScrollbarProps } from '../components/scrollbar';
import type { LinkProps } from '../components/link';
import type { TypographyBaseProps } from '../components/typography';
import type { SpinProps } from '../components/spin';
import type { TagProps } from '../components/tag';
import type { StatisticProps } from '../components/statistic';
import type { DescriptionsProps } from '../components/descriptions';
import type { ListProps } from '../components/list';
import type { TimelineProps } from '../components/timeline';
import type { StepsProps } from '../components/steps';
import type { AnchorProps } from '../components/anchor';
import type { BreadcrumbProps } from '../components/breadcrumb';
import type { MenuProps } from '../components/menu';
import type { DatePickerProps } from '../components/date-picker';
import type { TimePickerProps } from '../components/time-picker';
import type { InputNumberProps } from '../components/input-number';
import type { ColorPickerProps } from '../components/color-picker';
import type { SearchProps } from '../components/search';
import type { DateRangePickerProps } from '../components/date-range-picker';
import type { FormProps } from '../components/form';
import type { RadioProps } from '../components/radio';
import type { RateProps } from '../components/rate';
import type { TransferProps } from '../components/transfer';
import type { BatchUploadProps, UploadProps } from '../components/upload';
import type { WatermarkProps } from '../components/watermark';
import type { QRCodeProps } from '../components/qr-code';
import type { PopoverProps } from '../components/popover';
import type { PopconfirmProps } from '../components/popconfirm';
import type { DrawerProps } from '../components/drawer';
import type { BackTopProps } from '../components/back-top';
import type { TreeProps } from '../components/tree';
import type { TreeSelectProps } from '../components/tree-select';
import type { CascaderProps } from '../components/cascader';
import type { MentionsProps } from '../components/mentions';
import type { CalendarProps } from '../components/calendar';
import type { CarouselProps } from '../components/carousel';
import type { SplitterProps } from '../components/splitter';
import type { TourProps } from '../components/tour';
import type { MessageProps } from '../components/message';
import type { NotificationProps } from '../components/notification';
import type { TableProps } from '../components/table';
import type { AccordionProps } from '../components/accordion';
import type { AlertProps } from '../components/alert';
import type { AvatarProps, AvatarGroupProps } from '../components/avatar';
import type { BadgeProps } from '../components/badge';
import type { ButtonProps } from '../components/button';
import type { CardProps } from '../components/card';
import type { CheckboxProps } from '../components/checkbox';
import type { DialogProps } from '../components/dialog';
import type { EmptyStateProps } from '../components/empty-state';
import type { InputProps } from '../components/input';
import type { IconProps } from '../components/icon';
import type { PaginationProps } from '../components/pagination';
import type { ProgressProps } from '../components/progress';
import type { RadioGroupProps } from '../components/radio-group';
import type { SelectProps } from '../components/select';
import type { SkeletonProps } from '../components/skeleton';
import type { RangeSliderProps, SliderProps } from '../components/slider';
import type { SwitchProps } from '../components/switch';
import type { TabsProps } from '../components/tabs';
import type { TextareaProps } from '../components/textarea';
import type { ToastProviderProps } from '../components/toast';
import type { TooltipProps } from '../components/tooltip';
import type { CodeBlockProps } from '../components/code-block';
import type { MarkdownProps } from '../components/markdown';
import type { DocumentViewerProps } from '../components/document-viewer';
import type { VideoPlayerProps } from '../components/video-player';
import type { AudioPlayerProps } from '../components/audio-player';
import type { ContentRendererProps } from '../components/content-renderer';
import type { ImageViewerProps } from '../components/image-viewer';
import type {
  PagePresetProps,
  ErrorPageProps,
  EmptyPageProps,
  ResultPageProps,
  LoadingPageProps,
  MaintenancePageProps,
  OfflinePageProps,
  RedirectPageProps,
} from '../components/page-presets';

/** Defaults configure presentation; instances own content, state and business callbacks. */
type Defaults<Props> = {
  [
    Key in keyof Props as Key extends
      | `on${string}`
      | 'children'
      | 'value'
      | 'defaultValue'
      | 'checked'
      | 'defaultChecked'
      | 'open'
      | 'defaultOpen'
      | 'src'
      | 'options'
      | 'page'
      | 'totalPages'
      | 'trigger'
      | 'title'
      | 'content'
      | 'name'
      | 'id'
      | 'href'
      | 'autoRedirect'
      ? never
      : Key
  ]?: Props[Key];
};

export interface ComponentDefaults {
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

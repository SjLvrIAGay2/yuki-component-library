---
title: 图片 Image
group: 数据展示
description: 在保留宽高比的前提下展示图片，支持加载占位、失败回退与点击预览。
order: 130
---

## 何时使用

- 展示内容图片、封面图或相册时。
- 需要点击放大预览并支持焦点陷阱与 Esc 关闭时。
- 图片加载失败需要稳定回退时。

## 基础用法

<Demo id="image/01-basic" />

## 深度定制

悬停或聚焦缩略图可显示自定义遮罩。打开全屏预览后，使用放大、缩小按钮调节比例，点击百分比可复位。聚焦图片后，按加号、减号或 0 也可执行对应操作。放大后的图片支持滚动查看。

<Demo id="image/02-custom" />

## API

### Image

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| src | 图片地址或本地文件 | MediaSource | — |
| alt | 替代文本 | string | — |
| width | 宽度 | number | string | — |
| height | 高度 | number | string | — |
| fit | 填充方式 | CSSProperties["objectFit"] | cover |
| fallback | 加载失败内容 | ReactNode | — |
| placeholder | 加载中占位内容 | ReactNode | — |
| preview | 开启预览，或传入预览配置 | boolean | ImagePreviewConfig | false |
| mask | 悬浮遮罩内容，false 关闭 | ReactNode | false | — |
| size | 尺寸档位 | Size | 继承 ConfigProvider |
| imgProps | 透传给 img 的属性 | ImgHTMLAttributes | — |
| classNames | 语义节点类名 | ImageClassNames | — |
| styles | 语义节点内联样式 | ImageStyles | — |

### ImagePreviewConfig

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| open | 受控预览开关 | boolean | — |
| defaultOpen | 非受控初始开关 | boolean | false |
| onOpenChange | 开关变化回调 | (open: boolean) => void | — |
| src | 预览使用的地址或本地文件 | MediaSource | — |
| closable | 是否显示关闭按钮 | boolean | true |
| maskClosable | 点击遮罩关闭 | boolean | true |
| closeIcon | 自定义关闭图标 | ReactNode | — |

## 定制点

- **设计 Token**：`--yuki-image-bg`、`--yuki-image-radius`、`--yuki-image-mask-bg`、`--yuki-image-mask-color`、`--yuki-image-placeholder-bg`、`--yuki-image-fallback-bg`、`--yuki-image-duration/easing`。
- **类名与样式**：`classNames` 可覆盖 `root`、`img`、`mask`、`fallback`、`placeholder`、`preview`、`previewClose`、`previewImage` 八个语义节点。；`className`、`style` 作用于根节点。
- **结构**：根节点带 `data-slot="image"` 与 `data-size`，`data-status` 表示 loading、loaded、error，`data-preview` 表示是否可预览。
- **行为**：受控与非受控用法一致，所有文案均可通过 ConfigProvider 的 locale 覆盖。

## 无障碍

- 可预览时根节点可聚焦，带 `role="button"`、`aria-haspopup="dialog"`，Enter/Space 打开。
- 预览层是模态对话框：`role="dialog"` + `aria-modal`，打开时焦点陷阱、锁定滚动、Esc 关闭，关闭后焦点归还触发元素。
- 图片替代文本缺失时使用默认「预览图片」作为可访问名称。

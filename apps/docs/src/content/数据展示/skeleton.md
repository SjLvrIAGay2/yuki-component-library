---
title: 骨架屏 Skeleton
group: 数据展示
description: 在内容加载完成前占位，降低布局跳动并传达「正在加载」。
order: 40
---

## 何时使用

- 首屏或列表数据尚未返回时。
- 需要保持布局稳定、避免内容闪烁时。
- 需要在加载完成后平滑替换为真实内容时。

## 基础用法

<Demo id="skeleton/01-basic" />

## 深度定制

<Demo id="skeleton/02-custom" />

## API

### Skeleton

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| loading | 为 false 时直接渲染 children | boolean | true |
| active | 是否播放呼吸动画，尊重 prefers-reduced-motion | boolean | true |
| avatar | 头像骨架，或头像配置 | boolean | SkeletonAvatarProps | true |
| title | 标题骨架，或标题配置 | boolean | SkeletonTitleProps | true |
| paragraph | 段落骨架，或段落配置 | boolean | SkeletonParagraphProps | true |
| round | 使用全圆角 | boolean | false |
| classNames | 语义节点类名 | SkeletonClassNames | — |
| styles | 语义节点内联样式 | SkeletonStyles | — |
| width、height、circle | 显示指定宽高的独立骨架块，circle 为圆形 | CSS 尺寸、boolean | — |

## 定制点

- **设计 Token**：`--yuki-skeleton-block-bg`、`--yuki-skeleton-radius`、`--yuki-skeleton-row-height`、`--yuki-skeleton-title-height`、`--yuki-skeleton-gap`。
- **类名与样式**：`classNames` 可覆盖 `root`、`avatar`、`content`、`title`、`paragraph`、`row` 六个语义节点。；`className`、`style` 作用于根节点。
- **结构**：根节点带 `data-slot="skeleton"` 与 `data-size`，`data-loading`、`data-active` 表示加载与动画状态。
- **行为**：受控与非受控用法一致，所有文案均可通过 ConfigProvider 的 locale 覆盖。

## 无障碍

- 骨架容器带 `role="status"`、`aria-busy="true"`，并附视觉隐藏的「加载中」文本。
- 动画在系统开启「减少动态效果」时自动关闭。
- `loading={false}` 时骨架完全移除，只保留 children。

---
title: 时间轴 Timeline
group: 数据展示
description: 按时间顺序展示事件流、流程进度或变更记录。
order: 90
---

## 何时使用

- 展示操作日志、审批流程、版本历史时。
- 需要左右交错或倒序展示时间线时。
- 需要在末尾提示「进行中 / 等待中」时。

## 基础用法

<Demo id="timeline/01-basic" />

## 深度定制

<Demo id="timeline/02-custom" />

## API

### Timeline

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 时间轴节点列表 | TimelineItem[] | [] |
| mode | 排列方式：start、alternate | TimelineMode | start |
| reverse | 是否倒序渲染 | boolean | false |
| pending | 末尾待定节点文案，false 关闭 | ReactNode | false | — |
| pendingDot | 自定义待定节点图标 | ReactNode | — |
| size | 尺寸：sm、md、lg | Size | 继承 ConfigProvider |
| children | 直接传入 Timeline.Item 子节点 | ReactNode | — |
| classNames | 语义节点类名 | TimelineClassNames | — |
| styles | 语义节点内联样式 | TimelineStyles | — |

### TimelineItem

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| key | 唯一标识 | string | number | — |
| children | 节点内容 | ReactNode | — |
| label | 时间或辅助说明 | ReactNode | — |
| color | 颜色：default、primary、success、warning、danger，或任意 CSS 颜色 | TimelineColor | default |
| dot | 自定义节点图标 | ReactNode | — |
| position | alternate 模式下强制左右位置 | start | end | — |
| className | 节点类名 | string | — |
| style | 节点内联样式 | CSSProperties | — |

## 定制点

- **设计 Token**：`--yuki-timeline-rail-width`、`--yuki-timeline-line-width`、`--yuki-timeline-line-color`、`--yuki-timeline-dot-size`、`--yuki-timeline-dot-color`、`--yuki-timeline-item-gap`。
- **类名与样式**：`classNames` 可覆盖 `root`、`item`、`rail`、`dot`、`line`、`content`、`label`、`body`、`pending` 九个语义节点。；`className`、`style` 作用于根节点。
- **结构**：根节点带 `data-slot="timeline"` 与 `data-size`，`data-color` 表示命名的语义颜色，自定义颜色通过 `--yuki-timeline-dot-color` 变量下发；`data-mode` 表示排列方式。
- **行为**：受控与非受控用法一致，所有文案均可通过 ConfigProvider 的 locale 覆盖。

## 无障碍

- 使用语义化列表结构，每个节点是 `listitem`，读屏会按顺序朗读。
- 自定义 `dot` 图标默认为装饰性，如需表达含义请同时提供文案。
- 颜色不单独承载语义，状态信息应写在文本中。

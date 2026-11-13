---
title: Splitter
group: 布局
description: 可拖拽的双面板分割器，支持键盘调整、受控尺寸与自定义手柄。
order: 6
---

## 何时使用

用于让用户自行分配两块内容的宽度/高度：代码编辑器与预览、目录与正文、列表与详情。若比例固定，请直接用 Grid 或 Flex，不需要引入拖拽交互。

## 基础用法

<Demo id="splitter/01-basic" />

## 深度定制

`size` 受控时可在拖拽过程中读取百分比（`onResize`），松手时提交（`onResizeEnd`）；`handle` 可替换整个手柄，`classNames/styles` 可细化到每个面板与分隔线。

<Demo id="splitter/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| direction | 分割方向 | `horizontal ｜ vertical` | `horizontal` |
| size | 首面板百分比（受控） | `number` | — |
| defaultSize | 首面板默认百分比 | `number` | `50` |
| min / max | 允许的最小/最大百分比 | `number` | `10` / `90` |
| step | 键盘调整步长（百分比） | `number` | `1` |
| disabled | 禁用拖拽与键盘调整 | `boolean` | `false` |
| onResize | 调整过程中回调 | `(size: number) => void` | — |
| onResizeEnd | 调整结束回调 | `(size: number) => void` | — |
| handle | 自定义手柄节点 | `ReactNode` | 默认分隔线 |
| classNames | `{ root, pane, firstPane, secondPane, handle, line }` | — | — |
| styles | 同上 | — | — |
| children | 两个面板节点 | `[ReactNode, ReactNode]` | — |

## 定制点

- **Token**：手柄命中区 `--yuki-splitter-handle-hit`、线宽 `--yuki-splitter-handle-line-thickness`、线长 `--yuki-splitter-handle-line-length`、手柄颜色 `--yuki-splitter-handle-color` 与激活色。
- **类名/样式**：`classNames.root | pane | firstPane | secondPane | handle | line`、`styles.*`。
- **结构**：`handle` 插槽替换默认手柄；两个 panel 内容完全由使用者提供。
- **行为**：`direction`、`size`/`defaultSize`、`min`/`max`、`step`、`disabled`、`onResize`、`onResizeEnd`。

## 无障碍

- 手柄是 `role="separator"`，带 `aria-valuemin`、`aria-valuemax`、`aria-valuenow` 与可访问名称。
- 键盘：`ArrowLeft/ArrowRight`（水平）或 `ArrowUp/ArrowDown`（垂直）按 `step` 调整，`Home` / `End` 跳到最小 / 最大。
- 指针拖拽使用 pointer 事件并监听 `pointercancel`，触屏与手写笔同样可用。

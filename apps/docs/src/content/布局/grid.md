---
title: Grid
group: 布局
description: 12 栅格布局，支持间距、对齐、起始列与 xs–xl 响应式跨度。
order: 1
---

## 何时使用

用于页面级或表单级的分栏对齐。若只是横向排列几个元素，优先用 Flex 或 Space；Grid 的价值在于**同一套列宽约束**贯穿整页。

- `Grid`：栅格容器，默认 12 列
- `GridItem`：栅格单元，`span` 控制占列数，`responsive` 为不同断点指定跨度

## 基础用法

<Demo id="grid/01-basic" />

## 深度定制

响应式跨度在 `responsive` 中声明，映射到 `sm / md / lg / xl` 断点；`gap`、`rowGap`、`columnGap` 接受 SpaceSize token，避免出现随手写的像素。

<Demo id="grid/02-responsive" />

## API

### Grid

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 列数 | `number` | `12` |
| gap | 行列间距 | `SpaceSize` | `4` |
| rowGap | 行间距 | `SpaceSize` | 继承 gap |
| columnGap | 列间距 | `SpaceSize` | 继承 gap |
| align | 单元格纵向对齐 | `start ｜ center ｜ end ｜ stretch` | `stretch` |
| justify | 整行水平分布 | `start ｜ center ｜ end ｜ stretch ｜ between ｜ around` | `start` |
| classNames / styles | `{ root }` | — | — |

### GridItem

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| span | 基础跨度（1–12） | `number` | `12` |
| start | 起始列 | `number` | — |
| responsive | 断点跨度 | `{ sm?, md?, lg?, xl? }` | — |
| classNames / styles | `{ root }` | — | — |

## 定制点

- **Token**：间距消费 `--yuki-space-*`，断点使用 `--yuki-breakpoint-*` 对应的媒体查询；组件 token `--yuki-grid-columns`。
- **类名/样式**：`classNames.root`、`styles.root`，以及容器级 CSS 变量 `--yuki-grid-columns`。
- **结构**：`GridItem` 内可放任意节点，单元格本身不包裹额外 DOM。
- **行为**：`columns`、`gap`、`align`、`justify`、`span`、`start`、`responsive`。

## 无障碍

- Grid 仅改变布局，不改变 DOM 顺序；请保证 DOM 顺序与阅读顺序一致。
- 不要把 Grid 用作语义表格；数据表格请使用 Table。

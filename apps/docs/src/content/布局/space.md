---
title: Space
group: 布局
description: 为子元素之间自动插入间距，并支持自定义分隔节点。
order: 3
---

## 何时使用

Space 只做一件事：在**相邻子元素之间**插入一致间距，而不改变子元素自身的布局方式。它最适合行内按钮组、标签列表、面包屑式的短元素序列；需要对齐与伸缩时用 Flex。

与 Flex 的 `gap` 相比，Space 额外提供：

- `split` 分隔节点，可插入 Divider、圆点或任意 ReactNode
- `size` 接受 `[水平, 垂直]` 元组，分别控制两轴间距
- 自动过滤 `null`、`undefined`、`false` 子节点，条件渲染不会留下多余间距

## 基础用法

<Demo id="space/01-basic" />

## 深度定制

垂直排列、换行与分隔符组合使用，可以搭出设置项列表与元信息行。

<Demo id="space/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| direction | 排列方向 | `horizontal ｜ vertical` | `horizontal` |
| size | 间距；元组为 `[水平, 垂直]` | `SpaceSize ｜ [SpaceSize, SpaceSize]` | `2` |
| align | 交叉轴对齐 | `start ｜ center ｜ end ｜ baseline` | `center` |
| wrap | 是否换行 | `boolean` | `false` |
| split | 子元素之间的分隔节点 | `ReactNode` | — |
| classNames | `{ root, item, split }` | — | — |
| styles | `{ root, item, split }` | — | — |

## 定制点

- **Token**：间距映射 `--yuki-space-*`，通过 `--yuki-space-gap` 与 `--yuki-space-row-gap` 下发。
- **类名/样式**：`classNames.root | item | split`、`styles.*`。
- **结构**：`split` 可替换为任意节点；每个子元素被包进带 `data-slot="item"` 的 div。
- **行为**：`direction`、`size`、`align`、`wrap`。

## 无障碍

- 分隔节点输出 `aria-hidden="true"`，不会被读屏重复朗读。
- 若子元素本身需要成为列表语义，请在 Space 外层使用 `ul/li`，不要依赖视觉间距表达分组。

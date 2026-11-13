---
title: Scrollbar 滚动条
group: 其他
description: 自定义滚动条容器，支持横向、纵向与悬停显示。
order: 2
---

# Scrollbar 滚动条

Scrollbar 包裹滚动内容，隐藏原生滚动条并绘制自定义滑块，让滚动条在各浏览器与主题下保持一致。

## 何时使用

- 需要统一跨浏览器的滚动条外观。
- 深色主题或定制品牌风格下，原生滚动条突兀。
- 需要横向滚动，或只在悬停时显示滑块。

## 基础用法

给根节点设定高度后包裹内容即可。默认纵向滚动、滑块常显。

<Demo id="scrollbar/01-basic" />

## 深度定制

- `direction="both"` 同时支持横向与纵向，`horizontal` 只保留横向。
- `visibility="hover"` 仅在悬停或拖动时显示滑块。
- `size` 调整滑块厚度，`focusable={false}` 关闭容器键盘聚焦。
- `onScroll` 透传滚动事件，便于实现懒加载或滚动联动。

<Demo id="scrollbar/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| direction | 滚动方向 | `vertical ｜ horizontal ｜ both` | `vertical` |
| visibility | 滑块显示时机 | `always ｜ hover` | `always` |
| size | 滑块厚度（px） | `number` | `--yuki-scrollbar-size` |
| focusable | 视口可键盘聚焦 | `boolean` | `true` |
| onScroll | 滚动事件 | `UIEventHandler` | — |
| classNames | `{ root, view, track, trackX, trackY, thumb, thumbX, thumbY }` | — | — |
| styles | 同上 | — | — |

## 定制点

- **Token**：`--yuki-scrollbar-size`、`--yuki-scrollbar-thumb`、`--yuki-scrollbar-thumb-hover`、`--yuki-radius-full`。
- **类名/样式**：轨道与滑块按方向拆分插槽，可单独定制。
- **结构**：原生滚动条通过 `scrollbar-width: none` 与伪元素隐藏，滑块尺寸根据滚动比例计算。

## 无障碍

- 视口默认 `tabIndex={0}`，聚焦后可用方向键、PageUp / PageDown 等原生滚动按键。
- 滑块带 `role="scrollbar"`、`aria-orientation`、`aria-valuenow/min/max`；轨道对辅助技术隐藏。
- 拖动滑块支持指针事件，触屏上仍可原生惯性滚动。

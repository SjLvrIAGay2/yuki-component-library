---
title: AspectRatio
group: 布局
description: 锁定宽高比的内容容器，为媒体、缩略图与骨架屏提供稳定占位。
order: 5
---

## 何时使用

当一块内容的**高度应由宽度推导**时使用：封面图、视频、头像、产品缩略图、骨架屏。提前锁定比例可以避免图片加载完成时的布局跳动（CLS）。

## 基础用法

<Demo id="aspect-ratio/01-basic" />

## 深度定制

`ratio` 接受数字（如 `16 / 9` 的 `1.777…`）或任意 CSS 比例字符串；内部子元素自动铺满并裁切媒体。无原生 `aspect-ratio` 支持的浏览器会回退到 padding-top 方案。

<Demo id="aspect-ratio/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| ratio | 宽高比 | `number ｜ string` | `1` |
| classNames | `{ root, content }` | — | — |
| styles | `{ root, content }` | — | — |

## 定制点

- **Token**：圆角与背景继承外层或使用组件 token，比例通过内联 `--yuki-aspect-ratio` 下发。
- **类名/样式**：`classNames.root | content`、`styles.*`。
- **结构**：`children` 放入 `data-slot="content"` 层；`img/video/iframe` 自动 `object-fit: cover`。
- **行为**：`ratio` 可为数字或字符串。

## 无障碍

- 仅作为布局容器，不引入语义；图片请提供 `alt`，装饰图用 `alt=""`。
- 视频请提供控制条与字幕；AspectRatio 不替代媒体自身的可访问性要求。

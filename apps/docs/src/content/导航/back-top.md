---
title: BackTop 回到顶部
group: 导航
description: 滚动一定距离后出现，一键平滑回到顶部。
order: 6
---

# BackTop 回到顶部

BackTop 是一个悬浮按钮，滚动超过阈值后出现，点击后把滚动容器平滑滚动到顶部。

## 何时使用

- 页面或容器内容较长，用户需要快速返回起点。
- 内容以阅读为主，滚动距离明显的场景。
- 一屏内即可看完的页面无需使用。

## 基础用法

默认监听 `window`，`visibilityHeight` 控制出现阈值。`target` 可指定任意滚动容器。

<Demo id="back-top/01-basic" />

## 深度定制

- 自定义出现阈值与内容（`children`），或用 `size` 调整按钮尺寸。
- 通过 `target` 绑定到内部滚动容器，常见于抽屉、弹层与侧栏。
- `onClick` 可先执行清理逻辑，`preventDefault` 后不再自动滚动。

<Demo id="back-top/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| visibilityHeight | 出现阈值（px） | `number` | `400` |
| target | 滚动容器工厂 | `() => HTMLElement ｜ Window ｜ null` | `window` |
| size | 按钮尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| children | 自定义内容 | `ReactNode` | 箭头图标 |
| onClick | 点击回调 | `MouseEventHandler` | — |
| classNames | `{ root, arrow, content }` | — | — |
| styles | 同上 | — | — |

## 定制点

- **Token**：`--yuki-back-top-size`、`--yuki-back-top-offset-block`、`--yuki-back-top-offset-inline`、`--yuki-back-top-bg`、`--yuki-back-top-color`、`--yuki-back-top-arrow-size` 等。
- **类名/样式**：根按钮、箭头与自定义内容均可定制。
- **结构**：默认箭头由 CSS 绘制，不依赖图标字体。

## 无障碍

- 按钮带 `aria-label="回到顶部"`（可由 `aria-label` 覆盖），并响应键盘 `Enter` / `Space`。
- 聚焦时显示统一的 focus ring。
- 开启「减少动态效果」时使用瞬时滚动而非平滑滚动。

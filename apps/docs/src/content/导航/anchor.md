---
title: Anchor 锚点
group: 导航
description: 滚动时自动高亮当前区块，点击可跳转到对应位置。
order: 5
---

# Anchor 锚点

锚点导航用于长页面内的区块定位：点击链接滚动到目标，滚动时自动高亮当前所在区块。使用 IntersectionObserver 监听，兼顾性能与精度。

## 何时使用

- 页面内容较长、包含多个同级区块，需要快速跳转。
- 需要让用户随时了解当前阅读位置。
- 页面区块不足两个时不必使用。

## 基础用法

`items` 描述锚点，`href` 指向目标元素的选择器。默认监听 `window`，也可用 `getContainer` 指定滚动容器。

<Demo id="anchor/01-basic" />

## 深度定制

- `activeKey` 受控、`onChange` 回传当前区块，便于与外部状态同步。
- `offsetTop` 让出固定头部高度，`targetOffset` 微调判定线位置。
- `children` 支持二级锚点，嵌套渲染为子列表。

<Demo id="anchor/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 锚点数据 | `AnchorItem[]` | — |
| activeKey | 当前激活项（受控） | `string` | — |
| defaultActiveKey | 默认激活项 | `string` | 第一项 |
| onChange | 激活项变化 | `(key: string) => void` | — |
| offsetTop | 距容器顶部偏移 | `number` | `0` |
| targetOffset | 目标判定线偏移 | `number` | `offsetTop` |
| getContainer | 返回滚动容器 | `() => HTMLElement ｜ Window ｜ null` | `window` |
| classNames | `{ root, list, item, link, activeLink, subList }` | — | — |
| styles | 同上 | — | — |

### AnchorItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| key | 唯一标识 | `string` |
| href | 目标元素选择器（如 `#intro`） | `string` |
| title | 链接文案 | `ReactNode` |
| children | 二级锚点 | `AnchorItem[]` |

## 定制点

- **Token**：`--yuki-anchor-active-color`、`--yuki-anchor-indicator-color`、`--yuki-anchor-link-padding-block`、`--yuki-anchor-font-size` 等。
- **类名/样式**：列表、项、链接、激活链接与子列表均可定制。
- **行为**：点击平滑滚动，尊重 `prefers-reduced-motion`；滚动监听使用 passive 监听器。

## 无障碍

- 根节点是 `<nav aria-label="锚点导航">`，当前链接带 `aria-current="location"`。
- 链接为原生 `<a href>`，键盘可直接聚焦与激活；支持 `↑` / `↓` / `Home` / `End` 在锚点间移动焦点。
- 减少动态效果时自动回退为瞬时滚动。

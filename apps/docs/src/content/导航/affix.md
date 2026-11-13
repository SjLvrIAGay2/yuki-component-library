---
title: Affix 固钉
group: 导航
description: 把元素固定在滚动容器的指定位置，避免随内容滚出视野。
order: 7
---

# Affix 固钉

固钉（Affix）让元素在滚动到指定位置后固定住，常用于工具栏、目录、操作条等需要持续可见的内容。

## 何时使用

- 操作条、筛选器或目录需要在长内容滚动时保持可见。
- 需要以 `offsetBottom` 把元素吸附在容器底部。
- 页面结构本身支持 `position: sticky` 时，优先使用原生方案。

## 基础用法

包裹需要固定的内容并设置 `offsetTop`；固钉时会保留等高占位，避免内容跳动。默认监听 `window`，也可用 `target` 指定滚动容器。

<Demo id="affix/01-basic" />

## 深度定制

- 动态切换 `offsetTop` 以适配不同高度的固定头部。
- `offsetBottom` 让元素吸附在容器底部。
- `onChange` 监听固定状态，用于联动阴影、埋点或样式。

<Demo id="affix/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| offsetTop | 距容器顶部偏移（px） | `number` | `0` |
| offsetBottom | 距容器底部偏移（px），设置后改为底部吸附 | `number` | — |
| target | 滚动容器工厂 | `() => HTMLElement ｜ Window ｜ null` | `window` |
| onChange | 固定状态变化 | `(affixed: boolean) => void` | — |
| classNames | `{ root, affix }` | — | — |
| styles | 同上 | — | — |

## 定制点

- **Token**：`--yuki-z-sticky` 控制层级，固定态阴影消费 `--yuki-shadow-sm`。
- **类名/样式**：外层占位与固定元素各有插槽，可分别定制。
- **结构**：固定态使用 `position: fixed` 并写入动态宽度；根节点保留原始高度。

## 无障碍

- 固钉只改变视觉位置，不改变 DOM 顺序与阅读顺序。
- 固定元素仍可通过键盘访问，建议内部操作条保持原生语义。
- 滚动监听为 passive，不会阻塞滚动性能。

---
title: Spin
group: 反馈
description: 加载指示器，支持独立使用、内容遮罩、延迟显示、自定义图标与全屏模式。
order: 10
---

## 何时使用

等待异步结果时使用：页面首屏、列表加载、按钮提交、局部区域刷新。短于 300ms 的等待不建议展示加载态；需要展示完成比例时改用 `Progress`。

## 基础用法

不带 `children` 时是独立指示器，可通过 `tip` 提供说明；包裹内容时会在内容上覆盖遮罩，并保留原始布局尺寸。

<Demo id="spin/01-basic" />

## 深度定制

`delay` 延迟显示，避免快速请求造成的闪烁；`icon` 替换内置环；`fullscreen` 覆盖整个视口，用于路由切换等全局等待。

<Demo id="spin/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| spinning | 是否显示加载态 | `boolean` | `true` |
| size | 指示器尺寸 | `sm ｜ md ｜ lg` | `md` |
| tip | 指示器下方文案 | `ReactNode` | — |
| delay | 延迟显示（毫秒） | `number` | `0` |
| fullscreen | 全屏遮罩（仅独立使用时生效） | `boolean` | `false` |
| icon | 自定义指示器图标 | `ReactNode` | 内置旋转环 |
| label | 可访问状态文案，默认取 `tip` 或本地化「加载中」 | `string` | — |
| children | 被遮罩的内容 | `ReactNode` | — |
| classNames | 插槽 | `{ root?, content?, mask?, indicator?, tip? }` | — |
| styles | 插槽内联样式 | 同上 | — |

## 定制点

- **Token**：`.yuki-spin` 声明 `--yuki-spin-ring-size`、`--yuki-spin-tip-color`、`--yuki-spin-mask-bg` 等槽位；全屏模式使用 `--yuki-z-modal` 层与 `--yuki-backdrop-blur-xs` 背景模糊。
- **尺寸**：`data-spinning` 为公开状态属性；`size="sm"` / `"lg"` 只重映射环尺寸与文案字号。
- **动效**：旋转环使用 `yuki-spin` 关键帧与 `--yuki-duration-slower`；在减少动态效果偏好或 `data-yuki-motion="off"` 下自动降级。

## 无障碍

- 独立指示器为 `role="status"` 且 `aria-live="polite"`，屏幕阅读器会播报 `label` / `tip` 文案；无 `tip` 时使用本地化「加载中」。
- 包裹内容时根节点带 `aria-busy="true"`，遮罩内的状态文案同样以 `role="status"` 播报。
- 遮罩不抢夺焦点；若等待期间应阻止交互，请同时禁用表单或使用 `Modal`。
- `delay` 只影响视觉显示，不会把状态变化延迟播报给辅助技术。

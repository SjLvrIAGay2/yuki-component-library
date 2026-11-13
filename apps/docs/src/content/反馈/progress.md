---
title: Progress
group: 反馈
description: 线形与环形进度条，支持语义状态、自定义格式、不确定进度与尺寸。
order: 9
---

## 何时使用

需要让用户感知**任务完成比例**时使用：上传、构建、表单填写进度、数据同步。无法预估剩余时间时使用 `indeterminate`，并配合 `Spin` 表达「正在处理」。

## 基础用法

`percent` 会被限制在 `0–100`；`status="success"` / `"exception"` 会切换语义色，`format` 自定义右侧文案。

<Demo id="progress/01-basic" />

## 深度定制

环形进度通过 `size`（直径，px）与 `strokeWidth` 控制外观；`tone` 在 `status="normal"` 时生效；`indeterminate` 让进度条循环动画，适用于未知时长的任务。

<Demo id="progress/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| percent | 完成百分比，自动限制在 0–100 | `number` | `0` |
| type | 形态 | `line ｜ circle` | `line` |
| status | 预设状态 | `normal ｜ success ｜ exception` | `normal` |
| tone | 正常状态下的语义色 | `primary ｜ success ｜ warning ｜ danger ｜ info` | `primary` |
| showInfo | 显示百分比文案 | `boolean` | `true` |
| format | 自定义文案渲染 | `(percent: number) => ReactNode` | — |
| strokeWidth | 线宽（线形像素 / 环形 viewBox 单位） | `number` | 线形 `4`、环形 `6` |
| size | 环形直径（px） | `number` | 由 token 决定 |
| sizePreset | 尺寸预设 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| indeterminate | 不确定进度循环动画 | `boolean` | `false` |
| classNames | 插槽 | `{ root?, track?, bar?, text? }` | — |
| styles | 插槽内联样式 | 同上 | — |
| value、max | 指定实际数量和上限，value 为 null 表示未知进度 | number | 0、100 |
| label、formatValue | 显示标签并用实际单位格式化文案 | ReactNode、函数 | — |

## 定制点

- **Token**：`.yuki-progress` 声明 `--yuki-progress-line-height`、`--yuki-progress-tone`、`--yuki-progress-track`、`--yuki-progress-circle-size` 等槽位；`data-type`、`data-tone`、`data-status`、`data-size` 为公开状态属性。
- **动效**：进度变化使用 `--yuki-duration-slow` 过渡；`indeterminate` 的关键帧在 `prefers-reduced-motion` 或 `data-yuki-motion="off"` 下自动停用。
- **类名/样式**：`classNames.root | track | bar | text` 与对应 `styles.*`。

## 无障碍

- 根节点为 `role="progressbar"`，带 `aria-valuemin` / `aria-valuemax` / `aria-valuenow`，并同步 `aria-valuetext`（来自 `format` 的文本结果）。
- `indeterminate` 时省略 `aria-valuenow`，表示进度未知；请提供 `aria-label` 说明正在进行的任务。
- 百分比文字是视觉补充，不是唯一信息载体；颜色状态同时有文案/数值表达。
- 环形 SVG 标记为 `role="presentation"` 且不可聚焦，避免键盘用户停留在装饰元素上。

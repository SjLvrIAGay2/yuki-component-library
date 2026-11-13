---
title: Steps 步骤条
group: 导航
description: 引导用户按流程完成任务，展示当前所处步骤与进度。
order: 3
---

# Steps 步骤条

步骤条把一个流程拆成若干步骤，并标出当前进度、已完成与异常状态，常用于表单分步、订单流程和向导。

## 何时使用

- 任务较长且可拆分为明确阶段，需要让用户知道进度。
- 需要引导用户按顺序完成多个步骤。
- 步骤数量较少（通常 3–6 步）；步骤太多时考虑用 Pagination 或分组。

## 基础用法

`current` 指定当前步骤（从 0 开始），未显式指定 `status` 的项根据位置推导为 `wait` / `process` / `finish`。

<Demo id="steps/01-basic" />

## 深度定制

- `direction="vertical"` 纵向排列，适合侧边流程或移动端。
- `clickable` 允许点击切换步骤，配合受控 `current` 与 `onChange`。
- `progressDot` 用圆点替代图标，适合轻量流程。
- 单项可用 `status` 覆盖（如 `error`）或 `disabled` 禁止点击。

<Demo id="steps/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 步骤数据 | `StepItem[]` | — |
| current | 当前步骤（受控，从 0 开始） | `number` | — |
| defaultCurrent | 默认当前步骤 | `number` | `0` |
| onChange | 点击切换回调 | `(index: number) => void` | — |
| direction | 排列方向 | `horizontal ｜ vertical` | `horizontal` |
| status | 当前步骤的状态 | `wait ｜ process ｜ finish ｜ error` | `process` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| clickable | 是否可点击切换 | `boolean` | `false` |
| progressDot | 使用圆点样式 | `boolean` | `false` |
| classNames | `{ root, item, icon, tail, content, title, description, dot }` | — | — |
| styles | 同上 | — | — |

### StepItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| key | 唯一标识 | `string` |
| title / subTitle | 标题与副标题 | `ReactNode` |
| description | 步骤描述 | `ReactNode` |
| icon | 自定义图标 | `ReactNode` |
| status | 覆盖该项状态 | `StepStatus` |
| disabled | 禁止点击 | `boolean` |

## 定制点

- **Token**：`--yuki-steps-icon-size`、`--yuki-steps-glyph-size`、`--yuki-steps-dot-size`、`--yuki-steps-item-gap`、`--yuki-steps-tail-color`、`--yuki-steps-icon-bg`、`--yuki-steps-icon-color` 等。
- **类名/样式**：图标、连接线、标题、描述与圆点各有插槽。
- **结构**：完成/错误状态使用内置对勾与叉号图标，其余显示序号。

## 无障碍

- 根节点是 `<ol>`，当前项带 `aria-current="step"`，状态通过 `data-status` 暴露。
- 可点击模式下使用按钮语义，支持 `←` / `→`、`↑` / `↓`、`Home` / `End` 在步骤间移动焦点。
- 禁用步骤以 `aria-disabled` 标记且不可聚焦；连接线对辅助技术隐藏。

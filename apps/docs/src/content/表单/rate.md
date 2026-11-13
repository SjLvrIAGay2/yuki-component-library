---
title: Rate
group: 表单
description: 评分控件。遵循 ARIA radiogroup 模式，支持半星、清除、自定义符号与键盘选择。
order: 9
---

## 何时使用

需要用户对内容打分或表达偏好时使用 Rate：商品评价、满意度、优先级。需要多维度评分时可并排多个 Rate；需要精确数值输入时改用 Slider 或 InputNumber。

## 基础用法

默认 5 个星标。空心表示未选中，实心表示已选中，左半实心表示半星。点击即选中，`allowClear` 允许再次点击当前值清零。

<Demo id="rate/01-basic" />

## 深度定制

`allowHalf` 通过指针落在星标左半边判定半星；`character` 接受任意节点或「索引 → 节点」函数，可用爱心、表情或文字替换星形。

<Demo id="rate/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 受控值 | `number` | — |
| defaultValue | 非受控初始值 | `number` | `0` |
| count | 符号数量 | `number` | `5` |
| allowHalf | 允许半星 | `boolean` | `false` |
| allowClear | 再次点击当前值清零 | `boolean` | `false` |
| disabled | 禁用 | `boolean` | `false` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| character | 自定义符号，函数接收从 1 开始的索引 | `ReactNode ｜ (index: number) => ReactNode` | 星形图标 |
| onChange | 值变化时触发 | `(value: number) => void` | — |
| onHoverChange | 悬停预览值变化时触发 | `(value: number) => void` | — |
| classNames | 语义节点类名 | `{ root?, item?, star?, fill? }` | — |
| styles | 语义节点内联样式 | 同上 | — |
| ref | 转发到根 `<div role="radiogroup">` | `Ref<HTMLDivElement>` | — |

## 定制点

- **Token**：`.yuki-rate` 声明 `--yuki-rate-size`、`--yuki-rate-gap`、`--yuki-rate-color`、`--yuki-rate-color-active`、`--yuki-rate-color-hover`。
- **类名/样式**：`classNames.root | item | star | fill` 与 `styles.*`；`fill` 与底层符号等宽，半星时仅显示它的左半部分。
- **结构**：`character` 可以是任意节点；单色 SVG 与文字会呈现空心或实心。每项按符号的实际宽度排列。
- **状态**：`data-size`、`data-value`、`data-disabled`、`data-half` 与每个选项上的 `data-checked` / `data-half` 是公开接口。

## 无障碍

- 根节点为 `role="radiogroup"`，每个符号为 `role="radio"`，`aria-checked` 标识当前选中的评分项；组名缺省为本地化的「评分」，可用 `aria-label` 覆盖。
- 采用 roving tabindex：整组只有一个 Tab 停靠点；← / ↓ 减小并选中，→ / ↑ 增大并选中，启用半星后每次调整 0.5，Home / End 跳到首尾，Enter / Space 选中当前焦点项。
- 悬停只做视觉预览，不改变值；`onHoverChange` 可用于联动文案给读屏或视觉补充。
- 禁用时所有选项 `aria-disabled="true"` 且不进入 Tab 序列；`data-disabled` 同步降低不透明度。
- 焦点环绘制在选项上，使用 `--yuki-shadow-focus`，键盘用户可清楚看到当前焦点。

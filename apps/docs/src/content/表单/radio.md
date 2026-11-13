---
title: Radio
group: 表单
description: 单选框与单选框组。整组统一键盘导航、ARIA radiogroup 语义与受控值管理。
order: 5
---

## 何时使用

在多个互斥选项中必须且只能选择一项时使用 Radio。选项较少且需要一眼看全时优先用平铺的 `RadioGroup`；选项很多时改用 `Select`。单项即时开关请使用 `Switch`。

- 互斥选项组：`<RadioGroup options={...} />`
- 自定义布局：在 `RadioGroup` 内直接写 `<Radio>` 子节点
- 放在 `Form.Item` 内时自动绑定单个值与校验状态

## 基础用法

`RadioGroup` 负责 `value` / `onChange` 与 `name`；`Radio` 通过 `value` 标识自身，选中项由值相等判断。

<Demo id="radio/01-basic" />

## 深度定制

`options` 支持字符串简写与逐项禁用；整组 `disabled` 会禁用所有子项。`size` 可以写在组上，子项会继承。

<Demo id="radio/02-custom" />

## API

### RadioGroup

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 受控值 | `string ｜ number ｜ boolean` | — |
| defaultValue | 非受控初始值 | `string ｜ number ｜ boolean` | — |
| onChange | 选中值变化时触发 | `(value, event?) => void` | — |
| options | 选项列表，字符串会被当作 label 与 value | `Array<{ label, value, disabled? } ｜ string ｜ number>` | — |
| direction | 排列方向 | `horizontal ｜ vertical` | `horizontal` |
| disabled | 禁用整组 | `boolean` | `false` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| name | 原生 name，缺省自动生成 | `string` | 自动 |
| classNames | 语义节点类名 | `{ root?, item? }` | — |
| ref | 转发到根 `<div role="radiogroup">` | `Ref<HTMLDivElement>` | — |

### Radio

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 选项值（组内唯一） | `string ｜ number ｜ boolean` | `id` 或 children 文本 |
| checked | 受控选中（独立使用时） | `boolean` | — |
| defaultChecked | 非受控初始值 | `boolean` | `false` |
| onChange | 状态变化时触发 | `(checked: boolean, event: ChangeEvent<HTMLInputElement>) => void` | — |
| disabled | 禁用 | `boolean` | `false` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承组/ConfigProvider |
| children | 标签内容 | `ReactNode` | — |
| classNames | 语义节点类名 | `{ root?, input?, control?, dot?, label? }` | — |
| ref | 转发到原生 `<input type="radio">` | `Ref<HTMLInputElement>` | — |

## 定制点

- **Token**：`.yuki-radio` 声明 `--yuki-radio-size`、`--yuki-radio-dot-size`、`--yuki-radio-gap`、`--yuki-radio-font-size`、`--yuki-radio-bg`、`--yuki-radio-border`、`--yuki-radio-color`、`--yuki-radio-dot`；选中与 hover 仅重映射边框/圆点颜色。
- **类名/样式**：`classNames.root | input | control | dot | label` 与 `styles.*`；组级 `classNames.root | item`。
- **结构**：`RadioGroup` 同时支持 `options` 与 `children`；`Radio` 的 `children` 可以是任意节点。
- **状态**：`data-size`、`data-checked`、`data-disabled`（组上还有 `data-direction`、`data-status`）可直接用于属性选择器。

## 无障碍

- `RadioGroup` 渲染 `role="radiogroup"`，组上可透传 `aria-label` / `aria-labelledby`；`Radio` 为原生 radio，label 包裹整块可点击。
- 组内只有一个 Tab 停靠点（浏览器原生行为），用方向键在选项间移动并即时选中；Home / End 亦可跳转。
- 在 `Form.Item` 内会自动接收 `aria-invalid`、`aria-describedby`、`aria-required` 与禁用状态。
- 焦点环由 `input:focus-visible + control` 绘制 `--yuki-shadow-focus`，不依赖颜色变化。
- 无可见标签的单项必须提供 `aria-label`；`name` 会透传到原生 input，便于原生表单提交。

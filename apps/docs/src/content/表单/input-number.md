---
title: InputNumber
group: 表单
description: 数字输入框。内置步进、上下限、精度、格式化与 ↑↓ 键盘步进。
order: 3
---

## 何时使用

需要用户输入受约束的数值时使用 InputNumber：数量、价格、比例、阈值。它负责把输入限制在 `min` / `max`，按 `step` 与 `precision` 规范化，并暴露 `role="spinbutton"` 语义。

- 整数或小数：设置 `precision`
- 需要快速微调：保留默认的步进按钮，或用 `controls={false}` 收起
- 需要单位、货币符号：使用 `prefix` / `suffix`
- 放在 `Form.Item` 内时自动获得 `null` 语义与校验绑定

## 基础用法

未输入时值为 `null`；失焦会把草稿值按上下限与精度归一后提交。

<Demo id="input-number/01-basic" />

## 深度定制

`formatter` / `parser` 可自定义展示与解析（如千分位）；`onStep` 在步进时额外携带 `type: 'up' | 'down'`，便于埋点或联动。

<Demo id="input-number/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| label / description / error | 独立字段的标签、说明与错误提示 | ReactNode | — |
| startIcon / endIcon | 数字输入框两侧的装饰 | ReactNode | — |
| value | 受控值 | `number ｜ null` | — |
| defaultValue | 非受控初始值 | `number ｜ null` | — |
| onChange | 值变化时触发（清空为 `null`） | `(value: number ｜ null) => void` | — |
| onStep | 点击步进按钮时触发 | `(value, { type }) => void` | — |
| min / max | 允许的最小 / 最大值 | `number` | — |
| step | 步进值 | `number` | `1` |
| precision | 小数位数 | `number` | — |
| controls | 是否显示步进按钮 | `boolean` | `true` |
| keyboard | 是否启用 ↑ / ↓ 步进 | `boolean` | `true` |
| formatter | 展示格式化 | `(value) => string` | — |
| parser | 输入解析 | `(text) => number ｜ null` | — |
| prefix / suffix | 框内前后内容 | `ReactNode` | — |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| status | 校验状态 | `default ｜ error ｜ warning ｜ success` | `default` |
| classNames | 语义节点类名 | `{ root?, group?, prefix?, input?, suffix?, controls?, up?, down? }` | — |
| ref | 转发到原生 `<input>` | `Ref<HTMLInputElement>` | — |

## 定制点

- **Token**：`.yuki-input-number` 声明 `--yuki-input-number-height`、`--yuki-input-number-padding-x`、`--yuki-input-number-font-size`、`--yuki-input-number-radius`、`--yuki-input-number-icon-size`、`--yuki-input-number-bg`、`--yuki-input-number-border`、`--yuki-input-number-fg`、`--yuki-input-number-placeholder`、`--yuki-input-number-focus-border`、`--yuki-input-number-focus-shadow`。
- **类名/样式**：`classNames.root | group | prefix | input | suffix | controls | up | down` 与 `styles.*`。
- **结构**：步进按钮为独立的两个按钮节点，可整体用 `controls={false}` 移除。
- **状态**：`data-size`、`data-status`、`data-disabled`、`data-controls` 是公开接口。

## 无障碍

- 输入框设置 `role="spinbutton"`，并同步 `aria-valuenow` / `aria-valuemin` / `aria-valuemax` / `aria-valuetext`。
- ↑ / ↓ 键按 `step` 增减并阻止页面滚动；PageUp / PageDown 按 10 倍步进（如实现则说明），Home / End 跳到上下限。
- 步进按钮 `tabIndex={-1}`，不进入 Tab 序列，避免键盘用户在两个按钮间反复停留；按钮带本地化 `aria-label`。
- 到达 `min` / `max` 时对应按钮自动 `disabled`；整体禁用时输入与按钮同时禁用。
- 错误态设置 `aria-invalid="true"`，焦点环使用 `--yuki-shadow-focus`。

---
title: Checkbox
group: 表单
description: 复选框与复选框组。支持半选（indeterminate）、受控/非受控、分组联动与原生表单绑定。
order: 6
---

## 何时使用

在一组互不排斥的选项中选择零项或多项时使用 Checkbox；`CheckboxGroup` 用于统一管理一组选项的值。单项开关（即时生效）请使用 `Switch`，互斥选项请使用 `Radio`。

- 独立勾选：`<Checkbox>`
- 一组多选：`<CheckboxGroup options={...} />`
- 全选 / 半选：给父级 `Checkbox` 传入 `indeterminate`
- 放在 `Form.Item` 内时自动绑定值与校验状态

## 基础用法

`children` 作为可点击标签，点击文字与方块等价；`defaultChecked` 用于非受控初始值。

<Demo id="checkbox/01-basic" />

## 深度定制

`indeterminate` 只影响视觉与 `aria-checked="mixed"`，不会改变 `checked`；实现全选时请同时维护两者。`CheckboxGroup` 的 `options` 支持字符串简写，也支持逐项 `disabled`。

<Demo id="checkbox/02-custom" />

## API

### Checkbox

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| checked | 受控选中状态 | `boolean` | — |
| defaultChecked | 非受控初始状态 | `boolean` | `false` |
| indeterminate | 半选状态（仅视觉与 ARIA） | `boolean` | `false` |
| onChange | 状态变化时触发 | `(checked: boolean, event: ChangeEvent<HTMLInputElement>) => void` | — |
| value | 在 `CheckboxGroup` 中代表该选项的值 | `string ｜ number ｜ boolean` | `children` 文本 |
| disabled | 禁用 | `boolean` | `false` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| children | 标签内容 | `ReactNode` | — |
| classNames | 语义节点类名 | `{ root?, input?, control?, label? }` | — |
| styles | 语义节点内联样式 | 同上 | — |
| ref | 转发到原生 `<input type="checkbox">` | `Ref<HTMLInputElement>` | — |

### CheckboxGroup

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 受控的选中值数组 | `CheckboxValue[]` | — |
| defaultValue | 非受控初始值 | `CheckboxValue[]` | `[]` |
| options | 选项列表，字符串会被当作 label 与 value | `Array<{ label, value, disabled? } ｜ string ｜ number>` | — |
| direction | 排列方向 | `horizontal ｜ vertical` | `horizontal` |
| disabled | 禁用整组 | `boolean` | `false` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| name | 原生 name | `string` | — |
| onChange | 值变化时触发 | `(values: CheckboxValue[], event?) => void` | — |
| classNames | 语义节点类名 | `{ root?, item? }` | — |

## 独立字段

`label` 会关联到控件。`description` 提供填写说明，有 `error` 时优先显示错误消息，并设置 `aria-invalid`。`fieldProps`、`labelProps` 和 `messageProps` 可配置字段节点。`indicator` 和 `indicatorProps` 可替换、设置选中标记。

## 定制点

- **Token**：`.yuki-checkbox` 声明 `--yuki-checkbox-size`、`--yuki-checkbox-radius`、`--yuki-checkbox-gap`、`--yuki-checkbox-font-size`、`--yuki-checkbox-bg`、`--yuki-checkbox-border`、`--yuki-checkbox-color`、`--yuki-checkbox-mark`；选中态重映射背景与边框，禁用态重映射为 disabled 令牌。
- **类名/样式**：`classNames.root | input | control | label` 与 `styles.*`。
- **结构**：`children` 可传任意节点（含链接、说明文字）；`CheckboxGroup` 的 `options` 与 `children` 二选一。
- **状态**：`data-size`、`data-checked`、`data-indeterminate`、`data-disabled` 是公开接口；`CheckboxGroup` 额外带 `data-direction`。

## 无障碍

- 隐藏的原生 `input[type="checkbox"]` 承载语义，label 包裹使其整块可点击；键盘 Space 切换。
- `indeterminate` 同时写入 DOM 的 `.indeterminate` 与 `aria-checked="mixed"`，读屏可正确播报半选。
- 焦点态由 `input:focus-visible + control` 绘制 `--yuki-shadow-focus` 焦点环，与鼠标状态解耦。
- 无可见标签时请提供 `aria-label`；`aria-label`、`name`、`required` 等原生属性会透传到 input。
- `CheckboxGroup` 使用 `role="group"`，请用 `aria-label` 或 `aria-labelledby` 为整组命名。
- 禁用态降低不透明度并保留可读对比度；不要用禁用代替解释。

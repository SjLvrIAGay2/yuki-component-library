---
title: Input
group: 表单
description: 单行文本输入框。支持前后缀、附加区、清除、计数与一体化表单绑定。
order: 1
---

## 何时使用

需要用户输入单行文本时使用 Input：用户名、邮箱、搜索关键词、URL 等。多行文本请使用 `Textarea`，数值输入请使用 `InputNumber`，带提交按钮的搜索场景推荐 `Search`。

- 输入内容不超过一行：`Input`
- 需要显式单位或协议（如 `https://`、`.com`）：使用 `addonBefore` / `addonAfter`
- 需要在框内放图标或单位：使用 `prefix` / `suffix`
- 放在 `Form.Item` 内时会自动继承 `id`、校验状态、必填与禁用状态

## 基础用法

支持三种尺寸、前置图标、清除按钮与密码输入；尺寸缺省继承 `ConfigProvider`。

<Demo id="input/01-basic" />

## 深度定制

附加区与输入框共享同一条边框并自动合并圆角；`status` 只改变语义颜色，不改布局。需要完全无边框的填充输入时使用 `bordered={false}`。

<Demo id="input/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 受控值 | `string` | — |
| defaultValue | 非受控初始值 | `string` | `''` |
| onChange | 值变化时触发，第二参数为原生事件 | `(value: string, event?) => void` | — |
| size | 尺寸，缺省继承 ConfigProvider | `sm ｜ md ｜ lg` | `md` |
| status | 校验状态 | `default ｜ error ｜ warning ｜ success` | `default` |
| prefix | 输入框内前置内容 | `ReactNode` | — |
| suffix | 输入框内后置内容 | `ReactNode` | — |
| addonBefore | 输入框左侧附加区 | `ReactNode` | — |
| addonAfter | 输入框右侧附加区 | `ReactNode` | — |
| bordered | 是否显示边框 | `boolean` | `true` |
| allowClear | 显示清除按钮 | `boolean` | `false` |
| onClear | 点击清除按钮时触发 | `() => void` | — |
| showCount | 显示字符计数（需配合 `maxLength`） | `boolean` | `false` |
| classNames | 语义节点类名插槽 | `{ root?, group?, prefix?, input?, suffix?, clear?, addonBefore?, addonAfter?, count? }` | — |
| styles | 语义节点内联样式 | 同上 | — |
| ref | 转发到原生 `<input>` 元素 | `Ref<HTMLInputElement>` | — |

未列出的原生属性（`placeholder`、`type`、`maxLength`、`aria-*`、`name` 等）会透传到原生 `<input>`。

## 独立字段

`label` 会关联到控件。`description` 提供填写说明，有 `error` 时优先显示错误消息，并设置 `aria-invalid`。`fieldProps`、`labelProps` 和 `messageProps` 可配置字段节点。`wrapperProps`、`startIconProps` 和 `endIconProps` 可配置输入框和两端装饰。

## 定制点

- **Token**：根类 `.yuki-input` 声明 `--yuki-input-height`、`--yuki-input-padding-x`、`--yuki-input-gap`、`--yuki-input-font-size`、`--yuki-input-radius`、`--yuki-input-icon-size`、`--yuki-input-bg`、`--yuki-input-border`、`--yuki-input-fg`、`--yuki-input-placeholder`、`--yuki-input-focus-border`、`--yuki-input-focus-shadow`；`--sm` / `--lg` 只重映射尺寸槽位。
- **类名/样式**：`classNames.root | group | prefix | input | suffix | clear | addonBefore | addonAfter | count` 与对应 `styles.*`。
- **结构**：`prefix` / `suffix` / 附加区接受任意节点；`showCount` 的计数文本由组件自身生成。
- **状态**：`data-size`、`data-status`、`data-disabled`、`data-readonly`、`data-bordered="false"`、`data-has-addon-before`、`data-has-addon-after` 是公开接口，可用属性选择器做局部定制。

## 无障碍

- 原生 `<input>` 承载全部输入语义；`ref` 指向它，可直接调用 `focus()` / `select()`。
- 在 `Form.Item` 内自动获得 `id`（与 label 关联）、`aria-invalid`、`aria-describedby`、`aria-required` 与 `aria-busy`。
- `status="error"` 时同步设置 `aria-invalid="true"`，不要只用颜色表达错误。
- 清除按钮 `tabIndex={-1}`，不会破坏 Tab 顺序，并提供本地化 `aria-label`；点击后焦点回到输入框。
- 焦点态通过 `:focus-within` 绘制 `--yuki-shadow-focus` 焦点环，键盘用户与鼠标用户一致可见。
- 前置/后置图标应为装饰性内容（`Icon` 默认 `aria-hidden`）；若图标承载信息，请为输入框提供 `aria-label`。

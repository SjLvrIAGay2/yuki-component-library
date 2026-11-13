---
title: Form
group: 表单
description: 表单容器与字段管理。内置校验、联动依赖、动态字段与完整表单实例，支持内置字段绑定和自定义控件。
order: 10
---

## 何时使用

需要收集、校验、提交一组字段时使用 Form。它负责值存储、校验时机、布局与 label 关联；具体输入控件仍由 Input / Textarea / InputNumber / Select 等负责。

- 登录、设置、信息录入等标准表单：`<Form>` + `<Form.Item>`
- 跨字段联动（确认密码、结束时间晚于开始时间）：`dependencies`
- 可增删的字段列表（邀请成员、多行地址）：`Form.List`
- 需要在组件外读取/写入表单：`Form.useForm()` 获得 `FormInstance`

## 基础用法

`name` 绑定字段，`rules` 声明校验；提交时先运行全部校验，全部通过才调用 `onFinish`，否则调用 `onFinishFailed` 并把第一个错误滚动到视区中心。

<Demo id="form/01-basic" />

## 深度定制

`dependencies` 会在被依赖字段变化时重新校验当前字段；`Form.List` 用 `name + field.name` 组织数组路径，`noStyle` 让字段自身不生成额外容器。`layout`、`requiredMark`、`colon`、`labelWidth` 可整体控制排版。

<Demo id="form/02-custom" />

## API

### Form

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| form | 表单实例，`Form.useForm()` 的返回值 | `FormInstance` | 自动创建 |
| initialValues | 初始值（仅首次挂载生效） | `object` | — |
| onFinish | 校验全部通过后触发 | `(values) => void` | — |
| onFinishFailed | 校验失败时触发 | `(errors, values) => void` | — |
| onValuesChange | 任意字段值变化时触发 | `(changed, all) => void` | — |
| layout | 布局 | `horizontal ｜ vertical ｜ inline` | `horizontal` |
| size | 控件尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| disabled | 禁用全部字段 | `boolean` | `false` |
| requiredMark | 是否显示必填星号 | `boolean` | `true` |
| colon | label 后是否显示冒号 | `boolean` | `false` |
| labelWidth | label 列宽（水平布局） | `string ｜ number` | token |
| validateTrigger | 默认校验时机 | `onChange ｜ onBlur ｜ onSubmit ｜ none` | `onChange` |

### Form.Item

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 字段路径，支持数组表示嵌套 | `string ｜ number ｜ (string ｜ number)[]` | — |
| label | 标签文本，自动与控件 `id` 关联 | `ReactNode` | — |
| rules | 校验规则列表 | `FormRule[]` | — |
| required | 设置必填标记与 aria-required，必填校验使用 rules | `boolean` | — |
| dependencies | 依赖字段路径，变化时重新校验 | `NamePath[]` | — |
| validateTrigger | 该字段的校验时机 | `onChange ｜ onBlur ｜ onSubmit ｜ none` | 继承 Form |
| validateStatus | 手动指定状态 | `default ｜ error ｜ warning ｜ success` | — |
| hasFeedback | 校验通过时显示成功态 | `boolean` | `false` |
| help | 自定义帮助文本，优先于校验错误 | `ReactNode` | — |
| extra | 常驻说明文本 | `ReactNode` | — |
| initialValue | 字段初始值 | `unknown` | — |
| noStyle | 不渲染容器，仅提供绑定上下文 | `boolean` | `false` |
| children | 控件，或渲染函数 `({ id, status, ariaProps }) => ReactNode` | `ReactNode ｜ Function` | — |
| classNames | 语义节点类名 | `{ root?, label?, control?, help?, extra? }` | — |

### 自定义字段

继承绑定的组件放在带 `name` 的 `Form.Item` 内即可。自定义控件可从 `@yuki-ui/react` 导入 `useFieldControl<T>()` 获取 `value`、`onChange`、`onBlur`、`id`、`disabled` 和 `ariaProps`。也可用字段的函数子元素将 value、onChange、onBlur、id 与 ariaProps 映射到业务组件。列表行的 React key 取 `field.key`，绑定路径使用完整路径，如 `['users', field.name, 'name']`。

### FormRule

`required`、`message`、`min`、`max`、`len`、`pattern`、`type`（`string`/`number`/`boolean`/`array`/`email`/`url`）、`enum`、`whitespace`、`transform`、`validator(value, form)`。

同一条规则先用 `transform` 转换待校验的值，再执行内置约束，最后把转换后的值交给 `validator`。转换仅用于校验，表单保留用户输入的原值。

### useForm / FormInstance

`useForm<Values>()` 返回 `[form]`。常用方法：`getFieldValue`、`getFieldsValue`、`setFieldValue`、`setFieldsValue`、`validateFields`、`validateField`、`resetFields`、`getFieldError`、`submit`、`subscribe`。

## 定制点

- **Token**：`.yuki-form` 声明 `--yuki-form-gap`、`--yuki-form-label-gap`、`--yuki-form-label-width`、`--yuki-form-label-color`、`--yuki-form-extra-color`、`--yuki-form-help-color`；`labelWidth` prop 会写入同名 CSS 变量，可在任意层级覆盖。
- **类名/样式**：`Form` 的 `classNames.root`；`Form.Item` 的 `classNames.root | label | control | help | extra` 与对应 `styles.*`。
- **结构**：`children` 支持渲染函数，直接拿到 `{ id, status, value, onChange, onBlur, ariaProps }`，便于接入非内置控件。
- **状态**：`data-layout`、`data-size`、`data-disabled`、`data-field`、`data-status`、`data-required`、`data-has-error` 是公开接口。

## 无障碍

- `<form noValidate>` 阻止浏览器原生气泡，由组件统一渲染错误；`role="alert"` 的帮助区在出错时被读屏即时播报。
- label 通过 `htmlFor` 与控件 `id` 关联；`aria-invalid`、`aria-describedby`（help / extra）、`aria-required`、`aria-busy` 会自动注入到绑定控件。
- 提交失败时自动把第一个错误字段滚动到视区中央，并尊重 `prefers-reduced-motion`（改为瞬时滚动）。
- 每个字段的 `Form.Item` 具有 `data-field` 路径标记，便于调试与测试定位。
- 错误不能只靠颜色表达：错误文本始终可见且与控件关联；禁用整表时所有控件都会被禁用。

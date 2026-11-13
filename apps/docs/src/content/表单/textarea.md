---
title: Textarea
group: 表单
description: 多行文本输入。支持自适应高度、字数统计、清除与校验状态。
order: 2
---

## 何时使用

需要输入多行文本时使用 Textarea：描述、备注、评论、JSON 片段等。单行输入请使用 `Input`；需要固定行高但允许拖拽调整时可关闭 `autoSize`。

- 内容长度不可预估、希望随输入增高：`autoSize`
- 需要明确上限：`maxLength` + `showCount`
- 放在 `Form.Item` 内时自动继承值与校验状态

## 基础用法

`rows` 控制初始可见行数；`autoSize` 会在内容变化时按 scrollHeight 自适应高度，`autoSize={{ minRows, maxRows }}` 可约束区间。

<Demo id="textarea/01-basic" />

## 深度定制

`status` 只改变语义颜色，不改变布局；`size` 控制内边距与字号；清除与计数浮层定位在右下角，不挤占文本空间。

<Demo id="textarea/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 受控值 | `string` | — |
| defaultValue | 非受控初始值 | `string` | `''` |
| onChange | 值变化时触发 | `(value: string, event?) => void` | — |
| rows | 可见行数 | `number` | `3` |
| autoSize | 自适应高度 | `boolean ｜ { minRows?, maxRows? }` | `false` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| status | 校验状态 | `default ｜ error ｜ warning ｜ success` | `default` |
| allowClear | 显示清除按钮 | `boolean` | `false` |
| onClear | 点击清除时触发 | `() => void` | — |
| showCount | 显示字数统计（配合 `maxLength`） | `boolean` | `false` |
| classNames | 语义节点类名 | `{ root?, control?, clear?, count? }` | — |
| styles | 语义节点内联样式 | 同上 | — |
| ref | 转发到原生 `<textarea>` | `Ref<HTMLTextAreaElement>` | — |

未列出的原生属性（`placeholder`、`maxLength`、`aria-*`、`name` 等）会透传到原生 `<textarea>`。

## 独立字段

`label` 会关联到控件。`description` 提供填写说明，有 `error` 时优先显示错误消息，并设置 `aria-invalid`。`fieldProps`、`labelProps` 和 `messageProps` 可配置字段节点。`footer` 可在消息下加入计数或操作。

## 定制点

- **Token**：`.yuki-textarea` 声明 `--yuki-textarea-min-height`、`--yuki-textarea-padding-x`、`--yuki-textarea-padding-y`、`--yuki-textarea-font-size`、`--yuki-textarea-radius`、`--yuki-textarea-bg`、`--yuki-textarea-border`、`--yuki-textarea-fg`、`--yuki-textarea-placeholder`、`--yuki-textarea-focus-border`、`--yuki-textarea-focus-shadow`。
- **类名/样式**：`classNames.root | control | clear | count` 与 `styles.*`。
- **结构**：清除按钮与计数为绝对定位的浮层，不参与文本流；`data-has-count` 会在有计数时保留右下角空间。
- **状态**：`data-size`、`data-status`、`data-disabled`、`data-readonly`、`data-has-count` 是公开接口。

## 无障碍

- 原生 `<textarea>` 承载输入语义，`ref` 指向它；label 通过 `Form.Item` 自动关联。
- `status="error"` 时设置 `aria-invalid="true"`，错误文本由 `Form.Item` 以 `role="alert"` 播报。
- 清除按钮 `tabIndex={-1}` 且有本地化 `aria-label`，不破坏 Tab 顺序，点击后焦点回到文本域。
- 焦点环使用 `--yuki-shadow-focus`，键盘与鼠标状态分离，暗色主题下同样可见。
- 手动拖拽调整高度（`autoSize` 关闭时）使用原生 resize，方向为垂直；禁用态保留可读对比度。

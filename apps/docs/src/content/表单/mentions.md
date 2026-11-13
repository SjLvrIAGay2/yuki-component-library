---
title: Mentions
group: 表单
description: 输入框内 @ 提及。触发字符后弹出候选列表，支持预设与异步数据、键盘选择与受控值。
order: 13
---

## 何时使用

需要在文本中提及其他成员、标签或资源时使用 Mentions：评论区 @ 某人、任务描述引用成员、工单里关联标签。候选来源可以是固定数组，也可以用 `loadOptions` 按输入关键字异步拉取。

- 固定候选：`options`
- 远程搜索：`loadOptions`（返回数组或 Promise）
- 自定义触发字符：`prefix`（例如 `#` 引用标签）
- 受控文本：`value` + `onChange`

## 基础用法

在文本域中输入 `@` 会弹出候选列表，继续输入会按关键字过滤；`ArrowUp` / `ArrowDown` 切换、`Enter` / `Tab` 选中、`Escape` 关闭。选中后会把 `prefix + value + split` 插入到触发位置，并保留原有后缀文本；`onSelect(option, prefix)` 可用于记录被提及的对象。

<Demo id="mentions/01-basic" />

## 深度定制

`loadOptions` 在每次打开或关键字变化时调用，组件会忽略过期响应并展示加载状态；空结果展示「暂无数据」。`filterOption` 可覆盖本地过滤逻辑，`prefix` 改成 `#` 后即可作为标签选择器；`size`、`rows`、`disabled`、`maxLength` 与原生文本域一致；`classNames` / `styles` 可定制每一个语义节点。

<Demo id="mentions/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 受控文本 | `string` | — |
| defaultValue | 非受控初始文本 | `string` | `''` |
| onChange | 文本变化时触发 | `(value: string) => void` | — |
| onSelect | 选中候选项时触发 | `(option: MentionOption, prefix: string) => void` | — |
| options | 静态候选列表 | `MentionOption[]` | `[]` |
| loadOptions | 异步候选来源 | `(keyword: string) => MentionOption[] ｜ Promise<MentionOption[]>` | — |
| filterOption | 本地过滤函数 | `(keyword: string, option: MentionOption) => boolean` | 匹配 value 与文本 label |
| prefix | 触发字符 | `string` | `@` |
| split | 插入后追加的分隔符 | `string` | 空格 |
| placeholder | 占位文案 | `string` | 输入 @ 提及他人 |
| rows | 可见行数 | `number` | `3` |
| maxLength | 最大字符数 | `number` | — |
| disabled | 禁用 | `boolean` | `false` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| classNames / styles | 语义节点类名 / 样式 | `MentionsClassNames` / `MentionsStyles` | — |
| ref | 转发到根 `<div>` | `Ref<HTMLDivElement>` | — |

`MentionOption` 字段：`value`、`label`、`disabled`。未列出的原生属性会透传到根 `<div>`；文本域自身的 `placeholder`、`maxLength` 等由同名属性覆盖。

## 定制点

- **Token**：`.yuki-mentions` 与弹层共用 `--yuki-mentions-font-size`、`-textarea-min-height`、`-textarea-padding-block`、`-textarea-padding-inline`、`-textarea-radius`、`-textarea-border`、`-textarea-bg`、`-textarea-color`、`-dropdown-width`、`-list-max-height`、`-list-padding`、`-list-gap`、`-option-padding-block`、`-option-padding-inline`、`-option-radius`、`-option-font-size`、`-option-color`、`-option-active-bg`、`-option-active-color`、`-option-disabled-color`、`-empty-padding`、`-empty-color`、`-empty-font-size`。
- **类名/样式**：`classNames.root | textarea | dropdown | list | option | optionLabel | empty | loading` 与 `styles.*`。
- **结构**：文本域与候选弹层分离，弹层通过 Portal 渲染并锚定在文本域下沿；列表带 `yuki-scrollbar` 自定义滚动条。
- **状态**：根节点 `data-size`、`data-disabled`、`data-open`；候选项 `data-active`、`data-disabled` 是公开接口。

## 无障碍

- 文本域使用 `role="combobox"`，带 `aria-haspopup="listbox"`、`aria-expanded`、`aria-controls`、`aria-autocomplete="list"`，当前项通过 `aria-activedescendant` 关联，焦点始终留在文本域。
- 候选列表为 `role="listbox"` 并带可读标签，候选项为 `role="option"`，用 `aria-selected` 标记激活项、`aria-disabled` 标记禁用项。
- 键盘完整可用：`ArrowUp` / `ArrowDown` 循环切换（跳过禁用项），`Enter` / `Tab` 选中，`Escape` 关闭，`Home` / `End` 等移动光标的键会重新计算触发词。
- 异步加载与空结果都有文本提示；关闭弹层不打断输入焦点，点击外部或再次移动光标即可收起。

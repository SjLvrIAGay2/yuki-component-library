---
title: Popconfirm
group: 反馈
description: 气泡式二次确认，组合 Popover 与按钮，支持异步确认与语义色。
order: 8
---

## 何时使用

操作**不可逆但影响范围小**、需要一次轻量确认时使用：删除单条记录、退出登录、归档文件。它紧贴触发元素，不打断页面。

- 影响面大、需要说明后果：`Modal.confirm`
- 只是提示信息，无需确认：`Popover` / `Tooltip`

## 基础用法

`onConfirm` 触发确认，`onCancel` 触发取消；两者都会关闭气泡。默认文案为本地化的「确定 / 取消」。

<Demo id="popconfirm/01-basic" />

## 深度定制

`okTone="danger"` 用于危险操作，`icon={null}` 隐藏图标，`okText` / `cancelText` 自定义文案。`onConfirm` 返回 Promise 时确定按钮保持加载态，resolve 后自动关闭。

<Demo id="popconfirm/02-custom" />

## API

Popconfirm 继承 `Popover` 的定位与触发属性，因此 `placement`、`trigger`、`open` / `defaultOpen` / `onOpenChange`、`arrow`、`disabled`、`closeOnOutsideClick`、`closeOnEscape` 等均可直接使用。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 确认标题 | `ReactNode` | — |
| description | 补充说明 | `ReactNode` | — |
| okText | 确认按钮文案 | `ReactNode` | 本地化「确定」 |
| cancelText | 取消按钮文案 | `ReactNode` | 本地化「取消」 |
| okTone | 确认按钮语义色 | `primary ｜ danger` | `primary` |
| icon | 图标，传 `null` 隐藏 | `ReactNode` | `help-circle` |
| confirmLoading | 外部加载态 | `boolean` | `false` |
| onConfirm | 确认回调；返回 Promise 时等待其 resolve | `() => void ｜ Promise<void>` | — |
| onCancel | 取消回调 | `() => void` | — |
| placement | 气泡方向 | `Placement` | `top` |
| open / defaultOpen | 受控 / 非受控打开状态 | `boolean` | — |
| onOpenChange | 打开状态变化 | `(open: boolean) => void` | — |
| classNames | 插槽 | `{ root?, popup?, arrow?, body?, icon?, title?, description?, actions?, ok?, cancel? }` | — |
| styles | 插槽内联样式 | 同上 | — |

## 定制点

- **Token**：`.yuki-popconfirm__popup` 声明 `--yuki-popconfirm-*` 系列（最大宽度、内边距、语义色）；`[data-tone='danger']` 会切换图标与强调色。
- **结构**：`body` 内为图标 + 主区（标题、描述、操作按钮），按钮直接复用 `Button` 的尺寸与语义。
- **组合**：Popconfirm 内部即 `Popover`，需要完全自定义时可直接用 Popover + 自己的按钮。

## 无障碍

- 气泡内容为 `role="dialog"`，由 Popover 提供 `aria-haspopup` / `aria-expanded` / `aria-controls` 关联。
- 打开后点击气泡内部不会误触触发器（内容区阻止了事件冒泡），键盘用户可用 Tab 在「取消」「确定」间移动。
- Escape 关闭（`closeOnEscape`），点击外部关闭；确认中的异步状态通过 `aria-busy` 暴露。
- 不要把唯一的重要信息只放在气泡里；触发元素本身应有清晰的可访问名称。

---
title: Modal
group: 反馈
description: 模态对话框，支持焦点陷阱、滚动锁定、尺寸与命令式确认框。
order: 6
---

## 何时使用

需要用户**集中注意力完成一个任务或做出决定**时使用 Modal：重命名、删除确认、表单填写、重要信息告知。它打断当前流程，因此不要用于普通信息展示。

- 轻量确认、与触发元素强相关：`Popconfirm`
- 侧边编辑、保留页面上下文：`Drawer`

## 基础用法

受控用法传 `open` 与 `onOpenChange`；非受控用法传 `defaultOpen`。标题与描述会自动关联为对话框的可访问名称与说明。

<Demo id="modal/01-basic" />

## 深度定制

`Modal.confirm / info / success / warning / error` 提供命令式确认框，返回 `{ id, destroy, update }` 句柄；`footer={null}` 隐藏默认按钮，`size` 控制宽度，`centered={false}` 顶部对齐。

<Demo id="modal/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| open | 受控打开状态 | `boolean` | — |
| defaultOpen | 非受控初始状态 | `boolean` | `false` |
| onOpenChange | 打开状态变化 | `(open: boolean) => void` | — |
| title | 标题，同时作为可访问名称 | `ReactNode` | — |
| description | 描述，关联 `aria-describedby` | `ReactNode` | — |
| children | 正文内容 | `ReactNode` | — |
| footer | 自定义页脚，`null` 隐藏 | `ReactNode ｜ null` | 取消 + 确定 |
| okText / cancelText | 按钮文案 | `ReactNode` | 本地化「确定 / 取消」 |
| okTone | 确定按钮语义色 | `ButtonTone` | `primary` |
| okLoading | 确定按钮加载态 | `boolean` | `false` |
| onOk | 确定回调；返回 Promise 时在 resolve 后关闭 | `() => void ｜ Promise<void>` | — |
| onCancel | 取消/关闭回调 | `() => void` | — |
| closable | 显示关闭按钮 | `boolean` | `true` |
| maskClosable | 点击遮罩关闭 | `boolean` | `true` |
| closeOnEscape | Escape 关闭 | `boolean` | `true` |
| showMask | 渲染遮罩 | `boolean` | `true` |
| centered | 垂直居中 | `boolean` | `true` |
| size | 宽度尺寸 | `sm ｜ md ｜ lg ｜ xl` | `md` |
| container | 自定义挂载容器 | `HTMLElement ｜ null` | ConfigProvider 浮层容器 |
| classNames | 插槽 | `{ root?, mask?, dialog?, header?, title?, close?, body?, footer?, ok?, cancel? }` | — |
| styles | 插槽内联样式 | 同上 | — |

### 命令式 API

`Modal.confirm / info / success / warning / error(options)`，`options` 支持 `title`、`content`、`description`、`icon`、`okText`、`cancelText`、`okTone`、`closable`、`maskClosable`、`size`、`className`、`style`、`classNames`、`styles`、`onOk`、`onCancel`、`key`；返回 `{ id, destroy, update }`。`Modal.destroy(id?)` 关闭全部或指定确认框。

## 定制点

- **Token**：`.yuki-modal` 声明宽度、背景、边框、圆角、阴影、内边距与动画槽位；`.yuki-modal-confirm` 用于命令式确认框布局。
- **结构**：`classNames.root | mask | dialog | header | title | close | body | footer | ok | cancel`。
- **状态属性**：`data-size`、`data-centered` 为公开接口。

## 无障碍

- 对话框为 `role="dialog"` + `aria-modal="true"`，`aria-labelledby` 指向标题、`aria-describedby` 指向描述（存在时）。
- 打开时把焦点移入对话框并**陷阱** Tab 循环；关闭后焦点回到触发元素，页面滚动锁定。
- Escape 关闭、遮罩点击按 `maskClosable` 生效；关闭按钮带本地化 `aria-label`。
- `onOk` 返回 Promise 时按钮进入 `aria-busy` 加载态，避免重复提交；`footer={null}` 时请自行提供可聚焦的关闭方式。

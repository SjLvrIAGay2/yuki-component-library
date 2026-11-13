---
title: Drawer
group: 反馈
description: 从屏幕边缘滑出的抽屉面板，支持四个方向、尺寸与完整弹窗交互契约。
order: 7
---

## 何时使用

需要在**保留页面上下文**的前提下完成一个任务时使用 Drawer：筛选条件、成员编辑、详情查看、多步表单。它从边缘滑出，视觉上比居中对话框更轻。

- 必须打断当前任务的决策：`Modal`
- 与某个触发按钮强相关的轻量确认：`Popconfirm`

## 基础用法

`placement` 控制滑出方向（默认 `right`），`size` 控制面板厚度。标题、描述、页脚与 Modal 保持一致。

<Demo id="drawer/01-basic" />

## 深度定制

四个方向均可使用；`footer` 可完全自定义，`footer={null}` 隐藏页脚。内容区独立滚动，长表单也不会撑破视口。

<Demo id="drawer/02-custom" />

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
| placement | 滑出方向 | `right ｜ left ｜ top ｜ bottom` | `right` |
| size | 面板厚度 | `sm ｜ md ｜ lg` | `md` |
| container | 自定义挂载容器 | `HTMLElement ｜ null` | ConfigProvider 浮层容器 |
| classNames | 插槽 | `{ root?, mask?, panel?, header?, title?, close?, body?, footer?, ok?, cancel? }` | — |
| styles | 插槽内联样式 | 同上 | — |

## 定制点

- **Token**：`.yuki-drawer` 声明背景、边框、阴影、内边距、标题字号与 `--yuki-drawer-size`；`data-placement` 决定滑入动画（四个方向各有关键帧）。
- **类名/样式**：`classNames.root | mask | panel | header | title | close | body | footer | ok | cancel`。
- **状态属性**：`data-placement`、`data-size` 为公开接口。

## 无障碍

- 面板为 `role="dialog"` + `aria-modal="true"`，`aria-labelledby` 关联标题、`aria-describedby` 关联描述（存在时）。
- 打开时聚焦面板（`tabIndex={-1}`）并陷阱 Tab 循环；关闭后恢复触发元素焦点，同时解除页面滚动锁。
- Escape 关闭、遮罩点击按 `maskClosable` 生效，关闭按钮带本地化 `aria-label`。
- 面板贴边时仍保留 1px 边框与阴影，键盘焦点环在面板内完整可见。

## 保留表单草稿

用 trigger 指定打开抽屉的元素，forceMount 会在关闭时隐藏面板并保留表单内容。若应用需要独立挂载点，传入 container 或 portalContainer；抽屉中的选择框会打开在当前面板内。异步确认失败后可再次提交，前一次打开时的请求不会关闭新打开的面板。

<Demo id="drawer/03-retained-form" />

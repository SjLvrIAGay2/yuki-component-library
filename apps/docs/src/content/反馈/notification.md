---
title: Notification
group: 反馈
description: 带标题与描述的通知卡片，支持四角堆叠、常驻、可操作与命令式调用。
order: 5
---

## 何时使用

需要展示**较完整信息**且不打断当前页面时使用 Notification：部署结果、新评论、证书到期、后台任务完成。它比 `Message` 有更多空间与操作区，且默认停留在屏幕角落。

## 基础用法

组件形式通过 `title` / `description` 展示内容；命令式形式使用 `notification.success / error / info / warning / loading`。

<Demo id="notification/01-basic" />

## 深度定制

`placement` 支持四角与上下居中；`duration={0}` 常驻；`action` 放撤销、查看等操作；`closable={false}` 可隐藏关闭按钮配合常驻使用。

<Demo id="notification/02-custom" />

## API

### 组件

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| tone | 语义色 | `success ｜ error ｜ info ｜ warning ｜ loading` | `info` |
| title | 标题 | `ReactNode` | — |
| description | 描述 | `ReactNode` | — |
| children | 自定义内容（替代 description） | `ReactNode` | — |
| icon | 自定义图标，传 `null` 隐藏 | `ReactNode` | 语义默认图标 |
| showIcon | 是否显示图标 | `boolean` | `true` |
| closable | 显示关闭按钮 | `boolean` | `true` |
| closeIcon | 自定义关闭图标 | `ReactNode` | `<Icon name="x" />` |
| action | 操作区内容 | `ReactNode` | — |
| onClose | 关闭回调 | `(event) => void` | — |
| classNames | 插槽 | `{ root?, icon?, content?, title?, description?, action?, close? }` | — |
| styles | 插槽内联样式 | 同上 | — |

### 命令式 API

| 方法 | 说明 |
| --- | --- |
| `notification.open(options \| ReactNode)` | 打开通知，`string` 作为标题，返回 `{ id, close, update }` |
| `notification.success / error / info / warning(options)` | 语义快捷方法 |
| `notification.loading(options)` | 加载通知，默认不自动关闭 |
| `notification.destroy(id?)` | 关闭指定通知；不传 id 关闭全部 |
| `notification.config({ duration?, placement?, maxCount?, closable? })` | 合并全局默认值 |

`NotificationOptions`：`title`、`description`、`tone`、`duration`（默认 4500）、`closable`、`showIcon`、`icon`、`action`、`placement`（默认 `topRight`）、`key`、`className`、`style`、`classNames`、`styles`、`onClose`。

声明式使用时可通过 `duration` 指定自动消失的毫秒数，通过 `onDismiss` 接收关闭通知。

## 定制点

- **Token**：`.yuki-notification` 声明 `--yuki-notification-*` 系列（背景、边框、阴影、语义色、内边距、间距、圆角、宽度）。
- **位置**：`.yuki-notification-list[data-placement]` 控制堆叠方向与偏移，底部位置自动反向堆叠。
- **类名/样式**：`classNames.root | icon | content | title | description | action | close`。

## 无障碍

- `error` 使用 `role="alert"`，其余使用 `role="status"` 并带 `aria-atomic="true"`。
- 通知区域带 `role="region"` 与本地化 `aria-label`，避免打断当前焦点。
- 关闭按钮为原生按钮并带 `aria-label`；`action` 内请使用原生可聚焦元素。
- 需要用户确认的通知应改用 `Modal.confirm`，而不是把确认按钮放进会自动消失的通知里。

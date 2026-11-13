---
title: Message
group: 反馈
description: 轻量的全局消息提示，支持五种语义、自动关闭、可更新句柄与命令式调用。
order: 4
---

## 何时使用

操作完成后需要一条**短暂、不打断**的反馈时使用，例如保存成功、复制完成、网络异常。需要标题与更多信息时改用 `Notification`；需要用户确认时改用 `Modal`。

也可以把 `Message` 当作普通组件渲染在页面中，受控展示一条提示。

## 基础用法

组件形式受控渲染；命令式形式通过 `message.success / error / info / warning / loading` 调用，自动挂载到 ConfigProvider 的浮层容器中。`message` 另导出别名 `toast`。

<Demo id="message/01-basic" />

## 深度定制

`open` 返回句柄，可 `update` 更新内容与语义，或 `close` 主动关闭。`placement` 控制堆叠位置（`top` / `topLeft` / `topRight` / `bottom` / `bottomLeft` / `bottomRight`），`message.config()` 设置全局默认值与最大条数。

<Demo id="message/02-custom" />

## API

### 组件

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| tone | 语义色 | `success ｜ error ｜ info ｜ warning ｜ loading` | `info` |
| children | 提示内容 | `ReactNode` | — |
| icon | 自定义图标，传 `null` 隐藏 | `ReactNode` | 语义默认图标 |
| showIcon | 是否显示图标 | `boolean` | `true` |
| closable | 显示关闭按钮 | `boolean` | `false` |
| closeIcon | 自定义关闭图标 | `ReactNode` | `<Icon name="x" />` |
| action | 操作区内容 | `ReactNode` | — |
| onClose | 关闭回调 | `(event) => void` | — |
| classNames | 插槽 | `{ root?, icon?, content?, action?, close? }` | — |
| styles | 插槽内联样式 | 同上 | — |

### 命令式 API

| 方法 | 说明 |
| --- | --- |
| `message.open(options \| ReactNode)` | 打开一条消息，返回 `{ id, close, update }` |
| `message.success / error / info / warning(content, options?)` | 语义快捷方法 |
| `message.loading(content, options?)` | 加载提示，默认不自动关闭 |
| `message.destroy(id?)` | 关闭指定消息；不传 id 关闭全部 |
| `message.config({ duration?, placement?, maxCount?, closable? })` | 合并全局默认值 |

`MessageOptions`：`content`、`tone`、`duration`（默认 3000，`0` 不自动关闭）、`closable`、`showIcon`、`icon`、`action`、`placement`、`key`、`className`、`style`、`classNames`、`styles`、`onClose`。

声明式使用时可通过 `duration` 指定自动消失的毫秒数，通过 `onDismiss` 接收关闭通知。

## 定制点

- **Token**：`.yuki-message` 声明 `--yuki-message-bg`、`--yuki-message-border`、`--yuki-message-shadow`、`--yuki-message-tone`、`--yuki-message-padding-*`、`--yuki-message-gap`、`--yuki-message-radius`、`--yuki-message-font-size`、`--yuki-message-max-width`。
- **容器**：命令式消息挂载到首个 `[data-yuki-portal]` 或 document.body，继承该 DOM 位置的 CSS 变量。需要随局部语言、尺寸和 React 上下文变化时，在该子树渲染 Message 或 ToastProvider。
- **类名/样式**：`classNames.root | icon | content | action | close`，分别覆盖根节点、图标、正文、操作区和关闭按钮。

## 无障碍

- `error` 使用 `role="alert"`，其余使用 `role="status"` 且 `aria-atomic="true"`，屏幕阅读器会完整播报更新后的内容。
- 每个位置的堆叠容器带 `role="region"` 与本地化 `aria-label`，消息可被快速定位。
- 关闭按钮带 `aria-label`；`duration` 设为 `0` 时消息常驻，避免自动消失导致无法阅读。
- 消息不会抢夺焦点；若提示需要用户处理，请改用 `Modal` 并将焦点移入对话框中。

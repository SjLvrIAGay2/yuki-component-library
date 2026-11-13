---
title: Alert
group: 反馈
description: 页面内持续性提示条，支持四种语义、三种视觉变体、可关闭与操作区。
order: 3
---

## 何时使用

需要**持续可见**的反馈，且不希望打断用户当前操作时使用 Alert：表单顶部校验摘要、页面级维护通知、构建失败横幅等。

- 一次性、自动消失的轻提示：使用 `Message`
- 带标题与描述、可堆叠的通知：使用 `Notification`
- 需要用户确认后才继续：使用 `Modal` / `Popconfirm`

## 基础用法

`tone` 决定语义色与默认图标，`variant` 决定视觉重量。`danger` / `warning` 会自动使用 `role="alert"`，其余使用 `role="status"`。

<Demo id="alert/01-basic" />

## 深度定制

`solid` 用于页面级强提醒，`outline` 适合信息密度较高的区域，`banner` 去掉圆角并贴边展示。`action` 放操作链接，`icon={null}` 可隐藏图标，`icon` 可替换为任意节点。

<Demo id="alert/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| tone | 语义色 | `info ｜ success ｜ warning ｜ danger` | `info` |
| variant | 视觉变体 | `subtle ｜ outline ｜ solid` | `subtle` |
| title | 标题 | `ReactNode` | — |
| description | 描述文本 | `ReactNode` | — |
| children | 自定义内容（替代 description） | `ReactNode` | — |
| showIcon | 是否显示图标 | `boolean` | `true` |
| icon | 自定义图标，传 `null` 隐藏 | `ReactNode` | 语义默认图标 |
| closable | 显示关闭按钮 | `boolean` | `false` |
| closeIcon | 自定义关闭图标 | `ReactNode` | `<Icon name="x" />` |
| action | 操作区内容 | `ReactNode` | — |
| banner | 贴边横幅样式 | `boolean` | `false` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| onClose | 关闭按钮回调 | `(event) => void` | — |
| classNames | 语义节点类名插槽 | `{ root?, icon?, content?, title?, description?, action?, close? }` | — |
| styles | 语义节点内联样式 | 同上 | — |

未列出的原生属性（`id`、`aria-*`、`data-*`、事件）会透传到根节点；`role` 可覆盖默认值。

## 定制点

- **Token**：根类 `.yuki-alert` 声明 `--yuki-alert-padding-block`、`--yuki-alert-padding-inline`、`--yuki-alert-gap`、`--yuki-alert-radius`、`--yuki-alert-font-size`、`--yuki-alert-icon-size`、`--yuki-alert-tone`、`--yuki-alert-tone-strong`、`--yuki-alert-tone-subtle`、`--yuki-alert-tone-border`、`--yuki-alert-tone-contrast`；语义变体只重映射这些槽位。
- **类名/样式**：`classNames.root | icon | content | title | description | action | close` 与对应 `styles.*`。
- **状态属性**：`data-tone`、`data-variant`、`data-size` 是公开接口，可用属性选择器做局部覆盖。

## 无障碍

- `danger` / `warning` 默认 `role="alert"`（断言式播报），`info` / `success` 默认 `role="status"`（礼貌播报）；可通过 `role` 覆盖。
- 图标为装饰性内容（`aria-hidden`），语义由标题与描述文字承载，不要只用颜色表达级别。
- 关闭按钮是原生 `<button>`，带本地化 `aria-label`，可通过 Tab 聚焦并有可见焦点环。
- `action` 中请放置原生可聚焦元素（`button` / `a`），不要使用 `div` + `onClick`。

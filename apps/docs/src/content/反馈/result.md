---
title: Result
group: 反馈
description: 结果页反馈，覆盖成功、失败、提示、警告与 403/404/500 等状态。
order: 11
---

## 何时使用

一个任务或流程**结束后**需要集中说明结果时使用：提交成功、支付失败、无权限、页面不存在、服务异常。它适合页面级或大区域占位，而不是行内提示。

- 行内、可关闭的提醒：`Alert`
- 只提示一句话：`Message`

## 基础用法

`status` 决定默认图标、语义色与标题（可被 `title` / `subTitle` 覆盖），`extra` 放后续操作。

<Demo id="result/01-basic" />

## 深度定制

`403` / `404` / `500` 内置对应图标与默认文案；`icon` 可替换为自定义插画，`size` 控制标题与图标尺寸，适合嵌入卡片或整页。

<Demo id="result/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| status | 结果状态 | `success ｜ error ｜ info ｜ warning ｜ 403 ｜ 404 ｜ 500` | `info` |
| title | 标题，覆盖默认文案 | `ReactNode` | 状态默认标题 |
| subTitle | 补充说明 | `ReactNode` | — |
| icon | 自定义图标/插画，传 `null` 隐藏 | `ReactNode` | 状态默认图标 |
| extra | 操作区 | `ReactNode` | — |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| classNames | 插槽 | `{ root?, icon?, content?, title?, subtitle?, extra? }` | — |
| styles | 插槽内联样式 | 同上 | — |

## 定制点

- **Token**：`.yuki-result` 声明 `--yuki-result-*` 系列（图标尺寸、语义色、标题字号、间距、最大宽度）；`data-status`、`data-size` 为公开状态属性。
- **结构**：`icon` 支持任意插画节点（建议固定宽高比）；`extra` 通常放 1–2 个按钮的 `Space`。
- **类名/样式**：`classNames.root | icon | content | title | subtitle | extra`。

## 无障碍

- 结果图标为装饰性内容（`aria-hidden`），结论由标题与说明文字承载。
- 标题为真实标题元素层级中的 `h2` 语义，便于屏幕阅读器跳转；如页面已有 `h1`，可按需包裹在正确的标题结构中。
- `extra` 中的操作请使用原生按钮/链接；危险操作同时使用 `tone` 与文案说明后果。
- 结果页不是模态框，不会移动焦点；流程跳转后应由路由把焦点移到页面主标题。

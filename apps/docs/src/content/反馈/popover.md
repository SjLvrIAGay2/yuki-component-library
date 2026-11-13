---
title: Popover
group: 反馈
description: 点击、悬停或聚焦触发的浮动卡片，用于承载说明、快捷操作与轻量表单。
order: 1
---

## 何时使用

需要在不离开当前上下文的情况下展示**较丰富的内容**（标题 + 多段文字、按钮组、小型表单）时使用 Popover。若只是纯文本提示，用 Tooltip；若是必须打断流程的决策，用 Modal。

## 基础用法

<Demo id="popover/01-basic" />

## 深度定制

`trigger` 切换交互方式，`title` 提供标题区，`placement` 指定首选方位（空间不足时自动翻转），`open`/`onOpenChange` 支持受控，`classNames` 可细化到弹出层、箭头、标题与内容。

<Demo id="popover/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 弹出层内容 | `ReactNode` | — |
| title | 标题 | `ReactNode` | — |
| trigger | 触发方式 | `click ｜ hover ｜ focus` | `click` |
| placement | 首选方位，空间不足自动翻转 | `top ｜ bottom ｜ left ｜ right` 及 `-start ｜ -end` 变体 | `bottom` |
| open / defaultOpen | 受控 / 非受控开关 | `boolean` | — |
| onOpenChange | 开关变化回调 | `(open: boolean) => void` | — |
| arrow | 显示箭头 | `boolean` | `true` |
| offset | 与触发元素的间距（px） | `number` | `8` |
| disabled | 禁用弹出 | `boolean` | `false` |
| closeOnOutsideClick | 点击外部关闭 | `boolean` | `true` |
| closeOnEscape | Esc 关闭 | `boolean` | `true` |
| classNames | `{ root, popup, arrow, title, content }` | — | — |
| styles | 同上 | — | — |

## 定制点

- **Token**：弹出层继承共享 `.yuki-popup` 外观，组件 token `--yuki-popover-max-width`、`--yuki-popup-width-*`。
- **类名/样式**：`classNames.root | popup | arrow | title | content`、`styles.*`。
- **结构**：`content`、`title` 接受任意 ReactNode；`children` 为唯一触发元素（会被注入 ARIA 属性）。
- **行为**：`trigger`、`placement`、`arrow`、`offset`、`disabled`、受控开关与关闭策略。

## 无障碍

- 触发元素自动获得 `aria-haspopup="dialog"`、`aria-expanded` 与 `aria-controls`。
- 点击外部关闭使用 pointer 事件并处理 `composedPath`，在 Shadow DOM 中同样可靠。
- hover 触发会保留 120ms 关闭延迟，允许指针从触发元素移动到弹出层；键盘用户请优先使用 click 或 focus 触发。
- 弹出层不自动抢夺焦点；如内容包含可交互元素，请自行管理打开后的焦点位置。

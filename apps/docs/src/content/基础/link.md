---
title: Link
group: 基础
description: 语义化超链接，内置外链标记、下划线策略与禁用态。
order: 4
---

## 何时使用

用于导航到另一个地址。若动作发生在当前页面内（打开弹层、提交、切换状态），请使用 Button 而不是 Link，避免误导读屏与键盘用户。

## 基础用法

<Demo id="link/01-basic" />

## 深度定制

`external` 会自动补全 `target="_blank"` 与 `rel="noopener noreferrer"` 并追加外链图标；`disabled` 会阻止点击、移出 Tab 序列并设置 `aria-disabled`。

<Demo id="link/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| underline | 下划线策略 | `auto ｜ always ｜ hover ｜ none` | `auto` |
| tone | 语义色调 | `default ｜ subtle ｜ danger` | `default` |
| size | 字号 | `sm ｜ md ｜ lg` | `md` |
| external | 外链：新窗口打开并显示图标 | `boolean` | `false` |
| icon | 自定义尾随图标 | `ReactNode` | 外链图标 |
| disabled | 禁用链接 | `boolean` | `false` |
| classNames | `{ root, icon }` | — | — |
| styles | `{ root, icon }` | — | — |

## 定制点

- **Token**：链接颜色使用 `--yuki-color-text-link`，悬停时使用 `--yuki-color-text-link-hover`。用原生 `style` 或根节点类名调整下划线。
- **类名/样式**：`classNames.root | icon`、`styles.*`。
- **结构**：`icon` 可替换尾随图标，`children` 即链接文本。
- **行为**：`underline`、`tone`、`size`、`external`、`disabled`，其余属性透传到 `<a>`。

## 无障碍

- 渲染原生 `<a>`，未提供 `href` 时仍可聚焦，但请尽量提供真实地址。
- 外链设置 `rel="noopener noreferrer"`，避免新窗口获得 `window.opener`。
- 禁用态使用 `aria-disabled="true"` 并阻止默认行为，而不是移除元素，保留上下文可发现性。
- 仅用颜色区分链接是不够的，正文中的链接请保留下划线（默认 `auto` 已处理）。

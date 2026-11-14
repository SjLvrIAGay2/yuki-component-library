---
title: 命令面板 CommandPalette
group: 导航
description: 按名称、关键词和分组选取并执行操作。
order: 42
---

把当前页面能执行的操作放进 `items`，每项提供唯一的 `id` 和可搜索的 `label`。输入多个词时，每个词都需出现在名称、分组或 `keywords` 中。上下键跳过禁用项，Enter 执行，Escape 关闭后焦点回到触发位置。

<Demo id="command-palette/01-basic" />

`trigger` 接收触发元素。可用 `open` 和 `onOpenChange` 接入应用快捷键，用 `title`、`placeholder` 和 `empty` 替换提示文案。文档站的搜索按钮支持 Ctrl+K 或 ⌘K。

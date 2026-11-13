---
title: Typography
group: 基础
description: 标题、正文与辅助文本的排版原语。字号阶梯、行高与字距全部来自 token。
order: 3
---

## 何时使用

页面中所有文字都应来自 Typography，而不是手写 `<h2>` 加内联字号。它把字号、字重、行高、颜色语义收敛到同一条视觉尺度上：

- `Title`：页面与区块标题，`level` 1–6 对应标题层级与字号阶梯
- `Text`：行内或块级正文，需要色调、字重、截断时使用
- `Paragraph`：段落，默认使用更舒展的行高
- `Typography`：排版容器，可以直接包裹内容，也提供子组件，`Typography.Title` 等同于 `Title`

## 基础用法

<Demo id="typography/01-basic" />

## 深度定制

单行与多行截断通过 `truncate` 表达（数字表示行数），多态标签用 `as`，装饰语义用 `code` / `mark` / `strong`，无需任何额外样式。

<Demo id="typography/02-custom" />

## API

### Title

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| level | 标题层级 | `1 ｜ 2 ｜ 3 ｜ 4 ｜ 5 ｜ 6` | `3` |
| plain | 去掉标题语义，改用 `div` 渲染 | `boolean` | `false` |
| size | 覆盖字号 | `TypographySize` | 由 level 决定 |

### Text / Paragraph / 公共属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| as | 多态标签 | `ElementType` | `span` / `p` |
| size | 字号 | `2xs…5xl` | `md` |
| weight | 字重 | `regular ｜ medium ｜ semibold ｜ bold` | `regular` |
| tone | 颜色语义 | `default ｜ secondary ｜ tertiary ｜ primary ｜ success ｜ warning ｜ danger ｜ info ｜ inverse` | `default` |
| align | 对齐 | `start ｜ center ｜ end ｜ justify` | — |
| truncate | 单行截断，或指定行数 | `boolean ｜ number` | `false` |
| gutterBottom | 底部留白 | `boolean` | `false` |
| strong / italic / underline / strike | 文本装饰 | `boolean` | `false` |
| code | 行内代码样式 | `boolean` | `false` |
| mark | 高亮标记样式 | `boolean` | `false` |
| classNames / styles | `{ root }` 插槽 | — | — |

## 定制点

- **Token**：字号消费 `--yuki-font-size-*`，行高 `--yuki-line-height-*`，颜色消费 `--yuki-color-text-*`；多行截断通过 `--yuki-typography-lines` 变量驱动。
- **类名/样式**：`className`、`classNames.root`、`styles.root`。
- **结构**：`as` 可切换到任意标签；`code`、`mark` 会切换默认标签与语义。
- **行为**：`size`、`weight`、`tone`、`align`、`truncate`、`gutterBottom` 与全部装饰 props。

## 无障碍

- `Title` 默认渲染真实 `h1–h5`，保留文档大纲语义；仅当视觉需要与语义分离时才用 `plain`。
- 不要通过 `size` 伪造标题层级，读屏依赖标签而非字号。
- `code` 输出 `<code>`，`mark` 输出 `<mark>`，让辅助技术理解其角色。

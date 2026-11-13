---
title: Icon
group: 基础
description: 24×24、1.75 描边的单色图标原语，内置常用图标并允许传入任意自定义 SVG。
order: 2
---

## 何时使用

用于表达动作、状态或类别的轻量视觉符号。图标继承 `currentColor`，因此永远与相邻文字保持同色；装饰性图标默认 `aria-hidden`，不会污染读屏。

## 基础用法

<Demo id="icon/01-basic" />

## 深度定制

`size` 接受数字（px）或任意 CSS 长度；`children` 可直接替换为自定义 SVG 内容，`label` 会把图标从装饰性切换为可访问图形。

<Demo id="icon/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 内置图标名 | `IconName` | — |
| size | 尺寸，数字为 px，字符串按 CSS 长度解析 | `number ｜ string` | `--yuki-icon-size-md` |
| label | 可访问名称；提供后设置 `role="img"` 与 `aria-label` | `string` | — |
| spin | 持续旋转（自定义加载图标） | `boolean` | `false` |
| strokeWidth | 描边粗细 | `number` | `1.75` |
| children | 自定义 SVG 内容，优先级高于 `name` | `ReactNode` | — |
| classNames | `{ root }` | `{ root?: string }` | — |
| styles | `{ root }` | `{ root?: CSSProperties }` | — |

## 定制点

- **Token**：默认尺寸消费 `--yuki-icon-size-md`；组件 token 可覆盖为 `--yuki-icon-size-sm/lg/…`，颜色继承 `currentColor`。
- **类名/样式**：`className`、`classNames.root`、`styles.root`。
- **结构**：`children` 替换整个 SVG 内容，支持第三方图标集。
- **行为**：`name`、`size`、`label`、`spin`、`strokeWidth` 以及所有 SVG 属性透传。

## 无障碍

- 没有 `label` 时输出 `aria-hidden="true"` 与 `focusable="false"`，避免读屏重复朗读装饰。
- 有 `label` 时输出 `role="img"` 与 `aria-label`，用于独立传达信息的图标。
- 图标按钮请确保按钮本身有可访问名称，而不是依赖图标内容。

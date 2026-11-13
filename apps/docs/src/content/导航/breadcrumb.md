---
title: Breadcrumb 面包屑
group: 导航
description: 展示页面在层级结构中的位置，并允许快速回到上级。
order: 20
---

# Breadcrumb 面包屑

面包屑展示当前页面在信息层级中的位置，帮助用户理解「我在哪」并快速回到上级页面。最后一项默认代表当前页面，带 `aria-current="page"`。

## 何时使用

- 站点或应用存在两级以上层级，需要让用户随时知道当前位置。
- 需要提供返回上级页面的快捷入口。
- 不要在单层页面或无法用路径表达的结构中使用。

## 基础用法

<Demo id="breadcrumb/01-basic" />

## 深度定制

通过 `separator`、`icon`、`disabled`、`itemRender` 定制分隔符与每一段的内容。

<Demo id="breadcrumb/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 面包屑数据 | `BreadcrumbItem[]` | — |
| separator | 分隔符节点 | `ReactNode` | `'/'` |
| itemRender | 自定义每一段的渲染 | `(item, index, items) => ReactNode` | — |
| classNames | 各语义节点的类名 | `BreadcrumbClassNames` | — |
| styles | 各语义节点的内联样式 | `BreadcrumbStyles` | — |
| className / style | 根节点类名与样式 | `string` / `CSSProperties` | — |

### BreadcrumbItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| title | 显示内容 | `ReactNode` |
| href | 存在时渲染为链接 | `string` |
| icon | 前置图标 | `ReactNode` |
| onClick | 链接点击回调 | `(event) => void` |
| disabled | 禁用（不渲染链接） | `boolean` |
| key | 稳定标识 | `string` |

## 定制点

面包屑在根节点暴露以下组件级变量：

| 变量 | 说明 |
| --- | --- |
| `--yuki-breadcrumb-gap` | 段落间距 |
| `--yuki-breadcrumb-item-gap` | 段落内文字与图标间距 |
| `--yuki-breadcrumb-font-size` | 字号 |
| `--yuki-breadcrumb-color` | 文字颜色 |
| `--yuki-breadcrumb-current-color` | 当前页颜色 |
| `--yuki-breadcrumb-link-color` | 链接颜色 |
| `--yuki-breadcrumb-link-hover-color` | 链接悬停颜色 |
| `--yuki-breadcrumb-separator-color` | 分隔符颜色 |
| `--yuki-breadcrumb-icon-size` | 图标尺寸 |
| `--yuki-breadcrumb-radius` | 链接圆角 |

## 无障碍

- 使用 `<nav>` 地标，并通过 `aria-label`（默认「面包屑导航」）区分多个导航区域。
- 当前页使用 `aria-current="page"`；禁用项不渲染为链接，并带 `aria-disabled`。
- 图标与分隔符是装饰性的，默认 `aria-hidden`，屏幕阅读器不会重复朗读。
- 链接支持键盘 Tab 聚焦，`:focus-visible` 使用统一焦点环。

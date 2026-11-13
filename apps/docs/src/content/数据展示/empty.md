---
title: 空状态 Empty
group: 数据展示
description: 当列表、表格或页面没有数据时，用一致的插画与引导操作替代空白。
order: 50
---

## 何时使用

- 列表、表格、搜索结果为空时。
- 需要引导用户执行下一步操作（如新建、刷新）时。
- 需要与品牌插画或自定义图标保持一致时。

## 基础用法

<Demo id="empty/01-basic" />

## 深度定制

<Demo id="empty/02-custom" />

## API

### Empty

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| image | 自定义插画，字符串按图片地址处理，null 关闭 | ReactNode | string | null | 内置插画 |
| icon | 使用图标替换内置插画 | ReactNode | — |
| description | 描述文案，null 关闭 | ReactNode | 暂无数据 |
| size | 尺寸：sm、md、lg | Size | 继承 ConfigProvider |
| imageStyle | 插画区域内联样式 | CSSProperties | — |
| children | 底部操作区，如按钮 | ReactNode | — |
| classNames | 语义节点类名 | EmptyClassNames | — |
| styles | 语义节点内联样式 | EmptyStyles | — |

## 定制点

- **设计 Token**：`--yuki-empty-illustration-size`、`--yuki-empty-description-color`、`--yuki-empty-description-size`、`--yuki-empty-gap`、`--yuki-empty-padding-inline/block`。
- **类名与样式**：`classNames` 可覆盖 `root`、`image`、`description`、`footer`（children 容器）四个语义节点。；`className`、`style` 作用于根节点。
- **结构**：根节点带 `data-slot="empty"` 与 `data-size`，`data-size` 表示尺寸档位。
- **行为**：受控与非受控用法一致，所有文案均可通过 ConfigProvider 的 locale 覆盖。

## 无障碍

- 内置插画是纯装饰元素，输出 `aria-hidden`，不干扰读屏。
- 描述文案作为空状态的语义内容被朗读，引导操作由真实按钮承担。
- 插画与文案使用 token 前景色，深色模式下自动适配。

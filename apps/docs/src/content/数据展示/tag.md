---
title: 标签 Tag
group: 数据展示
description: 用于标记对象的分类、属性或状态，支持可选、可关闭与多种视觉变体。
order: 20
---

## 何时使用

- 需要给内容打上分类或属性标记（如「设计」「已发布」）时。
- 需要在筛选器中提供可选中、可取消的标签时。
- 需要让用户关闭已选的筛选项时。

## 基础用法

<Demo id="tag/01-basic" />

## 深度定制

<Demo id="tag/02-custom" />

## API

### Tag

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| variant | 视觉变体：soft、solid、outline | TagVariant | soft |
| tone | 色调：neutral、primary、success、warning、danger、info | TagTone | neutral |
| size | 尺寸：sm、md、lg | Size | 继承 ConfigProvider |
| shape | 形状：default、round | TagShape | default |
| icon | 前置图标 | ReactNode | — |
| closable | 是否展示关闭按钮 | boolean | false |
| onClose | 关闭回调 | (event: MouseEvent) => void | — |
| closeIcon | 自定义关闭图标 | ReactNode | — |
| checkable | 是否作为可选标签 | boolean | false |
| checked | 受控选中态 | boolean | — |
| defaultChecked | 非受控初始选中态 | boolean | false |
| onCheckedChange | 选中态变化回调 | (checked: boolean) => void | — |
| disabled | 禁用 | boolean | false |
| classNames | 语义节点类名 | TagClassNames | — |
| styles | 语义节点内联样式 | TagStyles | — |

## 定制点

- **设计 Token**：`--yuki-tag-accent`、`--yuki-tag-accent-subtle`、`--yuki-tag-accent-border`、`--yuki-tag-height`、`--yuki-tag-radius`、`--yuki-tag-font-size`。
- **类名与样式**：`classNames` 可覆盖 `root`、`icon`、`content`、`close` 四个语义节点。；`className`、`style` 作用于根节点。
- **结构**：根节点带 `data-slot="tag"` 与 `data-size`，`data-tone`、`data-variant`、`data-checked` 反映当前状态。
- **行为**：受控与非受控用法一致，所有文案均可通过 ConfigProvider 的 locale 覆盖。

## 无障碍

- 可选标签使用 `role="checkbox"` 与 `aria-checked`，支持 Space、Enter 切换。
- 关闭按钮是独立可聚焦按钮，带「移除」可访问名称，点击不会触发标签本身的选中。
- 禁用标签带 `aria-disabled` 且不参与键盘切换。

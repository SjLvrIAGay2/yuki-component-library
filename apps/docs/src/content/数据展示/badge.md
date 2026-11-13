---
title: 徽标 Badge
group: 数据展示
description: 在图标或内容的右上角展示未读数量、状态点，也可独立展示状态说明。
order: 10
---

## 何时使用

- 需要在按钮、头像、图标右上角提示数量或红点时。
- 需要用一致的方式表达「在线 / 处理中 / 成功 / 告警」等状态时。
- 数量超过上限需要折叠为「99+」时。

## 基础用法

<Demo id="badge/01-basic" />

## 深度定制

<Demo id="badge/02-custom" />

## API

### Badge

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| count | 展示的数字 | number | — |
| dot | 仅显示小圆点 | boolean | false |
| status | 状态点：default、processing、success、warning、danger、info | BadgeStatus | — |
| text | 与 status 搭配的状态文案 | ReactNode | — |
| max | 数字上限，超出时显示 max+ 形式 | number | — |
| showZero | count 为 0 时是否展示 | boolean | false |
| color | 自定义指示器颜色 | string | — |
| offset | 指示器相对右上角的偏移 [x, y] | [number, number] | — |
| size | 尺寸：sm、md、lg | Size | 继承 ConfigProvider |
| classNames | 语义节点类名 | BadgeClassNames | — |
| styles | 语义节点内联样式 | BadgeStyles | — |

## 定制点

- **设计 Token**：`--yuki-badge-bg`、`--yuki-badge-fg`、`--yuki-badge-height`、`--yuki-badge-radius`、`--yuki-badge-dot-size`、`--yuki-badge-offset-x/y`。
- **类名与样式**：`classNames` 可覆盖 `root`、`indicator`、`count`、`dot`、`text` 五个语义节点。；`className`、`style` 作用于根节点。
- **结构**：根节点带 `data-slot="badge"` 与 `data-size`，`data-mode` 表示当前形态（overlay、status、pill、none）。
- **行为**：受控与非受控用法一致，所有文案均可通过 ConfigProvider 的 locale 覆盖。

## 无障碍

- 指示器内容通过视觉隐藏文本朗读（如「有 5 条未读」），纯装饰圆点带「有新内容」提示。
- `status` 圆点仅作装饰，状态语义由 `text` 文案承担。
- 数字与文案对比度满足 WCAG AA。

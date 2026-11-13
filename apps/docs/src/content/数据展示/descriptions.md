---
title: 描述列表 Descriptions
group: 数据展示
description: 成组展示只读的字段与值，常用于详情页与订单信息。
order: 80
---

## 何时使用

- 展示对象的一组属性（如订单详情、用户资料）时。
- 需要水平或垂直两种标签排布时。
- 需要跨列展示长文本、并为标签或内容做自定义渲染时。

## 基础用法

<Demo id="descriptions/01-basic" />

## 深度定制

<Demo id="descriptions/02-custom" />

## API

### Descriptions

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 描述项列表 | DescriptionItem[] | [] |
| title | 标题 | ReactNode | — |
| extra | 标题右侧操作区 | ReactNode | — |
| column | 每行列数 | number | 3 |
| bordered | 是否显示边框与分隔线 | boolean | false |
| layout | 布局：horizontal、vertical | DescriptionsLayout | horizontal |
| colon | 是否在标签后显示冒号 | boolean | true |
| size | 尺寸：sm、md、lg | Size | 继承 ConfigProvider |
| labelRender | 自定义标签渲染 | (item: DescriptionItem, index: number) => ReactNode | — |
| contentRender | 自定义内容渲染 | (item: DescriptionItem, index: number) => ReactNode | — |
| classNames | 语义节点类名 | DescriptionsClassNames | — |
| styles | 语义节点内联样式 | DescriptionsStyles | — |

### DescriptionItem

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| key | 唯一标识 | string | number | — |
| label | 字段标签 | ReactNode | — |
| children | 字段内容 | ReactNode | — |
| span | 占用列数，超出 column 时会被钳制 | number | 1 |
| labelStyle | 标签内联样式 | CSSProperties | — |
| contentStyle | 内容内联样式 | CSSProperties | — |
| className | 描述项类名 | string | — |

## 定制点

- **设计 Token**：`--yuki-descriptions-columns`、`--yuki-descriptions-label-width`、`--yuki-descriptions-label-color`、`--yuki-descriptions-content-color`、`--yuki-descriptions-cell-padding-block/inline`、`--yuki-descriptions-column-gap`、`--yuki-descriptions-row-gap`。
- **类名与样式**：`classNames` 可覆盖 `root`、`header`、`title`、`extra`、`table`、`item`、`label`、`content` 八个语义节点。；`className`、`style` 作用于根节点。
- **结构**：根节点带 `data-slot="descriptions"` 与 `data-size`，`data-layout`、`data-bordered`、`data-colon` 表示布局开关，列数通过根节点的 `--yuki-descriptions-columns` 变量控制。
- **行为**：受控与非受控用法一致，所有文案均可通过 ConfigProvider 的 locale 覆盖。

## 无障碍

- 使用语义化的 `div` 网格结构，标签与内容成对出现，读屏按顺序朗读字段名与值。
- 冒号由 CSS 伪元素生成，不进入可访问文本，避免读屏重复。
- 长文本自动换行，`span` 跨列时列数会被钳制在 `column` 之内。

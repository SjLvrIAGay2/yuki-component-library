---
title: List
group: 数据展示
description: 通用列表，支持默认/自定义条目、网格布局、分页、加载与空状态、虚拟滚动。
order: 2
---

## 何时使用

以单列或多列排布同构条目时使用，例如成员列表、卡片墙、消息流。需要严格的行列对齐与表头时请使用 Table；List 更强调条目内容的自由布局。

## 基础用法

传入 `items` 即可用默认条目布局渲染：默认读取 `title`/`label`/`name`、`description`/`content`、`extra`、`avatar`/`icon`、`actions`、`meta` 字段，也可以通过 `renderItem` 完全自定义。

<Demo id="list/01-basic" />

## 深度定制

`renderItem` 接管条目内容，`grid` 切换为多列网格，`pagination` 内置分页，`virtual` 在大数据量下只渲染可视条目。列表头部与尾部通过 `header` / `footer` 插槽放置。

<Demo id="list/02-custom" />

## 滚动续载

`onEndReached` 在列表末尾接近视口时请求下一批。获取数据时传 `loading`，追加数据后会重新判断是否需要续载。已读完时移除回调。分页模式使用页码控件。保留「加载更多」按钮也方便键盘用户操作。

<Demo id="list/03-more" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 数据源 | `readonly T[]` | `[]` |
| renderItem | 自定义条目渲染 | `(item: T, index: number) => ReactNode` | 内置 title/description/extra 布局 |
| rowKey | 条目唯一键 | `keyof T ｜ (item, index) => string ｜ number` | 依次取 `item.key`、下标 |
| header / footer | 头部 / 尾部 | `ReactNode` | — |
| bordered | 外边框 | `boolean` | `false` |
| split | 条目分隔线（网格模式忽略） | `boolean` | `true` |
| itemLayout | 条目布局 | `horizontal ｜ vertical` | `horizontal` |
| grid | 网格列数或配置（不能与 virtual 同用） | `number ｜ { columns?: number; gutter?: number }` | — |
| pagination | 分页配置 | `false ｜ ListPaginationConfig` | `false` |
| loading | 加载中 | `boolean` | `false` |
| onEndReached | 末尾接近视口时请求下一批，适用于普通列表和虚拟列表 | `() => void` | — |
| empty | 自定义空状态内容或渲染函数 | `ReactNode ｜ (() => ReactNode)` | `t('table.empty')` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| virtual | 虚拟滚动 | `{ height: number; itemSize?: number; overscan?: number }` | — |
| classNames / styles | 语义节点插槽 | `ListClassNames` / `ListStyles` | — |

### ListPaginationConfig

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| page / defaultPage | 当前页 | `1` |
| pageSize / defaultPageSize | 每页条数 | `10` |
| total | 总数 | 数据长度 |
| showSizeChanger / showTotal / simple / pageSizeOptions | 透传 Pagination | — |
| onChange | `(page, pageSize) => void` | — |

分页仅在总数大于每页条数时渲染；`page` / `pageSize` 传入即为受控。

## 定制点

- **Token**：在 `.yuki-list` 上覆盖条目间距、边框色、悬停背景等组件级变量；颜色统一消费 `--yuki-color-*` 语义 token，圆角消费 `--yuki-radius-*`。
- **类名/样式**：`classNames` / `styles` 提供 `root`、`header`、`body`、`item`、`avatar`、`itemMain`、`itemTitle`、`itemDescription`、`itemMeta`、`itemExtra`、`itemAction`、`footer`、`empty`、`loading`、`spinner`、`pagination` 插槽。
- **行为**：仅在空列表时调用传入 `empty` 的渲染函数。虚拟滚动要求固定 `height` 与稳定的 `itemSize`。
- **组合**：`onClick` 等根节点事件会让条目获得交互态样式；条目内可直接放 Button、Tag 等基础组件。

## 无障碍

- 条目容器为 `<ul role="list">`，每个条目为 `<li>`；根节点在加载时设置 `aria-busy="true"`。
- 加载态使用 `role="status"` + `aria-live="polite"`，并输出隐藏的“正在加载”文本。
- 空状态是纯文本节点，不参与焦点；若条目可点击，请在条目内提供真实的按钮/链接，而不是只依赖 `li` 的点击事件。
- 虚拟滚动只渲染可视区域，屏幕阅读器仅能读到大体量数据的一部分，数据浏览类场景建议配合分页使用。

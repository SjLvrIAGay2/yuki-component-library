---
title: Pagination
group: 导航
description: 页码导航，支持页码密度、每页条数、快速跳转与简洁模式。
order: 1
---

## 何时使用

数据量超过一屏时使用。表格分页优先由 Table 内置的分页器驱动；独立列表的分页则直接使用 Pagination。移动端或窄容器可切换 `simple` 模式。

## 基础用法

<Demo id="pagination/01-basic" />

## 深度定制

`page` 受控、`showSizeChanger` 切换每页条数、`showQuickJumper` 提供跳页输入、`showTotal` 自定义总数文案；`siblingCount` 控制当前页两侧保留的页码数量。

<Demo id="pagination/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| total | 数据总数 | `number` | — |
| pageSize | 每页条数（受控） | `number` | — |
| defaultPageSize | 默认每页条数 | `number` | `10` |
| page | 当前页（受控） | `number` | — |
| defaultPage | 默认当前页 | `number` | `1` |
| onChange | 页码或每页条数变化 | `(page: number, pageSize: number) => void` | — |
| pageSizeOptions | 每页条数候选 | `number[]` | `[10,20,50,100]` |
| showSizeChanger | 显示每页条数选择 | `boolean` | `false` |
| showQuickJumper | 显示快速跳页 | `boolean` | `false` |
| showTotal | 显示总数，或自定义渲染 | `boolean ｜ (total, range) => ReactNode` | `false` |
| simple | 简洁模式 | `boolean` | `false` |
| disabled | 禁用 | `boolean` | `false` |
| siblingCount | 当前页两侧页码数 | `number` | `1` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| classNames | `{ root, list, item, activeItem, prev, next, ellipsis, total, sizeChanger, quickJumper, jumpInput, simple }` | — | — |
| styles | 同上 | — | — |
| totalPages | 已知页数时直接传入总页数 | number | — |
| boundaryCount | 首尾保留的页码数 | number | 1 |
| previousContent、nextContent、ellipsis | 自定义翻页按钮及省略标记 | ReactNode | — |
| buttonProps | 根据按钮类型和页码定制属性，可用 preventDefault 取消跳页 | 函数 | — |

## 定制点

- **Token**：页码尺寸 `--yuki-pagination-item-size`、跳页输入宽度 `--yuki-pagination-jump-width`，颜色消费 primary/border/text 语义 token。
- **类名/样式**：完整的语义节点插槽列表（见 API 表），可精确控制每个页码、省略号与输入框。
- **结构**：`showTotal` 支持函数渲染；`classNames`/`styles` 可替换任意节点外观。
- **行为**：受控 `page`/`pageSize`、`simple`、`disabled`、`siblingCount`、`pageSizeOptions`。

## 无障碍

- 根节点是 `<nav aria-label="分页">`，页面按钮带 `aria-label="第 N 页"` 与 `aria-current="page"`。
- 上一页/下一页在边界处禁用；跳页输入框响应 Enter。
- 分页器不自动滚动页面；切换页码后如需回到顶部，请在 `onChange` 中自行处理。

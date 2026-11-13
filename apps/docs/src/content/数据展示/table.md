---
title: Table
group: 数据展示
description: 数据表格，支持排序、筛选、分页、行选择、展开行、固定列与虚拟滚动。
order: 1
---

## 何时使用

需要以行列结构展示结构化数据时使用。Table 覆盖了从轻量列表（只读展示）到数据密集型后台（排序、筛选、多选、固定列、虚拟滚动）的完整场景；数据量超过一屏时建议开启分页或虚拟滚动。

## 基础用法

`columns` 描述列结构，`data` 提供数据，`rowKey` 指定行唯一键。宽度、对齐方式与自定义渲染都在列定义中声明。

<Demo id="table/01-basic" />

## 深度定制

### 排序、筛选、选择与展开

列上声明 `sortable` / `filters` 即可获得表头控件；`rowSelection` 提供勾选（含半选表头），`expandable` 提供展开行。排序、筛选既可非受控，也可通过 `sortState` / `filterState` 完全受控，便于服务端排序与筛选。

<Demo id="table/02-custom" />

### 大数据与固定列

同时设置 `virtual` 与数字 `scroll.y` 即可启用虚拟滚动，`rowHeight` 必须与真实行高一致。`scroll.x` 配合 `fixed: 'left' | 'right'` 可固定列；固定列偏移会根据数字宽度自动累加。

<Demo id="table/03-virtual" />

## 组合表头与排序

通过 TableHead 的 sortDirection 和 onSortChange 控制排序。表头和单元格也支持原生合并行、合并列。

<Demo id="table/03-composition" />

## API

### Table

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 列定义 | `readonly TableColumn<T>[]` | — |
| data | 数据源 | `readonly T[]` | `[]` |
| rowKey | 行唯一键 | `keyof T ｜ (row, index) => string ｜ number` | 依次取 `item.key`、源数据下标 |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| bordered | 显示边框 | `boolean` | `false` |
| striped | 斑马纹 | `boolean` | `false` |
| hover | 行悬停高亮 | `boolean` | `true` |
| scroll | 横向/纵向滚动区域 | `{ x?: number ｜ string; y?: number ｜ string }` | — |
| stickyHeader | 固定表头 | `boolean` | 设置 `scroll.y` 时为 `true` |
| virtual | 行虚拟滚动（要求数字 `scroll.y`） | `boolean` | `false` |
| rowHeight | 虚拟滚动的固定行高 | `number` | sm 40 / md 48 / lg 56 |
| pagination | 分页配置 | `false ｜ TablePaginationConfig` | `false` |
| loading | 加载中 | `boolean` | `false` |
| empty | 自定义空状态内容或渲染函数 | `ReactNode ｜ (() => ReactNode)` | `t('table.empty')` |
| footerRender | 表尾内容 | `(data: readonly T[]) => ReactNode` | — |
| renderCell | 全局单元格回退渲染 | `(ctx: TableCellContext<T>) => ReactNode` | — |
| rowClassName | 行类名 | `string ｜ (row, index) => string` | — |
| onRow | 透传行事件与属性 | `(row, index) => HTMLAttributes<HTMLTableRowElement>` | — |
| rowSelection | 行选择配置 | `TableRowSelection<T>` | — |
| expandable | 展开行配置 | `TableExpandable<T>` | — |
| sortState | 排序状态（受控） | `{ columnKey: string; order: 'ascend' ｜ 'descend' } ｜ null` | — |
| defaultSortState | 默认排序状态 | 同上 | 首个声明 `defaultSortOrder` 的列 |
| onSortChange | 排序变化 | `(state ｜ null) => void` | — |
| filterState | 筛选状态（受控） | `Record<string, TableFilterValue[]>` | — |
| defaultFilterState | 默认筛选状态 | 同上 | — |
| onFilterChange | 筛选变化 | `(state, changedColumnKey) => void` | — |
| classNames / styles | 语义节点插槽 | `TableClassNames` / `TableStyles` | — |

### TableColumn<T>

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| key | 列唯一标识 | `string` | `dataIndex` 拼接，否则列下标 |
| title | 表头内容 | `ReactNode` | — |
| dataIndex | 取值路径 | `keyof T ｜ string ｜ readonly (string ｜ number)[]` | — |
| width / minWidth | 列宽 | `number ｜ string` | — |
| align | 对齐 | `left ｜ center ｜ right` | `left` |
| fixed | 固定列 | `left ｜ right` | — |
| sortable | 启用排序 | `boolean` | `false` |
| sorter | 自定义比较函数 | `(a: T, b: T) => number` | 按 `dataIndex` 比较 |
| defaultSortOrder | 初始排序 | `'ascend' ｜ 'descend'` | — |
| sortDirections | 排序循环方向 | `readonly ('ascend' ｜ 'descend')[]` | `['ascend', 'descend']` |
| filters | 筛选选项 | `readonly { label: ReactNode; value: string ｜ number ｜ boolean }[]` | — |
| filterMultiple | 多选筛选 | `boolean` | `true` |
| onFilter | 自定义筛选谓词 | `(value, row) => boolean` | 值相等 |
| render | 自定义单元格 | `(ctx: TableCellContext<T>) => ReactNode` | 取 `dataIndex` 的值 |
| ellipsis | 溢出省略 | `boolean` | `false` |
| className | 列类名 | `string` | — |

`TableCellContext<T>` 为 `{ row, rowIndex, column, columnKey, value }`。

### TableRowSelection<T>

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| type | `'checkbox'`（表格）或 `'radio'` | `checkbox` |
| selectedRowKeys / defaultSelectedRowKeys | 受控 / 默认选中键 | — |
| onChange | `(selectedRowKeys, selectedRows) => void` | — |
| getCheckboxProps | `(row, index) => { disabled?, name?, 'aria-label'? }` | — |
| columnWidth | 选择列宽 | `48` |
| fixed | 固定选择列 | — |
| hideSelectAll | 隐藏表头全选 | `false` |
| renderCell | 自定义选择单元格（`control` 为内置控件） | — |

全选只作用于当前页中未禁用的行；部分选中时表头显示半选。

### TableExpandable<T>

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| expandedRowKeys / defaultExpandedRowKeys | 受控 / 默认展开键 | — |
| onExpandedRowsChange | `(keys: TableKey[]) => void` | — |
| expandedRowRender | `(row, rowIndex) => ReactNode`（必填） | — |
| rowExpandable | 某行是否可展开 | 全部可展开 |
| expandIcon | 自定义展开图标 | 旋转的 chevron |
| columnWidth | 展开列宽 | `48` |
| fixed | 固定展开列 | — |
| expandedRowClassName | 展开行类名 | — |

虚拟滚动模式下不支持展开行。

### TablePaginationConfig

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| page / defaultPage | 当前页 | `1` |
| pageSize / defaultPageSize | 每页条数 | `10` |
| total | 总数 | 筛选后的数据长度 |
| serverSide | 数据已是服务端分页结果，不再客户端切片 | `false` |
| showSizeChanger / showTotal / simple / pageSizeOptions | 透传 Pagination | `showTotal` 为 `true` |
| onChange | `(page, pageSize) => void` | — |

## 定制点

- **Token**：在 `.yuki-table` 上覆盖 `--yuki-table-cell-padding-x/y`、`--yuki-table-font-size`、`--yuki-table-border-color`、`--yuki-table-header-bg`、`--yuki-table-header-color`、`--yuki-table-row-bg`、`--yuki-table-row-hover-bg`、`--yuki-table-row-striped-bg`、`--yuki-table-row-selected-bg`、`--yuki-table-radius` 即可整体换肤，其余颜色消费语义 token。
- **类名/样式**：`classNames` / `styles` 覆盖全部语义节点（`root`、`table`、`headerCell`、`sortTrigger`、`filterPanel`、`row`、`cell`、`expandedRow`、`footer`、`pagination`、`empty`、`loading` 等），也可用 `data-slot` 精确选择。
- **行为**：服务端排序/筛选使用受控 `sortState` / `filterState`；异步分页配合 `pagination.serverSide` 与 `pagination.total`。
- **组合**：自定义选择控件用 `rowSelection.renderCell`，自定义展开图标用 `expandable.expandIcon`，全局单元格兜底用 `renderCell`。

## 无障碍

- 根节点 `role="table"`，表头单元格 `role="columnheader"` 并带 `aria-sort`，数据单元格 `role="cell"`；加载时根节点 `aria-busy="true"`，状态区 `role="status"`。
- 排序按钮 `aria-label="排序 {列名}"`，筛选按钮为弹层触发器（`aria-haspopup="dialog"`），筛选选项为 `aria-pressed` 按钮；全选与行选择使用原生 checkbox / radio。
- 展开按钮带 `aria-expanded` 与“展开/收起”标签；选中行带 `aria-selected`。
- 固定列使用 `position: sticky`，键盘仍按 DOM 顺序遍历；虚拟滚动仅渲染可视行，请确保行高固定以获得稳定的焦点与读屏体验。

---
title: 统计值 Statistic
group: 数据展示
description: 突出展示关键指标数值，支持前后缀、精度、千分位与数字滚动动画。
order: 60
---

## 何时使用

- 需要在仪表盘或卡片中突出单个关键指标时。
- 需要统一数字格式（千分位、精度、货币前缀）时。
- 需要数值变化时以滚动动画吸引注意时。

## 基础用法

<Demo id="statistic/01-basic" />

## 深度定制

<Demo id="statistic/02-custom" />

## API

### Statistic

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 数值，字符串会原样展示 | number | string | — |
| title | 标题 | ReactNode | — |
| prefix | 数值前缀 | ReactNode | — |
| suffix | 数值后缀 | ReactNode | — |
| precision | 小数位数 | number | — |
| groupSeparator | 千分位分隔符 | string | 根据 locale |
| decimalSeparator | 小数点符号 | string | 根据 locale |
| formatter | 自定义格式化函数 | (value: number | string) => string | — |
| valueRender | 自定义数值渲染 | (formatted: string, value: number | string) => ReactNode | — |
| countUp | 是否播放数字滚动动画 | boolean | false |
| countDuration | 滚动动画时长（毫秒） | number | 900 |
| loading | 加载骨架 | boolean | false |
| size | 尺寸：sm、md、lg | Size | 继承 ConfigProvider |
| valueStyle | 数值内联样式 | CSSProperties | — |
| classNames | 语义节点类名 | StatisticClassNames | — |
| styles | 语义节点内联样式 | StatisticStyles | — |

## 定制点

- **设计 Token**：`--yuki-statistic-value-size`、`--yuki-statistic-value-weight`、`--yuki-statistic-value-color`、`--yuki-statistic-title-size`、`--yuki-statistic-title-color`、`--yuki-statistic-affix-size`、`--yuki-statistic-affix-color`、`--yuki-statistic-gap`。
- **类名与样式**：`classNames` 可覆盖 `root`、`title`、`content`、`prefix`、`value`、`suffix`、`loading` 七个语义节点。；`className`、`style` 作用于根节点。
- **结构**：根节点带 `data-slot="statistic"` 与 `data-size`，`data-loading` 表示骨架状态。
- **行为**：受控与非受控用法一致，所有文案均可通过 ConfigProvider 的 locale 覆盖。

## 无障碍

- 滚动动画在系统开启「减少动态效果」时自动跳过，直接展示最终值。
- 数值语义由文本内容提供，前缀后缀属于同一段文本，读屏连续朗读。
- 加载态输出 `aria-busy`，避免读屏读到中间值。

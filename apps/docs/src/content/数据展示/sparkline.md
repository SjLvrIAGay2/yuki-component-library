---
title: 趋势线 Sparkline
group: 数据展示
description: 在指标或表格单元格内呈现一组数值的变化。
order: 61
---

`values` 按时间顺序传入数字，`null` 和非有限值会在图中留出断点。单点显示为圆点，常量序列显示为水平线。传 `label` 说明趋势和单位，作为旁边说明文字的装饰时可省略。外观通过 `style` 的颜色、宽度、高度调整。

<Demo id="sparkline/01-basic" />

---
title: Accordion 折叠面板
group: 数据展示
description: 用面板数组或组合组件收纳内容，可同时展开一项或多项。
order: 30
---

## 面板数组

每项使用稳定且非空的字符串 `value`、按钮标题 `title` 与面板 `content`。`extra` 可放计数标签或独立的操作按钮。收起面板会保留表单输入。

<Demo id="accordion/03-items" />

<Demo id="accordion/04-items-custom" />

## 组合面板

需要指定标题层级、定制动效或管理内容的挂载时，组合 `AccordionItem`、`AccordionTrigger` 和 `AccordionContent`。

<Demo id="accordion/01-basic" />

## API

| 范围 | 属性 | 用法 |
| --- | --- | --- |
| Accordion | type | 默认 `multiple`。传 `single` 同时只展开一项 |
| Accordion | value、defaultValue、onValueChange | 受控展开项、初始展开项、变更回调。多项模式用 `string[]`，单项模式用 `string` |
| Accordion | collapsible | 单项模式允许再次点击收起，回调传入空字符串。默认 `false` |
| Accordion | disabled、orientation、dir | 整组禁用、键盘方向与文本方向 |
| 数组模式 | items | `readonly AccordionPanel[]`，每项有 `value`、`title`，以及可选的 `content`、`extra`、`disabled`、`showArrow`、`className`、`style` |
| 数组模式 | bordered、ghost、size | 是否显示外框（默认 true）、透明背景（默认 false）、尺寸（继承全局设置） |
| 数组模式 | expandIconPosition、expandIcon | 箭头放在 `start`（默认）或 `end`，可传节点或 `(item, open) => ReactNode` |
| 数组模式 | classNames、styles | 设置 root、item、header、title、extra、expandIcon、panel、panelInner、content 插槽 |
| 组合模式 | animation | 全组展开动效，可设 false |
| AccordionItem | value、disabled | 稳定且非空的标识、禁用单项 |
| AccordionTrigger | headerProps、indicator、indicatorProps | 指定标题元素或替换箭头 |
| AccordionContent | forceMount、bodyProps、animation | 保留组件状态、定制内容容器和单项动效 |

## 定制点

`expandIcon` 可根据面板展开状态切换图标。组合写法可在单个触发器传入 `indicator`，并用 `forceMount` 保留对应面板中的表单状态。

<Demo id="accordion/02-custom" />

## 无障碍

标题按钮通过 `aria-expanded` 公布状态。方向键在标题之间移动，Home 和 End 跳到首尾，Enter 或空格切换当前面板。收起时隐藏内容即刻退出键盘和读屏顺序。

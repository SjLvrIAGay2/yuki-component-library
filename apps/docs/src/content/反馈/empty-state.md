---
title: EmptyState 空状态
group: 反馈
description: 为搜索结果或列表提供带标题、说明与操作的空状态。
order: 30
---

## 清除筛选

<Demo id="empty-state/01-basic" />

## API

title 是空状态标题。description 说明原因，action 接收按钮或链接，icon 可指定组件库图标。对应的 titleProps、descriptionProps、actionProps 和 iconProps 会传递给实际元素。

## 定制点

icon 可用当前图标集表达业务状态，action 可放置跳转链接或操作按钮。

<Demo id="empty-state/02-custom" />

## 无障碍

标题和说明直接传达当前状态。图标默认仅作装饰，交互操作请使用有名称的按钮或链接。

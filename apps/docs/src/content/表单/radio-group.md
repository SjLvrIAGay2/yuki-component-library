---
title: RadioGroup 单选组
group: 表单
description: 带组选项说明和验证反馈的原生单选组。
order: 30
---

## 选项说明

使用方向键在选项间移动，读屏工具会一起朗读选项说明。

<Demo id="radio-group/01-basic" />

## API

label 提供单选组的无障碍名称。options 可为字符串数组，也可包含 value、label、description、disabled。使用 description 提供整组帮助，error 显示验证消息。direction 或 orientation 设置布局方向。value、defaultValue 和 onChange 与 Radio 的数据模式一致。

## 定制点

组消息的 error 优先于 description。可通过 messageProps、descriptionProps 传入额外属性或调整说明样式。

<Demo id="radio-group/02-custom" />

## 无障碍

组名称、选项说明与验证错误通过 aria-label、aria-describedby 和 aria-invalid 关联，单选项保留原生方向键交互。

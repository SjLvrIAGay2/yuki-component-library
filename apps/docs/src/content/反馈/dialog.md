---
title: Dialog 组合对话框
group: 反馈
description: 带触发器、关闭操作和焦点恢复的可组合对话框。
order: 30
---

## 编辑项目

trigger 复用按钮本身。DialogClose 可以包装页脚操作，让保存按钮在处理完成后关闭窗口。

<Demo id="dialog/01-basic" />

## API

| 属性 | 用途 |
| --- | --- |
| title、description、children、footer | 对话框标题、说明、表单内容和操作区 |
| open、defaultOpen、onOpenChange | 管理打开状态 |
| modal | 默认为模态，可设为 false 允许访问外部内容 |
| portalContainer、portalProps | 指定挂载点，通过 forceMount 在收起时保留表单状态 |
| contentProps、overlayProps、closeProps | 定制内容、遮罩和关闭控件 |
| animation、size | 配置进出动效和宽度 |

## 定制点

设置 contentProps.forceMount 可在关闭后保留未提交的输入。通过 size、bodyProps、footerProps 和 closeProps 调整布局与操作区。

<Demo id="dialog/02-custom" />

## 无障碍

打开时焦点移入对话框，模态状态限制背景交互。按 Esc 关闭后焦点返回触发器。嵌套选择框先接收 Esc。

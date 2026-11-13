---
title: 代码块 CodeBlock
group: 内容与媒体
description: 展示源码、配置或日志，提供语法高亮、行号和复制操作。
order: 10
---

## 基础用法

指定语言后，代码块按语法着色。行号和高亮行跟随起始行号。

<Demo id="code-block/01-basic" />

## 长行与换行

窄屏可启用自动换行。显示行数达到上限时，复制按钮仍会复制完整原文，包括原始换行符。

<Demo id="code-block/02-custom" />

## API

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| code | 要显示的源码字符串 | 必填 |
| language / filename | 语法名称和工具栏文件名 | text / — |
| showLineNumbers / startLine | 显示行号和起始行号 | true / 1 |
| highlightLines | 需要强调的行号数组 | [] |
| wrap / maxHeight | 自动换行、预览区最大高度 | false / 480 |
| maxRenderedLines | 预览最多渲染的行数 | 10000 |
| copyable / showToolbar | 显示复制按钮、显示整个工具栏 | true / true |
| onCopy / onCopyError | 成功时收到原文，失败时收到 Error | — |

## 定制点

使用 `toolbar` 增加操作，或通过 `toolbarProps`、`viewportProps`、`copyButtonProps` 传入节点属性。`truncationMessage` 可自定义截断提示。`--yuki-code-keyword` 和 `--yuki-code-string` 控制语法配色。

## 无障碍

预览区接受键盘焦点并支持滚动。行号对读屏隐藏，复制状态在操作后播报。

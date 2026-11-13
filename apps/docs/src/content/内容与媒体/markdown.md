---
title: Markdown 文本
group: 内容与媒体
description: 将 Markdown 转为可阅读的正文，支持表格、任务列表和代码围栏。
order: 20
---

## 基础用法

将 Markdown 源文作为子元素传入。代码围栏自动使用 CodeBlock。

<Demo id="markdown/01-basic" />

## 实时预览

编辑源文可以立即查看渲染结果。示例开启了代码行号，并用替代文本展示图片引用。

<Demo id="markdown/02-custom" />

## API

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| children | Markdown 字符串 | 必填 |
| components | 替换指定元素的 React 渲染器 | — |
| renderCodeBlock | 自定义代码围栏渲染函数 | — |
| codeLineNumbers | 在代码块中显示行号 | false |
| allowImages | 加载嵌入图片 | true |
| openLinksInNewTab | 在新标签页打开外部链接 | true |
| maxRenderedLines | 显示的最大行数 | 10000 |

## 定制点

通过 `codeBlockProps` 配置所有围栏，`tableScrollProps` 设置表格滚动区域，`truncationMessage` 修改截断提示。默认渲染器忽略原始 HTML，并过滤危险链接。

## 无障碍

标题保留原有层级。任务列表使用有名称的复选框，宽表格可用键盘横向滚动。

---
title: 内容渲染 ContentRenderer
group: 内容与媒体
description: 通过内容类型为附件和富文本选择对应的预览组件。
order: 70
---

## 基础用法

使用 `type` 选择内容类型，再传入该组件的属性。

<Demo id="content-renderer/01-basic" />

## 切换附件

文件列表可以共用一个预览区。示例将每一项的内容类型与其数据一起保存，切换时释放旧媒体资源。

<Demo id="content-renderer/02-custom" />

## API

| type | 对应组件 | 内容输入 |
| --- | --- | --- |
| code | CodeBlock | code、language |
| markdown | Markdown | children 字符串 |
| document | DocumentViewer | src 或 content |
| audio | AudioPlayer | src 或媒体子元素 |
| video | VideoPlayer | src、poster、tracks |
| image | ImageViewer | src、alt |

## 定制点

`ContentRendererProps` 是由 `type` 区分的联合类型。支持对应组件的受控属性、事件和样式配置，可将 `pdfOptions`、`codeBlockProps` 等配置直接传给相应类型。

## 无障碍

为图片提供描述性 `alt`，为视频提供 `tracks` 字幕。文档和播放器保留各自的键盘操作与状态播报。

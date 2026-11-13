---
title: 文档预览 DocumentViewer
group: 内容与媒体
description: 在页面内阅读 PDF、Word、Markdown、源代码和纯文本文件。
order: 30
---

## 示例文件

切换文件即可分别查看 PDF 分页、可选文本、DOCX 表格及嵌入图片。PDF 工作者和 Word 转换器会在打开对应格式时加载。

<Demo id="document-viewer/01-basic" />

## 本地预览

选择本地文件后，组件直接读取 File 并识别格式。远程地址需允许页面读取其内容。

<Demo id="document-viewer/02-custom" />

## API

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| src | 文件 URL、File 或 Blob | — |
| content | 内联文本，提供时优先使用 | — |
| format | auto、markdown、text、code、pdf、docx | auto |
| filename / language | 覆盖文件名或源代码语言 | 自动识别 |
| maxFileSize | 允许读取的最大字节数 | 20 MiB |
| maxRenderedLines | 文本和源码的最大显示行数 | 10000 |
| showHeader / header | 显示文件头、替换标题 | true / 文件名 |
| pdfOptions | 密码、资源地址、页码、缩放及工具栏 | — |
| active | 面板隐藏时传入 false 以暂停 PDF 绘制 | true |
| onLoad / onError | 接收 DocumentLoadInfo 或 DocumentError | — |

## 定制点

`pdfOptions.page`、`zoom` 可搭配 `onPageChange`、`onZoomChange` 受控使用。可通过 `cMapUrl`、`standardFontDataUrl`、`wasmUrl` 配置特殊 PDF 依赖的资源目录。`markdownOptions` 与 `codeBlockProps` 配置文本渲染，`renderError(error, { retry })`、`renderLoading` 和 `renderEmpty` 可替换对应状态。DOCX 以经过清理的 HTML 排版，保留标题、表格与图片；复杂分页效果取决于原文格式。

## 无障碍

PDF 提供可选择的文本层和带名称的翻页、缩放按钮。读取、绘制和错误状态可被读屏识别。

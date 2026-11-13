---
title: 图片查看器 ImageViewer
group: 内容与媒体
description: 显示 URL 或本地文件，可与轮播和预览组件组合为相册。
order: 20
---

## 基础用法

图片随容器宽度等比显示。

<Demo id="image-viewer/01-basic" />

## 本地相册

相册缩略图裁剪铺满画面。选择多张图片后，用轮播箭头切换，点击缩略图可在全屏预览中查看完整图片并调节缩放。轮播获得焦点时支持方向键，Esc 关闭预览。

<Demo id="image-viewer/02-custom" />

## API

| 属性 | 用途 |
| --- | --- |
| src | 图片 URL、Blob 或 File |
| alt | 图片的替代文本，装饰图片可传空字符串 |
| onLoad、onError | 监听原生图片的加载结果 |
| ref | 访问 img 元素 |

ImageViewer 在本地文件替换和组件卸载时释放生成的对象 URL。需要缩略图遮罩、加载占位或全屏预览时使用 Image。

## 定制点

透传的原生图片属性包括 sizes、srcSet、loading 和 decoding，可用 style 调整最大尺寸和 objectFit。

## 无障碍

用 alt 描述图片内容。示例中的 Image 预览支持 Enter 或空格打开，关闭后焦点返回缩略图。

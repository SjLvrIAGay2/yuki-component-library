---
title: 视频播放器 VideoPlayer
group: 内容与媒体
description: 播放视频、切换字幕和倍速，支持全屏和本地文件预览。
order: 40
---

## 基础用法

<Demo id="video-player/01-basic" />

## 本地视频

<Demo id="video-player/02-custom" />

## API

| 属性 | 用途 | 默认值 |
| --- | --- | --- |
| src | 视频 URL、Blob 或 File，也可通过子节点传入多个原生 source | — |
| title、poster | 视频名称和封面地址 | — |
| tracks | 字幕轨道，包含 src、label、srcLang 及可选的 kind、default | — |
| controlsVariant | custom 使用组件控制栏，native 使用浏览器控制栏 | custom |
| controls、controlOptions | 控制整栏或单项，额外支持 captions 和 fullscreen | — |
| playbackRates | 可选倍速 | 0.5、1、1.5、2 |
| active | 隐藏播放器时可设为 false 暂停播放 | true |
| showMetadata、onMetadata | 控制元数据显示，或接收尺寸和时长 | — |
| renderControls | 根据播放状态渲染自定义控制栏 | — |
| renderEmpty、renderLoading、renderError | 自定义空源、缓冲和加载错误状态 | — |

ref 指向原生 video 元素。全屏时移动指针到视频下方、按 Tab，或触摸画面可呼出控制栏。

## 定制点

倍速和字幕菜单会按选项宽度展开。较长的字幕名称会在窄屏上换行，全屏时也能完整阅读。

可用 captionProps 调整控制区，stageProps 调整画面容器，startButtonProps 设置画面中央的播放按钮。播放速度菜单使用组件库的 Select。

## 无障碍

通过 tracks 提供字幕，用户可在字幕菜单中切换语言或关闭字幕。全屏模式中支持通过 Tab 显示并操作控制栏。

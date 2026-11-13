---
title: 音频播放器 AudioPlayer
group: 内容与媒体
description: 播放远程音频或本地文件，控制音量、进度和倍速。
order: 30
---

## 基础用法

<Demo id="audio-player/01-basic" />

## 控件和封面

<Demo id="audio-player/02-custom" />

## API

| 属性 | 用途 | 默认值 |
| --- | --- | --- |
| src | 音频 URL、Blob 或 File，也可通过子节点传入多个原生 source | — |
| title、description、cover | 音轨名称、描述和封面地址 | — |
| controlsVariant | custom 使用组件控制栏，native 使用浏览器控制栏 | custom |
| controls | 显示播放控件 | true |
| controlOptions | 分别切换 timeline、skip、volume、playbackRate，或设置 skipSeconds | — |
| playbackRates | 倍速菜单选项，接受 0.25 到 4 的数值 | 0.5、1、1.5、2 |
| showMetadata | 在音轨名称旁显示时长 | true |
| active | 设为 false 后暂停播放；恢复时由用户手动播放 | true |
| onMetadata、onMediaError | 接收时长、文件信息或错误原因 | — |
| renderControls | 用播放状态与控制方法渲染自己的控制栏 | — |
| renderEmpty、renderLoading、renderError | 自定义状态，renderError 接收重试方法 | — |

ref 指向原生 audio 元素。parseMediaMetadata 可在浏览器中单独读取媒体的时长等信息，支持 AbortSignal 取消读取。

## 定制点

倍速菜单按选项宽度展开，完整显示小数倍速和选中标记。

通过 playButtonProps、volumeProps、timelineProps 分别设置播放键、音量和进度条的属性。封面支持 coverProps，外观随 ConfigProvider 切换。

## 无障碍

按钮有独立的操作名称，进度条和音量条支持方向键。可用 title 或 aria-label 区分页面中的多个播放器。

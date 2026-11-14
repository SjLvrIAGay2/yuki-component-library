---
title: 图片对比 ImageComparison
group: 内容与媒体
description: 拖动分界线比对两个版本的图像。
order: 25
---

提供 `before` 和 `after` 两张图片及各自的 `alt`。鼠标、触摸或键盘方向键都能调整前图显示比例。后图决定画框尺寸，前图等比裁切到同一画框；比对设计稿时宜使用相同尺寸的源图。

<Demo id="image-comparison/01-basic" />

`defaultValue` 指定初始百分比，默认 50。用 `value` 和 `onChange` 可同步多个对比视图。传入 `label` 命名滑块，`caption` 添加图注。

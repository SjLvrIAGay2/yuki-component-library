---
title: Animation 动效
group: 基础
description: 为组件设置进出场、交互反馈或自定义关键帧，并响应减少动态效果偏好。
order: 30
---

## 展开详情

<Demo id="animation/01-basic" />

## API

| 属性 | 用途 |
| --- | --- |
| open | 控制显示。关闭后立即停止交互，退出动效结束后卸载 |
| forceMount | 关闭时保留隐藏的节点和内部状态 |
| animation | 可设置 preset、duration、delay、easing、direction、distance、scale |
| preset | 支持 none、fade、scale、slide、collapse、feedback、spin、shimmer 和 custom |
| enterName、exitName | custom 模式使用的 CSS 关键帧名称 |

单个实例可设置 animation={false}。ConfigProvider 的 motion={false} 和系统减少动态效果设置优先于实例动效。需要自己的节点和生命周期时，可组合 useAnimation、usePresence 与 useReducedMotion。

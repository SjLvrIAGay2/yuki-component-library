---
title: PagePresets 页面预设
group: 反馈
description: 可复用的错误、空结果、加载、维护、离线、跳转及任务结果页面。
order: 30
---

## 页面状态

切换状态可体验取消、重试和手动跳转。标题、说明、按钮和进度条沿用当前主题与语言。

<Demo id="page-presets/01-basic" />

## API

| 组件 | 主要属性 |
| --- | --- |
| ErrorPage | statusCode，内置 401、403、404、500 和 503 |
| EmptyPage | reason 支持 no-data 和 no-results |
| ResultPage | status 支持 success、failure、warning 和 processing |
| LoadingPage | value、max、onCancel；传入 null 显示不定进度 |
| MaintenancePage | recoveryTime、onRetry |
| OfflinePage | online、onReconnect |
| RedirectPage | href、onNavigate、autoRedirect、delay、onCancel、renderFallback |

## 布局和操作

PagePreset 提供共享的 title、description、icon、illustration、footer 和 actions 插槽；layout 可设为 compact 或 illustrated。primaryAction、secondaryAction 接收按钮回调或 href，LinkComponent 可接入路由。重试与跳转回调接收 AbortSignal，可在卸载后取消请求。跳转默认由用户触发。

## 定制点

autoRedirect 配合 delay 显示可取消倒计时。onNavigate 可接入路由，renderFallback 可在导航失败时提供重试操作。

<Demo id="page-presets/02-custom" />

## 无障碍

页面通过唯一标识关联主标题，进度使用 progressbar。倒计时、恢复连接和异步失败均有状态或警报文本，按钮在请求中禁用以避免重复提交。

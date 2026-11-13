---
title: ToastProvider 消息队列
group: 反馈
description: 管理局部通知队列，支持滑动关闭、键盘聚焦和自定义操作。
order: 30
---

## 保存反馈

点击保存后可使用关闭按钮或滑动移除通知。按 F8 聚焦通知区。

<Demo id="toast/01-basic" />

## API

| 接口 | 用途 |
| --- | --- |
| ToastProvider | 设置 position、duration、maxToasts 和 portalContainer |
| useToast().toast(options) | 推入一条消息并返回 id。支持 title、description、variant、action 和 duration |
| useToast().dismiss(id) | 立即移除消息；传入 { animate: true } 可播放退出动效 |
| providerProps、viewportProps、toastProps | 调整滑动方向、通知区快捷键和默认样式 |

## 定制点

maxToasts 限制可见消息数。保存 toast() 返回的 id，业务完成时可以手动 dismiss。

<Demo id="toast/02-custom" />

## 无障碍

通知区支持 F8 聚焦，消息内容会自动播报。需要长时间交互的通知可以设置 duration 为 Infinity，并保留关闭按钮。

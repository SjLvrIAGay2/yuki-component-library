---
title: 相对时间 RelativeTime
group: 数据展示
description: 以当前语言显示时间距离，并随时间更新。
order: 62
---

`value` 接受 Date、毫秒时间戳或含时区的 ISO 字符串。时钟随浏览器时间更新，文案使用当前 Provider 语言。固定报表可传 `now`，使同一份报告在不同日期打开时得到同样的相对时间。渲染出的 `time` 元素含有可机器读取的绝对时间。

<Demo id="relative-time/01-basic" />

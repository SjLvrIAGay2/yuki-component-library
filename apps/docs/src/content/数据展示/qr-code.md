---
title: 二维码 QRCode
group: 数据展示
description: 把链接或短文本编码为可扫描的二维码，零运行时依赖。
order: 140
---

## 何时使用

- 需要在页面展示分享链接、支付码或设备配对信息时。
- 需要中心 Logo、品牌色或边框时。
- 需要「加载中 / 已失效」状态与刷新操作时。

## 基础用法

<Demo id="qr-code/01-basic" />

## 深度定制

<Demo id="qr-code/02-custom" />

## API

### QRCode

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 要编码的文本 | string | — |
| size | 二维码边长（像素） | number | 160 |
| level | 纠错等级：L、M、Q、H | QRCodeErrorLevel | M |
| color | 前景色 | string | — |
| bgColor | 背景色 | string | — |
| bordered | 是否显示边框与内边距 | boolean | false |
| status | 状态：active、loading、expired | QRCodeStatus | active |
| statusRender | 自定义状态层内容 | (status: QRCodeStatus) => ReactNode | — |
| onRefresh | 失效状态的刷新回调 | () => void | — |
| icon | 中心 Logo | ReactNode | — |
| ariaLabel | 可访问名称 | string | 二维码 |
| classNames | 语义节点类名 | QRCodeClassNames | — |
| styles | 语义节点内联样式 | QRCodeStyles | — |
| marginSize | 二维码静区宽度，以模块为单位 | number | 0 |

## 定制点

- **设计 Token**：`--yuki-qrcode-fg`、`--yuki-qrcode-bg`、`--yuki-qrcode-radius`、`--yuki-qrcode-padding`、`--yuki-qrcode-logo-size`、`--yuki-qrcode-logo-bg`、`--yuki-qrcode-logo-padding`、`--yuki-qrcode-logo-radius`、`--yuki-qrcode-status-bg/color`、`--yuki-qrcode-duration/easing`。
- **类名与样式**：`classNames` 可覆盖 `root`、`canvas`、`logo`、`status`、`refresh` 五个语义节点。；`className`、`style` 作用于根节点。
- **结构**：根节点带 `data-slot="qr-code"` 与 `data-size`，`data-level`、`data-status`、`data-bordered`、`data-error`（编码失败）反映当前状态。
- **行为**：受控与非受控用法一致，所有文案均可通过 ConfigProvider 的 locale 覆盖。

## 无障碍

- 根节点 `role="img"` 并提供可访问名称；二维码 SVG 本身对读屏隐藏，避免无意义朗读。
- 加载中输出 `aria-busy`；失效状态提供真实「刷新」按钮。
- 前景与背景应保持足够对比度，扫描区域不受 Logo 遮挡影响（纠错等级会补偿中心遮挡）。

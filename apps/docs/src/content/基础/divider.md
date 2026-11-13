---
title: Divider
group: 基础
description: 分隔区块的水平或垂直细线，可承载居中/起始/末尾说明文字。
order: 5
---

## 何时使用

用于表示相邻内容之间的边界。分组有名称时，可同时使用标题说明内容。

## 基础用法

<Demo id="divider/01-basic" />

## 深度定制

`orientation="vertical"` 适合行内分隔。`variant` 控制线型，`labelPosition` 控制文字位置，`strong` 提升到更强边框。`Space` 的 `split` 槽位可复用同一个分隔组件。

<Demo id="divider/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| orientation | 方向 | `horizontal ｜ vertical` | `horizontal` |
| decorative | 纯装饰分隔线，省略分隔线语义与方向 | `boolean` | `false` |
| variant | 线型 | `solid ｜ dashed ｜ dotted` | `solid` |
| labelPosition | 说明文字位置 | `start ｜ center ｜ end` | `center` |
| strong | 使用更强对比的边框 | `boolean` | `false` |
| classNames | `{ root, label }` | — | — |
| styles | `{ root, label }` | — | — |
| children | 分隔线中的说明文字 | `ReactNode` | — |

## 定制点

- 在线条根节点覆写 `--yuki-divider-color` 或 `--yuki-divider-style` 可定制颜色和线型。普通线取 `--yuki-color-divider`，strong 线取 `--yuki-color-border-strong`。
- `classNames.root` 与 `styles.root` 定制分隔线容器，`classNames.label` 与 `styles.label` 定制文字区域。说明文字由 children 提供。

## 无障碍

组件默认给自己的根节点设置 `role="separator"`，`aria-orientation` 对应实际方向。启用 decorative 后，根节点使用 `role="presentation"`，并省略 aria-orientation。显式传入其他 role 时也仅在最终 role 为 separator 时设置方向。

<Demo id="divider/03-semantic" />

<Demo id="divider/04-decorative" />

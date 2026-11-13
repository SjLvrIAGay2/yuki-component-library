---
title: Watermark 水印
group: 其他
description: 在内容上方覆盖重复的 Canvas 水印。
order: 1
---

# Watermark 水印

水印用于标识文档归属或安全等级。组件通过 Canvas 绘制重复纹理，覆盖在子内容之上，并随容器尺寸变化自动重绘。

## 何时使用

- 需要为敏感内容添加「内部资料」「禁止外传」等标识。
- 需要阻止截图外传、标注来源的场景。
- 需要图片或文字作为平铺纹理时。

## 基础用法

传入 `content` 包裹内容即可；水印不参与交互（`pointer-events: none`）。

<Demo id="watermark/01-basic" />

## 深度定制

- `content` 支持字符串数组，按行绘制多行文字。
- `rotate`、`gap`、`offset`、`opacity`、`fontSize`、`color` 控制纹理外观。
- `width` / `height` 调整单个纹理的尺寸，`zIndex` 控制覆盖层级。
- `image` 可用图片替代文字纹理。

<Demo id="watermark/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 水印文字，数组表示多行 | `string ｜ string[]` | — |
| image | 图片源（URL 或 Data URI） | `string` | — |
| width / height | 单个纹理宽高（px） | `number` | `120` / `64` |
| rotate | 旋转角度（度） | `number` | `-22` |
| gap | 横纵间距（px） | `[number, number]` | `[100, 100]` |
| offset | 纹理偏移（px） | `[number, number]` | `[0, 0]` |
| opacity | 透明度 | `number` | `0.15` |
| fontSize | 字号（px） | `number` | `14` |
| fontFamily | 字体 | `string` | 继承 |
| color | 颜色（Canvas 可识别的颜色值） | `string` | 继承文本色 |
| zIndex | 覆盖层级 | `number` | `9` |
| classNames | `{ root, canvas, content }` | — | — |
| styles | 同上 | — | — |

## 定制点

- **Token**：默认颜色读取继承的文本色，可自行传入 token 解析后的颜色值。
- **类名/样式**：根节点、Canvas 与内容容器均有插槽。
- **结构**：Canvas 绝对定位覆盖内容，`user-select: none` 且不接收指针事件。

## 无障碍

- Canvas 标记 `aria-hidden="true"`，不进入无障碍树，也不会被读屏朗读。
- 水印不拦截鼠标与键盘事件，内容可正常操作。
- 明暗主题切换后重新渲染会读取最新文本色。

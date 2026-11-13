---
title: Slider
group: 表单
description: 滑动输入。基于原生 range 元素，支持步进、刻度、数值气泡、反向与键盘微调。
order: 8
---

## 何时使用

在连续或分段区间内取值时使用 Slider：音量、亮度、比例、预算上限。需要精确输入具体数字时配合 `InputNumber` 使用；只有少量离散选项时优先用 Radio / Segmented。

## 基础用法

拖动滑块或聚焦后使用方向键调整；`showValue` 在滑块上方显示当前值气泡。

<Demo id="slider/01-basic" />

## 深度定制

`marks` 以「值 → 节点」映射绘制刻度文本；`formatValue` 自定义气泡文案；`reverse` 反转方向（适合 RTL 或「越大越靠左」的语义）。

<Demo id="slider/02-custom" />

## 区间与多个滑块

RangeSlider 用数组表示多个端点，可设置每个滑块的键盘名称。单值 Slider 仍使用数值。

<Demo id="slider/03-composition" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 受控值 | `number` | — |
| defaultValue | 非受控初始值 | `number` | 最小值 |
| min / max | 区间端点 | `number` | `0` / `100` |
| step | 步进值 | `number` | `1` |
| disabled | 禁用 | `boolean` | `false` |
| marks | 刻度文案 | `Record<number, ReactNode>` | — |
| showValue | 显示数值气泡 | `boolean` | `false` |
| formatValue | 自定义气泡文案 | `(value) => ReactNode` | — |
| reverse | 反转方向 | `boolean` | `false` |
| onChange | 值变化时触发 | `(value: number) => void` | — |
| onChangeComplete | 交互结束（keyup / blur）时触发 | `(value: number) => void` | — |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| status | 校验状态 | `default ｜ error ｜ warning ｜ success` | `default` |
| classNames | 语义节点类名 | `{ root?, input?, marks?, mark?, value? }` | — |
| ref | 转发到原生 `<input type="range">` | `Ref<HTMLInputElement>` | — |

## 定制点

- **Token**：`.yuki-slider` 声明 `--yuki-slider-track-height`、`--yuki-slider-thumb-size`、`--yuki-slider-thumb-border`、`--yuki-slider-track`、`--yuki-slider-fill`、`--yuki-slider-mark-color`；填充比例通过 `--yuki-slider-percent` 自定义属性传给原生轨道渐变。
- **类名/样式**：`classNames.root | input | marks | mark | value` 与 `styles.*`。
- **结构**：轨道与滑块由原生 `input[type="range"]` 的伪元素绘制（WebKit 与 Firefox 各一套），不额外嵌套装饰节点。
- **状态**：`data-size`、`data-status`、`data-disabled`、`data-reverse` 是公开接口。

## 无障碍

- 原生 `input[type="range"]` 自带 `role="slider"` 与 `aria-valuenow` / `aria-valuemin` / `aria-valuemax`，`ref` 指向它。
- 键盘：← / ↓ 减一个 `step`，→ / ↑ 加一个 `step`，PageUp / PageDown 十倍步进，Home / End 跳到端点；均阻止页面滚动。
- 刻度与数值气泡为装饰性内容（`aria-hidden`），信息已由原生控件属性表达；请始终通过 `aria-label` / `aria-labelledby` 为滑块命名。
- 焦点环绘制在滑块自身（`input:focus-visible` 的 thumb 阴影），使用 `--yuki-shadow-focus`；禁用时整体降低不透明度。
- `onChangeComplete` 适合触发表单提交或网络请求，避免拖动过程中高频请求。

---
title: ColorPicker
group: 表单
description: 颜色选择器。触发器展示色块与取值，弹层内提供预设色板、十六进制输入与可选透明度。
order: 12
---

## 何时使用

需要为某个配置选择单一颜色时使用 ColorPicker：品牌色、标签色、状态色、图表配色等。组件只处理颜色文本与透明度，不提供自由取色盘或渐变编辑。

- 从一组预设色中快速选择：`presets`
- 精确输入：面板内十六进制 / RGB 输入框
- 需要半透明颜色：`alpha`
- 需要「拖动结束才提交」：`onChangeComplete`

## 基础用法

`value` 受控、`defaultValue` 非受控；`onChange(value, color)` 在颜色变化时即时触发，`color` 为解析后的 `{ r, g, b, a }`（非法输入为 `null`）。`format` 控制展示与回传的文本格式（`hex` / `rgb`），`size` 与 `allowClear` 直接作用于触发器。

<Demo id="color-picker/01-basic" />

## 深度定制

`presets` 可替换默认色板；`alpha` 打开透明度滑杆后，十六进制会输出 8 位 `#rrggbbaa`，RGB 格式输出 `rgba()`。输入框在失焦或按 `Enter` 时提交并触发 `onChangeComplete`，拖拽滑杆则在 `pointerup` / 键盘抬起时提交，适合只在确认后写库的场景。`open`、`defaultOpen`、`onOpenChange` 可用于受控展开，禁用态不会打开弹层。

<Demo id="color-picker/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| label / description / error | 独立字段的标签、说明与错误提示 | ReactNode | — |
| name | 原生表单提交使用的字段名 | string | — |
| value | 受控颜色值 | `string` | — |
| defaultValue | 非受控初始值 | `string` | `''` |
| onChange | 颜色变化时触发 | `(value: string, color: RgbaColor ｜ null) => void` | — |
| onChangeComplete | 提交/确认时触发 | `(value: string, color: RgbaColor ｜ null) => void` | — |
| format | 输出格式 | `hex ｜ rgb` | `hex` |
| alpha | 启用透明度 | `boolean` | `false` |
| presets | 预设色板 | `string[]` | 内置 12 色 |
| allowClear | 显示清除按钮 | `boolean` | `false` |
| disabled | 禁用 | `boolean` | `false` |
| open / defaultOpen / onOpenChange | 弹层受控 | `boolean` / `boolean` / `(open: boolean) => void` | — |
| placeholder | 未选择时的占位文案 | `string` | 未选择 |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| classNames / styles | 语义节点类名 / 样式 | `ColorPickerClassNames` / `ColorPickerStyles` | — |
| ref | 转发到根 `<div>` | `Ref<HTMLDivElement>` | — |

配套工具函数可从包入口导入：`parseColor`、`formatColor`、`toHex`、`toRgb`、`toCssColor`、`isValidColor` 与默认色板 `colorPickerPresets`。未列出的原生属性会透传到根节点。

## 定制点

- **Token**：`.yuki-color-picker` 与弹层共用 `--yuki-color-picker-trigger-height`、`-trigger-padding`、`-trigger-gap`、`-trigger-radius`、`-trigger-bg`、`-trigger-border`、`-trigger-color`、`-swatch-size`、`-swatch-radius`、`-swatch-border`、`-value-size`、`-indicator-size`、`-indicator-color`、`-panel-width`、`-panel-padding`、`-panel-gap`、`-preset-columns`、`-preset-size`、`-preset-radius`、`-preset-border`、`-input-row-gap`、`-preview-size`、`-preview-radius`、`-alpha-gap`、`-alpha-label-size`、`-alpha-label-color`、`-alpha-value-color`。
- **类名/样式**：`classNames.root | trigger | swatch | value | indicator | panel | presets | preset | inputRow | preview | input | alpha | alphaInput | alphaValue | footer | clear` 与 `styles.*`。
- **结构**：触发器与弹层分离，弹层通过 Portal 渲染；色块下方是棋盘格底纹，用于辨认透明度；面板内的输入行复用了 `Input`。
- **状态**：根节点 `data-size`、`data-disabled`、`data-open`；预设按钮 `data-color`、`data-selected` 是公开接口。

## 无障碍

- 触发器是原生 `<button>`，带 `aria-haspopup="dialog"`、`aria-expanded` 与 `aria-controls`；`Enter` / `Space` / `ArrowDown` 打开弹层。
- 弹层为 `role="dialog"` 并带可读标签；`Escape` 关闭并把焦点交回触发器，点击外部同样关闭。
- 预设色按钮以十六进制值作为 `aria-label`，并用 `aria-pressed` 表示当前选中项，避免只靠色块传达信息。
- 透明度滑杆使用原生 `<input type="range">`，方向键可调，带 `aria-label="透明度"`；输入框按 `Enter` 提交。
- 焦点环统一使用 `--yuki-shadow-focus`，键盘与鼠标状态分离。

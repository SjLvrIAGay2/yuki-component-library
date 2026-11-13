---
title: Button
group: 基础
description: 触发操作的基础控件。六种变体 × 六种色调 × 三种尺寸，全部由组件级 token 驱动。
order: 1
---

## 何时使用

需要让用户发起一个动作时使用 Button。一个视区内只保留一个 `solid` 主按钮，其余动作降级为 `soft`、`outline`、`ghost` 或 `text`，让视觉重量与动作优先级一致。

- 主操作：`variant="solid"`（默认）
- 次级操作：`variant="soft"` 或 `variant="outline"`
- 低频、可逆操作：`variant="ghost"` / `variant="text"`
- 纯图标按钮：使用同包导出的 `IconButton`，它要求必须提供 `aria-label`

## 基础用法

<Demo id="button/01-basic" />

## 深度定制

品牌层只需替换 `primaryColor`，组件内部的 hover、subtle、border、focus ring 会一起派生；尺寸与形状则通过 props 表达，而不是覆写样式。

<Demo id="button/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| variant | 视觉变体 | `solid ｜ soft ｜ outline ｜ ghost ｜ text ｜ link` | `solid` |
| tone | 语义色调 | `primary ｜ neutral ｜ success ｜ warning ｜ danger ｜ info` | `primary` |
| size | 尺寸，缺省继承 ConfigProvider | `sm ｜ md ｜ lg` | `md` |
| shape | 外形 | `default ｜ round ｜ circle ｜ square` | `default` |
| block | 占满父容器宽度 | `boolean` | `false` |
| loading | 加载态，自动禁用并设置 `aria-busy` | `boolean` | `false` |
| loadingText | 加载时替换的文案 | `ReactNode` | — |
| startIcon / endIcon | 独立设置两端的图标 | `ReactNode` | — |
| loadingIndicator | 替换加载指示器 | `ReactNode` | 内置转圈 |
| spinnerProps | 传给内置加载指示器的原生属性 | `HTMLAttributes<HTMLSpanElement>` | — |
| animation | 设置按钮反馈和转圈动效，可在 ConfigProvider 中统一配置 | `AnimationOptions ｜ false` | 继承全局配置 |
| iconOnly | 纯图标模式（需可访问名称） | `boolean` | `false` |
| classNames | 语义节点类名插槽 | `{ root?, icon?, label?, spinner? }` | — |
| styles | 语义节点内联样式 | `{ root?, icon?, label?, spinner? }` | — |
| ref | 转发到 `<button>` 元素 | `Ref<HTMLButtonElement>` | — |


## 定制点

- **Token**：根类声明 `--yuki-btn-height`、`--yuki-btn-padding-x`、`--yuki-btn-gap`、`--yuki-btn-font-size`、`--yuki-btn-icon-size`、`--yuki-btn-radius`，以及 `--yuki-btn-solid-bg/-fg`、`--yuki-btn-soft-bg/-fg`、`--yuki-btn-outline-border/-fg` 等槽位；`--sm` / `--lg` 类只重映射尺寸槽位，色调类只重映射色调槽位。
- **类名/样式**：`classNames.root | icon | label | spinner`、`styles.*`，可精确控制每个内部节点。
- **结构**：`startIcon`、`endIcon`、`children`、`loadingText` 均可传入任意 ReactNode。`IconButton` 使用 `icon` 指定图标。
- **行为**：`variant`、`tone`、`size`、`shape`、`block`、`loading`、`iconOnly`；未消费属性透传到根节点。

## 无障碍

- 渲染原生 `<button>`，默认 `type="button"`，支持 Enter / Space 与完整键盘焦点。
- `:focus-visible` 使用 `--yuki-shadow-focus` 焦点环，暗色主题下同样可见。
- `loading` 时同时设置 `disabled` 与 `aria-busy="true"`，读屏会播报忙碌状态。
- 纯图标按钮请使用 `IconButton`；但若直接使用 `Button iconOnly`，务必自行提供 `aria-label`。
- 禁用态降低不透明度但仍保留对比度；不要用禁用按钮替代解释性文案。

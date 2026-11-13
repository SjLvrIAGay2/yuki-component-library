---
title: Tooltip
group: 反馈
description: 悬停或聚焦时出现的简短文字提示，带延迟与方向翻转。
order: 2
---

## 何时使用

用于补充**一句以内**的说明：图标按钮的含义、截断文字的完整内容、快捷键。Tooltip 不能承载交互元素，也不能是唯一的信息来源；移动端没有 hover，请确保同一信息有可发现的替代入口。

## 基础用法

<Demo id="tooltip/01-basic" />

## 深度定制

`openDelay` / `closeDelay` 控制节奏，`placement` 指定方位，`disabled` 可整体关闭，`classNames` 可替换气泡与箭头样式。

<Demo id="tooltip/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 提示内容 | `ReactNode` | — |
| placement | 方位 | `top ｜ bottom ｜ left ｜ right` 及对齐变体 | `top` |
| open / defaultOpen | 受控 / 非受控开关 | `boolean` | — |
| onOpenChange | 开关变化回调 | `(open: boolean) => void` | — |
| arrow | 显示箭头 | `boolean` | `true` |
| offset | 与触发元素间距（px） | `number` | `8` |
| disabled | 禁用提示 | `boolean` | `false` |
| openDelay | 悬停打开延迟（ms） | `number` | `200` |
| closeDelay | 悬停关闭延迟（ms） | `number` | `100` |
| classNames | `{ root, popup, arrow }` | — | — |
| styles | 同上 | — | — |
| portalContainer、portalProps | 设置挂载容器及 forceMount | HTMLElement、对象 | — |
| contentProps、arrowProps | 设置提示层、箭头、可访问名称和定位参数 | 对象 | — |
| animation | 设置出现和退出动画，false 关闭动画 | AnimationOptions 或 false | — |

## 定制点

- **Token**：反色气泡使用 `--yuki-color-bg-inverse` / `--yuki-color-text-inverse`，宽度 `--yuki-popup-width-sm`，圆角 `--yuki-popup-radius`。
- **类名/样式**：`classNames.root | popup | arrow`、`styles.*`。
- **结构**：`content` 接受任意节点；`children` 为唯一触发元素。
- **行为**：`placement`、`arrow`、`offset`、`openDelay`、`closeDelay`、`disabled`、受控开关。

## 无障碍

- 可见时给触发元素注入 `aria-describedby`，读屏可关联提示内容。
- 聚焦（focus）立即打开、失焦立即关闭；Esc 可关闭。
- 气泡本身 `pointer-events` 不拦截交互，避免遮挡下层点击。
- 不要把关键操作说明只放在 Tooltip 中。

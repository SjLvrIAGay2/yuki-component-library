---
title: Tour
group: 反馈
description: 分步引导，逐项高亮页面锚点，支持键盘导航、遮罩、跳过与完成回调。
order: 12
---

## 何时使用

新功能上线、首次使用教程、复杂页面需要**按顺序**介绍多个区域时使用 Tour。它比单条 `Tooltip` 更有结构，也比静态文档更贴近真实界面。

- 单点、悬停即看：`Tooltip` / `Popover`
- 需要用户完成一个必须处理的步骤：`Modal`

## 基础用法

每一步通过 `target`（CSS 选择器或返回元素的函数）定位锚点，`placement` 指定面板方向（空间不足时自动翻转）。`onFinish` / `onSkip` 区分完成与中断。

<Demo id="tour/01-basic" />

## 深度定制

`current` 受控步骤、`onCurrentChange` 同步进度；`mask={false}` 关闭遮罩仅保留高亮描边；`skipText` / `prevText` / `nextText` / `finishText` 自定义文案，`arrow={false}` 去掉连接箭头。

<Demo id="tour/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| steps | 步骤列表 | `TourStep[]` | — |
| open / defaultOpen | 受控 / 非受控打开状态 | `boolean` | — |
| onOpenChange | 打开状态变化 | `(open: boolean) => void` | — |
| current / defaultCurrent | 受控 / 非受控步骤索引 | `number` | `0` |
| onCurrentChange | 步骤变化 | `(current: number) => void` | — |
| onFinish | 最后一步点击完成后触发 | `() => void` | — |
| onSkip | 跳步、Escape、遮罩点击时触发 | `() => void` | — |
| closeOnEscape | Escape 中断导览 | `boolean` | `true` |
| mask | 显示遮罩 | `boolean` | `true` |
| maskClosable | 点击遮罩中断导览 | `boolean` | `false` |
| arrow | 显示连接箭头 | `boolean` | `true` |
| keyboard | 左右方向键切换步骤 | `boolean` | `true` |
| scrollIntoView | 自动滚动锚点到可视区域 | `boolean` | `true` |
| padding | 高亮区域外扩像素 | `number` | `6` |
| skipText / prevText / nextText / finishText | 按钮文案 | `ReactNode` | 本地化文案 |
| container | 自定义挂载容器 | `HTMLElement ｜ null` | ConfigProvider 浮层容器 |
| classNames | 插槽 | `{ root?, mask?, spotlight?, popup?, arrow?, header?, cover?, title?, description?, footer?, indicator?, actions?, skip?, prev?, next? }` | — |
| styles | 插槽内联样式 | 同上 | — |

`TourStep`：`target`、`title`、`description`、`cover`、`placement`、`className`、`style`。

## 定制点

- **Token**：`.yuki-tour` 声明 `--yuki-tour-width`、`--yuki-tour-bg`、`--yuki-tour-border`、`--yuki-tour-radius`、`--yuki-tour-shadow`、`--yuki-tour-arrow-size`、`--yuki-tour-spotlight-ring` 等槽位。
- **定位**：面板直接使用内部 `useFloating` 定位（而不是 `Popup`），因此可以正确使用 `--yuki-z-tour` 层级，位于遮罩与高亮之上。
- **结构**：填充高亮区域由四块遮罩 + 描边环组成；`cover` 支持插图或截图；footer 分页指示器与操作区独立可定制。

## 无障碍

- 面板为 `role="dialog"` + `aria-modal="true"`（有遮罩时），`aria-labelledby` / `aria-describedby` 关联当前步骤的标题与说明。
- 打开后焦点移入面板并陷阱 Tab 循环；关闭后焦点回到打开导览前的元素。
- 支持 `←` / `→` 切换步骤、`Esc` 中断；在输入框内按方向键不会触发切换。
- 步骤切换时焦点重新落到面板，屏幕阅读器会重新播报新步骤内容；高亮与遮罩均为装饰性元素（`aria-hidden`），不参与 Tab 顺序。
- 减少动态效果偏好下，面板淡入与高亮过渡时长归零，不阻断操作。

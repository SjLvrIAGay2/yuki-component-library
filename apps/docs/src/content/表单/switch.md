---
title: Switch
group: 表单
description: 开关控件。用于即时生效的二元状态切换，支持受控/非受控、加载态与状态文案。
order: 7
---

## 何时使用

切换会立即生效（或立即提交）的二元状态时使用 Switch，例如启用通知、开启自动保存。需要用户点击「保存」才生效的选项请使用 Checkbox；在多个互斥选项中选一个请使用 Radio。

## 基础用法

`defaultChecked` 为非受控初始值，`checked` + `onChange` 为受控用法；`checkedChildren` / `unCheckedChildren` 在轨道内显示状态文案。轨道按两种文案中较宽的一项预留空间，切换时宽度固定。

<Demo id="switch/01-basic" />

## 深度定制

`loading` 期间会阻止切换并显示旋转图标，同时设置 `aria-busy`，适合承载异步提交。尺寸可通过 `size` 或 `ConfigProvider` 统一控制。

<Demo id="switch/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| checked | 受控状态 | `boolean` | — |
| defaultChecked | 非受控初始值 | `boolean` | `false` |
| onChange | 状态变化时触发 | `(checked: boolean, event: ChangeEvent<HTMLInputElement>) => void` | — |
| loading | 加载态，阻止交互并显示忙碌提示 | `boolean` | `false` |
| checkedChildren | 选中时轨道内文案 | `ReactNode` | — |
| unCheckedChildren | 未选中时轨道内文案 | `ReactNode` | — |
| disabled | 禁用 | `boolean` | `false` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| classNames | 语义节点类名 | `{ root?, input?, track?, handle?, label?, loading? }` | — |
| styles | 语义节点内联样式 | 同上 | — |
| ref | 转发到原生 `<input type="checkbox">` | `Ref<HTMLInputElement>` | — |

## 独立字段

`label` 会关联到控件。`description` 提供填写说明，有 `error` 时优先显示错误消息，并设置 `aria-invalid`。`fieldProps`、`labelProps` 和 `messageProps` 可配置字段节点。`thumbProps` 可为滑块添加属性，`animation` 设置单个开关的动画。

## 定制点

- **Token**：`.yuki-switch` 声明 `--yuki-switch-height`、`--yuki-switch-width`、`--yuki-switch-bg`、`--yuki-switch-bg-hover`、`--yuki-switch-on-bg`、`--yuki-switch-on-bg-hover`、`--yuki-switch-handle-bg`、`--yuki-switch-label`、`--yuki-switch-on-label`；宽高与滑块位置全部由这些 token 推导。
- **类名/样式**：`classNames.root | input | track | handle | label | loading` 与 `styles.*`。
- **结构**：两侧文案可传任意节点；未提供文案时由 `data-has-label="false"` 收起文案位。
- **状态**：`data-size`、`data-checked`、`data-disabled`、`data-loading`、`data-has-label` 是公开接口。

## 无障碍

- 原生 `input[type="checkbox"]` 承载状态，并设置 `role="switch"` 与 `aria-checked`；label 包裹整块，点击轨道或文案都可切换。
- 键盘 Space 切换；`loading` 时同时设置 `disabled` 与 `aria-busy="true"`，避免重复提交。
- 焦点环绘制在轨道上（`input:focus-visible + track`），使用 `--yuki-shadow-focus`，键盘用户清晰可见。
- 无可见文案时请提供 `aria-label`；`name`、`required`、`aria-*` 会透传到原生 input。
- 加载图标为装饰性内容并带本地化 `aria-label`，不会吞掉开关自身的可访问名称。

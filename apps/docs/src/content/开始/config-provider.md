---
title: ConfigProvider 全局配置
group: 开始
description: 统一注入主题、品牌色、尺寸、语言与浮层挂载点。
order: 1
---

## 何时使用

`ConfigProvider` 是组件库的运行时配置入口：主题模式、品牌色、全局 token 覆盖、组件默认尺寸、语言包、浮层挂载容器都从这里注入。应用根部包一次即可；需要局部换主题时嵌套一层，并在嵌套处设置 `global={false}`，避免改动 `<html>` 上的全局属性。

## 基础用法

尺寸与语言沿树向下继承，所有组件（Button、Form 控件、Pagination……）自动采用同一档位。

<Demo id="config-provider/01-basic" />

## 深度定制

`theme.primaryColor` 会通过 `color-mix` 派生 hover / active / subtle / border / ring，无需逐个覆盖。`theme.tokens` 以不带 `--yuki-` 前缀的 token 名覆盖任意全局 token，例如 `radius-md`。

<Demo id="config-provider/02-custom" />

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| theme | `{ mode?: 'light' \| 'dark' \| 'system'; primaryColor?: string; tokens?: Record<string, string> }` | — | 主题模式、品牌色与 token 覆盖 |
| locale | `'zh-CN' \| 'en-US' \| { name, messages? }` | `zh-CN` | 语言与自定义文案 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 组件默认尺寸 |
| motion | `boolean` | `true` | 是否启用动效；`false` 等价于 `data-yuki-motion="off"` |
| density | `comfortable ｜ compact` | comfortable | 指定控件密度与页面间距 |
| components | `ComponentDefaults` | — | 按组件名提供带类型的默认属性，实例值优先 |
| animation | `AnimationOptions ｜ false` | — | 指定 Animation 与支持自定义动效组件的初始参数 |
| getPopupContainer | `(trigger?: HTMLElement \| null) => HTMLElement` | provider 内置 portal host | 浮层挂载容器 |
| global | `boolean` | 外层为 true，嵌套时为 false | 是否同步主题到 `<html>`（CSS 变量与 data 属性）。多个全局实例同时挂载时，同一字段由后挂载者决定 |
| className / style | `string` / `CSSProperties` | — | 应用到 provider 根节点 |
| portalClassName | `string` | — | 内置 portal host 的类名 |

## 定制点

- **Token 层**：`theme.primaryColor`、`theme.tokens`，或在任意祖先上用 CSS 覆盖 `--yuki-*` 变量。
- **样式层**：provider 根节点带 `yuki-ui-root` 与 `data-yuki-theme` / `data-yuki-brand` / `data-yuki-motion`，可据此写作用域样式。
- **行为层**：`size`、`motion`、`locale` 都是运行时 props；`useConfig()` / `useLocale()` 可在自定义组件中读取同一份配置。
- **挂载层**：`getPopupContainer` 可把 Select、Tooltip、Modal 等浮层渲染到你指定的容器。挂靠触发器的浮层会传入对应元素，可以返回 `trigger?.parentElement ?? document.body`。独立弹窗可能传入 `null`。

## 无障碍

- 主题切换会同步 `color-scheme`，原生控件（滚动条、输入框）跟随明暗模式。
- 语言切换更新 `lang` 相关文案；组件输出的 ARIA label 来自同一词典，屏幕阅读器朗读一致。
- `motion=false` 与系统 `prefers-reduced-motion` 都会关闭位移动画，仅保留必要状态切换。

## 局部默认属性与文案

嵌套 Provider 可以继承上层的主题、tokens、语言和组件默认属性。具名部位的样式逐项合并，实例显式属性优先；同一事件先执行实例处理器，可用 preventDefault 阻止继承的处理器。ThemeProvider 提供 theme、tokens 和 density 简写，LocaleProvider 单独覆盖文案。

<Demo id="config-provider/03-defaults" />

---
title: Container
group: 布局
description: 页面内容的最大宽度约束与安全边距，让长文与工作台共享同一条基线。
order: 4
---

## 何时使用

用于给页面主体一个**可预测的内容宽度**：宽屏下不无限拉伸，窄屏下保留安全边距。表单页、设置页、文档正文都适合用 Container 包裹；全屏画布类界面则使用 `fluid` 或直接不使用。

## 基础用法

<Demo id="container/01-basic" />

## 深度定制

`size` 映射到断点级最大宽度，`fluid` 去掉最大宽度只保留边距，`gutter` 控制左右安全边距，`center` 可关闭居中。

<Demo id="container/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| size | 最大宽度档位 | `sm ｜ md ｜ lg ｜ xl ｜ 2xl ｜ full` | `lg` |
| fluid | 不限制最大宽度 | `boolean` | `false` |
| gutter | 左右安全边距 | `SpaceSize` | `4` |
| center | 是否水平居中 | `boolean` | `true` |
| classNames / styles | `{ root }` | — | — |

## 定制点

- **Token**：最大宽度映射 `--yuki-breakpoint-sm/md/lg/xl/2xl`，边距映射 `--yuki-space-*`，通过 `--yuki-container-gutter` 下发。
- **类名/样式**：`classNames.root`、`styles.root`。
- **结构**：children 直接进入容器，不产生额外包装。
- **行为**：`size`、`fluid`、`gutter`、`center`。

## 无障碍

- 容器只影响布局，不引入任何角色或焦点行为。
- 窄屏下边距会降为 `--yuki-space-3`，避免文字贴边；如业务需要更紧的移动端边距，调节 `gutter` 即可。

---
title: Flex
group: 布局
description: 一维弹性布局原语，Stack 是它的纵向语义快捷方式。
order: 2
---

## 何时使用

需要按一个方向排列元素并控制对齐、换行与间距时使用 Flex。相比手写 `display:flex`，它把方向、对齐与 gap 收敛为受 token 约束的 props，避免每个页面各写一套。

`Stack` 是 `Flex` 的窄化封装：默认纵向、默认 `gap="2"`，只接受 `vertical` / `horizontal`，适合页面区块堆叠。

## 基础用法

<Demo id="flex/01-basic" />

## 深度定制

对齐、分布、换行与间距都是行为 props；`inline` 让容器参与行内排版，`classNames/styles` 用于局部覆盖。

<Demo id="flex/02-stack" />

## API

### Flex

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| direction | 主轴方向 | `row ｜ column` | `row` |
| align | 交叉轴对齐 | `start ｜ center ｜ end ｜ stretch ｜ baseline` | `stretch` |
| justify | 主轴分布 | `start ｜ center ｜ end ｜ between ｜ around ｜ evenly` | `start` |
| wrap | 是否换行 | `boolean` | `false` |
| gap | 间距 | `SpaceSize` | `0` |
| inline | 行内弹性容器 | `boolean` | `false` |
| classNames / styles | `{ root }` | — | — |

### Stack

`Stack` 继承 `Flex` 的全部属性，默认 `direction="vertical"`、`gap="2"`；`direction` 仅接受 `vertical ｜ horizontal`。

## 定制点

- **Token**：`gap` 映射 `--yuki-space-*`，通过内联 `--yuki-flex-gap` 下发。
- **类名/样式**：`classNames.root`、`styles.root`，以及 `--yuki-flex-gap` 变量。
- **结构**：children 直接成为 flex item，不引入额外包裹层。
- **行为**：`direction`、`align`、`justify`、`wrap`、`gap`、`inline`。

## 无障碍

- Flex 不改变 DOM 顺序，键盘与读屏顺序始终与源码一致。
- 需要视觉重排时，请用 `order` 之外的方式（例如调整结构），避免出现焦点顺序与视觉顺序不一致。

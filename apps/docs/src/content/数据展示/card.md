---
title: 卡片 Card
group: 数据展示
description: 将相关信息与操作聚合在一个可感知的容器中。
order: 70
---

## 何时使用

- 需要把标题、正文与操作聚合展示时。
- 需要可点击、可悬浮反馈的入口卡片时。
- 需要封面图、底部均分操作栏时。

## 基础用法

<Demo id="card/01-basic" />

## 深度定制

<Demo id="card/02-custom" />

## 组合卡片

用 CardHeader、CardTitle、CardDescription、CardContent 和 CardFooter 自由组织内容。

<Demo id="card/03-composition" />

## API

### Card

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 卡片标题 | ReactNode | — |
| extra | 标题右侧操作区 | ReactNode | — |
| cover | 封面内容（图片或任意节点） | ReactNode | — |
| footer | 底部内容 | ReactNode | — |
| actions | 底部均分操作栏 | ReactNode[] | — |
| hoverable | 悬浮时抬升与边框反馈 | boolean | false |
| loading | 骨架加载态 | boolean | false |
| variant | 视觉变体：default、elevated、ghost | CardVariant | default |
| size | 尺寸：sm、md、lg | Size | 继承 ConfigProvider |
| classNames | 语义节点类名 | CardClassNames | — |
| styles | 语义节点内联样式 | CardStyles | — |

## 定制点

- **设计 Token**：`--yuki-card-bg`、`--yuki-card-border-color`、`--yuki-card-radius`、`--yuki-card-padding`、`--yuki-card-gap`、`--yuki-card-shadow`、`--yuki-card-title-size`。
- **类名与样式**：`classNames` 可覆盖 `root`、`cover`、`header`、`title`、`extra`、`body`、`footer`、`actions`、`action`、`loading` 十个语义节点。；`className`、`style` 作用于根节点。
- **结构**：根节点带 `data-slot="card"` 与 `data-size`，`data-variant`、`data-hoverable`、`data-loading` 反映当前状态。
- **行为**：受控与非受控用法一致，所有文案均可通过 ConfigProvider 的 locale 覆盖。

## 无障碍

- 加载态根节点带 `aria-busy="true"`，骨架不参与读屏。
- `hoverable` 仅提供视觉反馈，不改变可点击语义；交互请放在内部按钮或链接上。
- 封面图片应有替代文本，或作为纯装饰从可访问树隐藏。

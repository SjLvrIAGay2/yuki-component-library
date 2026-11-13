---
title: 头像 Avatar
group: 数据展示
description: 代表用户或实体的头像，支持图片、文字回退、图标与头像组折叠。
order: 30
---

## 何时使用

- 需要在列表、评论、导航中代表用户时。
- 图片加载失败或缺失时，需要稳定回退为文字或图标时。
- 需要展示一组协作者并用「+N」折叠时。

## 基础用法

<Demo id="avatar/01-basic" />

## 深度定制

<Demo id="avatar/02-custom" />

## 在线状态

status 支持 online、busy、offline。statusLabel 可以覆盖状态的读屏文案。

<Demo id="avatar/03-composition" />

## API

### Avatar

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| src | 图片地址 | string | — |
| srcSet | 响应式图片地址 | string | — |
| alt | 图片替代文本；缺失时同时作为回退文字来源 | string | — |
| size | 尺寸，数字按 px 处理，或使用尺寸档位 | number | Size | md |
| shape | 形状：circle、square | AvatarShape | circle |
| icon | 自定义图标，优先级高于 fallback / children | ReactNode | — |
| fallback | 图片加载失败时展示的内容 | ReactNode | — |
| children | 文字头像内容 | ReactNode | — |
| imgProps | 透传给内部 img 的属性 | ImgHTMLAttributes | — |
| classNames | 语义节点类名 | AvatarClassNames | — |
| styles | 语义节点内联样式 | AvatarStyles | — |

### AvatarGroup

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| maxCount | 最多展示数量，其余折叠为 +N | number | — |
| overflowSize | 折叠项尺寸 | AvatarSize | 继承 |
| shape | 折叠项形状 | AvatarShape | circle |
| overflowRender | 自定义折叠项内容 | (restCount: number) => ReactNode | — |
| children | 头像列表 | ReactNode | — |

## 定制点

- **设计 Token**：`--yuki-avatar-size`、`--yuki-avatar-bg`、`--yuki-avatar-fg`、`--yuki-avatar-radius`、`--yuki-avatar-font-size`。
- **类名与样式**：`classNames` 可覆盖 `root`、`image`、`fallback` 三个语义节点；头像组另有 `AvatarGroup` 的 `root`、`overflow`。；`className`、`style` 作用于根节点。
- **结构**：根节点带 `data-slot="avatar"` 与 `data-size`，`data-status` 表示图片 loading、loaded、error，`data-shape` 表示形状。
- **行为**：受控与非受控用法一致，所有文案均可通过 ConfigProvider 的 locale 覆盖。

## 无障碍

- 图片头像的 `img` 使用 `alt` 文本；纯装饰头像（无 alt）应从可访问树中隐藏。
- 头像组使用 `role="group"` 与可本地化的组名，折叠项朗读「还有 N 位成员」。
- 文字回退内容保持与图片一致的对比度。

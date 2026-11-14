---
title: 轮播 Carousel
group: 数据展示
description: 在有限空间内循环展示多张图片、卡片或公告。
order: 120
---

## 何时使用

- 首页横幅、活动公告需要轮播展示时。
- 图片组需要淡入淡出或滑动切换时。
- 需要自动播放、但悬浮或聚焦时暂停的场景。

## 基础用法

<Demo id="carousel/01-basic" />

## 深度定制

<Demo id="carousel/02-custom" />

启用自动播放后，窗口转入后台、系统偏好减少动效或 Provider 关闭动效时会暂停。开启默认的悬停暂停后，指针和键盘焦点均离开才会恢复。垂直滚动页面时，横向轮播优先保留滚动手势。

## API

### Carousel

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 轮播项内容 | ReactNode[] | — |
| children | 轮播项内容（items 优先） | ReactNode | — |
| activeIndex | 受控当前索引 | number | — |
| defaultActiveIndex | 非受控初始索引 | number | 0 |
| onChange | 切换回调 | (index: number) => void | — |
| autoplay | 自动播放 | boolean | false |
| autoplayInterval | 自动播放间隔（毫秒） | number | 3000 |
| pauseOnHover | 悬浮或聚焦时暂停自动播放 | boolean | true |
| loop | 是否循环 | boolean | true |
| dots | 是否显示指示点 | boolean | true |
| arrows | 是否显示切换箭头 | boolean | true |
| swipe | 是否支持指针滑动 | boolean | true |
| effect | 切换效果：slide、fade | CarouselEffect | slide |
| vertical | 是否纵向轮播 | boolean | false |
| ariaLabel | 轮播区域可访问名称 | string | 轮播 |
| size | 尺寸：sm、md、lg | Size | 继承 ConfigProvider |
| classNames | 语义节点类名 | CarouselClassNames | — |
| styles | 语义节点内联样式 | CarouselStyles | — |

## 定制点

- **设计 Token**：`--yuki-carousel-bg`、`--yuki-carousel-radius`、`--yuki-carousel-arrow-size`、`--yuki-carousel-arrow-offset`、`--yuki-carousel-arrow-color`、`--yuki-carousel-dot-size`、`--yuki-carousel-dot-active-width`、`--yuki-carousel-dots-gap`、`--yuki-carousel-duration/easing`、`--yuki-carousel-height`。
- **类名与样式**：`classNames` 可覆盖 `root`、`viewport`、`track`、`slide`、`arrow`、`dots`、`dot` 七个语义节点。；`className`、`style` 作用于根节点。
- **结构**：根节点带 `data-slot="carousel"` 与 `data-size`，`data-effect`、`data-vertical` 表示切换效果与方向。
- **行为**：受控与非受控用法一致，所有文案均可通过 ConfigProvider 的 locale 覆盖。

## 无障碍

- 根节点使用 `role="region"` + `aria-roledescription="carousel"`，每张幻灯片是可命名的 `group`。
- 左右箭头有可访问名称，循环关闭时边界箭头禁用；指示点对应按钮朗读「切换到第 N 张」。
- 自动播放尊重 `prefers-reduced-motion`，开启减少动态效果时不会自动切换；悬浮或聚焦暂停。

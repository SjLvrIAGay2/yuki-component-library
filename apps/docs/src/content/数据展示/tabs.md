---
title: 标签页 Tabs
group: 数据展示
description: 在同一区域切换多组内容，保持页面结构稳定。
order: 110
---

## 何时使用

- 需要在少量平级内容之间切换时。
- 需要卡片或分段控件（segmented）风格时。
- 需要纵向标签页或标签栏右侧附加操作时。

## 基础用法

<Demo id="tabs/01-basic" />

## 深度定制

<Demo id="tabs/02-custom" />

## 保留表单状态的标签页

组合模式用相同的 `value` 配对 `TabsTrigger` 和 `TabsContent`。给根节点传 `defaultValue` 可指定初次显示的面板。给面板传 `forceMount` 可以在切走后保留输入草稿。

<Demo id="tabs/03-composition" />

## API

### Tabs

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 标签页列表 | readonly TabItem[] | [] |
| value | 受控选中项，对应条目的 key 或触发器的 value | string | — |
| defaultValue | 非受控初始选中项 | string | 数据模式取首个可用项 |
| onChange | 用户请求切换时回调 | (value: string) => void | — |
| variant | 视觉变体：line、card、segmented | TabsVariant | line |
| tabPosition | 数据模式的标签栏位置，组合模式以此推导默认导航方向 | TabPosition | top |
| size | 尺寸：sm、md、lg | Size | 继承 ConfigProvider |
| centered | 数据模式下标签栏居中 | boolean | false |
| hideContent | 数据模式下只显示标签栏 | boolean | false |
| tabBarExtraContent | 数据模式下标签栏右侧附加内容 | ReactNode | — |
| classNames | 语义节点类名 | TabsClassNames | — |
| styles | 语义节点内联样式 | TabsStyles | — |
| activationMode | 组合模式中，automatic 随焦点选中，manual 按 Enter 或空格选中 | 'automatic' 或 'manual' | automatic |
| orientation | 组合模式的导航方向 | 'horizontal' 或 'vertical' | 随 tabPosition |
| animation | 组合模式的面板动画 | AnimationOptions 或 false | 继承动画配置 |

数据模式会在异步条目到达时应用 `defaultValue`。非受控的选中项被禁用或移除时，组件显示首个可用项。受控时由调用方在 `onChange` 中写回 `value`；选中项被禁用时保留其面板，值缺失时没有活动面板。这两种情况下，首个可用标签仍可通过 Tab 键聚焦。数据变化本身不会触发 `onChange`。

### TabItem

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| key | 唯一标识 | string | — |
| label | 标签文案 | ReactNode | — |
| children | 面板内容 | ReactNode | — |
| icon | 标签图标 | ReactNode | — |
| disabled | 禁用该标签 | boolean | false |
| className | 标签类名 | string | — |
| style | 标签内联样式 | CSSProperties | — |

## 定制点

- **设计 Token**：`--yuki-tabs-gap`、`--yuki-tabs-tab-height`、`--yuki-tabs-tab-padding-inline`、`--yuki-tabs-tab-font-size`、`--yuki-tabs-tab-color`、`--yuki-tabs-tab-active-color`、`--yuki-tabs-indicator-size`、`--yuki-tabs-indicator-color`、`--yuki-tabs-radius`、`--yuki-tabs-content-font-size`、`--yuki-tabs-content-gap`。
- 数据模式中，`classNames` 和 `styles` 可覆盖 `root`、`nav`、`tablist`、`tab`、`label`、`icon`、`extra`、`content`、`panel` 九个语义节点。组合模式可以在对应子组件上传 `className` 和 `style`，两种模式均支持定制根节点。
- 数据模式根节点的 `data-slot="tabs"`、`data-size`、`data-variant`、`data-position` 可用于样式选择器。两种模式的选中项均带 `aria-selected="true"`。

## 无障碍

- 使用 ARIA tabs 模式：`tablist` + `tab` + `tabpanel`，`aria-selected`、`aria-controls`、`aria-labelledby` 完整关联。
- 方向键在标签间移动并自动激活，Home/End 跳到首尾；纵向模式下使用 ↑/↓。
- 数据模式只有一个可用标签处于 Tab 序列中。组合模式可将 `activationMode` 设为 `manual`，让用户先用方向键聚焦，再按 Enter 或空格激活。隐藏面板不参与读屏。

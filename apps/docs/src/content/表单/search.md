---
title: Search
group: 表单
description: 搜索输入框。在 Input 基础上内置搜索图标、清除与独立搜索按钮，回车或点击均可触发。
order: 4
---

## 何时使用

用于搜索场景：站内搜索、表格筛选、列表查找。它本质是 `Input` 的语义化封装，自动带搜索图标与清除按钮，并按需渲染右侧搜索按钮。

- 轻量筛选：不显示按钮，回车触发 `onSearch`
- 明确的提交动作：`enterButton` 显示按钮（可用 `loading` 阻塞重复提交）
- 复杂筛选入口：先用 Search 收集关键词，再交给 Select / DatePicker 细化

## 基础用法

`onSearch` 在按下 Enter 或点击搜索按钮时触发，参数始终是最新的输入值。

<Demo id="search/01-basic" />

## 深度定制

`enterButton` 接受 `true` 或自定义节点；`loading` 时按钮禁用并显示旋转图标，避免重复请求。`prefix` 与 `status` 会透传给内部 Input。

<Demo id="search/02-custom" />

搜索按钮和回车始终读取当前显示的输入值，包括 Form.Item 更新的值和父组件回填的受控值。加载期间暂停提交，输入法确认候选词后可以再次回车搜索。

## API

除下列差异外，其余属性与 `Input` 一致（`InputProps` 的 Omit 版本）。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 受控值 | `string` | — |
| defaultValue | 非受控初始值 | `string` | `''` |
| onChange | 值变化时触发 | `(value: string, event?) => void` | — |
| onSearch | 回车或点击搜索按钮时触发 | `(value: string, event?) => void` | — |
| prefix | 框内前缀，默认搜索图标 | `ReactNode` | `<Icon name="search" />` |
| enterButton | 是否显示搜索按钮 | `boolean ｜ ReactNode` | `false` |
| loading | 加载态，禁用搜索按钮 | `boolean` | `false` |
| allowClear | 显示清除按钮 | `boolean` | `true` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| status | 校验状态 | `default ｜ error ｜ warning ｜ success` | `default` |
| classNames | 语义节点类名 | `{ root?, input?, button? }` | — |
| ref | 转发到根节点 | `Ref<HTMLDivElement>` | — |

## 定制点

- **Token**：按钮高度跟随 `--yuki-control-height-sm`、`--yuki-control-height-md`、`--yuki-control-height-lg`。使用 `--yuki-color-primary`、`--yuki-color-primary-contrast` 和 `--yuki-color-primary-hover` 定制按钮颜色。
- **类名/样式**：`classNames.root | input | button` 与 `styles.*`。
- **结构**：按钮位于内部 Input 的 `suffix` 槽，宽度与高度自动与输入框对齐；`enterButton` 传节点即可完全自定义。
- **状态**：`data-size`、`data-status`、`data-loading` 是公开接口。

## 无障碍

- 回车与点击按钮使用同一条提交路径；搜索按钮始终带本地化 `aria-label`，即使内容只有图标也可被读屏识别。
- `loading` 时按钮 `disabled` 并设置 `aria-busy`，防止重复提交；清除按钮 `tabIndex={-1}`，不破坏 Tab 顺序。
- 输入框继承 `Input` 的 `aria-invalid` / `aria-describedby` 等表单绑定；请为纯图标场景提供 `aria-label`。
- 焦点环使用 `--yuki-shadow-focus`；搜索按钮的禁用态仍保留对比度，不用纯颜色表达可用性。

---
title: Upload
group: 表单
description: 文件上传。负责文件选择、校验、列表状态与图片预览，真正的传输由 action 或 customRequest 决定。
order: 11
---

## 何时使用

需要让用户从本地选择文件并提交，或仅需在界面上维护一份待提交文件列表时使用 Upload。组件不绑定后端协议：传入 `action` 时由内置 XHR 发起请求，或者用 `customRequest` 接管传输（对象存储直传、分片、mock 等）。

- 选择单个或多个文件：默认单选，`multiple` 开启多选
- 限制类型与数量：`accept`、`maxCount`
- 拖拽上传：使用 `UploadDragger`，或在 `Upload` 上设置 `drag`
- 受控列表：传入 `fileList` 并在 `onChange` 中回写

## 基础用法

`fileList` 为受控列表，`onChange(fileList, file)` 同时给出全量列表与本次变化的文件。文件状态 `status` 在 `uploading / done / error` 之间流转，列表项据此渲染进度与错误文案。`accept`、`maxCount`、`size`、`disabled` 直接作用于触发器与文件选择框。

<Demo id="upload/01-basic" />

## 深度定制

`customRequest` 接收 `UploadRequestOptions`（`onProgress`、`onSuccess`、`onError`），返回 `{ abort }` 后，移除文件会中断传输。`beforeUpload` 返回 `false` 或 `Promise<false>` 可拒绝文件，返回 `Promise<File>` 可替换文件。`listType="picture"` 在存在 `thumbUrl` 或 `url` 时显示缩略图；用 children 可以替换默认的按钮触发器；点击缩略图或预览按钮会打开内置预览浮层，传入 `onPreview` 可完全接管。

<Demo id="upload/02-custom" />

## 整批上传

用 `BatchUpload` 将一次选择的全部文件作为同一个 multipart 请求提交。传入 `action` 指定地址，`name` 指定重复使用的文件字段名。重新选择或重置表单会取消上一次请求。完成时 `onUploaded(files, response)` 返回该批文件与 HTTP 响应，失败时触发 `onUploadError(error)`。

下例在本地选择文件，将 `action` 指向你的上传接口即可提交。原生表单也可以直接读取所选文件。

<Demo id="upload/03-batch" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| fileList | 受控文件列表 | `UploadFile[]` | — |
| defaultFileList | 非受控初始列表 | `UploadFile[]` | `[]` |
| onChange | 列表变化时触发 | `(fileList: UploadFile[], file: UploadFile) => void` | — |
| beforeUpload | 上传前校验，可异步 | `(file: File, files: File[]) => boolean ｜ Promise<boolean ｜ File>` | — |
| customRequest | 自定义传输实现 | `(options: UploadRequestOptions) => UploadRequestResult ｜ void` | — |
| action | 上传地址 | `string` | — |
| method | 请求方法 | `string` | `POST` |
| headers / data | 请求头与附加字段 | `Record<string, string>` | — |
| name | 文件字段名 | `string` | `file` |
| withCredentials | 携带跨域凭据 | `boolean` | `false` |
| multiple | 允许选择多个文件 | `boolean` | `false` |
| accept | 可选文件类型 | `string` | — |
| maxCount | 最大文件数，超出触发 `onExceed` | `number` | — |
| drag | 拖拽上传（`UploadDragger` 恒为 true） | `boolean` | `false` |
| disabled | 禁用 | `boolean` | `false` |
| listType | 列表形态 | `text ｜ picture` | `text` |
| showUploadList | 显示文件列表 | `boolean` | `true` |
| showRemoveIcon / showPreviewIcon | 显示移除 / 预览按钮 | `boolean` | `true` |
| tip | 触发区提示文案 | `ReactNode` | — |
| icon | 自定义包裹层图标 | `ReactNode` | — |
| fileRender | 自定义列表项内容 | `(file: UploadFile) => ReactNode` | — |
| onRemove | 移除前回调，返回 `false` 阻止移除 | `(file) => boolean ｜ Promise<boolean ｜ void> ｜ void` | — |
| onPreview | 自定义预览 | `(file: UploadFile) => void` | — |
| onProgress / onSuccess / onError | 传输生命周期回调 | `(file, ...) => void` | — |
| onExceed | 超过 `maxCount` 时触发 | `(files: File[], fileList: UploadFile[]) => void` | — |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| classNames / styles | 语义节点类名 / 样式 | `UploadClassNames` / `UploadStyles` | — |

`UploadFile` 字段：`uid`、`name`、`size`、`type`、`status`、`percent`、`url`、`thumbUrl`、`originFile`、`response`、`error`。`ref` 指向根 `<div>`，未列出的原生属性会透传到根节点。

## 定制点

- **Token**：`.yuki-upload` 声明 `--yuki-upload-gap`、`--yuki-upload-trigger-gap`、`--yuki-upload-item-gap`、`--yuki-upload-item-padding-block`、`--yuki-upload-item-padding-inline`、`--yuki-upload-item-radius`、`--yuki-upload-item-bg`、`--yuki-upload-thumb-size`、`--yuki-upload-thumb-radius`、`--yuki-upload-dropzone-padding-block`、`--yuki-upload-dropzone-padding-inline`、`--yuki-upload-dropzone-radius`、`--yuki-upload-dropzone-bg`、`--yuki-upload-dropzone-bg-active`、`--yuki-upload-dropzone-border`、`--yuki-upload-icon-size`、`--yuki-upload-icon-color`、`--yuki-upload-tip-color`、`--yuki-upload-tip-size`、`--yuki-upload-file-size`、`--yuki-upload-meta-size`、`--yuki-upload-overlay-image-radius`。
- **类名/样式**：`classNames.root | trigger | dropzone | icon | tip | input | list | item | thumbnail | file | fileName | fileSize | progress | actions | preview | remove | overlay | overlayImage` 与 `styles.*`。
- **结构**：拖拽区（`__dropzone`）与按钮触发器（`__trigger`）互斥；隐藏的 `<input type="file">` 负责唤起系统选择框；预览浮层通过 Portal 渲染在弹层容器内。
- **状态**：根节点 `data-size`、`data-disabled`、`data-drag`、`data-list-type`、`data-dragging`；列表项 `data-status`（`uploading ｜ done ｜ error`）是公开接口。

## 无障碍

- 默认触发器使用原生 `Button`；拖拽区带 `role="button"` 与 `tabIndex={0}`，`Enter` / `Space` 打开文件选择框，`aria-disabled` 与 `disabled` 同步。
- 隐藏的文件输入 `aria-hidden` 且 `tabIndex={-1}`，不进入 Tab 顺序；选择后焦点回到触发器。
- 列表项状态由图标与文案共同表达，不依赖颜色；进度条带 `role="progressbar"`，移除与预览按钮的 `aria-label` 包含文件名。
- 内置预览浮层为 `role="dialog"` + `aria-modal`，打开后关闭按钮自动获得焦点，`Escape` 或点击遮罩关闭并把焦点交回触发元素。
- 所有焦点可见状态使用 `--yuki-shadow-focus`，暗色主题下对比度一致。

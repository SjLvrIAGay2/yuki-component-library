# @yuki-ui/react

Yuki UI 提供表单、数据展示、浮层、文档与媒体预览等 React 组件。安装时使用 React 和 React DOM 18.3 或 19 系列。应用入口引入一次完整样式。

```tsx
import { Button, ConfigProvider } from '@yuki-ui/react';
import '@yuki-ui/react/styles.css';

export function App() {
  return (
    <ConfigProvider theme={{ mode: 'system' }}>
      <Button onClick={() => window.print()}>打印</Button>
    </ConfigProvider>
  );
}
```

- 按组件导入时使用 `@yuki-ui/react/components/button` 等子路径。
- 使用 `@yuki-ui/react/tokens.css` 可单独引入设计令牌，完整样式已包含这些变量。
- 包内的 AI 组件指南收录各组件的完整 TSX 示例、字段、事件和页面组合建议。运行以下命令可在使用方项目中定位该文件。

```sh
node -p "require.resolve('@yuki-ui/react/ai-guide.md')"
```

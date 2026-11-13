import { Component, type ReactNode } from 'react';

export class RenderBoundary extends Component<
  { children: ReactNode; onError?: (error: Error) => void },
  { error?: Error }
> {
  override state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }
  override render() {
    return this.state.error ? (
      <p className="yuki-document-viewer__error" role="alert">
        暂时无法预览，请刷新页面后重试。
      </p>
    ) : (
      this.props.children
    );
  }
}

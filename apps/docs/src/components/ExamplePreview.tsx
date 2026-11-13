import { Suspense, useEffect, useRef, useState } from 'react';
import { Icon } from '@yuki-ui/react';
import type { ExampleEntry } from '../lib/examples';
import { CodeSample } from './CodeSample';

export interface ExamplePreviewProps {
  example: ExampleEntry;
  /** Render source open by default. */
  defaultOpen?: boolean;
}

export function ExamplePreview({ example, defaultOpen = false }: ExamplePreviewProps) {
  const [revision, setRevision] = useState(0);
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const { Component, loadSource, name } = example;
  const [source, setSource] = useState('');
  const [copyFailed, setCopyFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    let active = true;
    loadSource().then(text => { if (active) setSource(text); }, () => {
      if (active) setSource('示例源码加载失败，请刷新重试。');
    });
    return () => { active = false; };
  }, [open, loadSource]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(await loadSource());
      clearTimeout(timer.current);
      setCopyFailed(false);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopyFailed(true);
      setOpen(true);
    }
  };

  return (
    <figure className="docs-demo">
      <div className="docs-demo__stage">
        <Suspense fallback={<span role="status">正在加载示例…</span>}>
          <Component key={revision} />
        </Suspense>
      </div>
      <figcaption className="docs-demo__bar">
        <span className="docs-demo__name">{name}</span>
        <div className="docs-demo__actions">
          <button type="button" className="docs-demo__action" onClick={() => setRevision(value => value + 1)} aria-label="重置示例">
            <Icon name="refresh" size="0.8125rem" /> 重置
          </button>
          <button type="button" className="docs-demo__action" onClick={copy} aria-label="复制示例代码">
            <Icon name={copied ? 'check' : 'copy'} size="0.8125rem" />
            {copied ? '已复制' : copyFailed ? '请手动复制' : '复制'}
          </button>
          <button
            type="button"
            className="docs-demo__action"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            <Icon name="code" size="0.8125rem" />
            {open ? '收起代码' : '查看代码'}
          </button>
        </div>
      </figcaption>
      {open && (
        source ? (
          <CodeSample code={source} language="tsx" className="docs-demo__source" />
        ) : (
          <pre className="docs-demo__source" role="status">正在加载源码…</pre>
        )
      )}
    </figure>
  );
}

import { lazy, Suspense } from 'react';

const CodeBlock = lazy(() =>
  import('@yuki-ui/react/components/code-block').then(({ CodeBlock }) => ({ default: CodeBlock })),
);

export function CodeSample({
  code,
  language,
  className,
}: {
  code: string;
  language: string;
  className: string;
}) {
  return (
    <Suspense fallback={<pre className={className}><code>{code}</code></pre>}>
      <CodeBlock
        className="docs-code-sample"
        code={code}
        language={language}
        showToolbar={false}
        showLineNumbers={false}
        maxHeight="none"
        viewportProps={{ className }}
      />
    </Suspense>
  );
}

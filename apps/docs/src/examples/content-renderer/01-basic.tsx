import { ContentRenderer } from '@yuki-ui/react';

export default function CodeContent() {
  return <ContentRenderer type="code" filename="package.json" language="json"
    code={'{\n  "name": "yuki-ui",\n  "private": true\n}'} />;
}

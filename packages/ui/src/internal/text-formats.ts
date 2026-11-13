// Explicit filename classification; parsing/rendering never executes document contents.
const plainExtensions = new Set(
  'txt text log csv tsv nfo asc rst adoc asciidoc srt vtt ass ssa lrc'.split(' '),
);
const markdownExtensions = new Set('md markdown mdown mkd'.split(' '));
const plainNames = new Set(
  'readme license licence notice copying authors changelog .gitignore .gitattributes .dockerignore'.split(
    ' ',
  ),
);
const codeExtensions = new Map<string, string>();
for (const [language, extensions] of Object.entries({
  javascript: 'js jsx mjs cjs',
  typescript: 'ts tsx mts cts',
  xml: 'html htm xml svg vue svelte xsd xsl xslt',
  css: 'css',
  scss: 'scss',
  less: 'less',
  json: 'json jsonl ndjson',
  python: 'py pyw pyi',
  bash: 'sh bash zsh',
  sql: 'sql',
  yaml: 'yaml yml',
  lua: 'lua luau',
  ini: 'ini cfg toml env config',
  properties: 'properties',
  go: 'go',
  rust: 'rs',
  java: 'java',
  c: 'c h',
  cpp: 'cpp hpp cc cxx hxx',
  csharp: 'cs csx',
  kotlin: 'kt kts',
  swift: 'swift',
  ruby: 'rb rake gemspec',
  php: 'php phtml',
  r: 'r',
  perl: 'pl pm',
  scala: 'scala sc',
  groovy: 'groovy gradle',
  dart: 'dart',
  powershell: 'ps1 psm1 psd1',
  dos: 'bat cmd',
  dockerfile: 'dockerfile',
  makefile: 'mk makefile',
  cmake: 'cmake',
  diff: 'diff patch',
  graphql: 'graphql gql',
  protobuf: 'proto',
  latex: 'tex sty cls',
  apache: 'htaccess',
  text: 'conf cnf gitignore gitattributes dockerignore',
})) {
  for (const extension of extensions.split(' ')) codeExtensions.set(extension, language);
}
const codeNames = new Map<string, string>(
  Object.entries({
    dockerfile: 'dockerfile',
    containerfile: 'dockerfile',
    makefile: 'makefile',
    gnumakefile: 'makefile',
    'cmakelists.txt': 'cmake',
    '.bashrc': 'bash',
    '.bash_profile': 'bash',
    '.zshrc': 'bash',
    '.profile': 'bash',
    '.gitconfig': 'ini',
    '.editorconfig': 'ini',
    '.npmrc': 'ini',
    '.yarnrc': 'ini',
    'nginx.conf': 'nginx',
    '.htaccess': 'apache',
    gemfile: 'ruby',
    rakefile: 'ruby',
  }),
);

export function textDocumentType(
  filename: string,
): { format: 'text' | 'code' | 'markdown'; language: string } | undefined {
  const name = filename.split(/[\\/]/).pop()?.toLowerCase() ?? '';
  const named = codeNames.get(name);
  if (named) return { format: 'code', language: named };
  if (/^(dockerfile|containerfile)\..+$/.test(name))
    return { format: 'code', language: 'dockerfile' };
  if (name === '.env' || name.startsWith('.env.')) return { format: 'code', language: 'ini' };
  if (plainNames.has(name)) return { format: 'text', language: 'text' };
  const extension = name.split('.').pop() ?? '';
  if (markdownExtensions.has(extension)) return { format: 'markdown', language: 'markdown' };
  const language = codeExtensions.get(extension);
  if (language) return { format: 'code', language };
  if (plainExtensions.has(extension)) return { format: 'text', language: 'text' };
  return undefined;
}

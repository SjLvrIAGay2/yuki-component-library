import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import lua from 'highlight.js/lib/languages/lua';
import ini from 'highlight.js/lib/languages/ini';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import java from 'highlight.js/lib/languages/java';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import kotlin from 'highlight.js/lib/languages/kotlin';
import swift from 'highlight.js/lib/languages/swift';
import ruby from 'highlight.js/lib/languages/ruby';
import php from 'highlight.js/lib/languages/php';
import r from 'highlight.js/lib/languages/r';
import perl from 'highlight.js/lib/languages/perl';
import scala from 'highlight.js/lib/languages/scala';
import groovy from 'highlight.js/lib/languages/groovy';
import dart from 'highlight.js/lib/languages/dart';
import powershell from 'highlight.js/lib/languages/powershell';
import dos from 'highlight.js/lib/languages/dos';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import makefile from 'highlight.js/lib/languages/makefile';
import cmake from 'highlight.js/lib/languages/cmake';
import diff from 'highlight.js/lib/languages/diff';
import graphql from 'highlight.js/lib/languages/graphql';
import protobuf from 'highlight.js/lib/languages/protobuf';
import latex from 'highlight.js/lib/languages/latex';
import scss from 'highlight.js/lib/languages/scss';
import less from 'highlight.js/lib/languages/less';
import properties from 'highlight.js/lib/languages/properties';
import nginx from 'highlight.js/lib/languages/nginx';
import apache from 'highlight.js/lib/languages/apache';

const highlighter = createLowlight({
  javascript,
  typescript,
  xml,
  css,
  json,
  python,
  bash,
  sql,
  yaml,
  markdown,
  lua,
  ini,
  go,
  rust,
  java,
  c,
  cpp,
  csharp,
  kotlin,
  swift,
  ruby,
  php,
  r,
  perl,
  scala,
  groovy,
  dart,
  powershell,
  dos,
  dockerfile,
  makefile,
  cmake,
  diff,
  graphql,
  protobuf,
  latex,
  scss,
  less,
  properties,
  nginx,
  apache,
});
const aliases: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'xml',
  svg: 'xml',
  vue: 'xml',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  md: 'markdown',
  py: 'python',
  toml: 'ini',
  cfg: 'ini',
  env: 'ini',
  luau: 'lua',
  cs: 'csharp',
  ps1: 'powershell',
  bat: 'dos',
  cmd: 'dos',
  docker: 'dockerfile',
  make: 'makefile',
  proto: 'protobuf',
  tex: 'latex',
  kt: 'kotlin',
  rb: 'ruby',
  rs: 'rust',
  gql: 'graphql',
  patch: 'diff',
  zsh: 'bash',
  shellscript: 'bash',
};
export function highlightCode(code: string, language: string) {
  const name = language.toLowerCase();
  const resolved = Object.hasOwn(aliases, name) ? aliases[name]! : name;
  return code.length <= 100_000 && highlighter.registered(resolved)
    ? highlighter.highlight(resolved, code)
    : undefined;
}

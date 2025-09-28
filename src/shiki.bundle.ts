/* Generate by @shikijs/codegen */

import type {
  DynamicImportLanguageRegistration,
  DynamicImportThemeRegistration,
  HighlighterGeneric,
} from "@shikijs/types";
import { createdBundledHighlighter } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";

type BundledLanguage = 
  // 前20种流行编程语言
  "python" | "javascript" | "js" | "typescript" | "ts" | "java" | "csharp" | "cs" | "cpp" | "c" |
  "go" | "rust" | "html" | "css" | "sql" | "ruby" | "php" | "swift" | "kotlin" | "r" | "scala" | 
  "perl" | "lua" |
  // 额外支持的语言
  "vue" | "json" | "xml" | "bash" | "shellscript" | "shell" | "yaml" | "yml" |
  "less" | "scss" | "sass" | "graphql" | "docker" | "dockerfile" | "make" | "makefile" |
  "markdown" | "md";

type BundledTheme = "github-light" | "github-dark" | "light-plus" | "dark-plus";

type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

const bundledLanguages = {
  // 前20种流行编程语言
  python: () => import("@shikijs/langs-precompiled/python"),
  javascript: () => import("@shikijs/langs-precompiled/javascript"),
  js: () => import("@shikijs/langs-precompiled/javascript"),
  typescript: () => import("@shikijs/langs-precompiled/typescript"),
  ts: () => import("@shikijs/langs-precompiled/typescript"),
  java: () => import("@shikijs/langs-precompiled/java"),
  csharp: () => import("@shikijs/langs-precompiled/csharp"),
  cs: () => import("@shikijs/langs-precompiled/csharp"),
  cpp: () => import("@shikijs/langs-precompiled/cpp"),
  c: () => import("@shikijs/langs-precompiled/c"),
  go: () => import("@shikijs/langs-precompiled/go"),
  rust: () => import("@shikijs/langs-precompiled/rust"),
  html: () => import("@shikijs/langs-precompiled/html"),
  css: () => import("@shikijs/langs-precompiled/css"),
  sql: () => import("@shikijs/langs-precompiled/sql"),
  ruby: () => import("@shikijs/langs-precompiled/ruby"),
  php: () => import("@shikijs/langs-precompiled/php"),
  swift: () => import("@shikijs/langs-precompiled/swift"),
  kotlin: () => import("@shikijs/langs-precompiled/kotlin"),
  r: () => import("@shikijs/langs-precompiled/r"),
  scala: () => import("@shikijs/langs-precompiled/scala"),
  perl: () => import("@shikijs/langs-precompiled/perl"),
  lua: () => import("@shikijs/langs-precompiled/lua"),
  // 额外支持的语言
  vue: () => import("@shikijs/langs-precompiled/vue"),
  json: () => import("@shikijs/langs-precompiled/json"),
  xml: () => import("@shikijs/langs-precompiled/xml"),
  bash: () => import("@shikijs/langs-precompiled/bash"),
  shellscript: () => import("@shikijs/langs-precompiled/shellscript"),
  shell: () => import("@shikijs/langs-precompiled/shellscript"),
  yaml: () => import("@shikijs/langs-precompiled/yaml"),
  yml: () => import("@shikijs/langs-precompiled/yaml"),
  markdown: () => import("@shikijs/langs-precompiled/markdown"),
  md: () => import("@shikijs/langs-precompiled/markdown"),
  less: () => import("@shikijs/langs-precompiled/less"),
  scss: () => import("@shikijs/langs-precompiled/scss"),
  sass: () => import("@shikijs/langs-precompiled/sass"),
  graphql: () => import("@shikijs/langs-precompiled/graphql"),
  docker: () => import("@shikijs/langs-precompiled/docker"),
  dockerfile: () => import("@shikijs/langs-precompiled/docker"),
  make: () => import("@shikijs/langs-precompiled/make"),
  makefile: () => import("@shikijs/langs-precompiled/make"),
} as Record<BundledLanguage, DynamicImportLanguageRegistration>;

const bundledThemes = {
  "github-light": () => import("@shikijs/themes/github-light-default"),
  "github-dark": () => import("@shikijs/themes/github-dark-default"),
  "light-plus": () => import("@shikijs/themes/light-plus"),
  "dark-plus": () => import("@shikijs/themes/dark-plus"),
} as Record<BundledTheme, DynamicImportThemeRegistration>;

const createHighlighter = /* @__PURE__ */ createdBundledHighlighter<
  BundledLanguage,
  BundledTheme
>({
  langs: bundledLanguages,
  themes: bundledThemes,
  engine: () => createJavaScriptRegexEngine(),
});

export { createHighlighter };
export type { BundledLanguage, BundledTheme, Highlighter };
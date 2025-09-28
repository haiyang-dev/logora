/**
 * 公共的 BlockNote Schema 配置
 * 前后端共享，确保一致性
 */
import { 
  BlockNoteSchema, 
  createCodeBlockSpec,
  defaultBlockSpecs,
} from '@blocknote/core';

// 导入项目中配置好的Shiki bundle
import { 
  createHighlighter as createShikiHighlighter,
  type BundledLanguage,
  type BundledTheme
} from '../shiki.bundle';

// 按照官方文档使用extend方法正确配置代码块
export const unifiedSchema = BlockNoteSchema.create().extend({
  blockSpecs: {
    codeBlock: createCodeBlockSpec({
      indentLineWithTab: true,
      defaultLanguage: "typescript",
      supportedLanguages: {
        // 最常用的编程语言
        typescript: { name: "TypeScript", aliases: ["ts"] },
        javascript: { name: "JavaScript", aliases: ["js"] },
        python: { name: "Python", aliases: ["py"] },
        java: { name: "Java", aliases: ["java"] },
        // Web 技术相关
        html: { name: "HTML", aliases: ["html"] },
        css: { name: "CSS", aliases: ["css"] },
        json: { name: "JSON", aliases: ["json"] },
        xml: { name: "XML", aliases: ["xml"] },
        // 其他流行编程语言
        c: { name: "C", aliases: ["c"] },
        cpp: { name: "C++", aliases: ["cpp", "c++"] },
        csharp: { name: "C#", aliases: ["cs", "c#"] },
        go: { name: "Go", aliases: ["go"] },
        rust: { name: "Rust", aliases: ["rs"] },
        // 脚本语言
        bash: { name: "Bash", aliases: ["sh"] },
        shellscript: { name: "Shell Script", aliases: ["shell"] },
        // 其他编程语言
        ruby: { name: "Ruby", aliases: ["rb"] },
        php: { name: "PHP", aliases: ["php"] },
        swift: { name: "Swift", aliases: ["swift"] },
        kotlin: { name: "Kotlin", aliases: ["kt", "kts"] },
        r: { name: "R", aliases: ["r"] },
        scala: { name: "Scala", aliases: ["scala"] },
        perl: { name: "Perl", aliases: ["pl"] },
        lua: { name: "Lua", aliases: ["lua"] },
        // 样式表语言
        less: { name: "Less", aliases: ["less"] },
        scss: { name: "SCSS", aliases: ["scss"] },
        sass: { name: "Sass", aliases: ["sass"] },
        // 数据库相关
        sql: { name: "SQL", aliases: ["sql"] },
        // 配置和数据格式
        yaml: { name: "YAML", aliases: ["yml"] },
        // 其他特定用途语言
        graphql: { name: "GraphQL", aliases: ["graphql"] },
        docker: { name: "Docker", aliases: ["dockerfile"] },
        make: { name: "Makefile", aliases: ["makefile"] },
        vue: { name: "Vue", aliases: ["vue"] },
        markdown: { name: "Markdown", aliases: ["md"] }
      },
      // 异步创建高亮器实例
      createHighlighter: async () => {
        const highlighter = await createShikiHighlighter({
          themes: ["github-light" as BundledTheme], // 使用GitHub Light主题
          langs: [], // 可以根据需要预加载特定语言
        });
        return highlighter;
      },
    }),
  },
});

/**
 * Schema 版本信息
 * 用于调试和版本控制
 */
export const SCHEMA_VERSION = '2.1.0';

/**
 * 支持的代码块语言列表
 * 与Shiki bundle配置保持同步
 */
export const SUPPORTED_CODE_LANGUAGES: BundledLanguage[] = [
  // 最常用的编程语言
  'javascript', 'js', 'typescript', 'ts', 'python', 'java',
  // 其他流行编程语言
  'c', 'cpp', 'csharp', 'cs', 'go', 'rust',
  // Web 技术相关
  'html', 'css', 'json', 'xml',
  // 脚本语言
  'bash', 'shellscript', 'shell',
  // 其他编程语言
  'ruby', 'php', 'swift', 'kotlin', 'r', 'scala', 'perl', 'lua',
  // 样式表语言
  'less', 'scss', 'sass',
  // 配置和数据格式
  'yaml', 'yml',
  // 数据库相关
  'sql',
  // 其他特定用途语言
  'graphql', 'docker', 'dockerfile', 'make', 'makefile',
  'vue', 'markdown', 'md'
];

export type SupportedLanguage = BundledLanguage;

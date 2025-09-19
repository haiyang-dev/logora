import type { PartialBlock, Block } from '@blocknote/core';
import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { 
  BlockNoteSchema, 
  createCodeBlockSpec, 
  defaultBlockSpecs,
} from '@blocknote/core';

// 创建与客户端相同的schema配置
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    codeBlock: createCodeBlockSpec({
      indentLineWithTab: true,
      defaultLanguage: 'typescript',
      supportedLanguages: {
        // 将 TypeScript 放在第一位作为默认语言
        typescript: {
          name: 'TypeScript',
          aliases: ['ts'],
        },
        javascript: {
          name: 'JavaScript',
          aliases: ['js'],
        },
        python: {
          name: 'Python',
        },
        java: {
          name: 'Java',
        },
        csharp: {
          name: 'C#',
          aliases: ['cs'],
        },
        cpp: {
          name: 'C++',
        },
        c: {
          name: 'C',
        },
        go: {
          name: 'Go',
        },
        rust: {
          name: 'Rust',
        },
        html: {
          name: 'HTML',
        },
        css: {
          name: 'CSS',
        },
        sql: {
          name: 'SQL',
        },
        ruby: {
          name: 'Ruby',
        },
        php: {
          name: 'PHP',
        },
        swift: {
          name: 'Swift',
        },
        kotlin: {
          name: 'Kotlin',
        },
        r: {
          name: 'R',
        },
        scala: {
          name: 'Scala',
        },
        perl: {
          name: 'Perl',
        },
        lua: {
          name: 'Lua',
        },
        // 额外支持的语言
        vue: {
          name: 'Vue',
        },
        json: {
          name: 'JSON',
        },
        xml: {
          name: 'XML',
        },
        bash: {
          name: 'Bash',
          aliases: ['shellscript', 'shell'],
        },
        yaml: {
          name: 'YAML',
          aliases: ['yml'],
        },
        markdown: {
          name: 'Markdown',
          aliases: ['md'],
        },
        less: {
          name: 'Less',
        },
        scss: {
          name: 'SCSS',
        },
        sass: {
          name: 'Sass',
        },
        graphql: {
          name: 'GraphQL',
        },
        dockerfile: {
          name: 'Dockerfile',
          aliases: ['docker'],
        },
        makefile: {
          name: 'Makefile',
          aliases: ['make'],
        },
      },
      // 按照官方文档标准实现
      createHighlighter: () => null as any,
    }),
  },
});

// 将 Markdown 内容转换为 BlockNote 格式
export async function markdownToBlockNote(markdownContent: string): Promise<PartialBlock[]> {
  try {
    // 创建服务器端 BlockNote 编辑器实例，使用与客户端相同的schema
    const editor = ServerBlockNoteEditor.create({ schema });
    
    // 使用官方的 Markdown 解析方法
    const blocks = await editor.tryParseMarkdownToBlocks(markdownContent || '');
    
    // 打印解析结果用于调试
    console.log('Markdown 解析结果:', JSON.stringify(blocks, null, 2));
    
    // 确保返回有效的块数组
    if (blocks && Array.isArray(blocks) && blocks.length > 0) {
      // 过滤掉可能有问题的块并转换为PartialBlock类型
      const filteredBlocks: PartialBlock[] = blocks
        .filter(block => {
          // 确保每个块都有类型
          return block && block.type;
        })
        .map(block => {
          // 确保每个块都有 content 字段
          if (!block.content) {
            return {
              ...block,
              content: []
            } as unknown as PartialBlock;
          }
          return block as PartialBlock;
        });
      
      if (filteredBlocks.length > 0) {
        return filteredBlocks;
      }
    }
    
    // 如果没有内容或解析失败，返回一个包含空文本的段落
    return [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '',
            styles: {}
          }
        ]
      }
    ];
  } catch (error) {
    console.error('Markdown to BlockNote conversion failed:', error);
    
    // 出错时返回包含原始内容的段落
    return [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: markdownContent || '',
            styles: {}
          }
        ]
      }
    ];
  }
}

// 将 BlockNote 格式转换为 Markdown 内容
export async function blockNoteToMarkdown(blocks: Block[]): Promise<string> {
  try {
    // 创建服务器端 BlockNote 编辑器实例，使用与客户端相同的schema
    const editor = ServerBlockNoteEditor.create({ schema });
    
    // 确保所有块都有 content 字段
    const validBlocks = blocks.map(block => {
      if (!block.content) {
        return {
          ...block,
          content: []
        } as unknown as Block;
      }
      return block;
    });
    
    // 使用官方的 Markdown 导出方法
    const markdownContent = await editor.blocksToMarkdownLossy(validBlocks);
    
    return markdownContent;
  } catch (error) {
    console.error('BlockNote to Markdown conversion failed:', error);
    // 出错时返回空字符串
    return '';
  }
}
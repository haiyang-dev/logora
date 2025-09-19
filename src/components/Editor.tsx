import React, { useEffect, useCallback, useState, useRef } from 'react';
import { BlockNoteEditor, BlockNoteSchema, createCodeBlockSpec, defaultBlockSpecs } from '@blocknote/core';
import type { PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { createHighlighter } from '../shiki.bundle';
import { useApp } from '../context/AppContext';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import './Editor.css';

interface EditorProps {
  className?: string;
}

export function Editor({ className }: EditorProps) {
  const { state, dispatch } = useApp();
  
  const selectedNote = state.selectedNoteId ? state.notes[state.selectedNoteId] : null;
  
  // 添加一个状态来跟踪编辑器是否已经挂载
  const [isEditorReady, setIsEditorReady] = useState(false);
  
  // 使用 useRef 来存储上一次的内容，避免不必要的更新
  const previousContentRef = useRef<PartialBlock[] | null>(null);
  
  // 防抖定时器引用
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 创建编辑器实例，使用官方示例的自定义代码块配置
  const editor = useCreateBlockNote({
    schema: BlockNoteSchema.create().extend({
      blockSpecs: {
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
          createHighlighter: () =>
            createHighlighter({
              themes: ['dark-plus', 'light-plus'],
              langs: [],
            }),
        }),
      },
    }),
    initialContent: [
      {
        type: 'codeBlock',
        props: {
          language: 'typescript',
        },
        content: [
          {
            type: 'text',
            text: 'const x = 3 * 4;',
            styles: {},
          },
        ],
      },
      {
        type: 'paragraph',
      },
      {
        type: 'heading',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
          level: 3,
        },
        content: [
          {
            type: 'text',
            text: 'Click on "Typescript" above to see the different supported languages',
            styles: {},
          },
        ],
      },
      {
        type: 'paragraph',
      },
    ] as PartialBlock[],
    uploadFile: undefined,
  });
  
  // 调试信息和编辑器准备就绪处理
  useEffect(() => {
    console.log('编辑器创建成功，支持的块类型:', Object.keys(editor.schema.blockSpecs));
    console.log('codeBlock 配置:', editor.schema.blockSpecs.codeBlock);
    
    // 检查是否支持代码块
    if (editor.schema.blockSpecs.codeBlock) {
      console.log('代码块支持已启用');
    }
    
    // 设置编辑器准备就绪的回调
    const cleanup = editor.onCreate(() => {
      setIsEditorReady(true);
      console.log('编辑器已准备就绪');
    });
    
    // 清理函数
    return () => {
      cleanup();
      // 清理防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [editor]);
  
  // 当选中的笔记改变时，更新编辑器内容
  useEffect(() => {
    // 只有在编辑器准备就绪后才执行更新
    if (!isEditorReady) {
      return;
    }
    
    if (selectedNote && !selectedNote.isFolder && selectedNote.content) {
      // 只有当内容真正改变时才更新编辑器
      const currentContent = editor.document;
      const newContent = selectedNote.content as PartialBlock[];
      
      // 比较内容是否相同，避免不必要的更新
      // 使用更精确的比较方法，避免因为引用不同导致的误判
      const currentContentStr = JSON.stringify(currentContent.map(block => ({
        type: block.type,
        props: block.props,
        content: block.content
      })));
      
      const newContentStr = JSON.stringify(newContent.map(block => ({
        type: block.type,
        props: block.props,
        content: block.content
      })));
      
      // 检查内容是否真正改变
      if (currentContentStr !== newContentStr) {
        // 更新前保存当前内容到 ref
        previousContentRef.current = newContent;
        try {
          editor.replaceBlocks(editor.document, newContent);
        } catch (error) {
          console.warn('更新编辑器内容失败:', error);
        }
      }
    } else if (selectedNote && !selectedNote.isFolder && !selectedNote.content) {
      // 如果是新笔记，设置为空内容
      const currentContent = editor.document;
      const emptyContent = [
        {
          type: 'paragraph',
          content: '',
        },
      ] as PartialBlock[];
      
      // 只有当内容不是空的时候才更新
      if (currentContent.length > 0 || 
          (currentContent.length === 1 && 
           JSON.stringify(currentContent[0].content) !== JSON.stringify(emptyContent[0].content))) {
        // 更新前保存当前内容到 ref
        previousContentRef.current = emptyContent;
        try {
          editor.replaceBlocks(editor.document, emptyContent);
        } catch (error) {
          console.warn('设置空内容失败:', error);
        }
      }
    }
  }, [selectedNote, editor, isEditorReady]);

  const handleContentChange = useCallback(() => {
    if (!selectedNote || selectedNote.isFolder) return;
    
    // 清除之前的防抖定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // 设置新的防抖定时器
    debounceTimerRef.current = setTimeout(() => {
      try {
        const content = editor.document;
        
        // 更新 ref 中的内容
        previousContentRef.current = content;
        
        // 直接保存内容，不进行特殊处理
        dispatch({
          type: 'UPDATE_NOTE',
          payload: {
            id: selectedNote.id,
            updates: {
              content,
            },
          },
        });
      } catch (error) {
        console.warn('保存内容失败:', error);
      }
    }, 300); // 300ms 防抖延迟
  }, [selectedNote, editor, dispatch]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedNote) return;
    
    dispatch({
      type: 'UPDATE_NOTE',
      payload: {
        id: selectedNote.id,
        updates: {
          title: e.target.value,
        },
      },
    });
  }, [selectedNote, dispatch]);

  if (!selectedNote) {
    return (
      <div className={`editor ${className || ''}`}>
        <div className="editor-placeholder">
          <div className="placeholder-content">
            <h2>欢迎使用 BlackNote</h2>
            <p>从左侧选择一个笔记开始编辑，或创建一个新笔记。</p>
            <div className="placeholder-features">
              <div className="feature">
                <span className="feature-icon">📝</span>
                <span>富文本编辑</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📁</span>
                <span>文件夹组织</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔍</span>
                <span>快速搜索</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedNote.isFolder) {
    return (
      <div className={`editor ${className || ''}`}>
        <div className="editor-placeholder">
          <div className="placeholder-content">
            <h2>📁 {selectedNote.title}</h2>
            <p>这是一个文件夹。请选择其中的笔记进行编辑。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`editor ${className || ''}`}>
      {selectedNote && !selectedNote.isFolder && (
        <>
          <div className="editor-header">
            <input
              type="text"
              value={selectedNote.title}
              onChange={handleTitleChange}
              className="note-title"
              placeholder="未命名笔记"
            />
            <div className="note-info">
              <span className="note-date">
                更新于: {selectedNote.updatedAt.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="editor-content">
            <BlockNoteView
              editor={editor}
              onChange={handleContentChange}
              theme="light" // 确保使用浅色主题
            />
          </div>
        </>
      )}
    </div>
  );
}
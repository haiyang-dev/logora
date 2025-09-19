import React, { useEffect, useCallback, useState, useRef } from 'react';
import { 
  BlockNoteEditor, 
  BlockNoteSchema, 
  createCodeBlockSpec, 
  defaultBlockSpecs,
  type PartialBlock, 
  type Block 
} from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { createHighlighter } from '../shiki.bundle';
import { useApp } from '../context/AppContext';
import { FileSystemManager } from '../utils/fileSystem';
import { ImageUploadManager } from '../utils/imageUpload';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import './Editor.css';

interface EditorProps {
  className?: string;
}

// 保存内容到文件系统
async function saveToStorage(filePath: string, content: Block[]) {
  try {
    await FileSystemManager.saveNote(filePath, content);
  } catch (error) {
    console.error('Failed to save note to file system:', error);
  }
}

// 从文件系统加载内容
async function loadFromStorage(filePath: string) {
  try {
    const response = await fetch(`http://localhost:3001/api/notes/${encodeURIComponent(filePath)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('从服务器接收到的原始数据:', JSON.stringify(data, null, 2));
    
    // 验证 content 字段
    if (data.content) {
      console.log('服务器返回的内容块数量:', data.content.length);
      console.log('服务器返回的内容块类型统计:');
      const typeCounts: Record<string, number> = {};
      data.content.forEach((block: any) => {
        const type = block.type || 'undefined';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
        // 检查 content 字段
        if (block.content) {
          console.log(`  ${type} 块 content 字段:`, Array.isArray(block.content) ? `数组，长度 ${block.content.length}` : typeof block.content);
        } else {
          console.log(`  ${type} 块缺少 content 字段`);
        }
      });
      console.log('类型统计:', typeCounts);
    }
    
    return data.content as PartialBlock[];
  } catch (error) {
    console.error('从文件系统加载内容失败:', error);
    return [];
  }
}

export function Editor({ className }: EditorProps) {
  const { state, dispatch } = useApp();
  
  const selectedNote = state.selectedNoteId ? state.notes[state.selectedNoteId] : null;
  
  // 存储初始内容的状态
  const [initialContent, setInitialContent] = useState<PartialBlock[] | undefined | "loading">("loading");
  
  // 防抖定时器引用
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // 编辑器实例状态
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  
  // 保存状态
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // 是否启用自动保存
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // 加载内容的副作用
  useEffect(() => {
    // 重置初始内容状态
    setInitialContent("loading");
    setEditor(null);
    
    // 只处理非文件夹的笔记
    if (!selectedNote || selectedNote.isFolder) {
      setInitialContent(undefined);
      return;
    }
    
    // 如果笔记有文件路径，则从文件系统加载内容
    if (selectedNote.filePath) {
      loadFromStorage(selectedNote.filePath)
        .then((content) => {
          console.log('从后端接收到的内容:', JSON.stringify(content, null, 2));
          setInitialContent(content || []);
          
          // 同时更新本地状态
          if (content && content.length > 0) {
            dispatch({
              type: 'UPDATE_NOTE',
              payload: {
                id: selectedNote.id,
                updates: {
                  content,
                },
              },
            });
          }
        })
        .catch((error) => {
          console.error('加载笔记内容失败:', error);
          setInitialContent([]);
        });
    } else if (selectedNote.content) {
      // 如果没有文件路径但有本地内容，则使用本地内容
      setInitialContent(selectedNote.content as PartialBlock[]);
    } else {
      // 如果既没有文件路径也没有本地内容，则设置为空数组
      setInitialContent([]);
    }
  }, [selectedNote?.id, selectedNote?.filePath, dispatch]); // 只有当selectedNote的id或filePath变化时才重新加载
  
  // 当内容加载完成后再创建编辑器
  useEffect(() => {
    // 只有当内容加载完成后再创建编辑器
    if (initialContent === "loading" || initialContent === undefined) {
      return;
    }
    
    // 定义图片上传函数
    const uploadFile = async (file: File): Promise<string> => {
      try {
        // 使用我们自定义的图片上传管理器
        const imageUrl = await ImageUploadManager.uploadImage(file, selectedNote?.filePath || '');
        console.log('图片上传成功，URL:', imageUrl);
        return imageUrl;
      } catch (error) {
        console.error('图片上传失败:', error);
        throw error;
      }
    };
    
    // 创建编辑器实例（不设置初始内容）
    const newEditor = BlockNoteEditor.create({
      schema: BlockNoteSchema.create({
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
            createHighlighter: () =>
              createHighlighter({
                themes: ['dark-plus', 'light-plus'],
                langs: [],
              }),
          }),
        },
      }),
      // 添加图片上传功能
      uploadFile: uploadFile
    });
    
    setEditor(newEditor);
    
    // 如果有初始内容，则替换编辑器内容
    if (initialContent && initialContent.length > 0) {
      // 打印调试信息
      console.log('准备替换编辑器内容，初始内容块数量:', initialContent.length);
      console.log('初始内容详情:', JSON.stringify(initialContent.slice(0, 3), null, 2)); // 只显示前3个块以避免日志过长
      
      // 使用更安全的方式等待编辑器完全初始化
      const replaceContent = () => {
        try {
          // 确保编辑器已准备好
          if (newEditor && newEditor.document) {
            console.log('执行内容替换操作');
            console.log('替换前编辑器文档块数:', newEditor.document.length);
            
            // 验证要替换的内容
            console.log('要替换的内容块数:', initialContent.length);
            initialContent.forEach((block, index) => {
              console.log(`  块 ${index}: ${block.type}`, block.content ? `有content字段` : '无content字段');
            });
            
            // 确保内容格式正确并转换为正确的类型
            const validContent = initialContent.map(block => {
              // 确保每个块都有 content 字段
              if (!block.content) {
                return {
                  ...block,
                  content: []
                } as PartialBlock;
              }
              return block as PartialBlock;
            });
            
            newEditor.replaceBlocks(newEditor.document, validContent);
            console.log('内容替换完成，当前文档块数:', newEditor.document.length);
            
            // 验证替换后的内容
            setTimeout(() => {
              console.log('验证后编辑器内容块数量:', newEditor.document.length);
              if (newEditor.document.length > 0) {
                console.log('第一个块类型:', newEditor.document[0].type);
              }
            }, 100);
          } else {
            console.warn('编辑器尚未准备好，稍后重试');
            setTimeout(replaceContent, 50);
          }
        } catch (error) {
          console.error('Failed to replace editor content:', error);
        }
      };
      
      // 增加延迟确保编辑器完全初始化
      setTimeout(replaceContent, 300);
    }
    
    // 清理函数
    return () => {
      try {
        // 尝试销毁编辑器
        // 注意：不是所有版本的BlockNote都有destroy方法
        if (newEditor && typeof (newEditor as any).destroy === 'function') {
          (newEditor as any).destroy();
        }
      } catch (error) {
        console.warn('Failed to destroy editor:', error);
      }
    };
  }, [initialContent, selectedNote?.filePath]);
  
  // 处理内容变化
  const handleContentChange = useCallback(() => {
    if (!editor || !selectedNote || selectedNote.isFolder) return;
    
    // 如果启用了自动保存，则执行自动保存逻辑
    if (autoSaveEnabled) {
      // 清除之前的防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // 设置新的防抖定时器
      debounceTimerRef.current = setTimeout(() => {
        saveContent();
      }, 1000);
    }
  }, [editor, selectedNote, autoSaveEnabled]);
  
  // 保存内容的函数
  const saveContent = useCallback(async () => {
    if (!editor || !selectedNote || selectedNote.isFolder) return;
    
    setIsSaving(true);
    try {
      const content = editor.document;
      
      // 如果笔记有文件路径，则保存到文件系统
      if (selectedNote.filePath) {
        await saveToStorage(selectedNote.filePath, content);
      }
      
      // 更新本地状态
      dispatch({
        type: 'UPDATE_NOTE',
        payload: {
          id: selectedNote.id,
          updates: {
            content,
            updatedAt: new Date() // 更新时间戳
          },
        },
      });
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('保存笔记失败:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editor, selectedNote, dispatch]);
  
  // 处理Ctrl+S保存事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveContent();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [saveContent]);
  
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

  // 如果内容还在加载中，显示加载状态
  if (initialContent === "loading") {
    return (
      <div className={`editor ${className || ''}`}>
        <div className="editor-placeholder">
          <div className="placeholder-content">
            <h2>正在加载笔记内容...</h2>
          </div>
        </div>
      </div>
    );
  }

  // 如果编辑器还没创建完成，显示加载状态
  if (!editor) {
    return (
      <div className={`editor ${className || ''}`}>
        <div className="editor-placeholder">
          <div className="placeholder-content">
            <h2>正在初始化编辑器...</h2>
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
              <button 
                className="save-button"
                onClick={saveContent}
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
              <label className="auto-save-toggle">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                />
                自动保存
              </label>
              {lastSaved && (
                <span className="note-date">
                  更新于: {lastSaved.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="editor-content">
            <BlockNoteView
              editor={editor}
              onChange={handleContentChange}
              theme="light"
            />
          </div>
        </>
      )}
    </div>
  );
}
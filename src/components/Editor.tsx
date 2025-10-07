import React, { useEffect, useCallback, useState } from 'react';
import {
  type Block
} from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { unifiedSchema } from '../shared/schema';
import { useApp } from '../context/AppContext';
import { useEditor } from '../context/EditorContext';
import { FileSystemManager } from '../utils/fileSystem';
import { ImageUploadManager } from '../utils/imageUpload';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import './Editor.css';

// 验证和清理块的函数
function sanitizeBlocks(blocks: Block[]): Block[] {
  return blocks.filter(block => {
    // 确保块有必要的属性
    if (!block.id || !block.type) {
      console.warn('跳过无效的块:', block);
      return false;
    }

    // 确保有children属性
    if (!Array.isArray(block.children)) {
      block.children = [];
    }

    // 验证特定类型的块
    switch (block.type) {
      case 'table':
        // 表格块需要特殊验证
        if (!block.content || !block.content.rows || !Array.isArray(block.content.rows)) {
          console.warn('跳过无效的表格块:', block);
          return false;
        }
        break;
      case 'paragraph':
      case 'heading':
      case 'codeBlock':
      case 'bulletListItem':
      case 'numberedListItem':
      case 'blockquote':
        // 这些块应该有content数组
        if (!Array.isArray(block.content)) {
          block.content = [];
        }
        break;
      case 'image':
      case 'horizontalRule':
        // 这些块可以没有content或content为空数组
        if (!block.content) {
          block.content = [];
        }
        break;
    }

    // 确保有props对象
    if (!block.props || typeof block.props !== 'object') {
      block.props = {};
    }

    // 确保所有块都有必要的默认props
    if (block.type !== 'image' && block.type !== 'horizontalRule' && block.type !== 'codeBlock') {
      if (!block.props.backgroundColor) block.props.backgroundColor = 'default';
      if (!block.props.textColor) block.props.textColor = 'default';
      if (!block.props.textAlignment) block.props.textAlignment = 'left';
    }

    return true;
  });
}

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
    return {
      content: data.content as Block[],
      lastModified: data.lastModified ? new Date(data.lastModified) : null
    };
  } catch (error) {
    console.error('从文件系统加载内容失败:', error);
    return { content: [], lastModified: null };
  }
}

export const Editor = React.memo(function Editor({ className }: EditorProps) {
  const { state, dispatch } = useApp();
  const { setEditor } = useEditor();
  
  const selectedNote = state.selectedNoteId ? state.notes[state.selectedNoteId] : null;
  
  // 存储初始内容的状态
  const [initialContent, setInitialContent] = useState<Block[] | undefined | "loading">("loading");
  
  // 防抖定时器引用
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // 跟踪是否正在加载内容，防止加载时触发保存
  const isLoadingContentRef = React.useRef<boolean>(false);

  // 保存状态
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // 启用自动保存功能
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // 使用 useCreateBlockNote 创建编辑器实例，传递 initialContent
  const editor = useCreateBlockNote({
    schema: unifiedSchema,
    uploadFile: async (file: File): Promise<string> => {
      try {
        // 使用我们自定义的图片上传管理器
        const imageUrl = await ImageUploadManager.uploadImage(file);
        return imageUrl;
      } catch (error) {
        console.error('图片上传失败:', error);
        throw error;
      }
    },
    initialContent: undefined
  });
  
  // 设置编辑器实例到上下文
  useEffect(() => {
    setEditor(editor);
    return () => {
      setEditor(null);
    };
  }, [editor, setEditor]);

  // 加载内容的副作用
  useEffect(() => {
    // 重置初始内容状态为loading
    setInitialContent("loading");
    
    // 只处理非文件夹的笔记
    if (!selectedNote || selectedNote.isFolder) {
      setInitialContent(undefined);
      return;
    }
    
    // 如果笔记有文件路径，则从文件系统加载内容
    if (selectedNote.filePath) {
      loadFromStorage(selectedNote.filePath)
        .then((data) => {
          setInitialContent(data.content || []);
          // 使用文件的实际修改时间初始化lastSaved
          if (data.lastModified) {
            setLastSaved(data.lastModified);
          }
        })
        .catch((error) => {
          console.error('加载笔记内容失败:', error);
          setInitialContent([]);
        });
    } else if (selectedNote.content) {
      // 如果没有文件路径但有本地内容，则使用本地内容
      setInitialContent(selectedNote.content as Block[]);
      // 使用笔记的updatedAt初始化lastSaved
      if (selectedNote.updatedAt) {
        setLastSaved(new Date(selectedNote.updatedAt));
      }
    } else {
      // 如果既没有文件路径也没有本地内容，则设置为空数组
      setInitialContent([]);
    }
  }, [selectedNote?.id, selectedNote?.filePath, selectedNote?.content]); // 包含所有实际使用的依赖
  
  // 当 initialContent 加载完成并且编辑器准备好后，更新编辑器内容
  useEffect(() => {
    if (initialContent === "loading" || !editor) {
      return;
    }

    // 确保 initialContent 是有效的数组
    const validInitialContent = Array.isArray(initialContent) && initialContent.length > 0
      ? sanitizeBlocks(initialContent) // 清理和验证块
      : [];

    // 调试日志
    console.log('尝试加载的内容:', validInitialContent);
    console.log('编辑器当前文档:', editor.document);

    // 只有当编辑器内容为空时才替换内容，避免在已有内容时覆盖
    if (validInitialContent.length > 0) {
      // 设置加载标志，防止触发保存
      isLoadingContentRef.current = true;
      try {
        // 检查编辑器是否已经有内容
        const hasExistingContent = editor.document && editor.document.length > 0;

        if (hasExistingContent) {
          console.log('编辑器已有内容，使用insertBlocks添加新内容');
          // 获取最后一个块作为参考点
          const lastBlock = editor.document[editor.document.length - 1];

          // 逐个插入块
          for (const block of validInitialContent) {
            try {
              editor.insertBlocks([block], lastBlock.id, "after");
            } catch (blockError) {
              console.error('插入块时发生错误:', blockError, block);
            }
          }
        } else {
          console.log('编辑器为空，使用replaceBlocks设置内容');
          editor.replaceBlocks(editor.document, validInitialContent);
        }
      } catch (error) {
        console.error('设置内容时发生错误:', error);
        // 备用方案：尝试使用transact
        try {
          editor.transact((tr) => {
            console.log('尝试使用transaction设置内容');
            // 这里可以添加更底层的操作
          });
        } catch (transactError) {
          console.error('transaction也失败:', transactError);
        }
      }
      // 在下一个事件循环中清除标志，确保replaceBlocks完成后再允许处理变化事件
      setTimeout(() => {
        isLoadingContentRef.current = false;
      }, 0);
    }
  }, [initialContent, editor, selectedNote?.id]);
  
  // 处理内容变化
  const handleContentChange = useCallback(() => {
    if (!editor || !selectedNote || selectedNote.isFolder) return;

    // 如果正在加载内容，不处理内容变化事件
    if (isLoadingContentRef.current) return;

    // 获取当前编辑器内容
    const currentContent = editor.document;

    // 检查内容是否真正发生变化（只比较当前选中笔记的内容）
    const previousContent = selectedNote.content || [];
    const hasContentChanged = JSON.stringify(previousContent) !== JSON.stringify(currentContent);

    // 只有当内容真正发生变化时才更新状态
    if (hasContentChanged) {
      // 直接更新本地状态
      dispatch({
        type: 'UPDATE_NOTE',
        payload: {
          id: selectedNote.id,
          updates: {
            content: currentContent,
            updatedAt: new Date() // 更新时间戳
          },
        },
      });
    }

    // 如果启用了自动保存，则执行自动保存逻辑
    if (autoSaveEnabled && hasContentChanged) {
      // 清除之前的防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 设置新的防抖定时器
      debounceTimerRef.current = setTimeout(() => {
        saveContent();
      }, 1000);
    }
  }, [editor, selectedNote?.id, selectedNote?.content, autoSaveEnabled, dispatch]);
  
  // 保存内容的函数
  const saveContent = useCallback(async () => {
    if (!editor || !selectedNote || selectedNote.isFolder) return;
    
    setIsSaving(true);
    try {
      const content = editor.document;
      
      // 检查内容是否真正发生变化（只比较当前选中笔记的内容）
      const previousContent = selectedNote.content || [];
      const hasContentChanged = JSON.stringify(previousContent) !== JSON.stringify(content);
      
      // 如果笔记有文件路径，则保存到文件系统
      if (selectedNote.filePath) {
        await saveToStorage(selectedNote.filePath, content);
      }
      
      // 只有当内容真正发生变化时才更新本地状态
      if (hasContentChanged) {
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
      }
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
    
    const newTitle = e.target.value;
    
    // 只更新本地状态（立即更新UI，但不执行任何文件操作）
    dispatch({
      type: 'UPDATE_NOTE',
      payload: {
        id: selectedNote.id,
        updates: {
          title: newTitle,
          // 不更新时间戳，避免触发自动保存
        },
      },
    });
  }, [selectedNote, dispatch]);
  
  // 新增处理标题失去焦点的函数
  const handleTitleBlur = useCallback(() => {
    if (!selectedNote) return;
    
    // 当用户点击其他地方时，执行重命名操作
    dispatch({
      type: 'RENAME_NOTE',
      payload: {
        id: selectedNote.id,
        newTitle: selectedNote.title
      },
    });
  }, [selectedNote, dispatch]);
  
  if (!selectedNote) {
    return (
      <div className={`editor ${className || ''}`}>
        <div className="editor-placeholder">
          <div className="placeholder-content">
            <h2>欢迎使用 Logora</h2>
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

  return (
    <div className={`editor ${className || ''}`}>
      {selectedNote && !selectedNote.isFolder && (
        <>
          <div className="editor-header">
            <input
              type="text"
              value={selectedNote.title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              className="note-title"
              placeholder="未命名笔记"
            />
            <div className="note-info">
              <div className="note-info-left">
                {lastSaved && (
                  <span className="note-date">
                    更新于: {lastSaved.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="note-info-right">
                <label className="auto-save-toggle">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  />
                  自动保存
                </label>
                <button 
                  className="save-button"
                  onClick={saveContent}
                  disabled={isSaving}
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="editor-content">
            <BlockNoteView
              editor={editor}
              onChange={handleContentChange}
            />
          </div>
        </>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，只有当 className 发生变化时才重新渲染
  return prevProps.className === nextProps.className;
});

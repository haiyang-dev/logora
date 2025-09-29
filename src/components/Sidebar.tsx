import React, { useState, useCallback, useMemo } from 'react';
import type { NoteTreeItem } from '../types';
import { useApp } from '../context/AppContext';
import { FileSystemManager } from '../utils/fileSystem';
import { ExportManager } from '../utils/exportMarkdown';
import { ImportManager } from '../utils/importMarkdown';

interface TreeNode {
  id: string;
  title: string;
  isFolder: boolean;
  children: TreeNode[];
}

interface SidebarProps {
  className?: string;
  editor?: any;
}

export const Sidebar = React.memo(function Sidebar({ editor }: SidebarProps) {
  const { state, dispatch } = useApp();
  console.log('Sidebar中的state:', state);
  
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createType, setCreateType] = useState<'note' | 'folder'>('note');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    noteId?: string;
    isFolder?: boolean;
    isEmptyArea?: boolean;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentParentId, setCurrentParentId] = useState<string | undefined>(undefined);
  const [moveMode, setMoveMode] = useState<{
    sourceNoteId: string;
    sourceTitle: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    noteId: string;
    title: string;
    isFolder: boolean;
  } | null>(null);
  const [renameMode, setRenameMode] = useState<{
    noteId: string;
    title: string;
    isFolder: boolean;
  } | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // 构建树形结构 - 修复父子关系匹配逻辑
  const tree = useMemo(() => {
    // console.log('构建树形结构，notes:', state.notes);
    const buildTree = (parentId: string | null = null): TreeNode[] => {
      // 修复：正确过滤根节点（parentId为null或undefined的节点）
      let notes = Object.values(state.notes).filter(note => {
        // 对于根节点，parentId应该是null或undefined
        if (parentId === null) {
          return (note.parentId === null || note.parentId === undefined);
        }
        // 对于其他节点，直接匹配parentId
        return note.parentId === parentId;
      });
      
      // 对节点按标题进行排序，文件夹优先，然后按字母顺序
      notes.sort((a, b) => {
        // 文件夹优先
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        // 相同类型按标题排序
        return a.title.localeCompare(b.title);
      });
      
      // console.log(`构建parentId=${parentId}的节点，找到${notes.length}个笔记`);
      return notes.map(note => ({
        id: note.id,
        title: note.title,
        isFolder: note.isFolder,
        children: note.isFolder ? buildTree(note.id) : [], // 只有文件夹才递归构建子节点
      }));
    };
    const result = buildTree(null);
    // console.log('构建完成的树:', result);
    return result;
  }, [state.notes]);

  // 将 TreeNode 转换为 NoteTreeItem（添加 level 信息）
  const treeItems = useMemo(() => {
    const convertToTreeItem = (nodes: TreeNode[], level: number = 0): NoteTreeItem[] => {
      return nodes.map(node => {
        const note = state.notes[node.id];
        return {
          id: node.id,
          title: node.title,
          isFolder: node.isFolder,
          parentId: note?.parentId,
          level,
          isExpanded: state.expandedFolders.has(node.id),
          filePath: note?.filePath,
          children: node.children ? convertToTreeItem(node.children, level + 1) : undefined
        };
      });
    };
    const items = convertToTreeItem(tree);
    // console.log('生成的treeItems:', items);
    return items;
  }, [tree, state.notes, state.expandedFolders]);

  // 处理创建新项目
  const handleCreateNote = useCallback((type: 'note' | 'folder', parentId?: string) => {
    if (type === 'folder') {
      dispatch({
        type: 'ADD_FOLDER',
        payload: {
          title: '新文件夹',
          parentId,
        },
      });
    } else {
      dispatch({
        type: 'ADD_NOTE',
        payload: {
          title: '未命名笔记',
          isFolder: false,
          parentId,
        },
      });
    }
  }, [dispatch]);

  // 处理选择笔记 - 优化性能
  const handleSelectNote = useCallback((noteId: string, e: React.MouseEvent) => {
    try {
      const note = state.notes[noteId];
      if (!note) {
        console.warn('Note not found:', noteId);
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      if (note.isFolder) {
        dispatch({ type: 'TOGGLE_FOLDER', payload: noteId });
      } else {
        dispatch({ type: 'SELECT_NOTE', payload: noteId });
      }
    } catch (error) {
      console.error('Error in handleSelectNote:', error);
    }
  }, [state.notes, dispatch]);

  // 处理右键菜单
  const handleRightClick = useCallback((e: React.MouseEvent, noteId?: string) => {
    e.preventDefault();
    const note = noteId ? state.notes[noteId] : null;
    console.log('handleRightClick called with noteId:', noteId, 'note:', note);
    
    // 如果点击的是文件或文件夹，选中它
    if (noteId && note) {
      dispatch({ type: 'SELECT_NOTE', payload: noteId });
    }
    
    const contextMenuObj = {
      x: e.clientX,
      y: e.clientY,
      noteId,
      isFolder: note?.isFolder || false,
      isEmptyArea: !noteId,
    };
    console.log('Setting contextMenu:', contextMenuObj);
    setContextMenu(contextMenuObj);
  }, [state.notes, dispatch]);

  // 处理删除笔记
  const handleDeleteNote = useCallback((noteId: string) => {
    dispatch({ type: 'DELETE_NOTE', payload: noteId });
    setContextMenu(null);
  }, [dispatch]);

  // 处理创建新项目到指定文件夹
  const handleCreateInFolder = useCallback((parentId?: string, type: 'note' | 'folder' = 'note') => {
    setCreateType(type);
    setCurrentParentId(parentId);
    setIsCreating(true);
    setContextMenu(null);
  }, [state.notes]);

  // 处理创建带有自定义标题的笔记
  const handleCreateNoteWithCustomTitle = useCallback((type: 'note' | 'folder', title: string, parentId?: string) => {
    if (type === 'folder') {
      dispatch({
        type: 'ADD_FOLDER',
        payload: {
          title: title.trim() || '新文件夹',
          parentId,
        },
      });
    } else {
      dispatch({
        type: 'ADD_NOTE',
        payload: {
          title: title.trim() || '未命名笔记',
          isFolder: false,
          parentId,
        },
      });
    }
  }, [dispatch]);

  // 处理移动笔记
  const handleMoveNote = useCallback((noteId: string) => {
    console.log('handleMoveNote called with noteId:', noteId);
    const note = state.notes[noteId];
    console.log('note:', note);
    if (note) {
      setMoveMode({
        sourceNoteId: noteId,
        sourceTitle: note.title
      });
      setContextMenu(null);
    }
  }, [state.notes]);

  // 处理移动到目标文件夹
  const handleMoveToFolder = useCallback(async (targetFolderId?: string) => {
    console.log('handleMoveToFolder called with targetFolderId:', targetFolderId);
    console.log('moveMode:', moveMode);
    if (moveMode) {
      // 获取源笔记
      const sourceNote = state.notes[moveMode.sourceNoteId];
      console.log('sourceNote:', sourceNote);
      if (!sourceNote || !sourceNote.filePath) {
        console.error('Source note not found or has no file path');
        setMoveMode(null);
        return;
      }

      // 计算新的文件路径
      let newFilePath = sourceNote.filePath;
      console.log('Old file path:', sourceNote.filePath);
      if (targetFolderId) {
        // 移动到目标文件夹
        const targetFolder = state.notes[targetFolderId];
        console.log('targetFolder:', targetFolder);
        if (targetFolder && targetFolder.filePath) {
          const fileName = sourceNote.filePath.split('/').pop();
          newFilePath = `${targetFolder.filePath}/${fileName}`;
          console.log('Computed new file path:', newFilePath);
        } else {
          console.log('Target folder not found or has no filePath');
        }
      } else {
        // 移动到根目录
        const fileName = sourceNote.filePath.split('/').pop();
        newFilePath = fileName || sourceNote.filePath;
        console.log('Moving to root, new file path:', newFilePath);
      }
      console.log('New file path:', newFilePath);

      try {
        // 如果文件路径发生变化，需要在文件系统中移动文件
        if (sourceNote.filePath !== newFilePath) {
          console.log('Calling FileSystemManager.renameNote with:', sourceNote.filePath, newFilePath);
          await FileSystemManager.renameNote(sourceNote.filePath, newFilePath);
          console.log('FileSystemManager.renameNote completed successfully');
        } else {
          console.log('File path unchanged, skipping file system update');
        }

        // 更新前端状态
        console.log('Updating frontend state');
        dispatch({
          type: 'UPDATE_NOTE',
          payload: {
            id: moveMode.sourceNoteId,
            updates: {
              parentId: targetFolderId || undefined,
              filePath: newFilePath
            }
          }
        });
        console.log('Frontend state updated');
      } catch (error) {
        console.error('Failed to move note:', error);
        alert('移动笔记失败: ' + (error as Error).message);
      }
      
      setMoveMode(null);
    }
  }, [moveMode, state.notes, dispatch]);

  // 取消移动模式
  const cancelMoveMode = useCallback(() => {
    setMoveMode(null);
  }, []);

  // 获取文件路径显示
  const getFilePathDisplay = useCallback((filePath: string) => {
    if (!filePath) return '';
    // 处理 Windows 和 Unix 路径分隔符
    const pathParts = filePath.replace(/\\/g, '/').split('/');
    if (pathParts.length > 1) {
      // 显示完整的路径（包括文件名）
      return pathParts.join(' > ');
    }
    return filePath || '根目录';
  }, []);

  // 处理重命名笔记
  const handleRenameNote = useCallback((noteId: string, newTitle: string) => {
    dispatch({ type: 'RENAME_NOTE', payload: { id: noteId, newTitle } });
    setRenameMode(null);
    setContextMenu(null);
  }, [dispatch]);

  // 处理搜索结果点击
  const handleSearchResultClick = useCallback((searchResult: any) => {
    // 找到对应的笔记
    const note = Object.values(state.notes).find(n => n.filePath === searchResult.filePath);
    if (note) {
      // 使用新的 action 来同时处理选择和展开路径
      dispatch({ type: 'SELECT_NOTE_AND_EXPAND_PATH', payload: note.id });
      
      // 清除搜索结果
      setSearchQuery('');
      dispatch({ type: 'CLEAR_SEARCH_RESULTS' });
    }
  }, [state.notes, dispatch]);

  // 处理搜索
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      dispatch({ type: 'CLEAR_SEARCH_RESULTS' });
      return;
    }
    
    try {
      const searchResults = await FileSystemManager.searchNotes(searchQuery);

      dispatch({ type: 'SET_SEARCH_RESULTS', payload: searchResults });
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [searchQuery, dispatch]);

  // 处理导出功能
  const handleExportNote = useCallback(async () => {
    // 根据需求，移除单个笔记导出功能
    alert('单个笔记导出功能已移除。请使用"导出所有笔记"功能将所有笔记导出到指定文件夹。');
  }, []);

  // 渲染树形项目 - 优化性能
  const renderTreeItem = useCallback((item: NoteTreeItem): React.ReactElement => {
    const isSelected = state.selectedNoteId === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isInMoveMode = moveMode?.sourceNoteId === item.id;
    
    return (
      <div key={item.id}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            paddingLeft: `${item.level * 16 + 12}px`,
            paddingRight: '12px',
            paddingTop: '8px',
            paddingBottom: '8px',
            fontSize: '14px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: isSelected ? '#dbeafe' : 
                           (isInMoveMode ? '#fef3c7' : 'transparent'),
            color: isSelected ? '#1e40af' : 
                  (isInMoveMode ? '#92400e' : '#374151'),
            borderTop: isInMoveMode ? '1px dashed #f59e0b' : 'none',
            borderRight: isSelected ? '2px solid #3b82f6' : (isInMoveMode ? '1px dashed #f59e0b' : 'none'),
            borderBottom: isInMoveMode ? '1px dashed #f59e0b' : 'none',
            borderLeft: isInMoveMode ? '1px dashed #f59e0b' : 'none',
          }}
          onClick={(e) => {
            e.stopPropagation();
            try {
              handleSelectNote(item.id, e);
            } catch (error) {
              console.error('Error selecting note:', error);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRightClick(e, item.id);
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              const target = e.currentTarget as HTMLDivElement;
              target.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              const target = e.currentTarget as HTMLDivElement;
              target.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', flex: 1}}>
            {item.isFolder && (
              <svg
                style={{
                  width: '12px',
                  height: '12px',
                  color: '#9ca3af',
                  transform: item.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            
            {/* 文件/文件夹图标 */}
            {item.isFolder ? (
              <svg style={{width: '16px', height: '16px', color: '#3b82f6'}} fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            ) : (
              <svg style={{width: '16px', height: '16px', color: '#6b7280'}} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            )}
            
            <span style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1}}>{item.title}</span>
          </div>
        </div>
        
        {item.isFolder && item.isExpanded && hasChildren && (
          <div>
            {item.children!.map(child => renderTreeItem(child))}
          </div>
        )}
      </div>
    );
  }, [state.selectedNoteId, moveMode, handleSelectNote, handleRightClick]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'white'}}>
      {/* 侧边栏头部 */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #e5e7eb'}}>
        <h2 style={{fontSize: '18px', fontWeight: '600', color: '#111827'}}>Logora</h2>
        <div style={{display: 'flex', gap: '8px'}}>
          {/* 导入Markdown笔记按钮 */}
          <button
            onClick={async () => {
              try {
                if (editor) {
                  // 传递现有的笔记列表用于检查重复
                  const existingNotes = Object.values(state.notes || {});
                  console.log('Existing notes for duplicate check:', existingNotes);
                  await ImportManager.importMarkdownNotes(dispatch, editor, existingNotes);
                } else {
                  alert('编辑器未准备好，请稍后再试');
                }
              } catch (error) {
                console.error('导入Markdown笔记失败:', error);
                alert('导入Markdown笔记失败: ' + (error as Error).message);
              }
            }}
            style={
              {
                padding: '6px 12px',
                fontSize: '14px',
                color: '#8b5cf6',
                backgroundColor: 'transparent',
                border: '1px solid #8b5cf6',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }
            }
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = '#ede9fe';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = 'transparent';
            }}
          >
            <svg style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            导入文件夹
          </button>
          
          {/* 导出所有笔记到文件夹按钮 */}
          <button
            onClick={async () => {
              try {
                if (editor) {
                  await ExportManager.exportAllNotesToFolder(state.notes, editor);
                } else {
                  alert('编辑器未准备好，请稍后再试');
                }
              } catch (error) {
                console.error('导出所有笔记失败:', error);
                alert('导出所有笔记失败: ' + (error as Error).message);
              }
            }}
            style={
              {
                padding: '6px 12px',
                fontSize: '14px',
                color: '#10b981',
                backgroundColor: 'transparent',
                border: '1px solid #10b981',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }
            }
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = '#dcfce7';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = 'transparent';
            }}
          >
            <svg style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            导出所有笔记
          </button>
        </div>
      </div>
      
      {/* 搜索框 */}
      <div style={{padding: '16px', borderBottom: '1px solid #e5e7eb'}}>
        <div style={{position: 'relative'}}>
          <input
            type="text"
            placeholder="搜索笔记..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              } else if (e.key === 'Escape') {
                setSearchQuery('');
                dispatch({ type: 'CLEAR_SEARCH_RESULTS' });
              }
            }}
            style={{
              width: '100%',
              paddingLeft: '40px',
              paddingRight: '16px',
              paddingTop: '8px',
              paddingBottom: '8px',
              fontSize: '14px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
          <svg
            style={{
              position: 'absolute',
              left: '12px',
              top: '10px',
              width: '16px',
              height: '16px',
              color: '#9ca3af'
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {/* 创建新项目表单 */}
      {isCreating && (
        <div style={{padding: '16px', backgroundColor: '#dbeafe', borderBottom: '1px solid #e5e7eb'}}>
          {currentParentId && (
            <div style={{marginBottom: '8px', fontSize: '12px', color: '#6b7280'}}>
              在文件夹 "{state.notes[currentParentId]?.title || 'Unknown'}" 中创建{createType === 'folder' ? '文件夹' : '笔记'}
            </div>
          )}
          {!currentParentId && (
            <div style={{marginBottom: '8px', fontSize: '12px', color: '#6b7280'}}>
              在根目录中创建{createType === 'folder' ? '文件夹' : '笔记'}
            </div>
          )}
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder={`新建${createType === 'folder' ? '文件夹' : '笔记'}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (newItemTitle.trim()) {
                  // 使用用户输入的标题而不是默认标题
                  handleCreateNoteWithCustomTitle(createType, newItemTitle, currentParentId);
                  setNewItemTitle('');
                  setIsCreating(false);
                  setCurrentParentId(undefined);
                }
              } else if (e.key === 'Escape') {
                setIsCreating(false);
                setNewItemTitle('');
                setCurrentParentId(undefined);
              }
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              marginBottom: '12px',
              fontSize: '14px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            autoFocus
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <button
              onClick={() => {
                if (newItemTitle.trim()) {
                  handleCreateNoteWithCustomTitle(createType, newItemTitle, currentParentId);
                  setNewItemTitle('');
                  setIsCreating(false);
                  setCurrentParentId(undefined);
                }
              }}
              style={{
                padding: '4px 12px',
                fontSize: '14px',
                color: 'white',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#3b82f6';
              }}
            >
              创建
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setCurrentParentId(undefined);
              }}
              style={{
                padding: '4px 12px',
                fontSize: '14px',
                color: '#6b7280',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = 'white';
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}
      
      {/* 文件树列表 */}
      <div 
        style={{flex: 1, overflowY: 'auto', padding: '8px'}}
        onContextMenu={(e) => {
          handleRightClick(e); // 空白区域右键，不传递noteId
        }}
        onDrop={(e) => {
          // 只处理空白区域的放置
          const target = e.target as HTMLElement;
          if (target === e.currentTarget) {

            e.preventDefault();
            // 移动到根目录的逻辑已删除
          }
        }}
        onDragOver={(e) => {
          // 为空白区域提供基本支持
          const target = e.target as HTMLElement;
          if (target === e.currentTarget) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }
        }}
      >
        {/* 移动模式显示 */}
        {moveMode && (
          <div style={{
            padding: '8px 12px',
            margin: '4px',
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#92400e'
          }}>
            正在移动: {moveMode.sourceTitle}
            <button
              onClick={cancelMoveMode}
              style={{
                marginLeft: '8px',
                padding: '2px 6px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              取消
            </button>
          </div>
        )}
        
        {/* 搜索结果显示 */}
        {state.searchResults && state.searchResults.length > 0 && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #e0f2fe',
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#0369a1',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              搜索结果 ({state.searchResults.length})
              <button
                onClick={() => {
                  setSearchQuery('');
                  dispatch({ type: 'CLEAR_SEARCH_RESULTS' });
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  color: '#6b7280',
                  backgroundColor: 'transparent',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                清除
              </button>
            </div>
            {state.searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => handleSearchResultClick(result)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: 'transparent',
                  color: '#374151',
                  marginBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLDivElement;
                  target.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLDivElement;
                  target.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', flex: 1}}>
                  {/* 根据文件扩展名判断是文件还是文件夹 */}
                  {result.filePath && !result.filePath.endsWith('.json') ? (
                    // 文件夹图标（与目录树保持一致）
                    <svg style={{width: '16px', height: '16px', color: '#3b82f6'}} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  ) : (
                    // 文件图标（与目录树保持一致）
                    <svg style={{width: '16px', height: '16px', color: '#6b7280'}} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  )}
                  <div>
                    <div style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1}}>
                      {result.fileName}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    }}>
                      {getFilePathDisplay(result.filePath)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {treeItems.map(item => renderTreeItem(item))}
      </div>
      
      {/* 右键菜单 */}
      {contextMenu && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 40
            }}
            onClick={() => setContextMenu(null)}
          />
          <div
            style={{
              position: 'fixed',
              zIndex: 50,
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              paddingTop: '4px',
              paddingBottom: '4px',
              minWidth: '160px',
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            {/* 移动模式下的特殊选项 */}
            {moveMode && (
              <>
                {/* 如果移动模式下右键文件夹 */}
                {contextMenu.isFolder && contextMenu.noteId !== moveMode.sourceNoteId && (
                  <button
                    onClick={() => {
                      console.log('Move to folder button clicked, contextMenu.noteId:', contextMenu.noteId);
                      if (contextMenu.noteId) {
                        handleMoveToFolder(contextMenu.noteId);
                        setContextMenu(null); // 关闭右键菜单
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      textAlign: 'left',
                      fontSize: '14px',
                      color: '#059669',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.backgroundColor = '#ecfdf5';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <svg style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    移动到此文件夹
                  </button>
                )}
                
                {/* 如果移动模式下右键空白区域 */}
                {contextMenu.isEmptyArea && (
                  <button
                    onClick={() => {
                      handleMoveToFolder();
                      setContextMenu(null); // 关闭右键菜单
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      textAlign: 'left',
                      fontSize: '14px',
                      color: '#059669',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.backgroundColor = '#ecfdf5';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <svg style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a1 1 0 00-1-1H6a1 1 0 01-1-1V7a1 1 0 011-1h14a1 1 0 011 1v2" />
                    </svg>
                    移动到根目录
                  </button>
                )}
                
                <div style={{height: '1px', backgroundColor: '#e5e7eb', margin: '4px 0'}} />
              </>
            )}
            
            {/* 新建笔记 */}
            <button
              onClick={() => {
                // 如果是在文件夹上右键，传递文件夹ID；否则传递undefined（根目录）
                const parentId = contextMenu.isFolder ? contextMenu.noteId : undefined;
                handleCreateInFolder(parentId, 'note');
              }}
              style={{
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                fontSize: '14px',
                color: '#374151',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = 'transparent';
              }}
            >
              <svg style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              新建笔记{contextMenu.isFolder ? `到 "${state.notes[contextMenu.noteId!]?.title}"` : ''}
            </button>
            
            {/* 新建文件夹 */}
            <button
              onClick={() => {
                // 如果是在文件夹上右键，传递文件夹ID；否则传递undefined（根目录）
                const parentId = contextMenu.isFolder ? contextMenu.noteId : undefined;
                handleCreateInFolder(parentId, 'folder');
              }}
              style={{
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                fontSize: '14px',
                color: '#374151',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = 'transparent';
              }}
            >
              <svg style={{width: '16px', height: '16px'}} fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              新建文件夹{contextMenu.isFolder ? `到 "${state.notes[contextMenu.noteId!]?.title}"` : ''}
            </button>
            
            <div style={{height: '1px', backgroundColor: '#e5e7eb', margin: '4px 0'}} />
            
            {/* 重命名按钮 */}
            <button
              onClick={() => {
                if (contextMenu.noteId) {
                  const note = state.notes[contextMenu.noteId];
                  setRenameMode({
                    noteId: contextMenu.noteId,
                    title: note?.title || '',
                    isFolder: note?.isFolder || false
                  });
                  setNewTitle(note?.title || '');
                  setContextMenu(null);
                }
              }}
              style={{
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                fontSize: '14px',
                color: contextMenu.noteId ? '#374151' : '#9ca3af',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: contextMenu.noteId ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              disabled={!contextMenu.noteId}
              onMouseEnter={(e) => {
                if (contextMenu.noteId) {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (contextMenu.noteId) {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <svg style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              重命名
            </button>
            
            {/* 移动按钮 */}
            <button
              onClick={() => {
                if (contextMenu.noteId) {
                  handleMoveNote(contextMenu.noteId);
                }
              }}
              style={{
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                fontSize: '14px',
                color: contextMenu.noteId ? '#374151' : '#9ca3af',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = 'transparent';
              }}
            >
              <svg style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              移动
            </button>
            
            {/* 删除按钮 */}
            <button
              onClick={() => {
                if (contextMenu.noteId) {
                  const note = state.notes[contextMenu.noteId];
                  setDeleteConfirm({
                    noteId: contextMenu.noteId,
                    title: note?.title || '',
                    isFolder: note?.isFolder || false
                  });
                  setContextMenu(null);
                }
              }}
              style={{
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                fontSize: '14px',
                color: contextMenu.noteId ? '#dc2626' : '#9ca3af',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = 'transparent';
              }}
            >
              <svg style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 01-1-1V7a1 1 0 011-1h14a1 1 0 011 1v2" />
              </svg>
              删除
            </button>
          </div>
        </>
      )}
      
      {/* 重命名对话框 */}
      {renameMode && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setRenameMode(null)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                minWidth: '300px',
                maxWidth: '400px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{width: '20px', height: '20px', color: '#3b82f6'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0
                  }}>
                    重命名{renameMode.isFolder ? '文件夹' : '笔记'}
                  </h3>
                </div>
              </div>
              
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (newTitle.trim() && newTitle !== renameMode.title) {
                      handleRenameNote(renameMode.noteId, newTitle.trim());
                    } else {
                      setRenameMode(null);
                    }
                  } else if (e.key === 'Escape') {
                    setRenameMode(null);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  marginBottom: '20px'
                }}
                autoFocus
                onFocus={(e) => {
                  e.target.select();
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setRenameMode(null)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = '#f3f4f6';
                  }}
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (newTitle.trim() && newTitle !== renameMode.title) {
                      handleRenameNote(renameMode.noteId, newTitle.trim());
                    } else {
                      setRenameMode(null);
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = '#3b82f6';
                  }}
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* 自定义删除确认对话框 */}
      {deleteConfirm && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                minWidth: '300px',
                maxWidth: '400px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{width: '20px', height: '20px', color: '#dc2626'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 19c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0
                  }}>确认删除</h3>
                </div>
              </div>
              
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 20px 0',
                lineHeight: '1.5'
              }}>
                确定要删除这个{deleteConfirm.isFolder ? '文件夹' : '笔记'} <strong>"{deleteConfirm.title}"</strong> 吗？此操作无法撤销。
              </p>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = '#f3f4f6';
                  }}
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    handleDeleteNote(deleteConfirm.noteId);
                    setDeleteConfirm(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: '#dc2626',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = '#dc2626';
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Sidebar 组件没有 props，所以总是返回 false 以确保组件能够重新渲染
  // 这样可以确保当 state.notes 发生变化时，组件能够正确地重新渲染
  return false;
});

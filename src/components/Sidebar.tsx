import React, { useState, useCallback } from 'react';
import type { Note, NoteTreeItem } from '../types';
import { useApp } from '../context/AppContext';
import { FileSystemManager } from '../utils/fileSystem';
import './Sidebar.css';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { state, dispatch } = useApp();
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createType, setCreateType] = useState<'note' | 'folder'>('note');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    noteId: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 构建树形结构
  const buildTree = (notes: Record<string, Note>): NoteTreeItem[] => {
    const noteList = Object.values(notes);
    const rootItems: NoteTreeItem[] = [];
    
    const buildNode = (note: Note, level: number): NoteTreeItem => {
      const children = noteList
        .filter(n => n.parentId === note.id)
        .map(n => buildNode(n, level + 1));
      
      return {
        id: note.id,
        title: note.title,
        isFolder: note.isFolder,
        parentId: note.parentId,
        children: children.length > 0 ? children : undefined,
        level,
        isExpanded: state.expandedFolders.has(note.id),
        filePath: note.filePath,
      };
    };
    
    noteList
      .filter(note => !note.parentId)
      .forEach(note => {
        rootItems.push(buildNode(note, 0));
      });
    
    return rootItems;
  };

  const treeItems = buildTree(state.notes);

  // 处理创建新项目
  const handleCreateItem = useCallback(() => {
    if (!newItemTitle.trim()) return;
    
    dispatch({
      type: 'ADD_NOTE',
      payload: {
        title: newItemTitle.trim(),
        isFolder: createType === 'folder',
      },
    });
    
    setNewItemTitle('');
    setIsCreating(false);
  }, [newItemTitle, createType, dispatch]);

  // 处理选择笔记
  const handleSelectNote = useCallback((noteId: string) => {
    const note = state.notes[noteId];
    if (note && !note.isFolder) {
      dispatch({ type: 'SELECT_NOTE', payload: noteId });
    } else if (note && note.isFolder) {
      dispatch({ type: 'TOGGLE_FOLDER', payload: noteId });
    }
  }, [state.notes, dispatch]);

  // 处理右键菜单
  const handleRightClick = useCallback((e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      noteId,
    });
  }, []);

  // 处理删除笔记
  const handleDeleteNote = useCallback((noteId: string) => {
    dispatch({ type: 'DELETE_NOTE', payload: noteId });
    setContextMenu(null);
  }, [dispatch]);

  // 处理搜索
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const searchResults = await FileSystemManager.searchNotes(searchQuery);
      // 这里可以更新UI以显示搜索结果
      console.log('Search results:', searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [searchQuery]);

  // 渲染树形项目
  const renderTreeItem = (item: NoteTreeItem) => {
    const isSelected = state.selectedNoteId === item.id;
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div key={item.id} className="tree-item-container">
        <div
          className={`tree-item ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${item.level * 20 + 8}px` }}
          onClick={() => handleSelectNote(item.id)}
          onContextMenu={(e) => handleRightClick(e, item.id)}
        >
          <div className="tree-item-content">
            {item.isFolder && (
              <span className={`folder-icon ${item.isExpanded ? 'expanded' : ''}`}>
                ▶
              </span>
            )}
            <span className="item-icon">
              {item.isFolder ? '📁' : '📄'}
            </span>
            <span className="item-title">{item.title}</span>
          </div>
        </div>
        
        {item.isFolder && item.isExpanded && hasChildren && (
          <div className="tree-children">
            {item.children!.map(child => renderTreeItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`sidebar ${className || ''}`}>
      <div className="sidebar-header">
        <h2>笔记</h2>
        <div className="sidebar-actions">
          <button
            className="action-btn"
            onClick={() => {
              setCreateType('note');
              setIsCreating(true);
            }}
            title="新建笔记"
          >
            📄
          </button>
          <button
            className="action-btn"
            onClick={() => {
              setCreateType('folder');
              setIsCreating(true);
            }}
            title="新建文件夹"
          >
            📁
          </button>
        </div>
      </div>
      
      {/* 搜索框 */}
      <div className="search-container">
        <input
          type="text"
          placeholder="搜索笔记..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button onClick={handleSearch}>搜索</button>
      </div>
      
      {isCreating && (
        <div className="create-item">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder={`新建${createType === 'folder' ? '文件夹' : '笔记'}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateItem();
              } else if (e.key === 'Escape') {
                setIsCreating(false);
                setNewItemTitle('');
              }
            }}
            autoFocus
          />
          <div className="create-actions">
            <button onClick={handleCreateItem}>确认</button>
            <button onClick={() => setIsCreating(false)}>取消</button>
          </div>
        </div>
      )}
      
      <div className="tree-container">
        {treeItems.map(item => renderTreeItem(item))}
      </div>
      
      {contextMenu && (
        <>
          <div
            className="context-menu-overlay"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="context-menu"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            <button onClick={() => handleDeleteNote(contextMenu.noteId)}>
              删除
            </button>
          </div>
        </>
      )}
    </div>
  );
}
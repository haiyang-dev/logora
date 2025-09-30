import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Note, AppState, SearchResult } from '../types';
import { FileSystemManager } from '../utils/fileSystem';

// 动作类型
type AppAction = 
  | { type: 'SELECT_NOTE'; payload: string }
  | { type: 'ADD_NOTE'; payload: { parentId?: string; title: string; isFolder: boolean } }
  | { type: 'ADD_FOLDER'; payload: { parentId?: string; title: string } }
  | { type: 'ADD_NOTE_WITH_FILE'; payload: { parentId?: string; title: string; isFolder: boolean; filePath: string; content?: any } }
  | { type: 'UPDATE_NOTE'; payload: { id: string; updates: Partial<Note> } }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'TOGGLE_FOLDER'; payload: string }
  | { type: 'EXPAND_FOLDERS'; payload: string[] }
  | { type: 'SELECT_NOTE_AND_EXPAND_PATH'; payload: string }
  | { type: 'LOAD_NOTES'; payload: Record<string, Note> }
  | { type: 'LOAD_FILE_SYSTEM_NOTES'; payload: any[] }
  | { type: 'SET_SEARCH_RESULTS'; payload: SearchResult[] }
  | { type: 'CLEAR_SEARCH_RESULTS' }
  | { type: 'RENAME_NOTE'; payload: { id: string; newTitle: string } }
  | { type: 'FORCE_UPDATE' } // 添加强制更新操作
  | { type: 'SELECT_NOTE_AND_EXPAND_BY_PATH'; payload: string } // 新增动作：通过路径选择并展开笔记

// 初始状态
const initialState: AppState = {
  notes: {},
  selectedNoteId: null,
  expandedFolders: new Set(),
  searchResults: [],
  searchQuery: '',
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_NOTE':
      return {
        ...state,
        selectedNoteId: action.payload,
      };
    
    case 'ADD_NOTE': {
      const id = uuidv4();
      const now = new Date();
      
      // 生成文件路径（仅对非文件夹）
      let filePath: string | undefined;
      if (!action.payload.isFolder) {
        // 获取父级路径
        let parentPath = '';
        if (action.payload.parentId) {
          const parentNote = state.notes[action.payload.parentId];
          if (parentNote && parentNote.filePath) {
            // 如果父级是文件夹，使用其路径作为目录
            if (parentNote.isFolder) {
              parentPath = parentNote.filePath;
            } else {
              // 如果父级是文件，使用其目录
              const pathParts = parentNote.filePath.split('/');
              pathParts.pop(); // 移除文件名
              parentPath = pathParts.join('/');
            }
          }
        }
        
        // 使用自定义标题生成文件路径
        const fileName = `${action.payload.title}.json`;
        filePath = parentPath ? `${parentPath}/${fileName}` : fileName;
      }
      
      const newNote: Note = {
        id,
        title: action.payload.title, // 使用自定义标题
        content: action.payload.isFolder ? null : [
          {
            type: 'heading',
            props: { level: 1 },
            content: [{ type: 'text', text: action.payload.title }] // 标题块也使用自定义标题
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '' }]
          }
        ],
        parentId: action.payload.parentId,
        children: action.payload.isFolder ? [] : undefined,
        createdAt: now,
        updatedAt: now,
        isFolder: action.payload.isFolder,
        filePath: filePath
      };
      
      // 只有非文件夹笔记才创建文件
      if (!action.payload.isFolder && filePath) {
        // 异步创建文件（不等待结果）
        FileSystemManager.createNote(filePath, action.payload.title, [
          {
            type: 'heading',
            props: { level: 1 },
            content: [{ type: 'text', text: action.payload.title }]
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '' }]
          }
        ]).catch(error => {
          console.error('Failed to create file for new note:', error);
        });
      }
      
      return {
        ...state,
        notes: {
          ...state.notes,
          [id]: newNote,
        },
        selectedNoteId: action.payload.isFolder ? state.selectedNoteId : id,
      };
    }
    
    case 'ADD_FOLDER': {
      const id = uuidv4();
      const now = new Date();

      // 确定父级文件夹ID
      let parentId: string | undefined = action.payload.parentId; // 优先使用显式指定的parentId

      // 如果没有显式指定parentId，尝试从文件夹名称中推断
      if (!parentId && action.payload.title) {
        const pathParts = action.payload.title.replace(/\\/g, '/').split('/');
        // 只有当路径包含多级时才尝试查找父级
        if (pathParts.length > 1) {
          // 这是一个嵌套路径，需要找到父级文件夹
          pathParts.pop(); // 移除当前文件夹名
          const parentPath = pathParts.join('/');

          // 查找匹配的父级文件夹
          const parentFolder = Object.values(state.notes).find(note => 
            note.isFolder && note.filePath === parentPath
          );

          if (parentFolder) {
            parentId = parentFolder.id;
          }
        }
      }

      // 生成文件夹路径
      let folderPath: string | undefined;
      if (parentId) {
        const parentNote = state.notes[parentId];
        if (parentNote && parentNote.filePath) {
          // 如果父级是文件夹，使用其路径作为目录
          if (parentNote.isFolder) {
            folderPath = `${parentNote.filePath}/${action.payload.title.split('/').pop()}`;
          } else {
            // 如果父级是文件，使用其目录
            const pathParts = parentNote.filePath.split('/');
            pathParts.pop(); // 移除文件名
            const parentPath = pathParts.join('/');
            const folderName = action.payload.title.split('/').pop() || action.payload.title;
            folderPath = parentPath ? `${parentPath}/${folderName}` : folderName;
          }
        } else {
          const folderName = action.payload.title.split('/').pop() || action.payload.title;
          folderPath = folderName;
        }
      } else {
        // 如果没有父级，使用完整的路径作为文件夹路径
        folderPath = action.payload.title;
      }

      // 如果文件夹路径包含层级，使用最后一部分作为标题
      const folderTitle = folderPath ? folderPath.split('/').pop() || folderPath : action.payload.title;

      // 如果已存在相同 filePath 的文件夹，则跳过添加，避免目录树重复
      if (folderPath && Object.values(state.notes).some(n => n.isFolder && n.filePath === folderPath)) {
        console.log('ADD_FOLDER: Folder already exists, skip adding:', folderPath);
        return {
          ...state,
          selectedNoteId: state.selectedNoteId,
        };
      }

      const newFolder: Note = {
        id,
        title: folderTitle,
        content: null,
        parentId: parentId,
        children: [],
        createdAt: now,
        updatedAt: now,
        isFolder: true,
        filePath: folderPath  // 确保设置正确的filePath
      };

      console.log('ADD_FOLDER: Creating folder with:', { id, folderTitle, folderPath, parentId });

      // 异步创建文件夹（不等待结果）
      if (folderPath) {
        FileSystemManager.createFolder(folderPath).catch(error => {
          console.error('Failed to create folder:', error);
        });
      }

      // 创建一个新状态对象，确保笔记被正确添加
      const newNotes = {
        ...state.notes,
        [id]: newFolder,
      };

      console.log('ADD_FOLDER: State after creation:', newNotes);

      return {
        ...state,
        notes: newNotes,
        selectedNoteId: state.selectedNoteId, // 不改变选中的笔记
      };
    }
    
    case 'ADD_NOTE_WITH_FILE': {
      const id = uuidv4();
      const now = new Date();
      
      // 确定父级文件夹ID
      let parentId: string | undefined = action.payload.parentId; // 优先使用显式指定的parentId
      
      console.log('ADD_NOTE_WITH_FILE action:', action.payload);
      
      // 如果没有显式指定parentId，尝试从filePath中推断
      if (!parentId && action.payload.filePath) {
        // 从文件路径中提取父级路径
        const pathParts = action.payload.filePath.replace(/\\/g, '/').split('/');
        console.log('Path parts:', pathParts);
        if (pathParts.length > 1) {
          // 移除文件名部分
          pathParts.pop();
          const parentPath = pathParts.join('/');
          console.log('Looking for parent folder with path:', parentPath);
          
          // 查找匹配的父级文件夹
          const parentFolder = Object.values(state.notes).find(note => 
            note.isFolder && note.filePath === parentPath
          );
          
          console.log('Direct parent folder found:', parentFolder);
          
          if (parentFolder) {
            parentId = parentFolder.id;
          } else {
            // 如果直接父级没找到，尝试查找更上层的父级
            for (let i = pathParts.length - 1; i >= 0; i--) {
              const partialPath = pathParts.slice(0, i).join('/');
              console.log('Looking for ancestor folder with path:', partialPath);
              const ancestorFolder = Object.values(state.notes).find(note => 
                note.isFolder && note.filePath === partialPath
              );
              if (ancestorFolder) {
                console.log('Ancestor folder found:', ancestorFolder);
                parentId = ancestorFolder.id;
                break;
              }
            }
          }
        } else {
          // 如果pathParts.length <= 1，说明是根目录下的文件
          parentId = undefined;
        }
      }
      
      console.log('Determined parentId:', parentId);
      
      const newNote: Note = {
        id,
        title: action.payload.title,
        content: action.payload.isFolder ? null : (action.payload.content || [
          {
            type: 'heading',
            props: { level: 1 },
            content: [{ type: 'text', text: action.payload.title }]
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '' }]
          }
        ]),
        parentId: parentId, // 使用计算出的父级ID
        children: action.payload.isFolder ? [] : undefined,
        createdAt: now,
        updatedAt: now,
        isFolder: action.payload.isFolder,
        filePath: action.payload.filePath
      };
      
      console.log('ADD_NOTE_WITH_FILE: Creating note with:', { id, title: action.payload.title, filePath: action.payload.filePath, parentId });

      // 只有非文件夹笔记才创建文件
      if (!action.payload.isFolder && action.payload.filePath) {
        // 异步创建文件（不等待结果）
        FileSystemManager.createNote(
          action.payload.filePath, 
          action.payload.title, 
          action.payload.content || [
            {
              type: 'heading',
              props: { level: 1 },
              content: [{ type: 'text', text: action.payload.title }]
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '' }]
            }
          ]
        ).catch(error => {
          console.error('Failed to create file for new note:', error);
        });
      }
      
      // 在添加之前，移除任何 filePath 相同的现有笔记，避免目录树出现重复
      const newNotes: Record<string, Note> = { ...state.notes };
      for (const [existingId, existingNote] of Object.entries(newNotes)) {
        if (!existingNote.isFolder && existingNote.filePath === action.payload.filePath) {
          delete newNotes[existingId];
        }
      }
      // 添加新笔记
      newNotes[id] = newNote;

      console.log('ADD_NOTE_WITH_FILE: State after creation:', newNotes);
      console.log('ADD_NOTE_WITH_FILE: New note ID:', id);

      return {
        ...state,
        notes: newNotes,
        selectedNoteId: action.payload.isFolder ? state.selectedNoteId : id,
      };
    }
    
    case 'UPDATE_NOTE': {
      const note = state.notes[action.payload.id];
      if (!note) return state;
      
      // 检查是否是标题更改
      const isTitleChange = action.payload.updates.title !== undefined;
      
      // 检查内容是否真正发生变化
      let hasContentChanged = false;
      if (action.payload.updates.content !== undefined) {
        // 只有当提供了新的内容时才检查是否发生变化
        hasContentChanged = JSON.stringify(note.content || []) !== JSON.stringify(action.payload.updates.content);
      }
      
      // 只有当内容真正发生变化或明确提供了updatedAt时才更新时间戳
      const isExplicitTimestampUpdate = action.payload.updates.updatedAt !== undefined;
      const shouldUpdateTimestamp = hasContentChanged || isExplicitTimestampUpdate;
      
      const updatedAt = isExplicitTimestampUpdate ? 
        action.payload.updates.updatedAt : 
        (shouldUpdateTimestamp ? new Date() : note.updatedAt);
      
      const updatedNote: Note = {
        ...note,
        ...action.payload.updates,
        updatedAt: updatedAt || note.updatedAt, // 确保updatedAt始终有值
      };
      
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.payload.id]: updatedNote,
        },
      };
    }
    
    // 新增专门用于重命名笔记的动作
    case 'RENAME_NOTE': {
      const note = state.notes[action.payload.id];
      if (!note || !note.filePath) return state;
      
      const oldFilePath = note.filePath;
      // 获取父级路径，使用通用的路径分隔符处理方法
      const pathParts = oldFilePath.split(/[\/\\]/); // 同时处理正斜杠和反斜杠
      pathParts.pop(); // 移除旧文件名
      const parentPath = pathParts.join('/'); // 使用正斜杠作为统一格式
      
      if (note.isFolder) {
        // 处理文件夹重命名
        const newFolderName = action.payload.newTitle;
        const newFilePath = parentPath ? `${parentPath}/${newFolderName}` : newFolderName;
        
        // 只有当文件名真正改变时才重命名
        if (oldFilePath !== newFilePath) {
          // 异步重命名文件夹
          FileSystemManager.renameFolder(oldFilePath, newFilePath).catch((error: any) => {
            console.error('Failed to rename folder:', error);
          });
          
          // 更新笔记信息
          return {
            ...state,
            notes: {
              ...state.notes,
              [action.payload.id]: {
                ...note,
                title: action.payload.newTitle,
                filePath: newFilePath,
                updatedAt: new Date()
              },
            },
          };
        }
      } else {
        // 处理文件重命名
        const newFileName = FileSystemManager.generateFilePath(action.payload.newTitle);
        const newFilePath = parentPath ? `${parentPath}/${newFileName}` : newFileName;
        
        // 只有当文件名真正改变时才重命名
        if (oldFilePath !== newFilePath) {
          // 异步重命名文件
          FileSystemManager.renameNote(oldFilePath, newFilePath).catch((error: any) => {
            console.error('Failed to rename note file:', error);
          });
          
          // 更新笔记信息
          return {
            ...state,
            notes: {
              ...state.notes,
              [action.payload.id]: {
                ...note,
                title: action.payload.newTitle,
                filePath: newFilePath,
                updatedAt: new Date()
              },
            },
          };
        }
      }
      
      // 如果文件名没有改变，只更新标题
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.payload.id]: {
            ...note,
            title: action.payload.newTitle,
            updatedAt: new Date()
          },
        },
      };
    }
    
    case 'DELETE_NOTE': {
      const noteToDelete = state.notes[action.payload];
      console.log('DELETE_NOTE called with id:', action.payload);
      console.log('Note to delete:', noteToDelete);
      
      // 如果笔记有文件路径，尝试删除文件系统中的文件或文件夹
      if (noteToDelete && noteToDelete.filePath) {
        if (noteToDelete.isFolder) {
          // 删除文件夹
          FileSystemManager.deleteFolder(noteToDelete.filePath).catch(error => {
            console.error('Failed to delete folder:', error);
          });
        } else {
          // 删除文件
          FileSystemManager.deleteNote(noteToDelete.filePath).catch(error => {
            console.error('Failed to delete file for note:', error);
          });
        }
      }
      
      const newNotes = { ...state.notes };
      delete newNotes[action.payload];
      console.log('Notes after deletion:', newNotes);
      
      // 如果删除的是当前选中的笔记，清除选中状态
      const newSelectedNoteId = state.selectedNoteId === action.payload ? null : state.selectedNoteId;
      console.log('New selected note ID:', newSelectedNoteId);
      
      return {
        ...state,
        notes: newNotes,
        selectedNoteId: newSelectedNoteId,
      };
    }
    
    case 'TOGGLE_FOLDER': {
      const newExpanded = new Set(state.expandedFolders);
      const wasExpanded = newExpanded.has(action.payload);
      
      if (wasExpanded) {
        newExpanded.delete(action.payload);
      } else {
        newExpanded.add(action.payload);
      }
      
      
      return {
        ...state,
        expandedFolders: newExpanded,
      };
    }

    case 'EXPAND_FOLDERS': {
      const newExpanded = new Set(state.expandedFolders);
      action.payload.forEach(folderId => {
        newExpanded.add(folderId);
      });
      
      return {
        ...state,
        expandedFolders: newExpanded,
      };
    }

    case 'SELECT_NOTE_AND_EXPAND_PATH': {
      const noteId = action.payload;
      const note = state.notes[noteId];
      
      if (!note) return state;
      
      // 收集所有需要展开的父级文件夹
      const foldersToExpand: string[] = [];
      let currentNoteId: string | undefined = note.parentId;
      
      while (currentNoteId) {
        const parentNote = state.notes[currentNoteId];
        if (parentNote && parentNote.isFolder) {
          foldersToExpand.push(currentNoteId);
          currentNoteId = parentNote.parentId;
        } else {
          break;
        }
      }
      
      const newExpanded = new Set(state.expandedFolders);
      foldersToExpand.forEach(folderId => {
        newExpanded.add(folderId);
      });
      
      return {
        ...state,
        selectedNoteId: noteId,
        expandedFolders: newExpanded,
      };
    }
    
    case 'SELECT_NOTE_AND_EXPAND_BY_PATH': {
      // 通过文件路径查找并选择笔记
      const filePath = action.payload;
      console.log('SELECT_NOTE_AND_EXPAND_BY_PATH called with filePath:', filePath);
      console.log('Current notes count:', Object.keys(state.notes).length);
      
      // 直接查找笔记
      const note = Object.values(state.notes).find(n => n.filePath === filePath);
      console.log('Found note by filePath:', note);
      
      if (!note) {
        console.log('Note not found for filePath:', filePath);
        return state;
      }
      
      // 收集所有需要展开的父级文件夹
      const foldersToExpand: string[] = [];
      let currentNoteId: string | undefined = note.parentId;
      
      console.log('Collecting parent folders for note:', note.id);
      while (currentNoteId) {
        const parentNote = state.notes[currentNoteId];
        console.log('Checking parent note:', parentNote);
        if (parentNote && parentNote.isFolder) {
          foldersToExpand.push(currentNoteId);
          console.log('Adding folder to expand:', currentNoteId);
          currentNoteId = parentNote.parentId;
        } else {
          break;
        }
      }
      
      const newExpanded = new Set(state.expandedFolders);
      foldersToExpand.forEach(folderId => {
        newExpanded.add(folderId);
      });
      
      console.log('Final expanded folders:', Array.from(newExpanded));
      
      return {
        ...state,
        selectedNoteId: note.id,
        expandedFolders: newExpanded,
      };
    }
    
    case 'LOAD_NOTES':
      return {
        ...state,
        notes: action.payload,
      };
    
    case 'LOAD_FILE_SYSTEM_NOTES': {
      console.log('处理LOAD_FILE_SYSTEM_NOTES动作，payload:', action.payload);
      // 将文件系统笔记转换为应用笔记格式
      const convertToNotes = (items: any[], parentId?: string): Record<string, Note> => {
        const notes: Record<string, Note> = {};
        
        console.log('convertToNotes调用，items:', items, 'parentId:', parentId);
        
        items.forEach(item => {
          const id = item.id;
          const now = new Date();
          
          // 使用文件的最后修改时间（如果存在）
          const updatedAt = item.updatedAt ? new Date(item.updatedAt) : now;
          
          // 修复：不要为文件设置默认内容，而是在需要时加载
          // 正确处理parentId，对于根节点应该是undefined，对于子节点应该是父节点的id
          const note: Note = {
            id,
            title: item.isFolder ? item.title : item.title.replace(/\.md$/, ''), // 移除文件扩展名
            content: item.isFolder ? null : undefined, // 文件的内容在需要时才加载
            parentId: parentId !== undefined ? parentId : undefined, // 保持正确的parentId值
            children: item.isFolder ? [] : undefined,
            createdAt: now,
            updatedAt,
            isFolder: item.isFolder,
            filePath: item.filePath
          };
          
          notes[id] = note;
          
          // 重要修复：只有文件夹才可能有子节点，文件不应该有子节点
          if (item.isFolder && item.children && item.children.length > 0) {
            const childNotes = convertToNotes(item.children, id);
            Object.assign(notes, childNotes);
          }
        });
        
        console.log('convertToNotes返回，notes:', notes);
        return notes;
      };
      
      const fileSystemNotes = convertToNotes(action.payload);
      console.log('转换后的笔记对象:', fileSystemNotes);
      
      return {
        ...state,
        notes: fileSystemNotes,
      };
    }

    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload,
      };

    case 'CLEAR_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: [],
        searchQuery: '',
      };
    
    case 'FORCE_UPDATE':
      // 强制更新状态，触发重新渲染
      return {
        ...state
      };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

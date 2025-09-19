import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Note, AppState } from '../types';

// 动作类型
type AppAction = 
  | { type: 'SELECT_NOTE'; payload: string }
  | { type: 'ADD_NOTE'; payload: { parentId?: string; title: string; isFolder: boolean } }
  | { type: 'UPDATE_NOTE'; payload: { id: string; updates: Partial<Note> } }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'TOGGLE_FOLDER'; payload: string }
  | { type: 'LOAD_NOTES'; payload: Record<string, Note> }
  | { type: 'LOAD_FILE_SYSTEM_NOTES'; payload: any[] }; // 新增动作类型用于加载文件系统笔记

// 初始状态
const initialState: AppState = {
  notes: {},
  selectedNoteId: null,
  expandedFolders: new Set(),
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
      const newNote: Note = {
        id,
        title: action.payload.title,
        content: action.payload.isFolder ? null : [{ type: 'paragraph', content: '' }],
        parentId: action.payload.parentId,
        children: action.payload.isFolder ? [] : undefined,
        createdAt: now,
        updatedAt: now,
        isFolder: action.payload.isFolder,
      };
      
      return {
        ...state,
        notes: {
          ...state.notes,
          [id]: newNote,
        },
        selectedNoteId: action.payload.isFolder ? state.selectedNoteId : id,
      };
    }
    
    case 'UPDATE_NOTE': {
      const note = state.notes[action.payload.id];
      if (!note) return state;
      
      // 如果action.payload.updates中已经提供了updatedAt，则使用它，否则使用当前时间
      const updatedAt = action.payload.updates.updatedAt !== undefined ? 
        action.payload.updates.updatedAt : 
        new Date();
      
      const updatedNote = {
        ...note,
        ...action.payload.updates,
        updatedAt,
      };
      
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.payload.id]: updatedNote,
        },
      };
    }
    
    case 'DELETE_NOTE': {
      const newNotes = { ...state.notes };
      delete newNotes[action.payload];
      
      return {
        ...state,
        notes: newNotes,
        selectedNoteId: state.selectedNoteId === action.payload ? null : state.selectedNoteId,
      };
    }
    
    case 'TOGGLE_FOLDER': {
      const newExpanded = new Set(state.expandedFolders);
      if (newExpanded.has(action.payload)) {
        newExpanded.delete(action.payload);
      } else {
        newExpanded.add(action.payload);
      }
      
      return {
        ...state,
        expandedFolders: newExpanded,
      };
    }
    
    case 'LOAD_NOTES':
      return {
        ...state,
        notes: action.payload,
      };
    
    case 'LOAD_FILE_SYSTEM_NOTES': {
      // 将文件系统笔记转换为应用笔记格式
      const convertToNotes = (items: any[], parentId?: string): Record<string, Note> => {
        const notes: Record<string, Note> = {};
        
        items.forEach(item => {
          const id = item.id;
          const now = new Date();
          
          // 使用文件的最后修改时间（如果存在）
          const updatedAt = item.updatedAt ? new Date(item.updatedAt) : now;
          
          // 修复：不要为文件设置默认内容，而是在需要时加载
          const note: Note = {
            id,
            title: item.title,
            content: item.isFolder ? null : undefined, // 文件的内容在需要时才加载
            parentId,
            children: item.isFolder ? [] : undefined,
            createdAt: now,
            updatedAt,
            isFolder: item.isFolder,
            filePath: item.filePath
          };
          
          notes[id] = note;
          
          // 递归处理子项
          if (item.children && item.children.length > 0) {
            const childNotes = convertToNotes(item.children, id);
            Object.assign(notes, childNotes);
          }
        });
        
        return notes;
      };
      
      const fileSystemNotes = convertToNotes(action.payload);
      
      return {
        ...state,
        notes: fileSystemNotes,
      };
    }
    
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
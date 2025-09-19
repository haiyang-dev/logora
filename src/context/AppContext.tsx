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
  | { type: 'LOAD_NOTES'; payload: Record<string, Note> };

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
      
      const updatedNote = {
        ...note,
        ...action.payload.updates,
        updatedAt: new Date(),
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
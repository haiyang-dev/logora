import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { StorageManager } from './utils/storage';
import './App.css';

function AppContent() {
  const { state, dispatch } = useApp();

  // 初始化时加载保存的笔记
  useEffect(() => {
    const savedNotes = StorageManager.loadNotes();
    dispatch({ type: 'LOAD_NOTES', payload: savedNotes });
  }, [dispatch]);

  // 当笔记发生变化时自动保存
  useEffect(() => {
    if (Object.keys(state.notes).length > 0) {
      StorageManager.saveNotes(state.notes);
    }
  }, [state.notes]);

  return (
    <div className="app">
      <Sidebar className="app-sidebar" />
      <Editor className="app-editor" />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
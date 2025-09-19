import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { StorageManager } from './utils/storage';
import { FileSystemManager } from './utils/fileSystem';
import './App.css';

function AppContent() {
  const { state, dispatch } = useApp();

  // 初始化时加载文件系统中的笔记
  useEffect(() => {
    const loadFileSystemNotes = async () => {
      try {
        const fileSystemNotes = await FileSystemManager.getAllNotes();
        dispatch({ type: 'LOAD_FILE_SYSTEM_NOTES', payload: fileSystemNotes });
      } catch (error) {
        console.error('Failed to load file system notes:', error);
        // 如果无法加载文件系统笔记，则加载本地存储的笔记
        const savedNotes = StorageManager.loadNotes();
        dispatch({ type: 'LOAD_NOTES', payload: savedNotes });
      }
    };

    loadFileSystemNotes();
  }, [dispatch]);

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
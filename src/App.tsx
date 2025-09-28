import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { StorageManager } from './utils/storage';
import { FileSystemManager } from './utils/fileSystem';

function AppContent() {
  const { state, dispatch } = useApp();

  // 初始化时加载文件系统中的笔记
  useEffect(() => {
    const loadFileSystemNotes = async () => {
      try {
        console.log('开始加载文件系统笔记...');
        const fileSystemNotes = await FileSystemManager.getAllNotes();
        console.log('成功加载文件系统笔记:', fileSystemNotes.length, '个笔记');
        console.log('文件系统笔记详情:', JSON.stringify(fileSystemNotes, null, 2));
        dispatch({ type: 'LOAD_FILE_SYSTEM_NOTES', payload: fileSystemNotes });
        
        // 添加一个延迟来检查状态是否更新
        setTimeout(() => {
          console.log('延迟检查状态更新完成');
        }, 1000);
      } catch (error) {
        console.error('Failed to load file system notes:', error);
        // 显示错误信息而不是fallback到示例数据
        alert('无法加载文件系统笔记: ' + (error as Error).message);
      }
    };

    loadFileSystemNotes();
  }, [dispatch]);

  return (
    <div style={{height: '100vh', background: '#f9fafb', display: 'flex', overflow: 'hidden'}}>
      {/* 主内容区域 - 无顶部导航栏 */}
      <div style={{display: 'flex', flex: '1'}}>
        {/* 侧边栏 */}
        <div style={{width: '320px', background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column'}}>
          <Sidebar className="" />
        </div>
        
        {/* 编辑器区域 */}
        <div style={{flex: '1', background: 'white'}}>
          <Editor className="" />
        </div>
      </div>
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
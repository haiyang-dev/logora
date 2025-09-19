// 文件系统工具类
export class FileSystemManager {
  // API 基础路径
  private static readonly API_BASE = 'http://localhost:3001/api';

  // 获取所有笔记文件列表
  static async getAllNotes(): Promise<any[]> {
    try {
      const response = await fetch(`${this.API_BASE}/notes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      throw error;
    }
  }

  // 读取单个笔记内容
  static async readNote(filePath: string): Promise<{ content: any; rawContent: string }> {
    try {
      // 对文件路径进行编码以处理特殊字符和路径分隔符
      const encodedPath = encodeURIComponent(filePath);
      const response = await fetch(`${this.API_BASE}/notes/${encodedPath}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Note not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // 返回BlockNote格式的内容和原始内容
      return {
        content: data.content,
        rawContent: data.rawContent
      };
    } catch (error) {
      console.error(`Failed to read note ${filePath}:`, error);
      throw error;
    }
  }

  // 保存笔记内容
  static async saveNote(filePath: string, content: any[]): Promise<void> {
    try {
      // 对文件路径进行编码以处理特殊字符和路径分隔符
      const encodedPath = encodeURIComponent(filePath);
      const response = await fetch(`${this.API_BASE}/notes/${encodedPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error('Failed to save note');
      }
    } catch (error) {
      console.error(`Failed to save note ${filePath}:`, error);
      throw error;
    }
  }

  // 搜索笔记
  static async searchNotes(query: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to search notes:', error);
      throw error;
    }
  }

  // 重建搜索索引
  static async rebuildSearchIndex(): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/search/rebuild`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error('Failed to rebuild search index');
      }
    } catch (error) {
      console.error('Failed to rebuild search index:', error);
      throw error;
    }
  }
}

// 添加一个简单的测试函数，可以在浏览器控制台中运行
if (typeof window !== 'undefined') {
  (window as any).testFileSystemManager = async () => {
    console.log('开始测试FileSystemManager...');
    
    try {
      console.log('1. 测试获取所有笔记...');
      const notes = await FileSystemManager.getAllNotes();
      console.log('获取到的笔记列表:', notes);
      console.log('笔记数量:', notes.length);
      
      if (notes.length > 0) {
        // 找到第一个文件笔记进行测试
        const firstFileNote = notes.find((note: any) => !note.isFolder && note.filePath);
        if (firstFileNote) {
          console.log('找到测试笔记:', firstFileNote);
          
          console.log('2. 测试读取笔记内容...');
          const content = await FileSystemManager.readNote(firstFileNote.filePath);
          console.log('笔记内容:', content);
          console.log('原始内容长度:', content.rawContent.length);
          console.log('测试完成！');
        } else {
          console.log('没有找到任何文件笔记');
        }
      } else {
        console.log('没有找到任何笔记');
      }
    } catch (error) {
      console.error('测试失败:', error);
    }
  };
  
  console.log('FileSystemManager测试函数已添加到window.testFileSystemManager');
}
// 文件系统工具类
export class FileSystemManager {
  // API 基础路径
  private static readonly API_BASE = 'http://localhost:3001/api';

  // 获取所有笔记文件列表
  static async getAllNotes(): Promise<any[]> {
    try {
      console.log('正在调用 API:', `${this.API_BASE}/notes`);
      const response = await fetch(`${this.API_BASE}/notes`);
      console.log('API 响应状态:', response.status, response.statusText);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('获取到的数据:', data);
      return data;
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

  // 创建新笔记文件
  static async createNote(filePath: string, title: string, content: any[] = []): Promise<void> {
    try {
      // 确保文件路径以 .json 结尾
      const noteFilePath = filePath.endsWith('.json') ? filePath : `${filePath}.json`;
      
      // 对文件路径进行编码以处理特殊字符和路径分隔符
      const encodedPath = encodeURIComponent(noteFilePath);
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
        throw new Error('Failed to create note');
      }
    } catch (error) {
      console.error(`Failed to create note ${filePath}:`, error);
      throw error;
    }
  }

  // 创建新文件夹
  static async createFolder(folderPath: string): Promise<void> {
    try {
      // 发送请求到后端创建文件夹
      const response = await fetch(`${this.API_BASE}/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderPath }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error('Failed to create folder');
      }
    } catch (error) {
      console.error(`Failed to create folder ${folderPath}:`, error);
      throw error;
    }
  }

  // 删除笔记文件
  static async deleteNote(filePath: string): Promise<void> {
    try {
      // 对文件路径进行编码以处理特殊字符和路径分隔符
      const encodedPath = encodeURIComponent(filePath);
      const response = await fetch(`${this.API_BASE}/notes/${encodedPath}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error('Failed to delete note');
      }
    } catch (error) {
      console.error(`Failed to delete note ${filePath}:`, error);
      throw error;
    }
  }

  // 删除文件夹
  static async deleteFolder(folderPath: string): Promise<void> {
    try {
      // 发送请求到后端删除文件夹
      const response = await fetch(`${this.API_BASE}/folders`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderPath }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error('Failed to delete folder');
      }
    } catch (error) {
      console.error(`Failed to delete folder ${folderPath}:`, error);
      throw error;
    }
  }

  // 重命名笔记文件
  static async renameNote(oldFilePath: string, newFilePath: string): Promise<void> {
    try {
      console.log('FileSystemManager.renameNote called with:', { oldFilePath, newFilePath });
      const response = await fetch(`${this.API_BASE}/notes/rename`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPath: oldFilePath, newPath: newFilePath }),
      });
      
      console.log('API response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      if (!data.success) {
        throw new Error('Failed to rename note');
      }
      console.log('FileSystemManager.renameNote completed successfully');
    } catch (error) {
      console.error(`Failed to rename note from ${oldFilePath} to ${newFilePath}:`, error);
      throw error;
    }
  }

  // 重命名文件夹
  static async renameFolder(oldFolderPath: string, newFolderPath: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/folders/rename`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPath: oldFolderPath, newPath: newFolderPath }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error('Failed to rename folder');
      }
    } catch (error) {
      console.error(`Failed to rename folder from ${oldFolderPath} to ${newFolderPath}:`, error);
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

  // 生成文件路径
  static generateFilePath(title: string, parentPath?: string): string {
    // 清理标题，移除非法字符
    const cleanTitle = title.replace(/[<>:"/\\|?*]/g, '').trim();
    const fileName = `${cleanTitle}.json`; // 使用.json扩展名
    
    if (parentPath) {
      return `${parentPath}/${fileName}`;
    }
    
    return fileName;
  }
}
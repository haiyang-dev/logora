// 导出功能工具类
import { type Block } from '@blocknote/core';
import { FileSystemManager } from './fileSystem';

export class ExportManager {
  // 用于存储进度提示框的引用
  private static progressAlert: HTMLElement | null = null;
  
  /**
   * 导出所有笔记到用户选择的文件夹（无损Markdown版本）
   * @param notes 所有笔记
   * @param editor BlockNote编辑器实例
   */
  static async exportAllNotesToFolder(notes: Record<string, any>, editor: any): Promise<void> {
    try {
      // 请求用户选择导出目录
      let exportDirHandle: FileSystemDirectoryHandle;
      try {
        // @ts-ignore TypeScript可能不识别showDirectoryPicker
        exportDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      } catch (error) {
        console.warn('用户取消了目录选择或浏览器不支持showDirectoryPicker');
        this.showProgressAlert('导出失败', '请选择一个有效的导出目录。注意：此功能需要现代浏览器支持（如Chrome 86+）。', 'error');
        setTimeout(() => this.hideProgressAlert(), 3000);
        return;
      }

      // 不再创建notes文件夹，直接使用导出目录
      const rootDirHandle = exportDirHandle;
      const resourcesDirHandle = await exportDirHandle.getDirectoryHandle('.resources', { create: true });
      const imagesDirHandle = await resourcesDirHandle.getDirectoryHandle('images', { create: true });
      
      // 收集所有需要导出的图片URL和映射关系
      const imageUrls = new Set<string>();
      const imageFileNameMap = new Map<string, string>(); // 原始URL到导出文件名的映射
      
      // 显示导出进度提示
      this.showProgressAlert('正在导出', '正在收集笔记和图片信息...', 'info');
      
      // 先创建所有文件夹结构（包括空文件夹）
      for (const noteId in notes) {
        const note = notes[noteId];
        
        // 只处理文件夹
        if (!note.isFolder) continue;
        
        // 根据文件夹的文件路径创建相应的目录结构
        if (note.filePath) {
          // 获取文件路径中的目录部分
          const pathParts = note.filePath.split('/');
          
          // 逐级创建目录
          let currentDirHandle = rootDirHandle;
          for (const dirName of pathParts) {
            if (dirName) { // 跳过空字符串
              currentDirHandle = await currentDirHandle.getDirectoryHandle(dirName, { create: true });
            }
          }
        }
      }
      
      // 遍历所有笔记并导出
      let processedNotes = 0;
      const totalNotes = Object.values(notes).filter((note: any) => !note.isFolder).length;
      
      for (const noteId in notes) {
        const note = notes[noteId];
        
        // 跳过文件夹
        if (note.isFolder) continue;
        
        // 更新进度提示
        this.updateProgressAlert(`正在导出 (${processedNotes + 1}/${totalNotes})`, `正在处理: ${note.title}`, 'info');
        
        // 生成安全的文件名
        const safeFileName = note.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5-_]/g, '_');
        
        // 导出无损Markdown版本
        try {
          let content = note.content;
          // 如果笔记内容为空，从文件系统加载内容
          if (!content && note.filePath) {
            const noteData = await FileSystemManager.readNote(note.filePath);
            content = noteData.content;
          }
          
          if (content) {
            // 收集笔记中的图片URL
            this.collectImageUrls(content, imageUrls);
            
            // 转换为Markdown（有损）
            let markdownContent = await this.convertToMarkdown(content, editor);
            
            // 处理图片路径，将绝对路径替换为相对路径
            markdownContent = this.processImagePaths(markdownContent, imageFileNameMap);
            
            // 创建无损导出的数据结构 - 在Markdown中嵌入完整信息
            const fullMarkdown = `# ${note.title}

${markdownContent}`;
            
            // 根据笔记的文件路径创建相应的目录结构
            let noteDirHandle = rootDirHandle;
            if (note.filePath) {
              // 获取文件路径中的目录部分
              const pathParts = note.filePath.split('/');
              if (pathParts.length > 1) {
                // 移除文件名部分
                pathParts.pop();
                
                // 逐级创建目录
                for (const dirName of pathParts) {
                  if (dirName) { // 跳过空字符串
                    noteDirHandle = await noteDirHandle.getDirectoryHandle(dirName, { create: true });
                  }
                }
              }
            }
            
            // 在正确的目录中创建文件
            const fileHandle = await noteDirHandle.getFileHandle(`${safeFileName}.md`, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(fullMarkdown);
            await writable.close();
          }
        } catch (error) {
          console.error(`导出笔记 ${note.title} 失败:`, error);
        }
        
        processedNotes++;
      }
      
      // 更新进度提示
      this.updateProgressAlert('正在导出图片', `正在导出 ${imageUrls.size} 张图片...`, 'info');
      
      // 导出所有图片并建立映射关系
      await this.exportImages(Array.from(imageUrls), imagesDirHandle, imageFileNameMap);
      
      // 显示完成提示
      this.updateProgressAlert('导出完成', '所有笔记和图片已成功导出到选择的文件夹中！\n- 笔记按照原有文件夹结构保存\n- 空文件夹也已创建\n- 图片保存在 .resources/images/ 目录下', 'success');
      
      // 3秒后自动关闭提示
      setTimeout(() => {
        this.hideProgressAlert();
      }, 3000);
    } catch (error) {
      console.error('导出所有笔记失败:', error);
      this.updateProgressAlert('导出失败', '导出所有笔记失败: ' + (error as Error).message, 'error');
      setTimeout(() => {
        this.hideProgressAlert();
      }, 3000);
      throw error;
    }
  }
  
  /**
   * 使用BlockNote内置功能将内容转换为Markdown格式
   * @param content BlockNote内容数组
   * @param editor BlockNote编辑器实例
   * @returns Markdown格式字符串
   */
  static async convertToMarkdown(content: Block[], editor: any): Promise<string> {
    try {
      // 使用BlockNote原生的导出功能
      return await editor.blocksToMarkdownLossy(content);
    } catch (error) {
      console.error('导出Markdown失败:', error);
      throw error;
    }
  }
  
  /**
   * 收集笔记内容中的所有图片URL
   * @param content 笔记内容
   * @param imageUrls 图片URL集合
   */
  private static collectImageUrls(content: any[], imageUrls: Set<string>): void {
    try {
      for (const block of content) {
        // 检查块中的图片属性
        if (block && typeof block === 'object') {
          // 检查props中的图片URL
          if (block.props && typeof block.props === 'object') {
            for (const key in block.props) {
              if (typeof block.props[key] === 'string' && this.isImageUrl(block.props[key])) {
                imageUrls.add(block.props[key]);
              }
            }
          }
          
          // 检查其他可能的图片URL字段
          if (block.type === 'image' && block.props && block.props.url) {
            imageUrls.add(block.props.url);
          }
          
          // 递归检查嵌套内容
          if (block.content && Array.isArray(block.content)) {
            this.collectImageUrls(block.content, imageUrls);
          }
          
          // 检查content数组中的元素
          if (Array.isArray(block.content)) {
            for (const item of block.content) {
              if (item && typeof item === 'object' && item.type === 'image' && item.attrs && item.attrs.url) {
                imageUrls.add(item.attrs.url);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('收集图片URL时出错:', error);
    }
  }
  
  /**
   * 判断字符串是否为图片URL
   * @param str 待检查的字符串
   * @returns 是否为图片URL
   */
  private static isImageUrl(str: string): boolean {
    if (!str || typeof str !== 'string') return false;
    return (
      str.startsWith('http') && 
      (str.toLowerCase().endsWith('.jpg') || 
       str.toLowerCase().endsWith('.jpeg') || 
       str.toLowerCase().endsWith('.png') || 
       str.toLowerCase().endsWith('.gif') || 
       str.toLowerCase().endsWith('.webp') ||
       str.includes('/resources/images/'))
    );
  }
  
  /**
   * 处理Markdown中的图片路径，将绝对路径替换为相对路径
   * @param markdownContent Markdown内容
   * @param imageFileNameMap 图片URL到文件名的映射
   * @returns 处理后的Markdown内容
   */
  private static processImagePaths(markdownContent: string, imageFileNameMap: Map<string, string>): string {
    let processedContent = markdownContent;
    
    // 处理Markdown图片语法 ![alt](url)
    const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    processedContent = processedContent.replace(markdownImageRegex, (match, alt, url) => {
      // 如果是本地图片URL，替换为相对路径
      if (url.includes('/resources/images/')) {
        const fileName = imageFileNameMap.get(url) || this.getFileNameFromUrl(new URL(url, 'http://localhost:3001'));
        return `![${alt}](./.resources/images/${fileName})`;
      }
      return match;
    });
    
    // 处理HTML img标签
    const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
    processedContent = processedContent.replace(htmlImageRegex, (match, url) => {
      // 如果是本地图片URL，替换为相对路径
      if (url.includes('/resources/images/')) {
        const fileName = imageFileNameMap.get(url) || this.getFileNameFromUrl(new URL(url, 'http://localhost:3001'));
        return match.replace(url, `./.resources/images/${fileName}`);
      }
      return match;
    });
    
    return processedContent;
  }
  
  /**
   * 导出图片到指定目录
   * @param imageUrls 图片URL数组
   * @param imagesDirHandle 图片目录句柄
   * @param imageFileNameMap 图片URL到文件名的映射
   */
  private static async exportImages(imageUrls: string[], imagesDirHandle: FileSystemDirectoryHandle, imageFileNameMap: Map<string, string>): Promise<void> {
    try {
      let processedImages = 0;
      
      for (const imageUrl of imageUrls) {
        try {
          // 更新进度提示
          this.updateProgressAlert('正在导出图片', `正在导出图片 (${processedImages + 1}/${imageUrls.length})`, 'info');
          
          // 获取图片文件名
          const urlObj = new URL(imageUrl);
          const fileName = this.getFileNameFromUrl(urlObj);
          
          // 记录映射关系
          imageFileNameMap.set(imageUrl, fileName);
          
          // 获取图片数据
          const response = await fetch(imageUrl);
          if (!response.ok) {
            console.warn(`无法获取图片: ${imageUrl}`);
            continue;
          }
          
          const blob = await response.blob();
          
          // 创建文件并写入数据
          const fileHandle = await imagesDirHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          console.log(`成功导出图片: ${fileName}`);
          processedImages++;
        } catch (error) {
          console.error(`导出图片失败 ${imageUrl}:`, error);
        }
      }
    } catch (error) {
      console.error('导出图片时出错:', error);
    }
  }
  
  /**
   * 从URL中提取文件名
   * @param url URL对象
   * @returns 文件名
   */
  private static getFileNameFromUrl(url: URL): string {
    try {
      // 尝试从路径中获取文件名
      const pathname = url.pathname;
      const fileName = pathname.substring(pathname.lastIndexOf('/') + 1);
      
      if (fileName) return fileName;
      
      // 如果无法从路径获取，则使用查询参数或生成随机名称
      const searchParams = url.searchParams;
      if (searchParams.toString()) {
        return `image_${searchParams.toString().substring(0, 20)}.jpg`;
      }
      
      // 生成随机文件名
      return `image_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.jpg`;
    } catch (error) {
      console.error('提取文件名时出错:', error);
      return `image_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.jpg`;
    }
  }
  
  /**
   * 显示进度提示框
   * @param title 标题
   * @param message 消息内容
   * @param type 提示类型 (success, error, info, warning)
   */
  private static showProgressAlert(title: string, message: string, type: string): void {
    // 创建或更新提示框元素
    let alertContainer = document.getElementById('export-alert-container');
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'export-alert-container';
      alertContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
      `;
      document.body.appendChild(alertContainer);
    }
    
    // 创建提示框内容
    const alertElement = document.createElement('div');
    alertElement.style.cssText = `
      background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
      border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(0);
      transition: transform 0.3s ease, opacity 0.3s ease;
      opacity: 1;
    `;
    
    // 添加标题
    const titleElement = document.createElement('div');
    titleElement.style.cssText = `
      font-weight: bold;
      margin-bottom: 8px;
      color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
    `;
    titleElement.textContent = title;
    alertElement.appendChild(titleElement);
    
    // 添加消息内容
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
      color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
      white-space: pre-wrap;
      line-height: 1.5;
    `;
    messageElement.textContent = message;
    alertElement.appendChild(messageElement);
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
    `;
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => {
      alertElement.style.transform = 'translateX(100%)';
      alertElement.style.opacity = '0';
      setTimeout(() => {
        if (alertElement.parentNode) {
          alertElement.parentNode.removeChild(alertElement);
        }
      }, 300);
    };
    alertElement.appendChild(closeButton);
    
    // 保存引用以便更新
    this.progressAlert = alertElement;
    
    // 添加到容器
    alertContainer.appendChild(alertElement);
  }
  
  /**
   * 更新进度提示框内容
   * @param title 标题
   * @param message 消息内容
   * @param type 提示类型
   */
  private static updateProgressAlert(title: string, message: string, type: string): void {
    if (this.progressAlert) {
      // 更新样式
      this.progressAlert.style.cssText = `
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(0);
        transition: transform 0.3s ease, opacity 0.3s ease;
        opacity: 1;
      `;
      
      // 更新标题和消息
      const titleElement = this.progressAlert.querySelector('div:first-child');
      const messageElement = this.progressAlert.querySelector('div:nth-child(2)');
      
      if (titleElement) {
        titleElement.textContent = title;
        (titleElement as HTMLElement).style.cssText = `
          font-weight: bold;
          margin-bottom: 8px;
          color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
        `;
      }
      
      if (messageElement) {
        messageElement.textContent = message;
        (messageElement as HTMLElement).style.cssText = `
          color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
          white-space: pre-wrap;
          line-height: 1.5;
        `;
      }
    } else {
      // 如果还没有创建提示框，则创建一个
      this.showProgressAlert(title, message, type);
    }
  }
  
  /**
   * 隐藏进度提示框
   */
  private static hideProgressAlert(): void {
    if (this.progressAlert) {
      // 淡出效果
      this.progressAlert.style.transform = 'translateX(100%)';
      this.progressAlert.style.opacity = '0';
      setTimeout(() => {
        if (this.progressAlert && this.progressAlert.parentNode) {
          this.progressAlert.parentNode.removeChild(this.progressAlert);
          this.progressAlert = null;
        }
      }, 300);
    }
  }
}
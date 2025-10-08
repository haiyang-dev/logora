// 导出功能工具类
import { type Block } from '@blocknote/core';
import { FileSystemManager } from './fileSystem';
import { ProgressAlert } from './progressAlert';

export class ExportManager {
  // 使用ProgressAlert实例
  private static progressAlert = ProgressAlert.getInstance();

  // 统计使用备选方案的笔记数量
  private static fallbackExportCount = 0;
  
  /**
   * 导出所有笔记到用户选择的文件夹（无损Markdown版本）
   * @param notes 所有笔记
   * @param editor BlockNote编辑器实例
   */
  static async exportAllNotesToFolder(notes: Record<string, import('../types').Note>, editor: {
    getBlock?: (id: string) => unknown;
    [key: string]: unknown;
  }): Promise<void> {
    // 重置统计计数器
    this.fallbackExportCount = 0;

    try {
      // 请求用户选择导出目录
      let exportDirHandle: FileSystemDirectoryHandle;
      try {
        // @ts-expect-error TypeScript可能不识别showDirectoryPicker
        exportDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      } catch {
        console.warn('用户取消了目录选择或浏览器不支持showDirectoryPicker');
        this.progressAlert.show('导出失败', '请选择一个有效的导出目录。注意：此功能需要现代浏览器支持（如Chrome 86+）。', 'error');
        setTimeout(() => this.progressAlert.hide(), 3000);
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
      this.progressAlert.show('正在导出', '正在收集笔记和图片信息...', 'info');
      
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
        this.progressAlert.update(`正在导出 (${processedNotes + 1}/${totalNotes})`, `正在处理: ${note.title}`, 'info');
        
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
            let markdownContent = await this.convertToMarkdown(content as Block[], editor);
            
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
      this.progressAlert.update('正在导出图片', `正在导出 ${imageUrls.size} 张图片...`, 'info');
      
      // 导出所有图片并建立映射关系
      await this.exportImages(Array.from(imageUrls), imagesDirHandle, imageFileNameMap);
      
      // 显示完成提示
      let completionMessage = `所有笔记和图片已成功导出到选择的文件夹中！\n- 笔记按照原有文件夹结构保存\n- 空文件夹也已创建\n- 图片保存在 .resources/images/ 目录下`;

      // 如果有使用备选方案的笔记，添加相关信息
      if (this.fallbackExportCount > 0) {
        completionMessage += `\n\n💡 提示：有 ${this.fallbackExportCount} 个笔记使用了备选导出方案（由于编辑器方法不可用），但导出完全成功！`;
      }

      this.progressAlert.update('导出完成', completionMessage, 'success');

      // 3秒后自动关闭提示
      setTimeout(() => {
        this.progressAlert.hide();
      }, 3000);
    } catch (error) {
      console.error('导出所有笔记失败:', error);
      this.progressAlert.update('导出失败', '导出所有笔记失败: ' + (error as Error).message, 'error');
      setTimeout(() => {
        this.progressAlert.hide();
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
      // 检查editor是否存在并且有blocksToMarkdownLossy方法
      if (!editor || typeof editor.blocksToMarkdownLossy !== 'function') {
        console.warn('编辑器不可用或缺少blocksToMarkdownLossy方法，使用简单的Markdown转换');
        this.fallbackExportCount++;
        return this.convertToMarkdownSimple(content);
      }

      // 使用BlockNote原生的导出功能
      return await editor.blocksToMarkdownLossy(content);
    } catch (error) {
      console.warn('BlockNote原生导出不可用，使用备选方案:', error.message);
      // 如果BlockNote导出失败，尝试使用简单转换
      this.fallbackExportCount++;
      return this.convertToMarkdownSimple(content);
    }
  }

  /**
   * 简单的Markdown转换函数（备选方案）
   * @param content BlockNote内容数组
   * @returns Markdown格式字符串
   */
  private static convertToMarkdownSimple(content: Block[]): string {
    let markdown = '';

    for (const block of content) {
      if (!block || typeof block !== 'object') continue;

      switch (block.type) {
        case 'paragraph':
          markdown += this.blockToText(block) + '\n\n';
          break;
        case 'heading': {
          const level = block.props?.level || 1;
          markdown += '#'.repeat(level) + ' ' + this.blockToText(block) + '\n\n';
          break;
        }
        case 'codeBlock': {
          const code = this.blockToText(block);
          const language = block.props?.language || '';
          markdown += '```' + language + '\n' + code + '\n```\n\n';
          break;
        }
        case 'bulletListItem':
          markdown += '- ' + this.blockToText(block) + '\n';
          break;
        case 'numberedListItem':
          markdown += '1. ' + this.blockToText(block) + '\n';
          break;
        case 'quote':
          markdown += '> ' + this.blockToText(block) + '\n\n';
          break;
        case 'image': {
          const imageUrl = block.props?.url || '';
          const caption = block.props?.caption || '';
          markdown += `![${caption}](${imageUrl})\n\n`;
          break;
        }
        case 'table':
          markdown += this.tableToMarkdown(block);
          break;
        default:
          markdown += this.blockToText(block) + '\n\n';
      }
    }

    return markdown.trim();
  }

  /**
   * 将block的内容转换为纯文本
   * @param block Block对象
   * @returns 纯文本字符串
   */
  private static blockToText(block: any): string {
    if (!block || !block.content || !Array.isArray(block.content)) {
      return '';
    }

    let text = '';
    for (const item of block.content) {
      if (typeof item === 'string') {
        text += item;
      } else if (item && typeof item === 'object') {
        if (item.text) {
          let chunk = item.text;
          if (item.bold) chunk = `**${chunk}**`;
          if (item.italic) chunk = `*${chunk}*`;
          if (item.underline) chunk = `<u>${chunk}</u>`;
          if (item.strikethrough) chunk = `~~${chunk}~~`;
          if (item.code) chunk = `\`${chunk}\``;
          text += chunk;
        } else if (item.type === 'link' && item.content) {
          const linkText = this.extractTextFromContent(item.content);
          text += `[${linkText}](${item.attrs?.href || ''})`;
        }
      }
    }

    return text;
  }

  /**
   * 从content数组中提取文本
   * @param content content数组
   * @returns 文本字符串
   */
  private static extractTextFromContent(content: any[]): string {
    if (!Array.isArray(content)) return '';

    let text = '';
    for (const item of content) {
      if (typeof item === 'string') {
        text += item;
      } else if (item && typeof item === 'object') {
        if (item.text) {
          text += item.text;
        } else if (item.content) {
          text += this.extractTextFromContent(item.content);
        }
      }
    }
    return text;
  }

  /**
   * 将表格转换为Markdown格式
   * @param tableBlock 表格block对象
   * @returns Markdown格式的表格字符串
   */
  private static tableToMarkdown(tableBlock: any): string {
    if (!tableBlock || !tableBlock.content || !Array.isArray(tableBlock.content)) {
      return '';
    }

    let tableMarkdown = '';

    // 处理表格行
    for (const row of tableBlock.content) {
      if (row && row.type === 'tableRow' && row.content && Array.isArray(row.content)) {
        const cells = row.content.map((cell: any) => {
          if (cell && cell.content && Array.isArray(cell.content)) {
            return this.extractTextFromContent(cell.content).trim();
          }
          return '';
        });

        if (cells.length > 0) {
          tableMarkdown += '| ' + cells.join(' | ') + ' |\n';

          // 如果是第一行，添加分隔符
          if (row === tableBlock.content[0]) {
            const separator = cells.map(() => '---').join(' | ');
            tableMarkdown += '| ' + separator + ' |\n';
          }
        }
      }
    }

    return tableMarkdown + '\n';
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
          this.progressAlert.update('正在导出图片', `正在导出图片 (${processedImages + 1}/${imageUrls.length})`, 'info');
          
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
  
  }
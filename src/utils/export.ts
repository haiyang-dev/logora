// 导出功能工具类
import { type Block } from '@blocknote/core';
import { FileSystemManager } from './fileSystem';

export class ExportManager {
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
   * 导出单个笔记为Markdown文件
   * @param title 笔记标题
   * @param content 笔记内容
   * @param editor BlockNote编辑器实例
   * @param fileName 文件名（可选）
   */
  static async exportToMarkdown(title: string, content: Block[], editor: any, fileName?: string): Promise<void> {
    try {
      // 转换为Markdown
      const markdownContent = await this.convertToMarkdown(content, editor);
      
      // 生成文件名
      const filename = fileName || `${title}.md`;
      
      // 创建Blob对象
      const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL对象
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('导出笔记失败:', error);
      throw error;
    }
  }
  
  /**
   * 导出所有笔记为Markdown文件
   * @param notes 所有笔记
   * @param editor BlockNote编辑器实例
   */
  static async exportAllNotes(notes: Record<string, any>, editor: any): Promise<void> {
    try {
      // 创建一个包含所有笔记的Markdown文档
      let fullMarkdown = '# 所有笔记\n\n';
      
      // 遍历所有笔记
      for (const noteId in notes) {
        const note = notes[noteId];
        
        // 跳过文件夹
        if (note.isFolder) continue;
        
        // 添加笔记标题
        fullMarkdown += `## ${note.title}\n\n`;
        
        // 如果笔记有内容，添加内容
        if (note.content && Array.isArray(note.content) && note.content.length > 0) {
          const markdownContent = await this.convertToMarkdown(note.content, editor);
          fullMarkdown += markdownContent + '\n\n';
        } else if (note.filePath) {
          // 如果笔记没有内容但有文件路径，从文件系统加载内容
          try {
            const noteData = await FileSystemManager.readNote(note.filePath);
            const markdownContent = await this.convertToMarkdown(noteData.content, editor);
            fullMarkdown += markdownContent + '\n\n';
          } catch (error) {
            console.error(`加载笔记 ${note.title} 失败:`, error);
            fullMarkdown += '> 无法加载笔记内容\n\n';
          }
        } else {
          fullMarkdown += '> 空笔记\n\n';
        }
      }
      
      // 创建Blob对象
      const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = '所有笔记.md';
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL对象
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('导出所有笔记失败:', error);
      throw error;
    }
  }
  
  /**
   * 处理导出内容中的图片和文件路径
   * @param markdownContent Markdown内容
   * @param exportPath 导出路径
   * @returns 处理后的Markdown内容
   */
  static processMediaPaths(markdownContent: string, exportPath: string): string {
    // 这里可以实现处理图片和文件路径的逻辑
    // 例如将图片路径替换为.images文件夹下的相对路径
    // 将文件路径替换为.files文件夹下的相对路径
    
    // 示例处理逻辑（需要根据实际需求调整）：
    // 1. 查找所有图片引用
    // 2. 将图片复制到.exportPath/.images/目录下
    // 3. 更新Markdown中的图片路径
    
    // 暂时返回原始内容，后续实现具体逻辑
    return markdownContent;
  }
}
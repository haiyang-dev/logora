import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { StorageManager } from './storage';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取__dirname的ES模块兼容方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportDefaultNotesToMarkdown() {
  try {
    // 获取默认笔记内容
    const defaultNotes = StorageManager.getDefaultNotes();
    
    // 创建服务器端BlockNote编辑器实例
    const editor = ServerBlockNoteEditor.create();
    
    // 遍历所有笔记
    for (const [id, note] of Object.entries(defaultNotes)) {
      if (!note.isFolder && note.content) {
        console.log(`正在导出笔记: ${note.title} (${id})`);
        
        // 将Block内容转换为Markdown
        const markdownContent = await editor.blocksToMarkdownLossy(note.content as any);
        
        // 创建导出目录
        const exportDir = path.join(__dirname, '../../exported-notes');
        if (!fs.existsSync(exportDir)) {
          fs.mkdirSync(exportDir, { recursive: true });
        }
        
        // 保存Markdown文件
        const fileName = `${note.title.replace(/[/\\?%*:|"<>]/g, '-')}.md`;
        const filePath = path.join(exportDir, fileName);
        fs.writeFileSync(filePath, markdownContent, 'utf8');
        
        console.log(`已导出: ${filePath}`);
        console.log('Markdown内容预览:');
        console.log(markdownContent.substring(0, 500) + (markdownContent.length > 500 ? '...' : ''));
        console.log('---');
      }
    }
    
    console.log('所有默认笔记已导出完成');
  } catch (error) {
    console.error('导出默认笔记失败:', error);
  }
}

// 执行导出
exportDefaultNotesToMarkdown();
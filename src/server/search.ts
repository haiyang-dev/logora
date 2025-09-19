import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置 notes-md 目录路径
const NOTES_DIR = path.join(__dirname, '../../notes-md');

// 搜索索引接口
interface SearchIndex {
  fileId: string;
  fileName: string;
  contentPreview: string;
  keywords: string[];
  lastModified: Date;
}

// 搜索结果接口
interface SearchResult {
  fileId: string;
  fileName: string;
  filePath: string;
  contentPreview: string;
  relevance: number;
}

class SearchEngine {
  private index: SearchIndex[] = [];
  private isIndexing: boolean = false;

  // 构建搜索索引
  async buildIndex(): Promise<void> {
    if (this.isIndexing) {
      return;
    }
    
    this.isIndexing = true;
    this.index = [];
    
    try {
      await this.indexDirectory(NOTES_DIR);
      console.log(`Search index built with ${this.index.length} items`);
    } catch (error) {
      console.error('Failed to build search index:', error);
      throw error; // 重新抛出错误以便调用者处理
    } finally {
      this.isIndexing = false;
    }
  }

  // 递归索引目录
  private async indexDirectory(dir: string, basePath: string = ''): Promise<void> {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        await this.indexDirectory(fullPath, relativePath);
      } else if (stat.isFile() && item.endsWith('.md')) {
        await this.indexFile(fullPath, relativePath);
      }
    }
  }

  // 索引单个文件
  private async indexFile(fullPath: string, relativePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const stat = fs.statSync(fullPath);
      
      // 提取关键词（简单实现，实际项目中可以使用更复杂的算法）
      const keywords = this.extractKeywords(content);
      
      // 创建内容预览
      const contentPreview = content.substring(0, 200);
      
      this.index.push({
        fileId: relativePath,
        fileName: path.basename(relativePath),
        contentPreview,
        keywords,
        lastModified: stat.mtime
      });
    } catch (error) {
      console.error(`Failed to index file ${relativePath}:`, error);
      throw error; // 重新抛出错误以便调用者处理
    }
  }

  // 提取关键词（简单实现）
  private extractKeywords(content: string): string[] {
    // 移除 Markdown 标记并转换为小写
    const cleanContent = content
      .replace(/[#*`[\]()\-_]/g, ' ')
      .toLowerCase();
    
    // 分割单词并过滤常见停用词
    const words = cleanContent
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word));
    
    // 统计词频并返回高频词
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }

  // 检查是否为停用词
  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were',
      'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an', 'as', 'from', 'up', 'about', 'into', 'through',
      'over', 'after', 'before', 'between', 'among', 'during', 'without', 'within', 'along', 'across', 'behind',
      'beyond', 'near', 'toward', 'under', 'until', 'upon', 'via', 'out', 'off', 'down', 'around', 'amongst'
    ];
    return stopWords.includes(word);
  }

  // 搜索功能
  search(query: string): SearchResult[] {
    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    if (queryWords.length === 0) {
      return [];
    }
    
    const results: SearchResult[] = [];
    
    for (const item of this.index) {
      let relevance = 0;
      
      // 文件名匹配（权重最高）
      const fileNameMatches = queryWords.filter(word => 
        item.fileName.toLowerCase().includes(word)
      ).length;
      relevance += fileNameMatches * 10;
      
      // 关键词匹配
      const keywordMatches = queryWords.filter(word => 
        item.keywords.includes(word)
      ).length;
      relevance += keywordMatches * 5;
      
      // 内容匹配
      const contentMatches = queryWords.filter(word => 
        item.contentPreview.toLowerCase().includes(word)
      ).length;
      relevance += contentMatches;
      
      // 如果有相关性，则添加到结果中
      if (relevance > 0) {
        results.push({
          fileId: item.fileId,
          fileName: item.fileName,
          filePath: item.fileId,
          contentPreview: item.contentPreview,
          relevance
        });
      }
    }
    
    // 按相关性排序
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  // 获取索引状态
  getIndexStatus(): { count: number; isIndexing: boolean } {
    return {
      count: this.index.length,
      isIndexing: this.isIndexing
    };
  }
}

// 创建搜索引擎实例
const searchEngine = new SearchEngine();

// 导出搜索引擎实例
export default searchEngine;

// 导出类型定义
export type { SearchIndex, SearchResult };
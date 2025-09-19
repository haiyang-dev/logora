import type { Note } from '../types';

const STORAGE_KEY = 'blacknote-data';

// 本地存储管理
export class StorageManager {
  static saveNotes(notes: Record<string, Note>): void {
    try {
      // 转换 Date 对象为字符串以便存储
      const serializedNotes = Object.fromEntries(
        Object.entries(notes).map(([id, note]) => [
          id,
          {
            ...note,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString(),
          },
        ])
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedNotes));
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error);
    }
  }

  static loadNotes(): Record<string, Note> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return this.getDefaultNotes();
      }

      const parsed = JSON.parse(stored);
      
      // 转换字符串回 Date 对象
      const notes = Object.fromEntries(
        Object.entries(parsed).map(([id, note]: [string, any]) => [
          id,
          {
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          },
        ])
      );
      
      return notes;
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error);
      return this.getDefaultNotes();
    }
  }

  static getDefaultNotes(): Record<string, Note> {
    const now = new Date();
    
    const defaultNotes: Record<string, Note> = {
      'welcome-folder': {
        id: 'welcome-folder',
        title: '欢迎使用 BlackNote',
        content: null,
        isFolder: true,
        createdAt: now,
        updatedAt: now,
        children: [],
      },
      'welcome-note': {
        id: 'welcome-note',
        title: '开始使用',
        parentId: 'welcome-folder',
        content: [
          {
            type: 'heading',
            props: { level: 1 },
            content: [{ type: 'text', text: '欢迎使用 BlackNote!' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'BlackNote 是一个基于 BlockNote 构建的现代化笔记应用。',
              },
            ],
          },
          {
            type: 'heading',
            props: { level: 2 },
            content: [{ type: 'text', text: '代码块功能' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '现在使用官方标准的 Shiki 语法高亮器，支持完整的亮色和暗色主题：',
              },
            ],
          },
          {
            type: 'codeBlock',
            props: { language: 'typescript' },
            content: [
              {
                type: 'text',
                text: '// TypeScript 示例 - 完整的语法高亮\ninterface Note {\n  id: string;\n  title: string;\n  content: Block[];\n  createdAt: Date;\n}\n\nclass NoteManager {\n  private notes: Map<string, Note> = new Map();\n  \n  constructor(private storage: Storage) {}\n  \n  async addNote(note: Note): Promise<void> {\n    this.notes.set(note.id, note);\n    await this.saveToStorage();\n  }\n  \n  private async saveToStorage(): Promise<void> {\n    // 保存到本地存储\n  }\n}',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Python 示例（支持完整的语法高亮）：',
              },
            ],
          },
          {
            type: 'codeBlock',
            props: { language: 'python' },
            content: [
              {
                type: 'text',
                text: '# Python 示例 - 支持完整语法高亮\nfrom typing import List, Optional\nimport asyncio\n\nclass NoteManager:\n    """\u7b14记管理器"""\n    \n    def __init__(self):\n        self.notes: List[dict] = []\n    \n    async def add_note(self, title: str, content: str) -> dict:\n        """\u6dfb加新笔记"""\n        note = {\n            "id": len(self.notes) + 1,\n            "title": title,\n            "content": content,\n            "created_at": datetime.now()\n        }\n        self.notes.append(note)\n        return note\n    \n    def find_note(self, title: str) -> Optional[dict]:\n        """\u67e5找笔记"""\n        return next((note for note in self.notes \n                    if note["title"] == title), None)',
              },
            ],
          },
          {
            type: 'bulletListItem',
            content: [
              { type: 'text', text: '🎨 语法高亮显示' },
            ],
          },
          {
            type: 'bulletListItem',
            content: [
              { type: 'text', text: '🔄 Tab 键缩进支持' },
            ],
          },
          {
            type: 'bulletListItem',
            content: [
              { type: 'text', text: '🌍 多语言支持' },
            ],
          },
          {
            type: 'bulletListItem',
            content: [
              { type: 'text', text: '📄 代码复制功能' },
            ],
          },
          {
            type: 'codeBlock',
            props: { language: 'javascript' },
            content: [
              {
                type: 'text',
                text: 'function hello() {\n  console.log("Hello, BlackNote!");\n  return "Welcome to coding!";\n}',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '也支持 Python、Java、TypeScript 等多种语言：',
              },
            ],
          },
          {
            type: 'codeBlock',
            props: { language: 'python' },
            content: [
              {
                type: 'text',
                text: 'def greet(name):\n    """问候函数"""\n    return f"Hello, {name}!"\n\nprint(greet("BlackNote"))',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'HTML 和 CSS 示例：',
              },
            ],
          },
          {
            type: 'codeBlock',
            props: { language: 'html' },
            content: [
              {
                type: 'text',
                text: '<!-- HTML 示例 -->\n<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>BlackNote 笔记</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <div class="note-container">\n    <h1>欢迎使用 BlackNote</h1>\n    <p>强大的富文本编辑器</p>\n  </div>\n</body>\n</html>',
              },
            ],
          },
          {
            type: 'codeBlock',
            props: { language: 'css' },
            content: [
              {
                type: 'text',
                text: '/* CSS 示例 - 现代化样式 */\n.note-container {\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 2rem;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  border-radius: 12px;\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);\n}\n\n.note-container h1 {\n  color: white;\n  font-size: 2.5rem;\n  margin-bottom: 1rem;\n  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);\n}\n\n.note-container p {\n  color: rgba(255, 255, 255, 0.9);\n  font-size: 1.2rem;\n  line-height: 1.6;\n}\n\n/* 响应式设计 */\n@media (max-width: 768px) {\n  .note-container {\n    padding: 1rem;\n    margin: 1rem;\n  }\n}',
              },
            ],
          },
          {
            type: 'heading',
            props: { level: 2 },
            content: [{ type: 'text', text: '主要功能' }],
          },
          {
            type: 'bulletListItem',
            content: [
              { type: 'text', text: '📝 富文本编辑（标题、列表、代码块等）' },
            ],
          },
          {
            type: 'bulletListItem',
            content: [
              { type: 'text', text: '📁 文件夹组织' },
            ],
          },
          {
            type: 'bulletListItem',
            content: [
              { type: 'text', text: '💾 自动保存' },
            ],
          },
          {
            type: 'bulletListItem',
            content: [
              { type: 'text', text: '🎨 现代化界面' },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '开始创建你的第一个笔记吧！',
                styles: { bold: true },
              },
            ],
          },
        ],
        isFolder: false,
        createdAt: now,
        updatedAt: now,
      },
      'tips-note': {
        id: 'tips-note',
        title: '使用技巧',
        parentId: 'welcome-folder',
        content: [
          {
            type: 'heading',
            props: { level: 1 },
            content: [{ type: 'text', text: '使用技巧' }],
          },
          {
            type: 'heading',
            props: { level: 2 },
            content: [{ type: 'text', text: '快捷键' }],
          },
          {
            type: 'bulletListItem',
            content: [
              { type: 'text', text: 'Ctrl + B: 加粗' },
            ],
          },
          {
            type: 'bulletListItem',
            content: [
              { type: 'text', text: 'Ctrl + I: 斜体' },
            ],
          },
          {
            type: 'bulletListItem',
            content: [
              { type: 'text', text: 'Ctrl + U: 下划线' },
            ],
          },
          {
            type: 'heading',
            props: { level: 2 },
            content: [{ type: 'text', text: '如何使用代码块' }],
          },
          {
            type: 'numberedListItem',
            content: [
              { type: 'text', text: '输入 ' },
              { type: 'text', text: '```', styles: { code: true } },
              { type: 'text', text: ' 或使用左侧工具栏的代码块按钮' },
            ],
          },
          {
            type: 'numberedListItem',
            content: [
              { type: 'text', text: '选择编程语言（支持 JavaScript、TypeScript、Python、Java、C++、HTML、CSS 等）' },
            ],
          },
          {
            type: 'numberedListItem',
            content: [
              { type: 'text', text: '享受语法高亮、自动缩进和代码格式化' },
            ],
          },
          {
            type: 'numberedListItem',
            content: [
              { type: 'text', text: '使用 Tab/Shift+Tab 进行缩进控制' },
            ],
          },
          {
            type: 'numberedListItem',
            content: [
              { type: 'text', text: '右键复制代码块内容' },
            ],
          },
          {
            type: 'bulletListItem',
            content: [
              { type: 'text', text: '使用文件夹来组织相关的笔记' },
            ],
          },
          {
            type: 'bulletListItem',
            content: [
              { type: 'text', text: '右键点击可以删除笔记或文件夹' },
            ],
          },
          {
            type: 'bulletListItem',
            content: [
              { type: 'text', text: '所有更改都会自动保存到本地存储' },
            ],
          },
        ],
        isFolder: false,
        createdAt: now,
        updatedAt: now,
      },
    };
    
    return defaultNotes;
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  static exportNotes(notes: Record<string, Note>): string {
    return JSON.stringify(notes, null, 2);
  }

  static importNotes(jsonData: string): Record<string, Note> | null {
    try {
      const parsed = JSON.parse(jsonData);
      
      // 验证数据结构
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid data format');
      }
      
      // 转换并验证每个笔记
      const notes = Object.fromEntries(
        Object.entries(parsed).map(([id, note]: [string, any]) => {
          if (!note || typeof note !== 'object') {
            throw new Error(`Invalid note format for ID: ${id}`);
          }
          
          return [
            id,
            {
              ...note,
              createdAt: new Date(note.createdAt),
              updatedAt: new Date(note.updatedAt),
            },
          ];
        })
      );
      
      return notes;
    } catch (error) {
      console.error('Failed to import notes:', error);
      return null;
    }
  }
}
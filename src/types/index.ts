// 笔记数据结构定义
export interface Note {
  id: string;
  title: string;
  content: any; // BlockNote 的内容格式
  parentId?: string;
  children?: Note[];
  createdAt: Date;
  updatedAt: Date;
  isFolder: boolean;
  filePath?: string; // 用于关联本地文件系统中的文件路径
}

export interface NoteTreeItem {
  id: string;
  title: string;
  isFolder: boolean;
  parentId?: string;
  children?: NoteTreeItem[];
  level: number;
  isExpanded?: boolean;
  filePath?: string; // 用于关联本地文件系统中的文件路径
}

export interface AppState {
  notes: Record<string, Note>;
  selectedNoteId: string | null;
  expandedFolders: Set<string>;
}

// 本地文件系统笔记结构
export interface FileSystemNote {
  id: string;
  title: string;
  isFolder: boolean;
  filePath?: string;
  children?: FileSystemNote[];
}
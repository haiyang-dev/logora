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
}

export interface NoteTreeItem {
  id: string;
  title: string;
  isFolder: boolean;
  parentId?: string;
  children?: NoteTreeItem[];
  level: number;
  isExpanded?: boolean;
}

export interface AppState {
  notes: Record<string, Note>;
  selectedNoteId: string | null;
  expandedFolders: Set<string>;
}
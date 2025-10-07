import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

// 编辑器上下文类型
interface EditorContextType {
  editor: {
    createBlock?: (block: unknown) => void;
    replaceBlocks?: (blocks: unknown[], newBlocks: unknown[]) => void;
    getBlock?: (id: string) => unknown;
    [key: string]: unknown;
  } | null;
  setEditor: (editor: {
    createBlock?: (block: unknown) => void;
    replaceBlocks?: (blocks: unknown[], newBlocks: unknown[]) => void;
    getBlock?: (id: string) => unknown;
    [key: string]: unknown;
  } | null) => void;
}

// 创建编辑器上下文
const EditorContext = createContext<EditorContextType | null>(null);

// 编辑器提供者组件
export function EditorProvider({ children }: { children: ReactNode }) {
  const [editor, setEditor] = React.useState<{
    createBlock?: (block: unknown) => void;
    replaceBlocks?: (blocks: unknown[], newBlocks: unknown[]) => void;
    getBlock?: (id: string) => unknown;
    [key: string]: unknown;
  } | null>(null);
  
  return (
    <EditorContext.Provider value={{ editor, setEditor }}>
      {children}
    </EditorContext.Provider>
  );
}

// 使用编辑器的Hook
export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
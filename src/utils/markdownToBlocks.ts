// 无损Markdown到BlockNote JSON格式转换器
import { v4 as uuidv4 } from 'uuid';

// 文本样式类型
interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
}

// 文本内容类型
interface TextContent {
  type: 'text';
  text: string;
  styles: TextStyle;
}

// BlockNote块类型
interface BlockNoteBlock {
  id: string;
  type: string;
  props: Record<string, any>;
  content: (TextContent | any)[];
  children: any[];
}

// Markdown元素类型
interface MarkdownElement {
  type: string;
  [key: string]: any;
}

/**
 * 解析Markdown文本样式
 * @param text 包含Markdown样式的文本
 * @returns 解析后的文本内容数组和剩余文本
 */
function parseTextStyles(text: string): { content: TextContent[]; remainingText: string } {
  const content: TextContent[] = [];
  let remainingText = text;
  
  // 处理代码样式 (优先级最高)
  const codeRegex = /`([^`]+)`/g;
  let match;
  let lastIndex = 0;
  const tempParts: { text: string; styles: TextStyle }[] = [];
  
  while ((match = codeRegex.exec(text)) !== null) {
    // 添加代码标记前的文本
    if (match.index > lastIndex) {
      tempParts.push({ 
        text: text.substring(lastIndex, match.index), 
        styles: {} 
      });
    }
    
    // 添加代码样式文本
    tempParts.push({ 
      text: match[1], 
      styles: { code: true } 
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // 添加剩余文本
  if (lastIndex < text.length) {
    tempParts.push({ 
      text: text.substring(lastIndex), 
      styles: {} 
    });
  }
  
  // 如果没有代码样式，直接处理整个文本
  const partsToProcess = tempParts.length > 0 ? tempParts : [{ text: remainingText, styles: {} as TextStyle }];
  remainingText = '';
  
  // 处理其他样式
  for (const part of partsToProcess) {
    let currentText = part.text;
    const baseStyles = part.styles;
    
    // 处理加粗 (**text** 或 __text__)
    const boldRegex1 = /\*\*(.*?)\*\*/g;
    const boldRegex2 = /__(.*?)__/g;
    let newParts: { text: string; styles: TextStyle }[] = [];
    
    // 处理 **text** 格式
    let match2;
    let lastIdx = 0;
    while ((match2 = boldRegex1.exec(currentText)) !== null) {
      if (match2.index > lastIdx) {
        newParts.push({ 
          text: currentText.substring(lastIdx, match2.index), 
          styles: { ...baseStyles } 
        });
      }
      newParts.push({ 
        text: match2[1], 
        styles: { ...baseStyles, bold: true } 
      });
      lastIdx = match2.index + match2[0].length;
    }
    
    if (lastIdx < currentText.length) {
      newParts.push({ 
        text: currentText.substring(lastIdx), 
        styles: { ...baseStyles } 
      });
    }
    
    // 如果没有找到**格式，尝试处理__格式
    if (newParts.length === 0) {
      let match3;
      let lastIdx2 = 0;
      while ((match3 = boldRegex2.exec(currentText)) !== null) {
        if (match3.index > lastIdx2) {
          newParts.push({ 
            text: currentText.substring(lastIdx2, match3.index), 
            styles: { ...baseStyles } 
          });
        }
        newParts.push({ 
          text: match3[1], 
          styles: { ...baseStyles, bold: true } 
        });
        lastIdx2 = match3.index + match3[0].length;
      }
      
      if (lastIdx2 < currentText.length) {
        newParts.push({ 
          text: currentText.substring(lastIdx2), 
          styles: { ...baseStyles } 
        });
      }
    }
    
    // 如果没有加粗样式，使用原始文本
    const partsWithBold = newParts.length > 0 ? newParts : [{ text: currentText, styles: baseStyles }];
    
    // 处理斜体 (*text* 或 _text_)
    const finalParts: { text: string; styles: TextStyle }[] = [];
    for (const part2 of partsWithBold) {
      let currentText2 = part2.text;
      const baseStyles2 = part2.styles;
      
      const italicRegex1 = /\*(.*?)\*/g;
      const italicRegex2 = /_(.*?)_/g;
      let newParts2: { text: string; styles: TextStyle }[] = [];
      
      // 处理 *text* 格式
      let match4;
      let lastIdx3 = 0;
      while ((match4 = italicRegex1.exec(currentText2)) !== null) {
        if (match4.index > lastIdx3) {
          newParts2.push({ 
            text: currentText2.substring(lastIdx3, match4.index), 
            styles: { ...baseStyles2 } 
          });
        }
        newParts2.push({ 
          text: match4[1], 
          styles: { ...baseStyles2, italic: true } 
        });
        lastIdx3 = match4.index + match4[0].length;
      }
      
      if (lastIdx3 < currentText2.length) {
        newParts2.push({ 
          text: currentText2.substring(lastIdx3), 
          styles: { ...baseStyles2 } 
        });
      }
      
      // 如果没有找到*格式，尝试处理_格式
      if (newParts2.length === 0) {
        let match5;
        let lastIdx4 = 0;
        while ((match5 = italicRegex2.exec(currentText2)) !== null) {
          if (match5.index > lastIdx4) {
            newParts2.push({ 
              text: currentText2.substring(lastIdx4, match5.index), 
              styles: { ...baseStyles2 } 
            });
          }
          newParts2.push({ 
            text: match5[1], 
            styles: { ...baseStyles2, italic: true } 
          });
          lastIdx4 = match5.index + match5[0].length;
        }
        
        if (lastIdx4 < currentText2.length) {
          newParts2.push({ 
            text: currentText2.substring(lastIdx4), 
            styles: { ...baseStyles2 } 
          });
        }
      }
      
      // 如果没有斜体样式，使用原始文本
      const partsWithItalic = newParts2.length > 0 ? newParts2 : [{ text: currentText2, styles: baseStyles2 }];
      finalParts.push(...partsWithItalic);
    }
    
    // 添加到最终内容
    for (const part3 of finalParts) {
      content.push({
        type: 'text',
        text: part3.text,
        styles: part3.styles
      });
    }
  }
  
  return { content, remainingText };
}

/**
 * 解析Markdown链接
 * @param text 包含链接的文本
 * @returns 解析后的文本内容数组
 */
function parseLinks(text: string): (TextContent | any)[] {
  const content: (TextContent | any)[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  let lastIndex = 0;
  
  while ((match = linkRegex.exec(text)) !== null) {
    // 添加链接前的文本
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      const { content: styledContent } = parseTextStyles(beforeText);
      content.push(...styledContent);
    }
    
    // 添加链接
    content.push({
      type: 'link',
      href: match[2],
      content: match[1]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // 添加剩余文本
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    const { content: styledContent } = parseTextStyles(remainingText);
    content.push(...styledContent);
  }
  
  // 如果没有链接，直接处理整个文本
  if (content.length === 0) {
    const { content: styledContent } = parseTextStyles(text);
    content.push(...styledContent);
  }
  
  return content;
}

/**
 * 将Markdown文本转换为JSON格式的段落元素
 * @param text Markdown文本
 * @returns JSON格式的段落元素
 */
function createParagraphElement(text: string): MarkdownElement {
  return {
    type: 'paragraph',
    content: text
  };
}

/**
 * 将Markdown标题转换为JSON格式的标题元素
 * @param level 标题级别 (1-6)
 * @param text 标题文本
 * @returns JSON格式的标题元素
 */
function createHeadingElement(level: number, text: string): MarkdownElement {
  return {
    type: 'heading',
    level: level,
    content: text
  };
}

/**
 * 将Markdown代码块转换为JSON格式的代码块元素
 * @param language 代码语言
 * @param code 代码内容
 * @returns JSON格式的代码块元素
 */
function createCodeBlockElement(language: string, code: string): MarkdownElement {
  return {
    type: 'codeBlock',
    language: language || 'plaintext',
    content: code
  };
}

/**
 * 将Markdown无序列表项转换为JSON格式的列表项元素
 * @param text 列表项文本
 * @returns JSON格式的列表项元素
 */
function createBulletListItemElement(text: string): MarkdownElement {
  return {
    type: 'bulletListItem',
    content: text
  };
}

/**
 * 将Markdown有序列表项转换为JSON格式的列表项元素
 * @param text 列表项文本
 * @returns JSON格式的列表项元素
 */
function createNumberedListItemElement(text: string): MarkdownElement {
  return {
    type: 'numberedListItem',
    content: text
  };
}

/**
 * 将Markdown引用块转换为JSON格式的引用元素
 * @param text 引用文本
 * @returns JSON格式的引用元素
 */
function createBlockquoteElement(text: string): MarkdownElement {
  return {
    type: 'blockquote',
    content: text
  };
}

/**
 * 将Markdown图片转换为JSON格式的图片元素
 * @param alt 替代文本
 * @param url 图片URL
 * @returns JSON格式的图片元素
 */
function createImageElement(alt: string, url: string): MarkdownElement {
  // 处理相对路径图片URL，转换为完整的URL
  let fullUrl = url;
  if (url.startsWith('../.resources/images/') || url.startsWith('./.resources/images/') || 
      url.startsWith('.resources/images/') || url.startsWith('.\\.resources\\images\\')) {
    // 提取文件名
    const fileName = url.split(/[\/]/).pop();
    if (fileName) {
      fullUrl = `http://localhost:3001/resources/images/${fileName}`;
    }
  }
  
  // 处理已经上传到服务器的图片URL，确保使用正确的路径
  if (url.startsWith('http://localhost:3001/resources/images/')) {
    // 已经是正确的URL格式，无需修改
    fullUrl = url;
  }
  
  return {
    type: 'image',
    alt: alt,
    url: fullUrl
  };
}

/**
 * 检查是否为表格行
 * @param line 行内容
 * @returns 是否为表格行
 */
function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  // 更宽松的检测：包含管道符号即可
  return trimmed.includes('|') && trimmed.length > 1;
}

/**
 * 检查是否为表格分隔行
 * @param line 行内容
 * @returns 是否为表格分隔行
 */
function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  // 更宽松的分隔符检测：包含管道符号和破折号
  return trimmed.includes('|') &&
         trimmed.includes('-') &&
         /[-\s]{2,}/.test(trimmed); // 至少包含2个破折号或空格的组合
}

/**
 * 解析表格内容
 * @param lines 表格行数组
 * @returns JSON格式的表格元素
 */
function createTableElement(lines: string[]): MarkdownElement {
  const rows: string[][] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // 跳过空行
    if (!trimmedLine) {
      continue;
    }

    // 更宽松的表格行检测
    if (isTableRow(trimmedLine)) {
      // 如果是分隔符行，跳过
      if (isTableSeparator(trimmedLine)) {
        continue;
      }

      try {
        // 处理不完整的表格行
        let processedLine = trimmedLine;

        // 确保行以|开头和结尾
        if (!processedLine.startsWith('|')) {
          processedLine = '|' + processedLine;
        }
        if (!processedLine.endsWith('|')) {
          processedLine = processedLine + '|';
        }

        // 解析表格行，移除首尾的|并按|分割
        const cells = processedLine.slice(1, -1).split('|').map(cell => cell.trim());

        // 只添加非空行或有有效内容的行
        if (cells.length > 0 && (cells.some(cell => cell.length > 0) || rows.length > 0)) {
          rows.push(cells);
        }
      } catch (error) {
        console.warn('解析表格行时出错:', trimmedLine, error);
        continue;
      }
    }
  }

  // 如果没有有效行，返回空表格
  if (rows.length === 0) {
    return {
      type: 'table',
      rows: [['', '']] // 默认创建一个2列的空表格
    };
  }

  // 如果只有一行，可能是标题行，添加空的数据行
  if (rows.length === 1) {
    const emptyRow = rows[0].map(() => '');
    rows.push(emptyRow);
  }

  // 确保所有行都有相同数量的列
  if (rows.length > 0) {
    const maxCols = Math.max(...rows.map(row => row.length));
    for (let i = 0; i < rows.length; i++) {
      while (rows[i].length < maxCols) {
        rows[i].push('');
      }
    }
  }

  return {
    type: 'table',
    rows: rows
  };
}

/**
 * 将Markdown分隔线转换为JSON格式的分隔线元素
 * @returns JSON格式的分隔线元素
 */
function createHorizontalRuleElement(): MarkdownElement {
  return {
    type: 'horizontalRule'
  };
}

/**
 * 无损解析Markdown到JSON格式
 * @param markdown Markdown内容
 * @returns JSON格式的元素数组
 */
export function parseMarkdownToJSON(markdown: string): MarkdownElement[] {
  const elements: MarkdownElement[] = [];
  const lines = markdown.split('\n');
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockContent = '';
  let inBlockquote = false;
  let blockquoteContent: string[] = [];
  let inTable = false;
  let tableLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 处理代码块
    if (line.startsWith('```')) {
      // 如果在表格中，先处理表格
      if (inTable) {
        elements.push(createTableElement(tableLines));
        inTable = false;
        tableLines = [];
      }
      
      if (!inCodeBlock) {
        // 开始代码块
        inCodeBlock = true;
        codeBlockLanguage = line.substring(3).trim();
        codeBlockContent = '';
      } else {
        // 结束代码块
        inCodeBlock = false;
        elements.push(createCodeBlockElement(codeBlockLanguage, codeBlockContent.trimEnd()));
        codeBlockLanguage = '';
        codeBlockContent = '';
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent += line + '\n';
      continue;
    }
    
    // 处理表格
    if (isTableRow(line)) {
      if (!inTable) {
        // 开始表格
        inTable = true;
        tableLines = [line];
      } else {
        // 继续表格
        tableLines.push(line);
      }
      continue;
    } else if (inTable) {
      // 结束表格
      elements.push(createTableElement(tableLines));
      inTable = false;
      tableLines = [];
    }
    
    // 处理空行
    if (line.trim() === '') {
      // 如果在引用块中，结束引用块
      if (inBlockquote) {
        elements.push(createBlockquoteElement(blockquoteContent.join('\n')));
        inBlockquote = false;
        blockquoteContent = [];
      }
      continue;
    }
    
    // 处理引用块
    if (line.startsWith('> ')) {
      inBlockquote = true;
      blockquoteContent.push(line.substring(2));
      continue;
    } else if (inBlockquote) {
      // 结束引用块
      elements.push(createBlockquoteElement(blockquoteContent.join('\n')));
      inBlockquote = false;
      blockquoteContent = [];
    }
    
    // 处理标题
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      elements.push(createHeadingElement(level, text));
      continue;
    }
    
    // 处理无序列表项
    const bulletMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
    if (bulletMatch) {
      const text = bulletMatch[3];
      elements.push(createBulletListItemElement(text));
      continue;
    }
    
    // 处理有序列表项
    const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      const text = orderedMatch[3];
      elements.push(createNumberedListItemElement(text));
      continue;
    }
    
    // 处理图片
    const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imageMatch) {
      const alt = imageMatch[1];
      const url = imageMatch[2];
      elements.push(createImageElement(alt, url));
      continue;
    }
    
    // 处理分隔线
    if (line.match(/^[-*_]{3,}$/)) {
      elements.push(createHorizontalRuleElement());
      continue;
    }
    
    // 处理普通段落
    elements.push(createParagraphElement(line));
  }
  
  // 处理文件末尾可能未关闭的代码块
  if (inCodeBlock) {
    elements.push(createCodeBlockElement(codeBlockLanguage, codeBlockContent.trimEnd()));
  }
  
  // 处理文件末尾可能未关闭的引用块
  if (inBlockquote) {
    elements.push(createBlockquoteElement(blockquoteContent.join('\n')));
  }
  
  // 处理文件末尾可能未关闭的表格
  if (inTable) {
    elements.push(createTableElement(tableLines));
  }
  
  return elements;
}

/**
 * 将JSON格式的元素转换为BlockNote块
 * @param elements JSON格式的元素数组
 * @returns BlockNote块数组
 */
export function convertJSONToBlocks(elements: MarkdownElement[]): BlockNoteBlock[] {
  const blocks: BlockNoteBlock[] = [];

  for (const element of elements) {
    switch (element.type) {
      case 'paragraph':
        blocks.push({
          id: uuidv4(),
          type: 'paragraph',
          props: {
            backgroundColor: 'default',
            textColor: 'default',
            textAlignment: 'left'
          },
          content: parseLinks(element.content),
          children: []
        });
        break;

      case 'heading':
        blocks.push({
          id: uuidv4(),
          type: 'heading',
          props: {
            backgroundColor: 'default',
            textColor: 'default',
            textAlignment: 'left',
            level: element.level
          },
          content: parseLinks(element.content),
          children: []
        });
        break;
        
      case 'codeBlock':
        blocks.push({
          id: uuidv4(),
          type: 'codeBlock',
          props: {
            language: element.language || 'plaintext'
          },
          content: [{
            type: 'text',
            text: element.content,
            styles: {}
          }],
          children: []
        });
        break;

      case 'bulletListItem':
        blocks.push({
          id: uuidv4(),
          type: 'bulletListItem',
          props: {
            backgroundColor: 'default',
            textColor: 'default',
            textAlignment: 'left'
          },
          content: parseLinks(element.content),
          children: []
        });
        break;

      case 'numberedListItem':
        blocks.push({
          id: uuidv4(),
          type: 'numberedListItem',
          props: {
            backgroundColor: 'default',
            textColor: 'default',
            textAlignment: 'left'
          },
          content: parseLinks(element.content),
          children: []
        });
        break;

      case 'blockquote':
        blocks.push({
          id: uuidv4(),
          type: 'blockquote',
          props: {
            backgroundColor: 'default',
            textColor: 'default',
            textAlignment: 'left'
          },
          content: parseLinks(element.content),
          children: []
        });
        break;

      case 'image':
        blocks.push({
          id: uuidv4(),
          type: 'image',
          props: {
            url: element.url,
            caption: element.alt,
            aspectRatio: 16/9
          },
          content: [],
          children: []
        });
        break;

      case 'horizontalRule':
        blocks.push({
          id: uuidv4(),
          type: 'horizontalRule',
          props: {},
          content: [],
          children: []
        });
        break;
        
      case 'table': {
        // 将表格转换为BlockNote表格块
        const tableRows = element.rows as string[][];

        // 确保表格至少有一行，如果为空则跳过
        if (tableRows.length === 0) {
          break;
        }

        // 确保所有行都有相同数量的列
        const maxCols = Math.max(...tableRows.map(row => row.length));
        const normalizedRows = tableRows.map(row => {
          while (row.length < maxCols) {
            row.push('');
          }
          return row;
        });

        // 创建表格内容
        const tableContent = {
          type: 'tableContent' as const,
          columnWidths: maxCols > 0 ? Array(maxCols).fill(null) : [],
          rows: normalizedRows.map((row: string[]) => ({
            cells: row.map((cell: string) => {
              // 解析单元格内容，如果内容为空则提供默认内容
              const cellContent = parseLinks(cell);
              const cleanedContent = Array.isArray(cellContent) && cellContent.length > 0
                ? cellContent
                : [{ type: 'text', text: '', styles: {} }];

              return {
                type: 'tableCell' as const,
                content: cleanedContent,
                props: {
                  colspan: 1,
                  rowspan: 1,
                  backgroundColor: 'default' as const,
                  textColor: 'default' as const,
                  textAlignment: 'left' as const
                }
              };
            })
          }))
        };

        // 验证创建的表格内容
        const isValidTable = tableContent.rows.length > 0 &&
                           tableContent.rows.every(row =>
                             row.cells.length > 0 &&
                             row.cells.every(cell =>
                               cell.type === 'tableCell' &&
                               Array.isArray(cell.content)
                             )
                           );

        if (isValidTable) {
          blocks.push({
            id: uuidv4(),
            type: 'table',
            props: {
              textColor: 'default'
            },
            content: tableContent,
            children: []
          });
        } else {
          console.warn('跳过无效的表格块，转换为段落');
          // 将表格转换为段落作为备用
          blocks.push({
            id: uuidv4(),
            type: 'paragraph',
            props: {
              backgroundColor: 'default',
              textColor: 'default',
              textAlignment: 'left'
            },
            content: parseLinks(element.rows.map(row => row.join(' | ')).join('\n')),
            children: []
          });
        }
        break;
      }
    }
  }
  
  return blocks;
}

/**
 * 无损解析Markdown到BlockNote块（先转JSON再转Block）
 * @param markdown Markdown内容
 * @returns BlockNote块数组
 */
export function parseMarkdownToBlocks(markdown: string): BlockNoteBlock[] {
  try {
    // 第一步：将Markdown转换为JSON格式
    const jsonElements = parseMarkdownToJSON(markdown);

    // 第二步：将JSON格式转换为BlockNote块
    const blocks = convertJSONToBlocks(jsonElements);

    return blocks;
  } catch (error) {
    console.error('Markdown转换为BlockNote块时发生错误:', error);
    // 返回一个包含原始文本的简单段落块
    return [{
      id: uuidv4(),
      type: "paragraph",
      props: {
        backgroundColor: "default",
        textColor: "default",
        textAlignment: "left"
      },
      content: [{
        type: "text",
        text: markdown,
        styles: {}
      }],
      children: []
    }];
  }
}
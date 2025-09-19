import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取__dirname的ES模块兼容方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 修复损坏的Markdown文件
function fixMarkdownFiles(directory: string) {
  try {
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 递归处理子目录
        fixMarkdownFiles(fullPath);
      } else if (stat.isFile() && item.endsWith('.md')) {
        console.log("正在处理文件: " + fullPath);
        fixMarkdownFile(fullPath);
      }
    }
  } catch (error) {
    console.error("处理目录 " + directory + " 时出错:", error);
  }
}

// 修复单个Markdown文件
function fixMarkdownFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否包含损坏的代码块格式
    if (content.includes("```\n\n\n\n") || content.includes("```typescript\n```")) {
      console.log("发现损坏的代码块格式，正在修复: " + filePath);
      
      // 修复损坏的代码块格式
      let fixedContent = content;
      
      // 处理连续的空行后跟代码内容的情况
      // 匹配模式：连续空行后跟代码内容，然后是空行
      const pattern = "```\\s*\\n\\s*\\n([\\s\\S]*?)\\s*\\n\\s*\\n\\s*(?=\\w|```)";
      const regex = new RegExp(pattern, 'g');
      
      fixedContent = fixedContent.replace(regex, (match, codeContent) => {
        // 重新组织代码块格式
        const trimmedContent = codeContent.trim();
        if (trimmedContent) {
          // 确定代码语言（简单判断）
          let language = "text";
          if (trimmedContent.includes("interface") || trimmedContent.includes("class") || trimmedContent.includes("function")) {
            language = "typescript";
          } else if (trimmedContent.includes("def ") || trimmedContent.includes("import ")) {
            language = "python";
          } else if (trimmedContent.includes("<html") || trimmedContent.includes("<div")) {
            language = "html";
          } else if (trimmedContent.includes("{") && trimmedContent.includes(":")) {
            language = "css";
          }
          
          return "```" + language + "\\n" + trimmedContent + "\\n```";
        }
        return match;
      });
      
      // 移除多余的空代码块
      fixedContent = fixedContent.replace(/```[a-z]+\s*\n\s*```\s*\n/g, '');
      
      // 如果内容有变化，则保存修复后的内容
      if (fixedContent !== content) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log("已修复文件: " + filePath);
      } else {
        console.log("文件无需修复: " + filePath);
      }
    } else {
      console.log("文件格式正常: " + filePath);
    }
  } catch (error) {
    console.error("修复文件 " + filePath + " 时出错:", error);
  }
}

// 执行修复
const notesDir = path.join(__dirname, '../../notes-md');
console.log("开始修复notes-md目录中的Markdown文件: " + notesDir);
fixMarkdownFiles(notesDir);
console.log("修复完成");
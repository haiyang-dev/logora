import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取__dirname的ES模块兼容方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 修复Test目录下的特定文件
function fixTestFiles() {
  const testDir = path.join(__dirname, '../../notes-md/Test');
  
  try {
    const items = fs.readdirSync(testDir);
    
    for (const item of items) {
      if (item.endsWith('.md')) {
        const filePath = path.join(testDir, item);
        console.log("正在处理文件: " + filePath);
        fixSpecificFile(filePath);
      }
    }
  } catch (error) {
    console.error("处理Test目录时出错:", error);
  }
}

// 修复特定文件的格式
function fixSpecificFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 修复特定的损坏模式
    let fixedContent = content;
    
    // 匹配损坏的代码块模式：多个换行后跟代码内容
    const pattern = "```\\s*\\n\\s*\\n([\\s\\S]*?)\\s*\\n\\s*\\n\\s*(?=\\w|```|\\*|\\d)";
    const regex = new RegExp(pattern, 'g');
    
    fixedContent = fixedContent.replace(regex, (match, codeContent) => {
      const trimmedContent = codeContent.trim();
      if (trimmedContent) {
        // 确定代码语言
        let language = "text";
        if (trimmedContent.includes("interface") || trimmedContent.includes("class") || 
            trimmedContent.includes("function") || trimmedContent.includes("const") ||
            trimmedContent.includes("let") || trimmedContent.includes("var")) {
          language = "typescript";
        } else if (trimmedContent.includes("def ") || trimmedContent.includes("import ") || 
                   trimmedContent.includes("from ") || trimmedContent.includes("class ")) {
          language = "python";
        } else if (trimmedContent.includes("<html") || trimmedContent.includes("<div") || 
                   trimmedContent.includes("<!DOCTYPE") || trimmedContent.includes("<head")) {
          language = "html";
        } else if (trimmedContent.includes("{") && trimmedContent.includes(":") && 
                   trimmedContent.includes(";")) {
          language = "css";
        } else if (trimmedContent.includes("function") || trimmedContent.includes("var") || 
                   trimmedContent.includes("let")) {
          language = "javascript";
        }
        
        return "```" + language + "\\n" + trimmedContent + "\\n```";
      }
      return match;
    });
    
    // 移除多余的空代码块
    fixedContent = fixedContent.replace(/```[a-z]*\s*\n\s*```\s*\n/g, '');
    
    // 如果内容有变化，则保存修复后的内容
    if (fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log("已修复文件: " + filePath);
    } else {
      console.log("文件无需修复: " + filePath);
    }
  } catch (error) {
    console.error("修复文件 " + filePath + " 时出错:", error);
  }
}

// 执行修复
console.log("开始修复Test目录中的Markdown文件");
fixTestFiles();
console.log("修复完成");
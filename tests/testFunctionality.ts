// 测试文件用于验证导入和导出功能
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取__dirname的ES模块兼容方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试内容
const testContent = `# 功能测试

这是一个功能测试笔记。

## 代码块测试

\`\`\`typescript
interface Test {
  name: string;
}

class TestClass implements Test {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
}
\`\`\`

## 链接测试

[百度](https://www.baidu.com)

## 列表测试

1. 项目1
2. 项目2
   * 子项目1
   * 子项目2

## 表格测试

| 姓名 | 年龄 |
| ---- | ---- |
| 张三 | 25   |
| 李四 | 30   |
`;

// 创建测试目录和文件
const testDir = path.join(__dirname, '../notes-md', 'test');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

const testFilePath = path.join(testDir, 'functionality-test.md');
fs.writeFileSync(testFilePath, testContent, 'utf8');

console.log('测试文件已创建:', testFilePath);
console.log('请启动服务器并访问 http://localhost:3001/api/notes/test/functionality-test.md 来测试导入功能');
console.log('您也可以通过POST请求到 http://localhost:3001/api/notes/test/functionality-test.md 来测试导出功能');
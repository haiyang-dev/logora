import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import searchEngine from './search.js';
import { markdownToBlockNote, blockNoteToMarkdown } from './markdownParser.js';
import multer from 'multer';
import type { Request, Response } from 'express';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置 notes-md 目录路径
const NOTES_DIR = path.join(__dirname, '../../notes-md');

// 配置静态资源目录路径
const PUBLIC_DIR = path.join(__dirname, '../../public');

// 确保 notes-md 目录存在
if (!fs.existsSync(NOTES_DIR)) {
  fs.mkdirSync(NOTES_DIR, { recursive: true });
}

// 配置 multer 中间件用于处理文件上传
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    // 默认保存到 public 目录下的 uploads 文件夹
    const uploadDir = path.join(PUBLIC_DIR, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // 生成唯一的文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 配置 - 支持多个开发端口
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175'
];

app.use((req: Request, res: Response, next: any) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 中间件
app.use(express.json({ limit: '10mb' })); // 增加请求体大小限制
app.use(express.urlencoded({ extended: true }));

// 静态资源服务 - 为图片等资源提供服务
app.use('/assets', express.static(PUBLIC_DIR));
app.use('/notes-assets', express.static(NOTES_DIR));

// 为笔记目录中的images文件夹提供静态资源服务
// 这样可以直接通过/images/文件名访问图片
app.use('/images', express.static(NOTES_DIR, {
  setHeaders: (res, path) => {
    // 设置适当的缓存头
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));

// API 路由：获取所有笔记文件列表
app.get('/api/notes', (req: Request, res: Response) => {
  try {
    const notes = getAllNotes(NOTES_DIR);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notes' });
  }
});

// API 路由：读取单个笔记内容
app.get('/api/notes/:filePath', async (req: Request, res: Response) => {
  try {
    const filePath = decodeURIComponent(req.params.filePath);
    console.log('请求的文件路径:', filePath);
    
    // 确保文件路径在 notes-md 目录内，防止路径遍历攻击
    const fullPath = path.join(NOTES_DIR, filePath);
    console.log('完整文件路径:', fullPath);
    
    if (!fullPath.startsWith(NOTES_DIR)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    
    if (!fs.existsSync(fullPath)) {
      console.log('文件不存在:', fullPath);
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    console.log('原始 Markdown 内容:', content);
    
    // 将Markdown内容转换为BlockNote格式
    const blockNoteContent = await markdownToBlockNote(content);
    console.log('转换后的 BlockNote 内容:', JSON.stringify(blockNoteContent, null, 2));
    
    res.json({ 
      content: blockNoteContent,
      rawContent: content 
    });
  } catch (error) {
    console.error('Failed to read note:', error);
    res.status(500).json({ error: 'Failed to read note' });
  }
});

// API 路由：保存笔记内容
app.post('/api/notes/:filePath', async (req: Request, res: Response) => {
  try {
    const filePath = req.params.filePath;
    const { content } = req.body;
    
    // 确保文件路径在 notes-md 目录内，防止路径遍历攻击
    const fullPath = path.join(NOTES_DIR, filePath);
    
    if (!fullPath.startsWith(NOTES_DIR)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    
    // 确保目录存在
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // 将BlockNote格式转换为Markdown格式再保存
    const markdownContent = await blockNoteToMarkdown(content);
    
    fs.writeFileSync(fullPath, markdownContent, 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save note:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// API 路由：上传图片
app.post('/api/upload-image', upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // 获取笔记路径（可选）
    const notePath = req.body.notePath || '';
    
    // 构建图片访问URL
    const imageUrl = `/assets/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// API 路由：搜索笔记
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    // 构建索引（如果尚未构建）
    if (searchEngine.getIndexStatus().count === 0) {
      await searchEngine.buildIndex();
    }
    
    const results = searchEngine.search(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search notes' });
  }
});

// API 路由：重建搜索索引
app.post('/api/search/rebuild', async (_req: Request, res: Response) => {
  try {
    await searchEngine.buildIndex();
    res.json({ success: true, message: 'Search index rebuilt successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rebuild search index' });
  }
});

// 递归获取所有笔记文件
function getAllNotes(dir: string, basePath: string = ''): any[] {
  const notes = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.join(basePath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      notes.push({
        id: relativePath,
        title: item,
        isFolder: true,
        children: getAllNotes(fullPath, relativePath)
      });
    } else if (stat.isFile() && item.endsWith('.md')) {
      // 获取文件的最后修改时间
      const mtime = stat.mtime;
      
      notes.push({
        id: relativePath,
        title: item,
        isFolder: false,
        filePath: relativePath,
        updatedAt: mtime
      });
    }
  }
  
  return notes;
}

// 启动服务器时构建搜索索引
searchEngine.buildIndex().then(() => {
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to build initial search index:', error);
  // 即使索引构建失败也启动服务器
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

export default app;
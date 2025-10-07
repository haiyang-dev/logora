import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import searchEngine from './search.js';
import multer from 'multer';
import type { Request, Response } from 'express';
import { createHash } from 'crypto';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置 workspace 目录路径（独立的workspace文件夹）
const WORKSPACE_DIR = path.join(__dirname, '../../workspace');

// 配置资源目录路径
const RESOURCES_DIR = path.join(WORKSPACE_DIR, '.resources');

// 配置图片目录路径
const IMAGES_DIR = path.join(RESOURCES_DIR, 'images');

// 确保必要的目录存在
if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

if (!fs.existsSync(RESOURCES_DIR)) {
  fs.mkdirSync(RESOURCES_DIR, { recursive: true });
}

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// 配置 multer 中间件用于处理文件上传，使用内存存储以便计算hash
const storage = multer.memoryStorage();

// 配置 multer，设置正确的文件名编码处理
const upload = multer({ 
  storage: storage,
  preservePath: true
});

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
app.use('/assets', express.static(path.join(__dirname, '../../public'), {
  setHeaders: (res, filePath) => {
    // 设置适当的MIME类型
    if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
    // 设置缓存头
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));

// 为.resources目录提供静态资源服务
app.use('/resources', express.static(RESOURCES_DIR, {
  setHeaders: (res, filePath) => {
    // 设置适当的MIME类型
    if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
    // 设置缓存头
    res.setHeader('Cache-Control', 'public, max-age=3600');
    // 添加CORS头以确保图片可以被前端访问
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  }
}));

// API 路由：获取所有笔记文件列表
app.get('/api/notes', (_req: Request, res: Response) => {
  try {
    const notes = getAllNotes(WORKSPACE_DIR);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notes' });
  }
});

// API 路由：重命名笔记文件（必须在通用的 :filePath 路由之前定义）
app.post('/api/notes/rename', async (req: Request, res: Response) => {
  try {
    const { oldPath, newPath } = req.body;

    // 将URL中的正斜杠转换为系统路径分隔符
    const systemOldPath = oldPath.replace(/\//g, path.sep);
    const systemNewPath = newPath.replace(/\//g, path.sep);

    // 确保文件路径在 workspace 目录内，防止路径遍历攻击
    const fullOldPath = path.join(WORKSPACE_DIR, systemOldPath);
    const fullNewPath = path.join(WORKSPACE_DIR, systemNewPath);

    // 使用 path.resolve 确保路径正确解析
    const resolvedOldPath = path.resolve(fullOldPath);
    const resolvedNewPath = path.resolve(fullNewPath);
    const resolvedWorkspaceDir = path.resolve(WORKSPACE_DIR);

    if (!resolvedOldPath.startsWith(resolvedWorkspaceDir) || !resolvedNewPath.startsWith(resolvedWorkspaceDir)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    // 检查原文件是否存在
    if (!fs.existsSync(resolvedOldPath)) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // 确保目标目录存在
    const newDirPath = path.dirname(resolvedNewPath);
    if (!fs.existsSync(newDirPath)) {
      fs.mkdirSync(newDirPath, { recursive: true });
    }
    fs.renameSync(resolvedOldPath, resolvedNewPath);
    
    // 重建搜索索引
    try {
      await searchEngine.buildIndex();
    } catch (indexError) {
      console.warn('Failed to rebuild search index after note rename:', indexError);
    }
    
    res.json({ success: true, message: 'Note renamed successfully' });
  } catch (error) {
    console.error('Failed to rename note:', error);
    res.status(500).json({ error: 'Failed to rename note' });
  }
});

// API 路由：读取单个笔记内容
app.get('/api/notes/:filePath', async (req: Request, res: Response) => {
  try {
    const filePath = decodeURIComponent(req.params.filePath);

    // 将URL中的正斜杠转换为系统路径分隔符
    const systemPath = filePath.replace(/\//g, path.sep);

    // 确保文件路径在 workspace 目录内，防止路径遍历攻击
    const fullPath = path.join(WORKSPACE_DIR, systemPath);

    if (!fullPath.startsWith(WORKSPACE_DIR)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    // 直接读取JSON文件
    if (fs.existsSync(fullPath)) {
      // 如果文件存在，直接读取并返回
      const jsonContent = fs.readFileSync(fullPath, { encoding: 'utf8' });
      const blocks = JSON.parse(jsonContent);

      // 获取文件的最后修改时间
      const stats = fs.statSync(fullPath);
      const lastModified = stats.mtime;

      res.json({
        content: blocks,
        lastModified: lastModified.toISOString() // 返回ISO格式的修改时间
      });
      return;
    }

    // 如果不存在，返回空内容
    res.json({
      content: []
    });
  } catch (error) {
    console.error('Failed to read note:', error);
    res.status(500).json({ error: 'Failed to read note' });
  }
});

// API 路由：保存笔记内容
app.post('/api/notes/:filePath', async (req: Request, res: Response) => {
  try {
    const filePath = decodeURIComponent(req.params.filePath);
    const { content } = req.body;
    
        
    // 将URL中的正斜杠转换为系统路径分隔符
    const systemPath = filePath.replace(/\//g, path.sep);
    
    // 确保文件路径在 workspace 目录内，防止路径遍历攻击
    const fullPath = path.join(WORKSPACE_DIR, systemPath);
    
        
    if (!fullPath.startsWith(WORKSPACE_DIR)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    
    // 确保目录存在
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // 验证内容
    if (!content || !Array.isArray(content)) {
      console.warn('无效的内容格式');
      return res.status(400).json({ error: 'Invalid content format' });
    }
    
    // 直接保存文件，允许覆盖已存在的文件
    fs.writeFileSync(fullPath, JSON.stringify(content, null, 2), 'utf8');
        
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save note:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// API 路由：删除笔记文件
app.delete('/api/notes/:filePath', async (req: Request, res: Response) => {
  try {
    const filePath = decodeURIComponent(req.params.filePath);
    
    // 将URL中的正斜杠转换为系统路径分隔符
    const systemPath = filePath.replace(/\//g, path.sep);
    
    // 确保文件路径在 workspace 目录内，防止路径遍历攻击
    const fullPath = path.join(WORKSPACE_DIR, systemPath);
    
    if (!fullPath.startsWith(WORKSPACE_DIR)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    
    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // 删除文件
    fs.unlinkSync(fullPath);
    
    // 重建搜索索引
    try {
      await searchEngine.buildIndex();
    } catch (indexError) {
      console.warn('Failed to rebuild search index after deletion:', indexError);
    }
    
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Failed to delete note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// API 路由：服务资源文件
app.get('/api/resource/:fileName', (req: Request, res: Response) => {
  try {
    const fileName = req.params.fileName;
    
    // 构建资源文件的完整路径
    const resourcePath = path.join(RESOURCES_DIR, fileName);
    
    // 安全检查 - 确保路径在RESOURCES_DIR内
    if (!resourcePath.startsWith(RESOURCES_DIR)) {
      return res.status(400).json({ error: 'Invalid resource path' });
    }
    
    // 检查文件是否存在
    if (!fs.existsSync(resourcePath)) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // 设置正确的MIME类型
    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream'; // 默认
    
    if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    } else if (ext === '.svg') {
      contentType = 'image/svg+xml';
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    }
    
    // 设置响应头
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // 发送文件
    res.sendFile(resourcePath);
    
  } catch (error) {
    console.error('资源访问失败:', error);
    res.status(500).json({ error: 'Failed to serve resource' });
  }
});

// API 路由：代理外部图片
app.get('/api/proxy-image', (req: Request, res: Response) => {
  try {
    const imageUrl = req.query.url as string;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // 验证URL格式
    try {
      new URL(imageUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // 只允许HTTPS图片URL，提高安全性
    if (!imageUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'Only HTTPS URLs are allowed' });
    }
    
    // 使用fetch获取外部图片
    fetch(imageUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // 设置正确的Content-Type
        const contentType = response.headers.get('content-type') || 'image/png';
        res.setHeader('Content-Type', contentType);
        
        // 设置缓存头
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        // 转换为缓冲区然后发送
        return response.arrayBuffer();
      })
      .then(buffer => {
        res.send(Buffer.from(buffer));
      })
      .catch(error => {
        console.error('代理图片失败:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to fetch external image', details: error.message });
        }
      });
    
  } catch (error) {
    console.error('代理图片请求失败:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API 路由：测试图片访问
app.get('/api/test-image', (_req: Request, res: Response) => {
  try {
    const testImagePath = path.join(__dirname, '../../public/uploads/test-image.svg');
    
    if (fs.existsSync(testImagePath)) {
      const content = fs.readFileSync(testImagePath, 'utf8');
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(content);
    } else {
      res.status(404).json({ error: 'Test image not found' });
    }
  } catch (error) {
    console.error('测试图片访问失败:', error);
    res.status(500).json({ error: 'Failed to access test image' });
  }
});

// API 路由：上传图片
app.post('/api/upload-image', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // 计算文件内容的hash值，用于去重
    const fileBuffer = req.file.buffer;
    const hash = createHash('sha256').update(fileBuffer).digest('hex');
    
    // 获取文件扩展名
    let originalName = req.file.originalname;
    try {
      // 尝试解码可能被错误编码的文件名
      originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    } catch (decodeError) {
      // 如果解码失败，保持原始文件名
      console.warn('文件名解码失败:', decodeError);
    }
    
    const fileExtension = path.extname(originalName);
    const fileName = `${hash}${fileExtension}`;
    const filePath = path.join(IMAGES_DIR, fileName);
    
    // 检查文件是否已存在，如果不存在则保存
    if (!fs.existsSync(filePath)) {
      // 保存文件到磁盘
      fs.writeFileSync(filePath, fileBuffer);
    }
    
    // 构建相对路径的图片URL
    const relativeImageUrl = `/resources/images/${fileName}`;
    
    // 构建绝对URL，确保在BlockNote编辑器中能正确显示
    const absoluteImageUrl = `http://localhost:3001${relativeImageUrl}`;
    
    // 返回BlockNote期望的格式
    res.json({ 
      success: true, 
      url: absoluteImageUrl,    // 使用绝对URL确保正确显示
      name: originalName        // 使用原始文件名
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

// API 路由：创建文件夹
app.post('/api/folders', async (req: Request, res: Response) => {
  try {
    const { folderPath } = req.body;
    
    // 确保文件夹路径在 workspace 目录内，防止路径遍历攻击
    const fullFolderPath = path.join(WORKSPACE_DIR, folderPath);
    
    if (!fullFolderPath.startsWith(WORKSPACE_DIR)) {
      return res.status(400).json({ error: 'Invalid folder path' });
    }
    
    // 创建文件夹
    fs.mkdirSync(fullFolderPath, { recursive: true });
    
    res.json({ success: true, message: 'Folder created successfully' });
  } catch (error) {
    console.error('Failed to create folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// API 路由：删除文件夹
app.delete('/api/folders', async (req: Request, res: Response) => {
  try {
    const { folderPath } = req.body;
    
    // 确保文件夹路径在 workspace 目录内，防止路径遍历攻击
    const fullFolderPath = path.join(WORKSPACE_DIR, folderPath);
    
    if (!fullFolderPath.startsWith(WORKSPACE_DIR)) {
      return res.status(400).json({ error: 'Invalid folder path' });
    }
    
    // 检查文件夹是否存在
    if (!fs.existsSync(fullFolderPath)) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // 检查是否是目录
    const stat = fs.statSync(fullFolderPath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a folder' });
    }
    
    // 删除文件夹及其所有内容
    fs.rmSync(fullFolderPath, { recursive: true, force: true });
    
    // 重建搜索索引
    try {
      await searchEngine.buildIndex();
    } catch (indexError) {
      console.warn('Failed to rebuild search index after folder deletion:', indexError);
    }
    
    res.json({ success: true, message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Failed to delete folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// API 路由：重命名文件夹
app.post('/api/folders/rename', async (req: Request, res: Response) => {
  try {
    const { oldPath, newPath } = req.body;
    
    // 确保文件夹路径在 workspace 目录内，防止路径遍历攻击
    const fullOldPath = path.join(WORKSPACE_DIR, oldPath);
    const fullNewPath = path.join(WORKSPACE_DIR, newPath);
    
    if (!fullOldPath.startsWith(WORKSPACE_DIR) || !fullNewPath.startsWith(WORKSPACE_DIR)) {
      return res.status(400).json({ error: 'Invalid folder path' });
    }
    
    // 检查原文件夹是否存在
    if (!fs.existsSync(fullOldPath)) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // 检查是否是目录
    const stat = fs.statSync(fullOldPath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a folder' });
    }
    
    // 确保目标目录存在
    const newDirPath = path.dirname(fullNewPath);
    if (!fs.existsSync(newDirPath)) {
      fs.mkdirSync(newDirPath, { recursive: true });
    }
    
    // 重命名文件夹
    fs.renameSync(fullOldPath, fullNewPath);
    
    // 重建搜索索引
    try {
      await searchEngine.buildIndex();
    } catch (indexError) {
      console.warn('Failed to rebuild search index after folder rename:', indexError);
    }
    
    res.json({ success: true, message: 'Folder renamed successfully' });
  } catch (error) {
    console.error('Failed to rename folder:', error);
    res.status(500).json({ error: 'Failed to rename folder' });
  }
});



// 递归获取所有笔记文件
function getAllNotes(dir: string, basePath: string = ''): any[] {
  const notes = [];
  const items = fs.readdirSync(dir);
  
  // 过滤掉以点(.)开头的隐藏文件夹和其他不需要的目录
  const filteredItems = items.filter(item => 
    !item.startsWith('.') &&  // 过滤掉所有以点(.)开头的隐藏文件夹
    item !== 'node_modules' && 
    item !== 'public' &&
    item !== 'src'
  );
  
  // 分离文件夹和文件
  const folders = [];
  const files = [];
  
  for (const item of filteredItems) {
    const fullPath = path.join(dir, item);
    // 使用正斜杠作为路径分隔符，确保在Web API中正确处理
    const relativePath = basePath ? `${basePath}/${item}` : item;
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      folders.push({
        id: relativePath,
        title: item,
        isFolder: true,
        filePath: relativePath,
        children: getAllNotes(fullPath, relativePath)
      });
    } else if (stat.isFile() && item.endsWith('.json')) {
      // 获取文件的最后修改时间
      const mtime = stat.mtime;
      
      files.push({
        id: relativePath,
        title: item.replace(/\.json$/, ''), // 显示时不带.json扩展名
        isFolder: false,
        filePath: relativePath,
        updatedAt: mtime
      });
    }
  }
  
  // 先排序文件夹，再排序文件（都按标题字母顺序）
  folders.sort((a, b) => a.title.localeCompare(b.title));
  files.sort((a, b) => a.title.localeCompare(b.title));
  
  // 先添加文件夹，再添加文件
  notes.push(...folders);
  notes.push(...files);
  
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
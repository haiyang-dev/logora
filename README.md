# Logora

一个基于 React + TypeScript 的本地 Markdown 笔记管理应用，类似于 Obsidian，使用 BlockNote 编辑器提供富文本编辑功能。

![OneNote BlackNote](https://img.shields.io/badge/React-19.1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![BlockNote](https://img.shields.io/badge/BlockNote-0.39.1-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 特性

### 📝 富文本编辑
- 基于 BlockNote 的现代化编辑器
- 支持代码块语法高亮（使用 Shiki）
- 实时自动保存
- 图片上传和管理
- 块级编辑功能

### 📁 文件管理
- 本地 JSON 文件存储
- 文件夹层级结构
- 文件和文件夹的创建、重命名、删除
- 拖拽排序支持

### 🔍 搜索功能
- 全文搜索索引
- 实时搜索结果
- 搜索结果高亮
- 支持文件夹内搜索

### 🎨 用户界面
- 现代化设计
- 响应式布局
- 深色/浅色主题切换（计划中）
- 侧边栏文件夹树形视图

### 📤 导入导出
- Markdown 文件导入
- 无损 Markdown 导出
- 批量导出功能
- 文件夹结构保持
- **智能备选方案**：当主要功能不可用时自动切换到备选方案

## 🛡️ 备选方案和错误处理

本应用采用多层备选方案设计，确保在各种环境下都能稳定运行：

### 导出功能备选方案
- **主要方案**：使用 BlockNote 原生的 `blocksToMarkdownLossy()` 方法
- **备选方案**：自定义 Markdown 转换器，支持所有 BlockNote 块类型
- **用户反馈**：如果使用了备选方案，会在导出完成时显示提示信息
- **统计功能**：记录使用备选方案的笔记数量

### 编辑器内容处理备选方案
- **类型安全**：不支持的块类型自动转换为段落块
- **错误恢复**：处理失败的块会显示为"导入错误: 无法显示此内容"
- **内容保护**：即使部分内容无法处理，也不会丢失其他内容

### Markdown 导入备选方案
- **图片处理**：图片上传失败时保留原始路径
- **文件读取**：单个文件失败不影响其他文件处理
- **格式容错**：无效的 Markdown 格式会转换为纯文本段落
- **路径处理**：支持相对路径和绝对路径的智能转换

### 文件系统操作备选方案
- **错误分类**：404 错误（文件不存在）和其他错误的区分处理
- **路径安全**：自动处理路径编码和特殊字符
- **操作回退**：文件夹操作失败时保持数据一致性

### 图片上传备选方案
- **多格式支持**：支持 PNG、JPG、JPEG、GIF、WebP、SVG 格式
- **错误处理**：上传失败时保留原始文件引用
- **代理服务**：外部图片通过代理服务解决 CORS 问题

### 浏览器兼容性备选方案
- **文件系统 API**：当 `showDirectoryPicker` 不可用时显示友好提示
- **现代浏览器要求**：推荐 Chrome 86+ 或其他支持 File System Access API 的浏览器
- **功能降级**：在不支持的环境中自动禁用相关功能并提示用户

## 🔧 限制和注意事项

### 浏览器要求
- **推荐浏览器**：Chrome 86+、Edge 86+、Firefox 103+（部分功能）
- **必需功能**：File System Access API（用于文件导入导出）
- **可选功能**：Web Workers、Service Workers（用于性能优化）

### 文件限制
- **笔记文件**：仅支持 `.json` 格式（BlockNote 格式）
- **导入格式**：`.md`、`.txt` 文件
- **图片格式**：PNG、JPG、JPEG、GIF、WebP、SVG
- **文件大小**：单个图片文件建议不超过 10MB
- **路径长度**：建议不超过 255 字符

### 性能限制
- **搜索索引**：大量笔记时初次加载可能较慢
- **批量导出**：同时导出大量文件时浏览器可能提示响应延迟
- **图片处理**：大量图片导入时建议分批处理

### 数据安全
- **本地存储**：所有数据存储在本地 `workspace/` 目录
- **无数据上传**：不会将笔记内容上传到外部服务器
- **图片安全**：图片文件经过哈希处理，避免文件名冲突

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装

```bash
# 克隆项目
git clone https://github.com/haiyang-dev/logora.git
cd logora

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

应用将在以下地址启动：
- 前端：http://localhost:5173
- 后端：http://localhost:3001

### 生产环境部署

```bash
# 构建项目
npm run build

# 启动生产服务器
npm run server:prod
```

## 📖 使用指南

### 创建笔记

1. 点击侧边栏的 "+" 按钮
2. 选择"新建笔记"
3. 输入笔记标题
4. 开始编辑内容

### 文件夹管理

1. 右键点击侧边栏空白处
2. 选择"新建文件夹"
3. 输入文件夹名称
4. 拖拽笔记到文件夹中

### 搜索笔记

1. 点击搜索框
2. 输入关键词
3. 查看实时搜索结果
4. 点击结果跳转到对应笔记

### 导入 Markdown

1. 点击菜单中的"导入"
2. 选择 Markdown 文件或文件夹
3. 确认导入设置
4. 查看导入的笔记

### 导出笔记

1. 点击菜单中的"导出"
2. 选择导出范围
3. 选择导出位置
4. 等待导出完成

**备选方案提示**：
- 如果看到"X 个笔记使用了备选导出方案"的提示，表示部分笔记使用了自定义转换器
- 这是正常现象，导出的内容完全有效
- 备选方案会保持原有的格式和内容结构

### 错误处理和恢复

应用具有完善的错误处理机制：

1. **文件操作失败**：自动重试或提供替代方案
2. **格式不兼容**：自动转换为支持的格式
3. **浏览器不支持**：显示友好的错误提示和升级建议
4. **网络问题**：本地操作不受影响，仅影响需要网络的功能

**常见问题处理**：
- 如果导入失败，检查文件格式是否为 `.md` 或 `.txt`
- 如果导出提示浏览器不支持，请升级到 Chrome 86+ 或 Edge 86+
- 如果图片无法显示，检查网络连接或使用本地图片

## 🛠️ 开发

### 项目结构

```
logora/
├── src/
│   ├── components/          # React 组件
│   │   ├── Editor.tsx      # 编辑器组件
│   │   └── Sidebar.tsx     # 侧边栏组件
│   ├── config/             # 配置文件
│   │   ├── constants.ts    # 常量配置
│   │   ├── server.ts       # 服务器配置
│   │   ├── vite.ts         # Vite 配置
│   │   └── development.ts  # 开发配置
│   ├── context/            # React Context
│   │   ├── AppContext.tsx  # 应用状态管理
│   │   └── EditorContext.tsx # 编辑器状态
│   ├── server/             # 后端服务器
│   │   ├── index.ts        # Express 服务器
│   │   └── search.ts       # 搜索引擎
│   ├── shared/             # 共享代码
│   │   └── schema.ts       # BlockNote 配置
│   ├── types/              # TypeScript 类型
│   │   └── index.ts        # 类型定义
│   ├── utils/              # 工具函数
│   │   ├── exportMarkdown.ts    # Markdown 导出
│   │   ├── importMarkdown.ts    # Markdown 导入
│   │   ├── fileSystem.ts        # 文件系统操作
│   │   ├── imageUpload.ts       # 图片上传
│   │   ├── progressAlert.ts     # 通知系统
│   │   └── storage.ts           # 本地存储
│   └── App.tsx              # 主应用组件
├── workspace/              # 笔记存储目录
├── public/                 # 静态资源
├── package.json            # 项目配置
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
└── README.md              # 项目说明
```

### 可用脚本

```bash
# 开发
npm run dev          # 启动开发服务器（前端 + 后端）
npm run server       # 仅启动后端开发服务器
npm run server:prod  # 启动后端生产服务器

# 构建
npm run build        # 构建生产版本
npm run preview      # 预览生产构建

# 代码质量
npm run lint         # 代码检查
```

### 技术栈

#### 前端
- **React 19** - 用户界面框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **BlockNote** - 富文本编辑器
- **Shiki** - 语法高亮
- **Tailwind CSS** - 样式框架

#### 后端
- **Express.js** - Web 服务器
- **TypeScript** - 类型安全
- **Multer** - 文件上传处理
- **Node.js** - 运行时环境

#### 开发工具
- **ESLint** - 代码检查
- **Nodemon** - 开发服务器热重载
- **Concurrently** - 并发运行脚本

### API 接口

#### 笔记管理
- `GET /api/notes` - 获取所有笔记
- `GET /api/notes/:filePath` - 获取单个笔记内容
- `POST /api/notes/:filePath` - 保存笔记内容
- `POST /api/notes/rename` - 重命名笔记
- `DELETE /api/notes/:filePath` - 删除笔记

#### 文件夹管理
- `POST /api/folders` - 创建文件夹
- `DELETE /api/folders` - 删除文件夹
- `POST /api/folders/rename` - 重命名文件夹

#### 搜索
- `GET /api/search?q=keyword` - 搜索笔记
- `POST /api/search/rebuild` - 重建搜索索引

#### 文件上传
- `POST /api/upload-image` - 上传图片
- `GET /api/resource/:fileName` - 获取资源文件
- `GET /api/proxy-image?url=xxx` - 代理外部图片

## 🔧 配置

### 环境变量

```bash
# 服务器配置
PORT=3001                    # 服务器端口
HOST=localhost               # 服务器主机

# 开发配置
VITE_PORT=5173              # 前端开发端口
VITE_HOST=localhost         # 前端开发主机
VITE_OPEN=false             # 是否自动打开浏览器

# API 配置
VITE_API_BASE_URL=/api      # API 基础路径
```

### 自定义配置

所有配置项都集中在 `src/config/` 目录中：

- `constants.ts` - 应用常量
- `server.ts` - 服务器配置
- `vite.ts` - 构建配置
- `development.ts` - 开发环境配置

## 📁 数据存储

### 笔记文件格式

笔记以 JSON 格式存储在 `workspace/` 目录中：

```json
[
  {
    "id": "block-uuid",
    "type": "paragraph",
    "props": {},
    "content": [
      {
        "type": "text",
        "text": "Hello, World!"
      }
    ],
    "children": []
  }
]
```

### 文件结构

```
workspace/
├── .resources/
│   └── images/             # 上传的图片
├── folder1/
│   ├── note1.json
│   └── note2.json
├── folder2/
│   └── subfolder/
│       └── note3.json
└── root-note.json
```

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 规则
- 编写清晰的注释
- 保持代码格式一致

## 📝 更新日志

### v0.1.1 (2025-10-08)
- 🛡️ **导出功能增强**：添加 BlockNote 原生导出失败时的智能备选方案
- 📊 **统计功能**：记录使用备选方案的笔记数量并提供用户反馈
- 🔄 **错误处理优化**：将致命错误改为警告级别，提升用户体验
- 🔧 **编辑器容错**：不支持的块类型自动转换为安全格式
- 📝 **文档完善**：添加详细的备选方案和限制条件说明

### v0.1.0 (2025-10-07)
- ✨ 初始版本发布
- 📝 基础笔记编辑功能
- 📁 文件夹管理
- 🔍 搜索功能
- 📤 导入导出功能

## 🐛 问题反馈

如果您遇到任何问题或有功能建议，请在 [GitHub Issues](https://github.com/your-username/one-note-blacknote/issues) 中提交。

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [BlockNote](https://www.blocknotejs.org/) - 强大的富文本编辑器
- [Shiki](https://shiki.style/) - 语法高亮引擎
- [React](https://reactjs.org/) - 用户界面框架
- [Express](https://expressjs.com/) - Web 应用框架

---

**OneNote BlackNote** - 让笔记管理变得简单高效 📚✨
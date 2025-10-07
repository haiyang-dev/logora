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

### v0.1.0 (2024-01-XX)
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
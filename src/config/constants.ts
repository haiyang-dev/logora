/**
 * 应用常量配置
 */

// API 配置
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production'
    ? window.location.origin
    : 'http://localhost:3001',
  ENDPOINTS: {
    NOTES: '/api/notes',
    SEARCH: '/api/search',
    UPLOAD_IMAGE: '/api/upload-image',
    RESOURCE: '/api/resource',
    PROXY_IMAGE: '/api/proxy-image',
    FOLDERS: '/api/folders'
  }
} as const;

// 文件配置
export const FILE_CONFIG = {
  ALLOWED_IMAGE_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
  ALLOWED_TEXT_EXTENSIONS: ['.md', '.txt'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  WORKSPACE_DIR: 'workspace',
  RESOURCES_DIR: '.resources',
  IMAGES_DIR: '.resources/images'
} as const;

// UI 配置
export const UI_CONFIG = {
  ALERT: {
    AUTO_HIDE_DELAY: 3000,
    FADE_DURATION: 300,
    MAX_WIDTH: 500,
    MIN_WIDTH: 300
  },
  SIDEBAR: {
    WIDTH: 320,
    EXPAND_DELAY: 50,
    UPDATE_DELAY: 100
  },
  EDITOR: {
    SAVE_DELAY: 500,
    MAX_CONTENT_LENGTH: 1000000 // 1MB
  }
} as const;

// 默认内容配置
export const DEFAULT_CONTENT = {
  WELCOME_NOTE: [
    {
      type: 'heading',
      props: { level: 1 },
      content: [{ type: 'text', text: '欢迎使用 BlackNote!' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'BlackNote 是一个基于 BlockNote 构建的现代化笔记应用，支持富文本编辑和文件夹组织。',
        },
      ],
    }
  ],
  EMPTY_NOTE: []
} as const;

// 搜索配置
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 1,
  MAX_RESULTS: 50,
  SNIPPET_LENGTH: 100
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查服务器是否运行',
  FILE_NOT_FOUND: '文件不存在或已被删除',
  PERMISSION_DENIED: '没有访问权限',
  INVALID_FILE_TYPE: '不支持的文件类型',
  FILE_TOO_LARGE: '文件过大',
  SAVE_FAILED: '保存失败',
  LOAD_FAILED: '加载失败',
  INVALID_PATH: '文件路径无效',
  SERVER_ERROR: '服务器错误'
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
  SAVED: '保存成功',
  DELETED: '删除成功',
  RENAMED: '重命名成功',
  CREATED: '创建成功',
  IMPORTED: '导入成功',
  EXPORTED: '导出成功'
} as const;
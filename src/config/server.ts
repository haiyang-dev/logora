/**
 * 服务器配置
 */

// 服务器基础配置
export const SERVER_CONFIG = {
  PORT: process.env.PORT || 3001,
  HOST: process.env.HOST || 'localhost',
  NODE_ENV: process.env.NODE_ENV || 'development'
} as const;

// CORS 配置
export const CORS_CONFIG = {
  ALLOWED_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175'
  ],
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  CREDENTIALS: true
} as const;

// 文件系统配置
export const FILESYSTEM_CONFIG = {
  WORKSPACE_DIR: 'workspace',
  RESOURCES_DIR: '.resources',
  IMAGES_DIR: 'images',
  PUBLIC_DIR: 'public',
  ALLOWED_EXTENSIONS: ['.json'],
  IGNORED_DIRECTORIES: [
    'node_modules',
    'public',
    'src',
    '.git',
    '.vscode',
    '.idea',
    'dist',
    'build'
  ],
  IGNORED_FILES: [
    '.DS_Store',
    'Thumbs.db',
    '*.log',
    '*.tmp'
  ]
} as const;

// 上传配置
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: '10mb',
  ALLOWED_IMAGE_TYPES: [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  ALLOWED_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
} as const;

// 缓存配置
export const CACHE_CONFIG = {
  STATIC_CACHE_MAX_AGE: 'public, max-age=3600',
  IMAGE_CACHE_MAX_AGE: 'public, max-age=86400', // 24 hours
  RESOURCE_CACHE_MAX_AGE: 'public, max-age=3600'
} as const;

// MIME 类型配置
export const MIME_CONFIG = {
  TYPES: {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.json': 'application/json'
  } as const,
  DEFAULT_TYPE: 'application/octet-stream'
} as const;

// 搜索配置
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 1,
  MAX_RESULTS: 50,
  SNIPPET_LENGTH: 100,
  AUTO_REBUILD_ON_CHANGE: true
} as const;

// 安全配置
export const SECURITY_CONFIG = {
  ALLOWED_IMAGE_PROTOCOLS: ['https:'],
  BLOCKED_PATHS: ['..', './', '~'],
  PATH_TRAVERSAL_PATTERNS: ['\\.\\.', '~/', '/\\./'],
  MAX_PATH_LENGTH: 260
} as const;
/**
 * 开发环境配置
 */

// 开发环境端口配置
export const DEV_PORTS = {
  FRONTEND: 5173,
  BACKEND: 3001,
  ALTERNATIVE_PORTS: [5174, 5175]
} as const;

// 开发工具配置
export const DEV_TOOLS = {
  HOT_RELOAD: true,
  SOURCE_MAP: true,
  AUTO_OPEN_BROWSER: false,
  OVERLAY: true,
  CLEAR_CONSOLE: false
} as const;

// 日志配置
export const LOG_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_FILE_LOG: false,
  ENABLE_CONSOLE_LOG: true,
  LOG_REQUESTS: true,
  LOG_ERRORS: true,
  LOG_PERFORMANCE: false
} as const;

// 调试配置
export const DEBUG_CONFIG = {
  ENABLE_DEBUG_MODE: process.env.NODE_ENV === 'development',
  DEBUG_ROUTES: ['/api/debug', '/api/test'],
  ENABLE_MOCK_DATA: false,
  ENABLE_PROFILING: false
} as const;

// 性能配置
export const PERFORMANCE_CONFIG = {
  ENABLE_BUNDLING_ANALYZER: false,
  CHUNK_SIZE_WARNING_LIMIT: 1000,
  ASSET_INLINE_LIMIT: 4096,
  CSS_CODE_SPLIT: true
} as const;

// 测试配置
export const TEST_CONFIG = {
  ENABLE_TEST_MODE: process.env.NODE_ENV === 'test',
  TEST_PORT: 3002,
  MOCK_API: false,
  ENABLE_COVERAGE: false
} as const;
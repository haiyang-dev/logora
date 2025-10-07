/**
 * Vite 配置
 */

// 代理配置
export const PROXY_CONFIG = {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    secure: false
  }
} as const;

// 开发服务器配置
export const DEV_SERVER_CONFIG = {
  HOST: process.env.VITE_HOST || 'localhost',
  PORT: parseInt(process.env.VITE_PORT || '5173'),
  OPEN: process.env.VITE_OPEN === 'true',
  CORS: true,
  STRICT_PORT: false
} as const;

// 构建配置
export const BUILD_CONFIG = {
  OUT_DIR: 'dist',
  ASSETS_DIR: 'assets',
  SOURCES_DIR: 'src',
  MINIFY: 'terser' as const,
  TARGET: 'es2015' as const,
  ROLLUP_OPTIONS: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        editor: ['@blocknote/core', '@blocknote/react'],
        utils: ['axios', 'uuid']
      }
    }
  }
} as const;

// 环境变量配置
export const ENV_CONFIG = {
  BASE_URL: process.env.VITE_BASE_URL || '/',
  API_BASE_URL: process.env.VITE_API_BASE_URL || '/api',
  PUBLIC_PATH: process.env.VITE_PUBLIC_PATH || '/',
  MODE: process.env.NODE_ENV || 'development'
} as const;

// 插件配置
export const PLUGIN_CONFIG = {
  REACT: true,
  LEGACY: false,
  COMPONENTS: false,
  PWA: false
} as const;
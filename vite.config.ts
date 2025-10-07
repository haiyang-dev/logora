import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { PROXY_CONFIG, DEV_SERVER_CONFIG, BUILD_CONFIG } from './src/config/vite.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: DEV_SERVER_CONFIG.HOST,
    port: DEV_SERVER_CONFIG.PORT,
    open: DEV_SERVER_CONFIG.OPEN,
    cors: DEV_SERVER_CONFIG.CORS,
    strictPort: DEV_SERVER_CONFIG.STRICT_PORT,
    proxy: PROXY_CONFIG
  },
  build: {
    outDir: BUILD_CONFIG.OUT_DIR,
    assetsDir: BUILD_CONFIG.ASSETS_DIR,
    minify: BUILD_CONFIG.MINIFY,
    target: BUILD_CONFIG.TARGET,
    rollupOptions: BUILD_CONFIG.ROLLUP_OPTIONS
  }
})

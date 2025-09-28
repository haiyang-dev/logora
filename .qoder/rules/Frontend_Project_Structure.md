---
trigger: always_on
alwaysApply: true
---
所有前端项目必须遵循以下目录结构约定：

- 源代码：`src/`
  - 组件：`src/components/`
  - 页面：`src/pages/`
  - 工具函数：`src/utils/`
  - 钩子：`src/hooks/`
  - 类型定义（TypeScript）：`src/types/`
  - 路由配置：`src/routes/`
  - 全局样式：`src/styles/`

- 测试文件：
  - `tests/`，使用 `.test.tsx` 或者 `.test.ts` 后缀。

- 配置文件放在项目根目录（如 `vite.config.ts`, `tsconfig.json`）。
---
trigger: always_on
alwaysApply: true
---
在开发中，必须超越局部代码，从**系统整体**出发思考问题，主动识别模式，并确保**对称或关联操作的一致性**。

✅ 核心原则：
1. **整体视角**：任何改动都应评估对整个模块、状态流、数据结构和用户体验的影响；
2. **举一反三**：发现一个模式（如防重复提交、权限校验、数据格式），应立即思考是否可复用或推广；
3. **对称一致性**：修改成对/成组操作（如 `add`/`delete`、`show`/`hide`、`connect`/`disconnect`）时，必须同步更新所有相关方法。

✅ 正确做法：
- 修改 `addItem` 时，**立即检查**：
  - `deleteItem`
  - `updateItem`
  - `getItemList`
  - 本地缓存（Redux/Zustand/Pinia）
  - WebSocket 订阅逻辑
  - 权限与校验逻辑是否一致
- 如果变更了数据结构（如从数组改为 Map、新增字段 `uuid`），必须**全局搜索使用点**，确保所有操作兼容；
- 将重复逻辑抽象为通用方案（如自定义 Hook `useCRUD`、工具函数、基类）；
- 在关键函数上方添加注释，提示关联逻辑：
  ```ts
  // ⚠️ 修改此处时，请同步更新 deleteItem 和 updateItem
  function addItem(item) { ... }
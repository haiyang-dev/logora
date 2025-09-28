---
trigger: always_on
alwaysApply: true
---
禁止在代码中随意添加 `console.log`、`console.debug` 等调试日志。

✅ 正确做法：
- 仅在**临时调试时**使用 `console.log`，调试完成后必须删除；
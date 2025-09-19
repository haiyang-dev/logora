```
npm install -g @anthropic-ai/claude-code
npm update -g @anthropic-ai/claude-code
百炼
CLAUDE_CODE_GIT_BASH_PATH="D:\Git\usr\bin\bash.exe"
export ANTHROPIC_BASE_URL="https://dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy"
export ANTHROPIC_AUTH_TOKEN="sk-e29d450ce06c49e2aaafcd9f25d859a3"

智谱
export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
export ANTHROPIC_AUTH_TOKEN=694391ce3c95443fb34ba75be005e8d5.DKpwk0AoQQg4YZ2O

1wy
export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
export ANTHROPIC_AUTH_TOKEN=e431f17f3db34ecb9c3dc35092a5b4d6.7vYHLfR9JeaSl062

硅基
export ANTHROPIC_BASE_URL="https://api.siliconflow.cn/"
export ANTHROPIC_MODEL="Qwen/Qwen3-Coder-480B-A35B-Instruct"
export ANTHROPIC_AUTH_TOKEN="sk-jsdagfrqxjwjrqxzkefiguzzwjfchysfjhradloyaisyumdp"

anyrouter
export ANTHROPIC_AUTH_TOKEN=sk-nH19sfZ9u1vLAFeTBEftDEHm7hTLE3hYbRxKkPj3T8fPjrSY
export ANTHROPIC_BASE_URL=https://anyrouter.top

```

设置shell

CLAUDE_CODE_GIT_BASH_PATH=D:\Git\usr\bin\bash.exe

配置信息

~/.claude/settings.json

```
{
  "env": {
      "ANTHROPIC_MODEL": "glm-4.5",
      "ANTHROPIC_SMALL_FAST_MODEL": "glm-4.5"
  }
}
```

```
/status

 Claude Code Status v1.0.65

  L Session ID: e1b4c0e4-52f0-4c6a-84dc-e7c9676a1760

 Working Directory
  L E:\code\one-shell

 System Diagnostics • /doctor
 ‼  Config mismatch: running npm-global but config says unknown

 Account
  L Auth Token: ANTHROPIC_AUTH_TOKEN

 API Configuration
  L Anthropic Base URL: https://open.bigmodel.cn/api/anthropic

 Memory • /memory
  L project: CLAUDE.md

 Model • /model
  L glm-4.5

```
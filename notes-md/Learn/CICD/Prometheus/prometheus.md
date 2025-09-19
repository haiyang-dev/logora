## 各组件详细解释（Server/Client 视角）

### 1. **Receiver（Server）**

- 监听端口或接口，等待数据进入

- 示例：

	- otlp receiver：接收 OTLP 协议数据

	- prometheus receiver：主动抓取（特殊情况，行为像 Client）

	- statsd receiver：监听 UDP，接收 StatsD 数据

### 2. **Exporter（Client）**

- 将处理后的数据发送到外部系统

- 示例：

	- otlp exporter：发送到另一个 Collector 或后端

	- awsxray exporter：发送到 AWS X-Ray

	- prometheus exporter：暴露 /metrics 接口供 Prometheus 抓取（行为像 Server）

### 3. **Collector（中间层）**

- 同时扮演 Server（接收数据）和 Client（导出数据）

- 可以部署在边缘、服务端或集中式环境中

### 4. **Prometheus Server（Client）**

- 主动抓取 /metrics 接口的数据

- 不依赖 Agent 或 SDK，适合暴露式指标

### 5. **PushGateway（Server）**

- 被动接收指标，适合短生命周期任务

- Prometheus 再从它那里抓取数据
### 🔍 解释 "..." 的作用：

在 CloudWatch Dashboard 的 metrics 配置中，每个 metric 是一个数组，格式如下：

```shell
[
  "Namespace",
  "MetricName",
  "DimensionName1", "DimensionValue1",
  "DimensionName2", "DimensionValue2",
  ...
  { "region": "xxx", "label": "xxx" }
]

```

当你有多个 metric 共享相同的前缀（比如相同的 Namespace 和 MetricName），你可以在后续的 metric 中用 "..." 来表示“复用上一个 metric 的前缀部分”。

### ✅ 示例说明：

假设第一个 metric 是：

```shell
[
  "a552014_ets_qe_int_otlp",
  "container_memory_rss",
  "container", "query-thrift",
  ...
]
```

那么第二个 metric：

```shell
[
  "...",
  "ets-qe-1",
  ".", "c1cba63d4d602c734ba43e0039ad3661fd24fb5b281d5c36d44d795df45cb456",
  ...
]
```

就等价于：

```shell
[
  "a552014_ets_qe_int_otlp",
  "container_memory_rss",
  "container", "query-thrift",
  "pod", "ets-qe-1",
  "name", "c1cba63d4d602c734ba43e0039ad3661fd24fb5b281d5c36d44d795df45cb456",
  ...
]

```

其中 "." 表示“跳过这个维度”，即复用上一个 metric 中相同位置的维度名和值。

### 🧠 总结：

| 符号 | 含义 | 
| -- | -- |
| "..." | 复用上一个 metric 的前缀（通常是 Namespace 和 MetricName） | 
| "." | 跳过该位置，复用上一个 metric 中相同位置的维度名和值 | 


在 AWS CloudWatch Dashboard 的 JSON 配置中，**只能使用三个点 ****"..."** 来表示“复用上一个 metric 的前缀”。这是 AWS 官方支持的语法，**不能使用四个点 ****"...."**** 或五个点 ****"....."**。

### ✅ 1. **Namespace 和 Metric Name**：只有 **value**，没有 key

```shell
[ "Namespace", "MetricName", ... ]
```

- **Namespace** 和 **MetricName** 是 CloudWatch 指标的**核心标识**，它们的位置是**固定的前两个元素**。

- 它们不需要写成 "key", "value" 形式，因为 CloudWatch 已经知道第一个是 Namespace，第二个是 MetricName。

### ✅ 2. **Dimensions（维度）**：必须是 "key", "value" 成对出现

```shell
[ ..., "dimensionName1", "dimensionValue1", "dimensionName2", "dimensionValue2", ... ]
```

- 维度是用来进一步标识某个 metric 的，比如 pod_name, container, image 等。

- 每个维度都必须是 "key", "value" 成对出现，CloudWatch 才能识别。

### ✅ 3. **最后的对象（可选）**：用于设置额外属性，比如 region 和 label

```shell
{ "region": "eu-west-1", "label": "query-thrift-0" }
```

- 这个对象是可选的，用于设置图表中该 metric 的显示标签、区域等。

- 它不是维度的一部分，而是图表渲染的辅助信息。

### 🧠 总结一下结构：

```shell
[
  "Namespace",               // 固定位置 1
  "MetricName",              // 固定位置 2
  "DimensionKey1", "Value1", // 从位置 3 开始是维度，必须成对
  "DimensionKey2", "Value2",
  ...
  { "region": "...", "label": "..." } // 可选的附加信息
]

```
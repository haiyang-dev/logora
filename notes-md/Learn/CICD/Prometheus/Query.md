[https://prometheus.io/docs/prometheus/latest/querying/basics/](https://prometheus.io/docs/prometheus/latest/querying/basics/)

```
curl 'http://prometheus-service.ets-intraday-qe.svc.cluster.local:9091/api/v1/query?query=sum(rate(container_cpu_usage_seconds_total%7Bcontainer%3D%22query-engine%22%7D%5B1m%5D))'
curl 'http://prometheus-service.ets-intraday-qe.svc.cluster.local:9091/api/v1/query?query=rate(container_cpu_usage_seconds_total%7Bcontainer%3D%22query-engine%22%7D%5B1m%5D)'
curl 'http://prometheus-service.ets-intraday-qe.svc.cluster.local:9091/api/v1/series?match[]=container_cpu_usage_seconds_total'
```

在eks集群中，最好是使用port forward来验证， 本地打开浏览器可以query和检查targets

```
kubectl port-forward svc/prometheus-service -n ets-intraday-qe 9091:9091 
http://localhost:9091/targets
```

targets一旦被remove, 那相应的metric会被移除的，所以类似于cpu利用率这种

```
sum(rate(container_cpu_usage_seconds_total{container="query-engine"}[1m]))/(count(container_cpu_usage_seconds_total{container="query-engine"}) * 12) * 100
```

统计container数量就可以直接count, 不用

(scalar(count(rate(container_cpu_usage_seconds_total{container="query-engine"}[1m]) > bool 0)) * 12)

🧠 背景知识

- container_cpu_usage_seconds_total 是一个 **累积计数器**，表示容器使用的 CPU 总秒数。

- rate(...[1m]) 表示 **过去 1 分钟内每秒使用的 CPU 核数**（即 CPU 使用率）。

- 你每个容器的 CPU 限制是 **12 核**。

## 🧮 举个例子

假设你有 **3 个 ****query-engine**** 容器**，它们的 CPU 使用情况如下：

| 容器名 | rate(...) | CPU limit（核） | 
| -- | -- | -- |
| A | 6 | 12 | 
| B | 9 | 12 | 
| C | 3 | 12 | 


🔢 计算步骤

1. **分子：总 CPU 使用率**

```
sum(rate(...)) = 6 + 9 + 3 = 18
```

表示这 3 个容器总共使用了 **18 核 CPU**（在过去 1 分钟内的平均速率）。

2. **分母：总 CPU 限制**

```
count(...) = 3 个容器
总限制 = 3 * 12 = 36 核
```

3. **计算比例并乘以 100 得到百分比**

```
(18 / 36) * 100 = 50%
```

✅ 结果解释

> 这表示：**所有 query-engine 容器的 CPU 使用率总和，占它们总限制的 50%**


如果你设置的 threshold: "75"，那么这个值 **不会触发扩容**，因为还没达到 75%。
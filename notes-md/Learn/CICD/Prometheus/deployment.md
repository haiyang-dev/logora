下面的config是抓取某个pod ip:port的targets, 抓取的目标在声明container时必须要有字段， 因为是从yaml读取的port信息。

```

          ports:
            - name: prometheus-exporter
              containerPort: 8889
              protocol: TCP
```

但也可以使用namespace, 会抓取所有的pod， 注意如果没有暴露指定端口的targets状态会是down

```
- job_name: 'adot-pods'
  kubernetes_sd_configs:
    - role: pod
  relabel_configs:
    # 只保留 ets-intraday-qe 命名空间的 Pod
    - source_labels: [__meta_kubernetes_namespace]
      action: keep
      regex: ets-intraday-qe

    # 设置抓取地址为 Pod IP + 8889 端口
    - source_labels: [__meta_kubernetes_pod_ip]
      target_label: __address__
      replacement: $1:8889

    # 添加标签
    - source_labels: [__meta_kubernetes_namespace]
      target_label: namespace
    - source_labels: [__meta_kubernetes_pod_name]
      target_label: pod
    - source_labels: [__meta_kubernetes_pod_container_name]
      target_label: container

```

抓取所有的adot container的8889

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'adot-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_container_port_number]
            action: keep
            regex: 8889
          - source_labels: [__meta_kubernetes_pod_ip]
            target_label: __address__
            replacement: $1:8889
```

要注意需要配置service account才能有权限list pod

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: ets-qe-reader
      containers:
        - name: prometheus
          image: prom/prometheus:latest
          args:
            - '--config.file=/etc/prometheus/prometheus.yml'
            - '--web.listen-address=:9091'
          ports:
            - containerPort: 9091
          volumeMounts:
            - name: config-volume
              mountPath: /etc/prometheus/
      volumes:
        - name: config-volume
          configMap:
            name: prometheus-config
```

可以创建个service

```
apiVersion: v1
kind: Service
metadata:
  name: prometheus-service
spec:
  selector:
    app: prometheus
  ports:
    - protocol: TCP
      port: 9091
      targetPort: 9091
  type: ClusterIP
```
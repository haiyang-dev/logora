验证external metrics，可以通过这两条命令来查看当前有哪些external metrics

```
kubectl config current-context
kubectl get --raw "/apis/external.metrics.k8s.io/v1beta1"
```

KEDA的scaledObject会自动创建一个HPA出来，

```
PS C:\Users\U6079496> kubectl get hpa -n ets-intraday-qe -o yaml
apiVersion: v1
items:
- apiVersion: autoscaling/v2
  kind: HorizontalPodAutoscaler
  metadata:
    annotations:
      kubectl.kubernetes.io/last-applied-configuration: |
        {"apiVersion":"keda.sh/v1alpha1","kind":"ScaledObject","metadata":{"annotations":{},"labels":{"app":"ets-qe"},"name":"ets-qe-scaledobject","namespace":"ets-intraday-qe"},"spec":{"advanced":{"horizontalPodAutoscalerConfig":{"behavior":{"scaleDown":{"policies":[{"periodSeconds":300,"type":"Percent","value":20},{"periodSeconds":300,"type":"Pods","value":1}],"selectPolicy":"Min","stabilizationWindowSeconds":300},"scaleUp":{"policies":[{"periodSeconds":600,"type":"Percent","value":20},{"periodSeconds":300,"type":"Pods","value":1}],"selectPolicy":"Max","stabilizationWindowSeconds":60}}},"restoreToOriginalReplicaCount":true},"maxReplicaCount":4,"minReplicaCount":2,"pollingInterval":30,"scaleTargetRef":{"apiVersion":"apps/v1","kind":"StatefulSet","name":"ets-qe"},"triggers":[{"metadata":{"metricName":"container_cpu_usage_seconds_total","query":"sum(rate(container_cpu_usage_seconds_total{container=\"query-engine\"}[1m]))/(count(container_cpu_usage_seconds_total{container=\"query-engine\"}) * 12) * 100","serverAddress":"http://prometheus-service.ets-intraday-qe.svc.cluster.local:9091","threshold":"75"},"type":"prometheus"},{"metadata":{"metricName":"task_queue_size","query":"max(task_queue_size)","serverAddress":"http://prometheus-service.ets-intraday-qe.svc.cluster.local:9091","threshold":"20"},"type":"prometheus"}]}}
    creationTimestamp: "2025-07-22T06:36:38Z"
    labels:
      app: ets-qe
      app.kubernetes.io/managed-by: keda-operator
      app.kubernetes.io/name: keda-hpa-ets-qe-scaledobject
      app.kubernetes.io/part-of: ets-qe-scaledobject
      app.kubernetes.io/version: 2.15.1
      scaledobject.keda.sh/name: ets-qe-scaledobject
    name: keda-hpa-ets-qe-scaledobject
    namespace: ets-intraday-qe
    ownerReferences:
    - apiVersion: keda.sh/v1alpha1
      blockOwnerDeletion: true
      controller: true
      kind: ScaledObject
      name: ets-qe-scaledobject
      uid: 6c9b71d5-979b-4fca-ad7a-1c97e9987ba1
    resourceVersion: "88778546"
    uid: d2136be6-a7cd-4650-862e-fffd7ca68fb2
  spec:
    behavior:
      scaleDown:
        policies:
        - periodSeconds: 300
          type: Percent
          value: 20
        - periodSeconds: 300
          type: Pods
          value: 1
        selectPolicy: Min
        stabilizationWindowSeconds: 300
      scaleUp:
        policies:
        - periodSeconds: 600
          type: Percent
          value: 20
        - periodSeconds: 300
          type: Pods
          value: 1
        selectPolicy: Max
        stabilizationWindowSeconds: 60
    maxReplicas: 4
    metrics:
    - external:
        metric:
          name: s0-prometheus
          selector:
            matchLabels:
              scaledobject.keda.sh/name: ets-qe-scaledobject
        target:
          type: Value
          value: "75"
      type: External
    - external:
        metric:
          name: s1-prometheus
          selector:
            matchLabels:
              scaledobject.keda.sh/name: ets-qe-scaledobject
        target:
          type: Value
          value: "20"
      type: External
    minReplicas: 2
    scaleTargetRef:
      apiVersion: apps/v1
      kind: StatefulSet
      name: ets-qe
  status:
    conditions:
    - lastTransitionTime: "2025-07-22T06:36:44Z"
      message: recommended size matches current size
      reason: ReadyForNewScale
      status: "True"
      type: AbleToScale
    - lastTransitionTime: "2025-07-22T06:36:44Z"
      message: 'the HPA was able to successfully calculate a replica count from external
        metric s0-prometheus(&LabelSelector{MatchLabels:map[string]string{scaledobject.keda.sh/name:
        ets-qe-scaledobject,},MatchExpressions:[]LabelSelectorRequirement{},})'
      reason: ValidMetricFound
      status: "True"
      type: ScalingActive
    - lastTransitionTime: "2025-07-22T07:11:21Z"
      message: the desired count is within the acceptable range
      reason: DesiredWithinRange
      status: "False"
      type: ScalingLimited
    currentMetrics:
    - external:
        current:
          value: 58530m
        metric:
          name: s0-prometheus
          selector:
            matchLabels:
              scaledobject.keda.sh/name: ets-qe-scaledobject
      type: External
    - external:
        current:
          value: "0"
        metric:
          name: s1-prometheus
          selector:
            matchLabels:
              scaledobject.keda.sh/name: ets-qe-scaledobject
      type: External
    currentReplicas: 2
    desiredReplicas: 2
kind: List
metadata:
  resourceVersion: ""
```

对于这段

```
metrics:
    - external:
        metric:
          name: s0-prometheus
          selector:
            matchLabels:
              scaledobject.keda.sh/name: ets-qe-scaledobject
        target:
          type: Value
          value: "75"
      type: External
```

请注意这里面的target:type, 默认是AverageValue, 意味着你的metric值在hpa里还算/replica 数量，Value就不会除了。

改成value需要在scaledobject里面使用下面的配置[https://keda.sh/docs/2.17/reference/scaledobject-spec/#scalingmodifiersmetrictype](https://keda.sh/docs/2.17/reference/scaledobject-spec/#scalingmodifiersmetrictype)

```
triggers:
  - type: prometheus
    metricType: Value
    metadata:
      serverAddress: http://prometheus-service.ets-intraday-qe.svc.cluster.local:9091
      metricName: container_cpu_usage_seconds_total
      threshold: "75"
      query: sum(rate(container_cpu_usage_seconds_total{container="query-engine"}[1m]))/(count(container_cpu_usage_seconds_total{container="query-engine"}) * 12) * 100
```
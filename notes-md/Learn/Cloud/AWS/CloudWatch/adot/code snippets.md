```
apiVersion: v1
kind: ConfigMap
metadata:
  name: adot-collector-config
  namespace: default
data:
  adot-collector-config.yaml: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: "0.0.0.0:4317"
      filelog:
        include: ["/workspaces/ets-qe/logs/${pod_name}/QELog.log*"]
        include_file_name: false
      #statsd:
      #  endpoint: "0.0.0.0:8125"
      prometheus:
        config:
          scrape_configs:
            - job_name: 'cadvisor-via-apiserver'
              scrape_interval: 60s
              scheme: https
              metrics_path: /api/v1/nodes/${HOST_NAME}/proxy/metrics/cadvisor
              static_configs:
                - targets: ['kubernetes.default.svc:443']
              bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
              tls_config:
                insecure_skip_verify: true
              metric_relabel_configs:
                - source_labels: [namespace, pod]
                  regex: ets-intraday-qe;${pod_name}
                  action: keep
                - source_labels: [container, interface]
                  regex: (query-thrift|query-engine);.*|.*;eth0
                  action: keep

    processors:
      batch:
        timeout: 1s
        send_batch_size: 50
      attributes:
        actions:
          - key: region
            value: "${region}"
            action: insert
          - key: pod_name
            value: "${pod_name}"
            action: insert
          - key: environment
            value: "${environment}"
            action: insert
          - key: id
            action: delete
          - key: image
            action: delete
          - key: name
            action: delete
          - key: pod
            action: delete

    exporters:
      awsemf/otlp:
        namespace: "a552014_ets_qe_${environment}_otlp"
        region: "${region}"
        log_group_name: "/aws/eks/a552014-ets-qe-${environment}-${short_region}/application"
        log_stream_name: "${pod_name}-metrics"
      awscloudwatchlogs:
        log_group_name: "/aws/eks/a552014-ets-qe-${environment}-${short_region}/application"
        log_stream_name: "${pod_name}"
        region: "${region}"
      prometheus:
        endpoint: "0.0.0.0:8889"
      #awsemf/statsd:
      #  namespace: "ns-ets-qe"
      #  region: "${region}"
      #  log_group_name: "/aws/eks/a552014-ets-qe-${environment}-${short_region}/application"
      #  log_stream_name: "${pod_name}-statsd"

    extensions:
      health_check:
        endpoint: "0.0.0.0:13133"

    service:
      pipelines:
        metrics/otlp:
          receivers: [otlp, prometheus]
          processors: [batch, attributes]
          exporters: [awsemf/otlp, prometheus]
        logs:
          receivers: [filelog]
          processors: [batch]
          exporters: [awscloudwatchlogs]
        #metrics/statsd:
        #  receivers: [statsd]
        #  processors: [batch, attributes]
        #  exporters: [awsemf/statsd]
      extensions: [health_check]

```

metric_relabel_configs是and的关系，不支持or, 所以想支持or需要用| 和.*

```shell
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ets-qe
  labels:
    app: ets-qe
spec:
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      partition: 0
  podManagementPolicy: Parallel
  serviceName: ets-qe-service
  selector:
    matchLabels:
      app: ets-qe
  template:
    metadata:
      labels:
        app: ets-qe
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - key: work-group
                    operator: In
                    values:
                      - ets-qe-group
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchExpressions:
                  - key: app
                    operator: In
                    values:
                      - ets-qe
              topologyKey: "kubernetes.io/hostname"

      serviceAccountName: ets-qe-reader
      initContainers:
        - name: adot-collector
          image: public.ecr.aws/aws-observability/aws-otel-collector:v0.41.1
          restartPolicy: Always
          volumeMounts:
            - name: adot-config
              mountPath: /etc/otel/config.yaml
              subPath: adot-collector-config.yaml
            - name: proc
              mountPath: /rootfs/proc
              readOnly: true
            - name: sys
              mountPath: /rootfs/sys
              readOnly: true
            - name: qe-log
              mountPath: /workspaces/ets-qe/logs
          command:
            - "/awscollector"
          args:
            - "--config=/etc/otel/config.yaml"
          resources:
            limits:
              cpu: 500m
              memory: 500Mi
            requests:
              cpu: 500m
              memory: 500Mi
          ports:
            - name: prometheus-exporter
              containerPort: 8889
              protocol: TCP
          env:
            - name: environment
              valueFrom:
                configMapKeyRef:
                  name: adot-collector-config
                  key: environment
            - name: short_region
              valueFrom:
                configMapKeyRef:
                  name: adot-collector-config
                  key: short_region
            - name: region
              valueFrom:
                configMapKeyRef:
                  name: adot-collector-config
                  key: region
            - name: pod_name
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: HOST_IP
              valueFrom:
                fieldRef:
                  fieldPath: status.hostIP
            - name: HOST_NAME
              valueFrom:
                fieldRef:
                  fieldPath: spec.nodeName
            - name: K8S_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
          startupProbe:
            httpGet:
              path: /
              port: 13133
            initialDelaySeconds: 10
            periodSeconds: 5
            successThreshold: 1
            failureThreshold: 6
            timeoutSeconds: 5
        - name: query-thrift
          restartPolicy: Always
          image: query-thrift:v-0.0.1
          lifecycle:
            preStop:
              exec:
                command: ["sh", "-c", "sleep 30"]
          imagePullPolicy: IfNotPresent
          command: ["/docker-entrypoint.sh"]
          args:
            - "/home/thrift/start_thrift.sh"
#          command: ["sleep", "186400"] #sleep, do not start thrift right now for testing.
          env:
            - name: MY_POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: MY_POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: MY_POD_IP
              valueFrom:
                fieldRef:
                  fieldPath: status.podIP
            - name: HOST_IP
              valueFrom:
                fieldRef:
                  fieldPath: status.hostIP
          envFrom:
            - configMapRef:
                name: qe-config
          resources: # the resources will be merged by overlays/{region}/{environment}/patch.yaml
            limits:
              cpu:  3500m
              memory: 16G
            requests:
              cpu: 3000m
              memory: 10G
          volumeMounts:
            - name: thrift-log
              mountPath: /home/thrift/logs
          startupProbe:
            exec:
              command:
              - sh
              - -c
              - /home/thrift/startup_check.sh
            initialDelaySeconds: 10
            periodSeconds: 5
            successThreshold: 1
            failureThreshold: 6
            timeoutSeconds: 5
      containers:
        - name: query-engine
          image: query-engine:v1.0.0
          lifecycle:
            preStop:
              exec:
                command: ["sh", "-c", "sleep 30"]
          imagePullPolicy: IfNotPresent
          command: ["/docker-entrypoint.sh"]
          args:
            - "/workspaces/ets-qe/start_qe.sh"
#          command: ["sleep", "186400"]
          env:
            - name: MY_POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: MY_POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: MY_POD_IP
              valueFrom:
                fieldRef:
                  fieldPath: status.podIP
            - name: HOST_IP
              valueFrom:
                fieldRef:
                  fieldPath: status.hostIP
          envFrom:
            - configMapRef:
                name: qe-config
          resources: # hpa need,don't move
            limits:
              cpu: 12
              memory: 96G
            requests:
              cpu: 10
              memory: 32G
          volumeMounts:
            - name: qe-log
              mountPath: /workspaces/ets-qe/logs
            - name: qe-crashdump
              mountPath: /workspaces/ets-qe/crashdumps
          readinessProbe:
            exec:
              command:
                - sh
                - -c
                - /workspaces/ets-qe/readiness_check.sh
            initialDelaySeconds: 60
            failureThreshold: 2
            successThreshold: 2
            periodSeconds: 30
            timeoutSeconds: 10
      volumes:
        - name: adot-config
          configMap:
            name: adot-collector-config
        - name: proc
          hostPath:
            path: /proc
        - name: sys
          hostPath:
            path: /sys
        - name: thrift-log
          hostPath:
            path: /home/ec2-user
  volumeClaimTemplates:
    - metadata:
        name: qe-log
        #finalizers: null
      spec:
        accessModes: [ "ReadWriteOnce" ]
        storageClassName: sc
        resources:
          requests:
            storage: 32Gi
    - metadata:
        name: qe-crashdump
        #finalizers: null
      spec:
        accessModes: [ "ReadWriteOnce" ]
        storageClassName: sc
        resources:
          requests:
            storage: 128Gi
  persistentVolumeClaimRetentionPolicy:
    #whenDeleted: Delete
    whenScaled: Delete

```
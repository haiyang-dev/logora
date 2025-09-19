configmap

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: configures
  labels:
    group: group-a
data:
  cwagentconfig.json: |
    {
      "agent": {
        "metrics_collection_interval": 10,
        "logfile": "/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log",
        "debug": false,
        "run_as_user": "root"
      },
      "metrics": {
        "namespace":"a206160-tscc-is-${environment}-${short_region}",
        "metrics_collected": {
          "statsd": {
            "metrics_aggregation_interval": 30,
            "metrics_collection_interval": 30,
            "service_address":":8125"
          }
        }
      },
      "logs": {
        "logs_collected": {
          "files": {
            "collect_list": [
              {
                "file_path": "/log_path/ingestionserver-0/tscc_is_Event_Log*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/application",
                "log_stream_name": "ingestionserver-0",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-1/tscc_is_Event_Log*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/application",
                "log_stream_name": "ingestionserver-1",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-2/tscc_is_Event_Log*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/application",
                "log_stream_name": "ingestionserver-2",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-3/tscc_is_Event_Log*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/application",
                "log_stream_name": "ingestionserver-3",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-4/tscc_is_Event_Log*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/application",
                "log_stream_name": "ingestionserver-4",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-5/tscc_is_Event_Log*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/application",
                "log_stream_name": "ingestionserver-5",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-6/tscc_is_Event_Log*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/application",
                "log_stream_name": "ingestionserver-6",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-7/tscc_is_Event_Log*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/application",
                "log_stream_name": "ingestionserver-7",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-8/tscc_is_Event_Log*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/application",
                "log_stream_name": "ingestionserver-8",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-9/tscc_is_Event_Log*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/application",
                "log_stream_name": "ingestionserver-9",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-0/tscc_is_Event_Alarm*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/alarm",
                "log_stream_name": "ingestionserver-0",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-1/tscc_is_Event_Alarm*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/alarm",
                "log_stream_name": "ingestionserver-1",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-2/tscc_is_Event_Alarm*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/alarm",
                "log_stream_name": "ingestionserver-2",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-3/tscc_is_Event_Alarm*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/alarm",
                "log_stream_name": "ingestionserver-3",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-4/tscc_is_Event_Alarm*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/alarm",
                "log_stream_name": "ingestionserver-4",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-5/tscc_is_Event_Alarm*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/alarm",
                "log_stream_name": "ingestionserver-5",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-6/tscc_is_Event_Alarm*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/alarm",
                "log_stream_name": "ingestionserver-6",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-7/tscc_is_Event_Alarm*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/alarm",
                "log_stream_name": "ingestionserver-7",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-8/tscc_is_Event_Alarm*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/alarm",
                "log_stream_name": "ingestionserver-8",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-9/tscc_is_Event_Alarm*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/alarm",
                "log_stream_name": "ingestionserver-9",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-replayperf-0/tscc_is_Event_Log*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/application",
                "log_stream_name": "tscc-is-replayperf-0",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/ingestionserver-replayperf-0/tscc_is_Event_Alarm*.qvt",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/alarm",
                "log_stream_name": "tscc-is-replayperf-0",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/healthcheck-0/healthcheck-log.log",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/application",
                "log_stream_name": "tscc-is-healthcheck-0",
                "timezone": "UTC"
              },
              {
                "file_path": "/log_path/healthcheck-0/healthcheck-alarm.log",
                "log_group_name": "/aws/eks/a206160-tscc-is-${environment}-main-${short_region}/alarm",
                "log_stream_name": "tscc-is-healthcheck-0",
                "timezone": "UTC"
              }
            ]            
          }
        },
        "log_stream_name": "tscc-is-default",
        "force_flush_interval": 10
      }
    }
```

statefulset

```
apiVersion: "apps/v1"
kind: StatefulSet
metadata:
  name: ingestionserver
  labels:
    app: ingestionserver
spec:
  podManagementPolicy: Parallel
  serviceName: tscc-is-headless
  # the replicas will be merged by overlays/{region}/{environment}/patch.yaml
  replicas: 4
  selector:
    matchLabels:
      app: ingestionserver
  template:
    metadata:
      labels:
        app: ingestionserver
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - key: work-group
                    operator: In
                    values:
                      - tsccis-group
      containers:
        - name: ingestionserver
          image: ingestionserver:R2022-24-4
          resources:
            limits:
              cpu:  48000m
              memory: 96Gi
            requests:
              cpu: 1000m
              memory: 5Gi
#          lifecycle:
#            preStop:
#              exec:
#                command: ["sh", "-c", "sleep 300"]
          imagePullPolicy: IfNotPresent
          command: ["/start.sh"]
#          command: ["sleep", "86400"]
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
            - name: MY_NODE_IP
              valueFrom:
                fieldRef:
                  fieldPath: status.hostIP
            - name: sp-eventSourceHostname
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: sp-hostingModuleID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: statsd_host
              valueFrom:
                fieldRef:
                  fieldPath: status.podIP
            - name: HOST_IP
              valueFrom:
                fieldRef:
                  fieldPath: status.hostIP
          envFrom:
            - configMapRef:
                name: ingestionserver-config
          ports:
            - name: thrift
              containerPort: 9090
          volumeMounts:
            - name: ingestionserver-log
              mountPath: /tsccis/logs
            - name: ingestionserver-crashdump
              mountPath: /tsccis/crashdumps
#          livenessProbe:
#            tcpSocket:
#              port: 9090
#            initialDelaySeconds: 30
#            failureThreshold: 4
#            periodSeconds: 60
#          readinessProbe:
#            exec:
#              command: [ "sh", "-c", "/data/ThomsonReuters/quantum_framework/bin/SnapshotServiceClient -s ${MY_POD_IP}:8443 -t healthcheck"]
#            initialDelaySeconds: 30
#            failureThreshold: 3
#            periodSeconds: 120
        - name: cloudwatch-agent
          image: cloudwatch-agent
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8125
              protocol: UDP
          resources:
            limits:
              cpu:  100m
              memory: 400Mi
            requests:
              cpu: 100m
              memory: 400Mi
          env:
            - name: environment
              valueFrom:
                configMapKeyRef:
                  name: configures
                  key: environment
            - name: short_region
              valueFrom:
                configMapKeyRef:
                  name: configures
                  key: short_region
          volumeMounts:
            - name: cwagentconfig
              mountPath: /etc/cwagentconfig # Please don't change the mountPath
            - name: ingestionserver-log
              mountPath: /log_path
      volumes:
        - name: cwagentconfig
          configMap:
            name: configures
  volumeClaimTemplates:
    - metadata:
        name: ingestionserver-log
      spec:
        accessModes: [ "ReadWriteOnce" ]
        storageClassName: sc
        resources:
          requests:
            storage: 60Gi
    - metadata:
        name: ingestionserver-crashdump
      spec:
        accessModes: [ "ReadWriteOnce" ]
        storageClassName: sc
        resources:
          requests:
            storage: 100Gi
```

注意             - name: ingestionserver-log  挂zai

              mountPath: /log_path
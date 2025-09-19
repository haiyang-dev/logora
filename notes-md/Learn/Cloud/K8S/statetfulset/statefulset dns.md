Kubernetes provides Stable Network IDs for all components of StatefulSet

Consider following example:

```
kind: Namespace
apiVersion: v1
metadata:
  name: mynamespace
---
apiVersion: v1
kind: Service
metadata:
  name: myservice
  namespace: mynamespace
  labels:
    app: myapp
spec:
  ports:
    - port: 80
      name: http
  type: ClusterIP
  selector:
    app: myapp
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: myapp
  namespace: mynamespace
spec:
  serviceName: myservice
  replicas: 2
  selector:
    matchLabels:
      app: myapp
  # ...
---
apiVersion: v1
kind: Service
metadata:
  name: ingestionserver-replay-headless
  labels:
    app: ingestionserver-replay-service
spec:
  selector:
    app: ingestionserver-replay
  ports:
    - name: thrift
      port: 9090
  clusterIP: None
```

Then you'll have following resolvable DNS entries within the k8s cluster:

- myservice.mynamespace.svc.cluster.local for loadbalanced access to one of myapp pods through the myservice

- **or myservice.mynamespace**

- myapp-0.myservice.mynamespace.svc.cluster.local for direct access to Pod 0 of myapp StatetefulSet

- myapp-1.myservice.mynamespace.svc.cluster.local for direct access to Pod 1 of myapp StatetefulSet

Documentation: [https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id)

eg:

ingestionserver-replay-0.ingestionserver-replay-headless.default.svc.cluster.local

create service need service account in a pod

```
apiVersion: v1
kind: ServiceAccount
metadata:
  name: tsccis-auxiliary-data-reloader-account
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: kubectl-role
rules:
  # kubectl api-resources -o wide
  - apiGroups: ["apps"]
    resources: ["daemonsets", "deployments", "replicasets", "statefulsets", "statefulsets/status", "statefulsets/scale",]
    verbs: ["create", "delete", "deletecollection", "get", "list", "patch", "update", "watch"]
  - apiGroups: [""]
    resources: ["pods", "pods/exec", "pods/log", "configmaps","statefulsets","nodes", "services"]
    verbs: ["create", "delete", "deletecollection", "get", "list", "patch", "update", "watch"]
  - apiGroups: ["batch"]
    resources: ["cronjobs", "jobs"]
    verbs: ["create", "get", "list", "patch", "update", "watch"]
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: kubectl-rolebinding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: kubectl-role
subjects:
  - kind: ServiceAccount
    name: tsccis-auxiliary-data-reloader-account
    namespace: default
```
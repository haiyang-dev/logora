kubernetes之StatefulSet详解

![](images/37AC5598E3B44923B98C542A9648E8344961_middle.jpeg)

Flywithmeto关注0人评论134188人阅读2018-07-10 19:25:21

概述

RC、Deployment、DaemonSet都是面向无状态的服务，它们所管理的Pod的IP、名字，启停顺序等都是随机的，而StatefulSet是什么？顾名思义，有状态的集合，管理所有有状态的服务，比如MySQL、MongoDB集群等。

StatefulSet本质上是Deployment的一种变体，在v1.9版本中已成为GA版本，它为了解决有状态服务的问题，它所管理的Pod拥有固定的Pod名称，启停顺序，在StatefulSet中，Pod名字称为网络标识(hostname)，还必须要用到共享存储。

在Deployment中，与之对应的服务是service，而在StatefulSet中与之对应的headless service，headless service，即无头服务，与service的区别就是它没有Cluster IP，解析它的名称时将返回该Headless Service对应的全部Pod的Endpoint列表。

除此之外，StatefulSet在Headless Service的基础上又为StatefulSet控制的每个Pod副本创建了一个DNS域名，这个域名的格式为：

$(podname).(headless server name)   
FQDN： $(podname).(headless server name).namespace.svc.cluster.local

StatefulSet示例

接下来看一些示例，演示下上面所说的特性，以加深理解。

apiVersion: v1
kind: Service
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  ports:
  - port: 80
    name: web
  clusterIP: None
  selector:
    app: nginx
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  selector:
    matchLabels:
      app: nginx # has to match .spec.template.metadata.labels
  serviceName: "nginx"  #声明它属于哪个Headless Service.
  replicas: 3 # by default is 1
  template:
    metadata:
      labels:
        app: nginx # has to match .spec.selector.matchLabels
    spec:
      terminationGracePeriodSeconds: 10
      containers:
      - name: nginx
        image: k8s.gcr.io/nginx-slim:0.8
        ports:
        - containerPort: 80
          name: web
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates:   #可看作pvc的模板
  - metadata:
      name: www
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: "gluster-heketi"  #存储类名，改为集群中已存在的
      resources:
        requests:
          storage: 1Gi


通过该配置文件，可看出StatefulSet的三个组成部分：

- Headless Service：名为nginx，用来定义Pod网络标识( DNS domain)。

- StatefulSet：定义具体应用，名为Nginx，有三个Pod副本，并为每个Pod定义了一个域名。

- volumeClaimTemplates： 存储卷申请模板，创建PVC，指定pvc名称大小，将自动创建pvc，且pvc必须由存储类供应。

为什么需要 headless service 无头服务？

在用Deployment时，每一个Pod名称是没有顺序的，是随机字符串，因此是Pod名称是无序的，但是在statefulset中要求必须是有序 ，每一个pod不能被随意取代，pod重建后pod名称还是一样的。而pod IP是变化的，所以是以Pod名称来识别。pod名称是pod唯一性的标识符，必须持久稳定有效。这时候要用到无头服务，它可以给每个Pod一个唯一的名称 。

为什么需要volumeClaimTemplate？

对于有状态的副本集都会用到持久存储，对于分布式系统来讲，它的最大特点是数据是不一样的，所以各个节点不能使用同一存储卷，每个节点有自已的专用存储，但是如果在Deployment中的Pod template里定义的存储卷，是所有副本集共用一个存储卷，数据是相同的，因为是基于模板来的 ，而statefulset中每个Pod都要自已的专有存储卷，所以statefulset的存储卷就不能再用Pod模板来创建了，于是statefulSet使用volumeClaimTemplate，称为卷申请模板，它会为每个Pod生成不同的pvc，并绑定pv， 从而实现各pod有专用存储。这就是为什么要用volumeClaimTemplate的原因。

---

---

创建：

$ kubectl create -f nginx.yaml 
service "nginx" created
statefulset "web" created

看下这三个Pod创建过程：

#第一个是创建web-0
$ kubectl get pod
web-0                     1/1       ContainerCreating   0          51s

#待web-0 running且ready时，创建web-1
$ kubectl get pod
web-0                     1/1       Running             0          51s
web-1                     0/1       ContainerCreating   0          42s

#待web-1 running且ready时，创建web-2
$ kubectl get pod
web-0                     1/1       Running             0          1m
web-1                     1/1       Running             0          45s
web-2                     1/1       ContainerCreating   0          36s

#最后三个Pod全部running且ready
$ kubectl get pod
NAME                      READY     STATUS    RESTARTS   AGE
web-0                     1/1       Running   0          4m
web-1                     1/1       Running   0          3m
web-2                     1/1       Running   0          1m

根据volumeClaimTemplates自动创建的PVC

$ kubectl get pvc
NAME              STATUS    VOLUME                                  CAPACITY   ACCESS MODES   STORAGECLASS     AGE
www-web-0         Bound     pvc-ecf003f3-828d-11e8-8815-000c29774d39   2G        RWO          gluster-heketi   7m
www-web-1         Bound     pvc-0615e33e-828e-11e8-8815-000c29774d39   2G        RWO          gluster-heketi   6m
www-web-2         Bound     pvc-43a97acf-828e-11e8-8815-000c29774d39   2G        RWO          gluster-heketi   4m

如果集群中没有StorageClass的动态供应PVC的机制，也可以提前手动创建多个PV、PVC，手动创建的PVC名称必须符合之后创建的StatefulSet命名规则：(volumeClaimTemplates.name)-(pod_name)

Statefulset名称为web 三个Pod副本: web-0，web-1,web-2，volumeClaimTemplates名称为：www，那么自动创建出来的PVC名称为www-web[0-2]，为每个Pod创建一个PVC。

规律总结：

- 匹配Pod name(网络标识)的模式为：$(statefulset名称)-$(序号)，比如上面的示例：web-0，web-1，web-2。

- StatefulSet为每个Pod副本创建了一个DNS域名，这个域名的格式为： $(podname).(headless server name)，也就意味着服务间是通过Pod域名来通信而非Pod IP，因为当Pod所在Node发生故障时，Pod会被飘移到其它Node上，Pod IP会发生变化，但是Pod域名不会有变化。

- StatefulSet使用Headless服务来控制Pod的域名，这个域名的FQDN为：$(service name).$(namespace).svc.cluster.local，其中，“cluster.local”指的是集群的域名。

- 根据volumeClaimTemplates，为每个Pod创建一个pvc，pvc的命名规则匹配模式：(volumeClaimTemplates.name)-(pod_name)，比如上面的volumeMounts.name=www， Pod name=web-[0-2]，因此创建出来的PVC是www-web-0、www-web-1、www-web-2。

- 删除Pod不会删除其pvc，手动删除pvc将自动释放pv。

关于Cluster Domain、headless service名称、StatefulSet 名称如何影响StatefulSet的Pod的DNS域名的示例：

| Cluster Domain | Service (ns/name) | StatefulSet (ns/name) | StatefulSet Domain | Pod DNS | Pod Hostname |
| - | - | - | - | - | - |
| cluster.local | default/nginx | default/web | nginx.default.svc.cluster.local | web-{0..N-1}.nginx.default.svc.cluster.local | web-{0..N-1} |
| cluster.local | foo/nginx | foo/web | nginx.foo.svc.cluster.local | web-{0..N-1}.nginx.foo.svc.cluster.local | web-{0..N-1} |
| kube.local | foo/nginx | foo/web | nginx.foo.svc.kube.local | web-{0..N-1}.nginx.foo.svc.kube.local | web-{0..N-1} |


Statefulset的启停顺序：

- 有序部署：部署StatefulSet时，如果有多个Pod副本，它们会被顺序地创建（从0到N-1）并且，在下一个Pod运行之前所有之前的Pod必须都是Running和Ready状态。

- 有序删除：当Pod被删除时，它们被终止的顺序是从N-1到0。

- 有序扩展：当对Pod执行扩展操作时，与部署一样，它前面的Pod必须都处于Running和Ready状态。　

Statefulset Pod管理策略：

在v1.7以后，通过允许修改Pod排序策略，同时通过.spec.podManagementPolicy字段确保其身份的唯一性。

- OrderedReady：上述的启停顺序，默认设置。

- Parallel：告诉StatefulSet控制器并行启动或终止所有Pod，并且在启动或终止另一个Pod之前不等待前一个Pod变为Running and Ready或完全终止。

StatefulSet使用场景：

- 稳定的持久化存储，即Pod重新调度后还是能访问到相同的持久化数据，基于PVC来实现。

- 稳定的网络标识符，即Pod重新调度后其PodName和HostName不变。

- 有序部署，有序扩展，基于init containers来实现。

- 有序收缩。

更新策略

在Kubernetes 1.7及更高版本中，通过.spec.updateStrategy字段允许配置或禁用Pod、labels、source request/limits、annotations自动滚动更新功能。

OnDelete：通过.spec.updateStrategy.type 字段设置为OnDelete，StatefulSet控制器不会自动更新StatefulSet中的Pod。用户必须手动删除Pod，以使控制器创建新的Pod。

RollingUpdate：通过.spec.updateStrategy.type 字段设置为RollingUpdate，实现了Pod的自动滚动更新，如果.spec.updateStrategy未指定，则此为默认策略。

StatefulSet控制器将删除并重新创建StatefulSet中的每个Pod。它将以Pod终止（从最大序数到最小序数）的顺序进行，一次更新每个Pod。在更新下一个Pod之前，必须等待这个Pod Running and Ready。

Partitions：通过指定 .spec.updateStrategy.rollingUpdate.partition 来对 RollingUpdate 更新策略进行分区，如果指定了分区，则当 StatefulSet 的 .spec.template 更新时，具有大于或等于分区序数的所有 Pod 将被更新。

具有小于分区的序数的所有 Pod 将不会被更新，即使删除它们也将被重新创建。如果 StatefulSet 的 .spec.updateStrategy.rollingUpdate.partition 大于其 .spec.replicas，则其 .spec.template 的更新将不会传播到 Pod。在大多数情况下，不需要使用分区。
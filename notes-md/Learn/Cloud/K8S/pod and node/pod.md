Kubernetes 之Pod学习

 

一、什么是Pod

kubernetes中的一切都可以理解为是一种资源对象，pod，rc，service，都可以理解是 一种资源对象。pod的组成示意图如下，由一个叫”pause“的根容器，加上一个或多个用户自定义的容器构造。pause的状态带便了这一组容器的状态，pod里多个业务容器共享pod的Ip和数据卷。在kubernetes环境下，pod是容器的载体，所有的容器都是在pod中被管理，一个或多个容器放在pod里作为一个单元方便管理。

pod是kubernetes可以部署和管理的最小单元，如果想要运行一个容器，先要为这个容器创建一个pod。同时一个pod也可以包含多个容器，之所以多个容器包含在一个pod里，往往是由于业务上的紧密耦合。【需要注意】这里说的场景都非必须把不同的容器放在同一个pod里，但是这样往往更便于管理，甚至后面会讲到的，紧密耦合的业务容器放置在同一个容器里通信效率更高。具体怎么使用还要看实际情况,综合权衡。

在Kubrenetes集群中Pod有如下两种使用方式：

a）一个Pod中运行一个容器。这是最常见用法。在这种方式中，你可以把Pod想象成是单个容器的封装，kuberentes管理的是Pod而不是直接管理容器。

b）在一个Pod中同时运行多个容器。当多个应用之间是紧耦合的关系时，可以将多个应用一起放在一个Pod中，同个Pod中的多个容器之间互相访问可以通过localhost来通信（可以把Pod理解成一个虚拟机，共享网络和存储卷）。也就是说一个Pod中也可以同时封装几个需要紧密耦合互相协作的容器，它们之间共享资源。这些在同一个Pod中的容器可以互相协作成为一个service单位 (即一个容器共享文件），另一个“sidecar”容器来更新这些文件。Pod将这些容器的存储资源作为一个实体来管理。

就像每个应用容器，pod被认为是临时实体。在Pod的生命周期中，pod被创建后，被分配一个唯一的ID（UID），调度到节点上，并一致维持期望的状态直到被终结（根据重启策略）或者被删除。如果node死掉了，分配到了这个node上的pod，在经过一个超时时间后会被重新调度到其他node节点上。一个给定的pod（如UID定义的）不会被“重新调度”到新的节点上，而是被一个同样的pod取代，如果期望的话甚至可以是相同的名字，但是会有一个新的UID（查看replication controller获取详情）。

kubernetes为什么使用pod作为最小单元，而不是container

直接部署一个容器看起来更简单，但是这里也有更好的原因为什么在容器基础上抽象一层呢？根本原因是为了管理容器，kubernetes需要更多的信息，比如重启策略，它定义了容器终止后要采取的策略;或者是一个可用性探针，从应用程序的角度去探测是否一个进程还存活着。基于这些原因，kubernetes架构师决定使用一个新的实体，也就是pod，而不是重载容器的信息添加更多属性，用来在逻辑上包装一个或者多个容器的管理所需要的信息。

kubernetes为什么允许一个pod里有多个容器

pod里的容器运行在一个逻辑上的"主机"上，它们使用相同的网络名称空间 (即同一pod里的容器使用相同的ip和相同的端口段区间) 和相同的IPC名称空间。它们也可以共享存储卷。这些特性使它们可以更有效的通信，并且pod可以使你把紧密耦合的应用容器作为一个单元来管理。也就是说当多个应用之间是紧耦合关系时，可以将多个应用一起放在一个Pod中，同个Pod中的多个容器之间互相访问可以通过localhost来通信（可以把Pod理解成一个虚拟机，共享网络和存储卷）。

因此当一个应用如果需要多个运行在同一主机上的容器时，为什么不把它们放在同一个容器里呢?首先，这样何故违反了一个容器只负责一个应用的原则。这点非常重要，如果我们把多个应用放在同一个容器里，这将使解决问题变得非常麻烦，因为它们的日志记录混合在了一起，并且它们的生命周期也很难管理。因此一个应用使用多个容器将更简单，更透明，并且使应用依赖解偶。并且粒度更小的容器更便于不同的开发团队共享和复用。

【需要注意】这里说到为了解偶把应用分别放在不同容器里，前面我们也强调为了便于管理管紧耦合的应用把它们的容器放在同一个pod里。一会强调耦合，一个强调解偶看似矛盾，实际上普遍存在，高内聚低耦合是我们的追求，然而一个应用的业务逻辑模块不可能完全完独立不存在耦合，这就需要我们从实际上来考量，做出决策。

因为，虽然可以使用一个pod来承载一个多层应用，但是更建议使用不同的pod来承载不同的层，因这这样你可以为每一个层单独扩容并且把它们分布到集群的不同节点上。

Pod中如何管理多个容器

Pod中可以同时运行多个进程（作为容器运行）协同工作，同一个Pod中的容器会自动的分配到同一个 node 上，同一个Pod中的容器共享资源、网络环境和依赖，它们总是被同时调度。需要注意：一个Pod中同时运行多个容器是一种比较高级的用法。只有当你的容器需要紧密配合协作的时候才考虑用这种模式。

Pod中共享的环境包括Linux的namespace，cgroup和其他可能的隔绝环境，这一点跟Docker容器一致。在Pod的环境中，每个容器中可能还有更小的子隔离环境。Pod中的容器共享IP地址和端口号，它们之间可以通过localhost互相发现。它们之间可以通过进程间通信，需要明白的是同一个Pod下的容器是通过lo网卡进行通信。例如SystemV信号或者POSIX共享内存。不同Pod之间的容器具有不同的IP地址，不能直接通过IPC通信。Pod中的容器也有访问共享volume的权限，这些volume会被定义成pod的一部分并挂载到应用容器的文件系统中。

总而言之。Pod中可以共享两种资源：网络 和 存储

1. 网络：每个Pod都会被分配一个唯一的IP地址。Pod中的所有容器共享网络空间，包括IP地址和端口。Pod内部的容器可以使用localhost互相通信。Pod中的容器与外界通信时，必须分配共享网络资源（例如使用宿主机的端口映射）。

2. 存储：可以Pod指定多个共享的Volume。Pod中的所有容器都可以访问共享的volume。Volume也可以用来持久化Pod中的存储资源，以防容器重启后文件丢失。

容器的依赖关系和启动顺序

当前,同一个pod里的所有容器都是并行启动并且没有办法确定哪一个容器必须早于哪一个容器启动。如果要想确保第一个容器早于第二个容器启动，那么就要使用到"init container"了。

同一pod的容器间网络通信

同一pod下的容器使用相同的网络名称空间,这就意味着他们可以通过"localhost"来进行通信,它们共享同一个Ip和相同的端口空间。

同一个pod暴露多个容器

通常pod里的容器监听不同的端口,想要被外部访问都需要暴露出去.你可以通过在一个服务里暴露多个端口或者使用不同的服务来暴露不同的端口来实现。

Pod的yaml格式定义配置文件说明

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41<br>42<br>43<br>44<br>45<br>46<br>47<br>48<br>49<br>50<br>51<br>52<br>53<br>54<br>55<br>56<br>57<br>58<br>59<br>60<br>61<br>62<br>63<br>64<br>65<br>66<br>67<br>68<br>69<br>70<br>71<br>72<br>73<br>74<br>75<br>76<br>77<br>78<br>79 | apiVersion: v1    　　　　　　\# 必选，版本号<br>kind: Pod         　　　　　　\# 必选，Pod<br>metadata:         　　　　　　\# 必选，元数据<br>  name: String    　　　　　　\# 必选，Pod名称<br>  namespace: String    　　　 \# 必选，Pod所属的命名空间<br>  labels:            　　　　 \# 自定义标签，Map格式<br>    Key: Value    　　　　　　\# 键值对<br>  annotations:    　　　　　　\# 自定义注解<br>    Key: Value    　　　　　  \# 键值对<br>spec:            　　　　　　 \# 必选，Pod中容器的详细属性<br>  containers:        　　　　 \# 必选，Pod中容器列表<br>  - name: String   　　　　   \# 必选，容器名称<br>    image: String    　　　　 \# 必选，容器的镜像地址和名称<br>    imagePullPolicy: {Always | Never | IfNotPresent}   <br> 　　　　                     \# 获取镜像的策略，Always表示下载镜像，IfnotPresent 表示优先使用本地镜像，否则下载镜像，Never表示仅使用本地镜像。<br>    command: [String]         \# 容器的启动命令列表(覆盖)，如不指定，使用打包镜像时的启动命令。<br>    args: [String]            \# 容器的启动命令参数列表<br>    workingDir: String        \# 容器的工作目录<br>    volumeMounts:             \# 挂载到容器内部的存储卷配置<br>    - name: String            \# 引用Pod定义的共享存储卷的名，需用Pod.spec.volumes[]部分定义的卷名<br>      mountPath: String       \# 存储卷在容器内Mount的绝对路径，应少于512字符<br>      readOnly: boolean       \# 是否为只读模式<br>  ports:                      \# 容器需要暴露的端口库号列表<br>  - name: String              \# 端口号名称<br>    containerPort: Int        \# 容器需要监听的端口号<br>    hostPort: Int             \# 可选，容器所在主机需要监听的端口号，默认与Container相同<br>  env:                        \# 容器运行前需设置的环境变量列表<br>  - name: String              \# 环境变量名称<br>    value: String             \# 环境变量的值<br>  resources:                  \# 资源限制和请求的设置<br>    limits:                   \# 资源限制的设置<br>      cpu: String             \# Cpu的限制，单位为Core数，将用于docker run --cpu-shares参数，如果整数后跟m，表示占用权重，1Core=1000m<br>      memory: String          \# 内存限制，单位可以为Mib/Gib，将用于docker run --memory参数<br>    requests:                 \# 资源请求的设置<br>      cpu: string             \# CPU请求，容器启动的初始可用数量<br>      memory: string          \# 内存请求，容器启动的初始可用数量<br>  livenessProbe:   <br> 　　　　           \# 对Pod内容器健康检查设置，当探测无响应几次后将自动重启该容器，检查方法有exec、httpGet和tcpSocket，对一个容器只需设置其中一种方法即可。<br>    exec:                     \# 对Pod容器内检查方式设置为exec方式<br>      command: [String]       \# exec方式需要制定的命令或脚本<br>    httpGet:                  \# 对Pod容器内检查方式设置为HttpGet方式，需要指定path、port<br>      path: String            \# 网址URL路径（去除对应的域名或IP地址的部分）<br>      port: Int               \# 对应端口<br>      host: String            \# 域名或IP地址<br>      schema: String          \# 对应的检测协议，如http<br>      HttpHeaders:            \# 指定报文头部信息<br>      - name: String<br>        value: String<br>    tcpSocket:                \# 对Pod容器内检查方式设置为tcpSocket方式<br>      port: Int<br>    initialDelaySeconds: Int  \# 容器启动完成后首次探测的时间，单位为秒<br>    timeoutSeconds: Int       \# 对容器健康检查探测等待响应的超时时间，单位为秒，默认为1秒<br>    periodSeconds: Int        \# 对容器监控检查的定期探测时间设置，单位为秒，默认10秒一次<br>    successThreshold: Int     \# 探测几次成功后认为成功<br>    failureThreshold: Int     \# 探测几次失败后认为失败<br>    securityContext:<br>      privileged: false<br>  restartPolicy: {Always | Never | OnFailure} <br> 　　　　           \# Pod的重启策略，Always表示一旦不管以何种方式终止运行，kubelet都将重启，OnFailure表示只有Pod以非0退出码才重启，Nerver表示不再重启该Pod<br>  nodeSelector:              \# 设置NodeSelector表示将该Pod调度到包含这个label的node上，以Key:Value的格式指定<br>    Key: Value               \# 调度到指定的标签Node上<br>  imagePullSecrets:          \# Pull镜像时使用的secret名称，以Key:SecretKey格式指定<br>  - name: String<br>  hostNetwork: false         \# 是否使用主机网络模式，默认为false，如果设置为true，表示使用宿主机网络<br>  volumes:                   \# 在该Pod上定义共享存储卷列表<br>  - name: String             \# 共享存储卷名称（Volumes类型有多种）<br>    emptyDir: { }            \# 类型为emptyDir的存储卷，与Pod同生命周期的一个临时目录，为空值<br>    hostPath: String         \# 类型为hostPath的存储卷，表示挂载Pod所在宿主机的目录<br>    path: String             \# Pod所在宿主机的目录，将被用于同期中Mount的目录<br>  secret:                    \# 类型为Secret的存储卷，挂载集群与定义的Secret对象到容器内部<br>    secretname: String<br>    items:                   \# 当仅需挂载一个Secret对象中的指定Key时使用<br>    - key: String<br>     path: String<br>  configMap:                 \# 类型为ConfigMap的存储卷，挂载预定义的ConfigMap对象到容器内部<br>    name: String<br>    items:                   \# 当仅需挂载一个ConfigMap对象中的指定Key时使用<br>    - key: String<br>      path: String |


# kubectl get pod podname -n namespace -o wide       # 查看pod分布在哪些node节点上

# kubectl get pod podname -n namespace -o yaml       # 查看pod的yml配置情况

二、如何使用Pod

通常把Pod分为两类：

-  自主式Pod ：这种Pod本身是不能自我修复的，当Pod被创建后（不论是由你直接创建还是被其他Controller），都会被Kuberentes调度到集群的Node上。直到Pod的进程终止、被删掉、因为缺少资源而被驱逐、或者Node故障之前这个Pod都会一直保持在那个Node上。Pod不会自愈。如果Pod运行的Node故障，或者是调度器本身故障，这个Pod就会被删除。同样的，如果Pod所在Node缺少资源或者Pod处于维护状态，Pod也会被驱逐。

-  控制器管理的Pod：Kubernetes使用更高级的称为Controller的抽象层，来管理Pod实例。Controller可以创建和管理多个Pod，提供副本管理、滚动升级和集群级别的自愈能力。例如，如果一个Node故障，Controller就能自动将该节点上的Pod调度到其他健康的Node上。虽然可以直接使用Pod，但是在Kubernetes中通常是使用Controller来管理Pod的。如下图：

每个Pod都有一个特殊的被称为"根容器"的Pause 容器。 Pause容器对应的镜像属于Kubernetes平台的一部分，除了Pause容器，每个Pod还包含一个或者多个紧密相关的用户业务容器。

![](images/3AFB8FD9578A4840A87D252DBFAE2BAD5-1338384811.png)

Kubernetes设计这样的Pod概念和特殊组成结构有什么用意呢？

原因一：在一组容器作为一个单元的情况下，难以对整体的容器简单地进行判断及有效地进行行动。比如一个容器死亡了，此时是算整体挂了么？那么引入与业务无关的Pause容器作为Pod的根容器，以它的状态代表着整个容器组的状态，这样就可以解决该问题。

原因二：Pod里的多个业务容器共享Pause容器的IP，共享Pause容器挂载的Volume，这样简化了业务容器之间的通信问题，也解决了容器之间的文件共享问题。

1. Pod的持久性和终止

-  Pod的持久性

Pod在设计上就不是作为持久化实体的。在调度失败、节点故障、缺少资源或者节点维护的状态下都会死掉会被驱逐。通常，用户不需要手动直接创建Pod，而是应该使用controller（例如Deployments），即使是在创建单个Pod的情况下。Controller可以提供集群级别的自愈功能、复制和升级管理。

-  Pod的终止

因为Pod作为在集群的节点上运行的进程，所以在不再需要的时候能够优雅的终止掉是十分必要的（比起使用发送KILL信号这种暴力的方式）。用户需要能够放松删除请求，并且知道它们何时会被终止，是否被正确的删除。用户想终止程序时发送删除pod的请求，在pod可以被强制删除前会有一个宽限期，会发送一个TERM请求到每个容器的主进程。一旦超时，将向主进程发送KILL信号并从API server中删除。如果kubelet或者container manager在等待进程终止的过程中重启，在重启后仍然会重试完整的宽限期。

示例流程如下：

-  用户发送删除pod的命令，默认宽限期是30秒；

-  在Pod超过该宽限期后API server就会更新Pod的状态为"dead"；

-  在客户端命令行上显示的Pod状态为"terminating"；

-  跟第三步同时，当kubelet发现pod被标记为"terminating"状态时，开始停止pod进程：

1. 如果在pod中定义了preStop hook，在停止pod前会被调用。如果在宽限期过后，preStop hook依然在运行，第二步会再增加2秒的宽限期；

2. 向Pod中的进程发送TERM信号；

- 跟第三步同时，该Pod将从该service的端点列表中删除，不再是replication controller的一部分。关闭的慢的pod将继续处理load balancer转发的流量；

- 过了宽限期后，将向Pod中依然运行的进程发送SIGKILL信号而杀掉进程。

- Kublete会在API server中完成Pod的的删除，通过将优雅周期设置为0（立即删除）。Pod在API中消失，并且在客户端也不可见。

删除宽限期默认是30秒。 kubectl delete命令支持 --grace-period=<seconds> 选项，允许用户设置自己的宽限期。如果设置为0将强制删除pod。在kubectl>=1.5版本的命令中，你必须同时使用 --force 和 --grace-period=0 来强制删除pod。

Pod的强制删除是通过在集群和etcd中将其定义为删除状态。当执行强制删除命令时，API server不会等待该pod所运行在节点上的kubelet确认，就会立即将该pod从API server中移除，这时就可以创建跟原pod同名的pod了。这时，在节点上的pod会被立即设置为terminating状态，不过在被强制删除之前依然有一小段优雅删除周期。【需要注意：如果删除一个pod后，再次查看发现pod还在，这是因为在deployment.yaml文件中定义了副本数量！还需要删除deployment才行。即："kubectl delete pod pod-name -n namespace" && "kubectl delete deployment deployment-name -n namespace"】

2.  Pause容器

Pause容器，又叫Infra容器。我们检查node节点的时候会发现每个node节点上都运行了很多的pause容器，例如如下:

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7 | [root@k8s-node01 ~]\# docker ps |grep pause<br>0cbf85d4af9e    k8s.gcr.io/pause:3.1   "/pause"     7 days ago  Up 7 days   k8s\_POD\_myapp-848b5b879b-ksgnv\_default\_0af41a40-a771-11e8-84d2-000c2972dc1f\_0<br>d6e4d77960a7    k8s.gcr.io/pause:3.1   "/pause"     7 days ago  Up 7 days   k8s\_POD\_myapp-848b5b879b-5f69p\_default\_09bc0ba1-a771-11e8-84d2-000c2972dc1f\_0<br>5f7777c55d2a    k8s.gcr.io/pause:3.1   "/pause"     7 days ago  Up 7 days   k8s\_POD\_kube-flannel-ds-pgpr7\_kube-system\_23dc27e3-a5af-11e8-84d2-000c2972dc1f\_1<br>8e56ef2564c2    k8s.gcr.io/pause:3.1   "/pause"     7 days ago  Up 7 days   k8s\_POD\_client2\_default\_17dad486-a769-11e8-84d2-000c2972dc1f\_1<br>7815c0d69e99    k8s.gcr.io/pause:3.1   "/pause"     7 days ago  Up 7 days   k8s\_POD\_nginx-deploy-5b595999-872c7\_default\_7e9df9f3-a6b6-11e8-84d2-000c2972dc1f\_2<br>b4e806fa7083    k8s.gcr.io/pause:3.1   "/pause"     7 days ago  Up 7 days   k8s\_POD\_kube-proxy-vxckf\_kube-system\_23dc0141-a5af-11e8-84d2-000c2972dc1f\_2 |


kubernetes中的pause容器主要为每个业务容器提供以下功能：

-  在pod中担任Linux命名空间共享的基础；

-  启用pid命名空间，开启init进程；

![](images/DBE952C5C5744B0784358A666097860358-339829150.png)

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26 | 示例如下：<br>[root@k8s-node01 ~]\# docker run -d --name pause -p 8880:80 k8s.gcr.io/pause:3.1<br> <br>[root@k8s-node01 ~]\# docker run -d --name nginx -v `pwd`/nginx.conf:/etc/nginx/nginx.conf --net=container:pause --ipc=container:pause --pid=container:pause nginx<br> <br>[root@k8s-node01 ~]\#  docker run -d --name ghost --net=container:pause --ipc=container:pause --pid=container:pause ghost<br> <br>现在访问http://\*\*\*\*:8880/就可以看到ghost博客的界面了。<br> <br>解析说明：<br>pause容器将内部的80端口映射到宿主机的8880端口，pause容器在宿主机上设置好了网络namespace后，nginx容器加入到该网络namespace中，我们看到nginx容器启动的时候指定了<br>--net=container:pause，ghost容器同样加入到了该网络namespace中，这样三个容器就共享了网络，互相之间就可以使用localhost直接通信，<br>--ipc=contianer:pause --pid=container:pause就是三个容器处于同一个namespace中，init进程为pause<br> <br>这时我们进入到ghost容器中查看进程情况。<br>[root@k8s-node01 ~]\# docker exec -it ghost /bin/bash<br>root@d3057ceb54bc:/var/lib/ghost\# ps axu<br>USER        PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND<br>root          1  0.0  0.0   1012     4 ?        Ss   03:48   0:00 /pause<br>root          6  0.0  0.0  32472   780 ?        Ss   03:53   0:00 nginx: master process nginx -g daemon off;<br>systemd+     11  0.0  0.1  32932  1700 ?        S    03:53   0:00 nginx: worker process<br>node         12  0.4  7.5 1259816 74868 ?       Ssl  04:00   0:07 node current/index.js<br>root         77  0.6  0.1  20240  1896 pts/0    Ss   04:29   0:00 /bin/bash<br>root         82  0.0  0.1  17496  1156 pts/0    R+   04:29   0:00 ps axu<br> <br>在ghost容器中同时可以看到pause和nginx容器的进程，并且pause容器的PID是1。而在kubernetes中容器的PID=1的进程即为容器本身的业务进程。 |


3.  Init容器

Pod 能够具有多个容器，应用运行在容器里面，但是它也可能有一个或多个先于应用容器启动的 Init 容器。init容器是一种专用的容器，在应用容器启动之前运行，可以包含普通容器映像中不存在的应用程序或安装脚本。init容器会优先启动，待里面的任务完成后容器就会退出。    init容器配置示例如下:

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29 | apiVersion: v1<br>kind: Pod<br>metadata:<br>  name: init-demo<br>spec:<br>  containers:<br>  - name: nginx<br>    image: nginx<br>    ports:<br>    - containerPort: 80<br>    volumeMounts:<br>    - name: workdir<br>      mountPath: /usr/share/nginx/html<br>  \# These containers are run during pod initialization<br>  initContainers:<br>  - name: install<br>    image: busybox<br>    command:<br>    - wget<br>    - "-O"<br>    - "/work-dir/index.html"<br>    - http://kubernetes.io<br>    volumeMounts:<br>    - name: workdir<br>      mountPath: "/work-dir"<br>  dnsPolicy: Default<br>  volumes:<br>  - name: workdir<br>    emptyDir: {} |


1.  理解init容器

- 它们总是运行到完成。

- 每个都必须在下一个启动之前成功完成。

- 如果 Pod 的 Init 容器失败，Kubernetes 会不断地重启该 Pod，直到 Init 容器成功为止。然而，如果 Pod 对应的 restartPolicy 为 Never，它不会重新启动。

- Init 容器支持应用容器的全部字段和特性，但不支持 Readiness Probe，因为它们必须在 Pod 就绪之前运行完成。

- 如果为一个 Pod 指定了多个 Init 容器，那些容器会按顺序一次运行一个。 每个 Init 容器必须运行成功，下一个才能够运行。

- 因为 Init 容器可能会被重启、重试或者重新执行，所以 Init 容器的代码应该是幂等的。 特别地，被写到 EmptyDirs 中文件的代码，应该对输出文件可能已经存在做好准备。

- 在 Pod 上使用 activeDeadlineSeconds，在容器上使用 livenessProbe，这样能够避免 Init 容器一直失败。 这就为 Init 容器活跃设置了一个期限。

- 在 Pod 中的每个 app 和 Init 容器的名称必须唯一；与任何其它容器共享同一个名称，会在验证时抛出错误。

- 对 Init 容器 spec 的修改，被限制在容器 image 字段中。 更改 Init 容器的 image 字段，等价于重启该 Pod。

一个pod可以包含多个普通容器和多个init容器，在Pod中所有容器的名称必须唯一，init容器在普通容器启动前顺序执行，如果init容器失败，则认为pod失败，K8S会根据pod的重启策略来重启这个容器，直到成功。

Init容器需要在pod.spec中的initContainers数组中定义（与pod.spec.containers数组相似）。init容器的状态在.status.initcontainerStatus字段中作为容器状态的数组返回（与status.containerStatus字段类似）。init容器支持普通容器的所有字段和功能，除了readinessprobe。Init 容器只能修改image 字段，修改image 字段等于重启 Pod，Pod 重启所有Init 容器必须重新执行。 

如果Pod的Init容器失败，Kubernetes会不断地重启该Pod，直到Init容器成功为止。然而如果Pod对应的restartPolicy为Never，则它不会重新启动。所以在Pod上使用activeDeadlineSeconds，在容器上使用livenessProbe，相当于为Init容器活跃设置了一个期限，能够避免Init容器一直失败。

2.  Init容器与普通容器的不同之处

Init 容器与普通的容器非常像，除了如下两点：

- Init 容器总是运行到成功完成为止。

- 每个 Init 容器都必须在下一个 Init 容器启动之前成功完成。

Init 容器支持应用容器的全部字段和特性，包括资源限制、数据卷和安全设置。 然而，Init 容器对资源请求和限制的处理稍有不同， 而且 Init 容器不支持 Readiness Probe，因为它们必须在 Pod 就绪之前运行完成。如果为一个 Pod 指定了多个 Init 容器，那些容器会按顺序一次运行一个。 每个 Init 容器必须运行成功，下一个才能够运行。 当所有的 Init 容器运行完成时，Kubernetes 初始化 Pod 并像平常一样运行应用容器。

3.  Init 容器能做什么

因为 Init 容器具有与应用容器分离的单独镜像，它们的启动相关代码具有如下优势：

- 它们可以包含并运行实用工具，处于安全考虑，是不建议在应用容器镜像中包含这些实用工具的。

- 它们可以包含实用工具和定制化代码来安装，但不能出现在应用镜像中。例如创建镜像没必要FROM另一个镜像，只需要在安装中使用类似sed，awk、 python 或dig这样的工具。

- 应用镜像可以分离出创建和部署的角色，而没有必要联合它们构建一个单独的镜像。

- 它们使用 Linux Namespace，所以对应用容器具有不同的文件系统视图。因此，它们能够具有访问 Secret 的权限，而应用容器不能够访问。

- 它们在应用容器启动之前运行完成，然而应用容器并行运行，所以 Init 容器提供了一种简单的方式来阻塞或延迟应用容器的启动，直到满足了一组先决条件。

4.  静态pod

静态Pod是由kubelet进行管理，仅存在于特定Node上的Pod。它们不能通过API Server进行管理，无法与ReplicationController、Deployment或DaemonSet进行关联，并且kubelet也无法对其健康检查。静态Pod总是由kubelet创建，并且总在kubelet所在的Node上运行。创建静态Pod的方式：使用配置文件方式 或 HTTP方式。一般常使用的是配置文件方式。

-  通过配置文件创建

配置文件只是特定目录中json或yaml格式的标准pod定义。它通过在kubelet守护进程中添加配置参数--pod-manifest-path=<the directory> 来运行静态Pod，kubelet经常会它定期扫描目录；例如，如何将一个简单web服务作为静态pod启动？

选择运行静态pod的节点服务器，不一定是node节点，只要有kubelet进程所在的节点都可以运行静态pod。可以在某个节点上创建一个放置一个Web服务器pod定义的描述文件文件夹，例如/etc/kubelet.d/static-web.yaml

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18 | \# mkdir /etc/kubelet.d/<br>\# vim /etc/kubelet.d/static-web.yaml<br>apiVersion: v1<br>kind: Pod<br>metadata:<br>  name: static-web<br>  labels:<br>    role: myrole<br>spec:<br>  containers:<br>    - name: web<br>      image: nginx<br>      ports:<br>        - name: web<br>          containerPort: 80<br>          protocol: TCP&lt;br&gt;<br>\#ls /etc/kubelet.d/<br>static-web.yaml |


通过使用--pod-manifest-path=/etc/kubelet.d/参数运行它，在节点上配置我的kubelet守护程序以使用此目录。比如这里kubelet启动参数位/etc/systemd/system/kubelet.service.d/10-kubelet.conf, 修改配置，然后将参数加入到现有参数配置项中(安装方式不尽相同，但是道理一样)。

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6 | \# vim /etc/systemd/system/kubelet.service.d/10-kubelet.conf<br>······<br>······<br>Environment="KUBELET\_EXTRA\_ARGS=--cluster-dns=10.96.0.10 --cluster-domain=cluster.local --pod-manifest-path=/etc/kubelet.d/"<br>······<br>······ |


保存退出，reload一下systemd daeomon ,重启kubelet服务进程

|   |   |
| - | - |
| 1<br>2 | \#systemctl daemon-reload<br>\# systemctl restart kubelet |


前面说了，当kubelet启动时，它会自动启动在指定的目录–pod-manifest-path=或–manifest-url=参数中定义的所有pod ，即我们的static-web。接着在该节点上检查是否创建成功：

|   |   |
| - | - |
| 1<br>2<br>3 | \# kubectl get pods -o wide<br>NAME                READY     STATUS    RESTARTS   AGE       IP            NODE   <br>static-web-k8s-m1   1/1       Running   0          2m        10.244.2.32   k8s-m1 |


上面也提到了，它不归任何部署方式来管理，即使我们尝试kubelet命令去删除

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6 | \# kubectl delete pod static-web-k8s-m1<br>pod "static-web-k8s-m1" deleted<br> <br>\# kubectl get pods -o wide<br>NAME                READY     STATUS    RESTARTS   AGE       IP        NODE      NOMINATED NODE<br>static-web-k8s-m1   0/1       Pending   0          2s        &lt;none&gt;    k8s-m1    &lt;none&gt; |


可以看出静态pod通过这种方式是没法删除的

那我如何去删除或者说是动态的添加一个pod呢？这种机制已经知道，kubelet进程会定期扫描配置的目录（/etc/kubelet.d在我的示例）以进行更改，并在文件出现/消失在此目录中时添加/删除pod。

5. Pod容器共享Volume

同一个Pod中的多个容器可以共享Pod级别的存储卷Volume,Volume可以定义为各种类型，多个容器各自进行挂载，将Pod的Volume挂载为容器内部需要的目录。例如：Pod级别的Volume:"app-logs",用于tomcat向其中写日志文件，busybox读日志文件。

![](images/0D32481B98294B44997D8C803AF90EFB3-1507086359.png)

pod-volumes-applogs.yaml文件的配置内容

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22 | apiVersion: v1<br>kind: Pod<br>metadata:<br>  name: volume-pod<br>spec:<br>  containers:<br>  - name: tomcat<br>    image: tomcat<br>    ports:<br>    - containerPort: 8080<br>    volumeMounts:<br>    - name: app-logs<br>      mountPath: /usr/local/tomcat/logs<br>  - name: busybox<br>    image: busybox<br>    command: ["sh","-c","tailf /logs/catalina\*.log"]<br>    volumeMounts:<br>    - name: app-logs<br>      mountPath: /logs<br>  volumes:<br>  - name: app-logs<br>    emptuDir: {} |


查看日志

# kubectl logs <pod_name> -c <container_name>

# kubectl exec -it <pod_name> -c <container_name> – tail /usr/local/tomcat/logs/catalina.xx.log

6. Pod的配置管理

Kubernetes v1.2的版本提供统一的集群配置管理方案 – ConfigMap：容器应用的配置管理

ConfigMap使用场景：

-  生成为容器内的环境变量。

-  设置容器启动命令的启动参数（需设置为环境变量）。

-  以Volume的形式挂载为容器内部的文件或目录。

ConfigMap以一个或多个key:value的形式保存在kubernetes系统中供应用使用，既可以表示一个变量的值（例如：apploglevel=info），也可以表示完整配置文件的内容（例如：server.xml=<?xml…>…）。可以通过yaml配置文件或者使用kubectl create configmap命令的方式创建ConfigMap。

3.1）创建ConfigMap

通过yaml文件方式

cm-appvars.yaml

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7 | apiVersion: v1<br>kind: ConfigMap<br>metadata:<br>  name: cm-appvars<br>data:<br>  apploglevel: info<br>  appdatadir: /var/data |


常用命令

# kubectl create -f cm-appvars.yaml

# kubectl get configmap

# kubectl describe configmap cm-appvars

# kubectl get configmap cm-appvars -o yaml

通过kubectl命令行方式

通过kubectl create configmap创建，使用参数–from-file或–from-literal指定内容，可以在一行中指定多个参数。

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8 | 1）通过–from-file参数从文件中进行创建，可以指定key的名称，也可以在一个命令行中创建包含多个key的ConfigMap。<br>\# kubectl create configmap NAME --from-file=[key=]source --from-file=[key=]source<br> <br>2）通过–from-file参数从目录中进行创建，该目录下的每个配置文件名被设置为key，文件内容被设置为value。<br>\# kubectl create configmap NAME --from-file=config-files-dir<br> <br>3）通过–from-literal从文本中进行创建，直接将指定的key=value创建为ConfigMap的内容。<br>\# kubectl create configmap NAME --from-literal=key1=value1 --from-literal=key2=value2 |


容器应用对ConfigMap的使用有两种方法：

- 通过环境变量获取ConfigMap中的内容。

- 通过Volume挂载的方式将ConfigMap中的内容挂载为容器内部的文件或目录。

通过环境变量的方式

ConfigMap的yaml文件: cm-appvars.yaml

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7 | apiVersion: v1<br>kind: ConfigMap<br>metadata:<br>  name: cm-appvars<br>data:<br>  apploglevel: info<br>  appdatadir: /var/data |


Pod的yaml文件：cm-test-pod.yaml

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20 | apiVersion: v1<br>kind: Pod<br>metadata:<br>  name: cm-test-pod<br>spec:<br>  containers:<br>  - name: cm-test<br>    image: busybox<br>    command: ["/bin/sh","-c","env|grep APP"]<br>    env:<br>    - name: APPLOGLEVEL<br>      valueFrom:<br>        configMapKeyRef:<br>          name: cm-appvars<br>          key: apploglevel<br>    - name: APPDATADIR<br>      valueFrom:<br>        configMapKeyRef:<br>          name: cm-appvars<br>          key: appdatadir |


创建命令：

# kubectl create -f cm-test-pod.yaml

# kubectl get pods --show-all

# kubectl logs cm-test-pod

使用ConfigMap的限制条件

-  ConfigMap必须在Pod之前创建

-  ConfigMap也可以定义为属于某个Namespace。只有处于相同Namespace中的Pod可以引用它。

-  kubelet只支持可以被API Server管理的Pod使用ConfigMap。静态Pod无法引用。

-  在Pod对ConfigMap进行挂载操作时，容器内只能挂载为“目录”，无法挂载为文件。

7. Pod的生命周期

-  Pod的状态

pod从创建到最后的创建成功会分别处于不同的阶段，下面是Pod的生命周期示意图，从图中可以看到Pod状态的变化：

![](images/42C0FCEFBBE84A4E9F6035850B13CF311-1625049545.png)

挂起或等待中 (Pending)：API Server创建了Pod资源对象并已经存入了etcd中，但是它并未被调度完成，或者仍然处于从仓库下载镜像的过程中。这时候Pod 已被 Kubernetes 系统接受，但有一个或者多个容器镜像尚未创建。等待时间包括调度 Pod 的时间和通过网络下载镜像的时间，这可能需要花点时间。创建pod的请求已经被k8s接受，但是容器并没有启动成功，可能处在：写数据到etcd，调度，pull镜像，启动容器这四个阶段中的任何一个阶段，pending伴随的事件通常会有：ADDED, Modified这两个事件的产生。

运行中 (Running)：该 Pod 已经被调度到了一个node节点上，Pod 中所有的容器都已被kubelet创建完成。至少有一个容器正在运行，或者正处于启动或重启状态。

正常终止 (Succeeded)：pod中的所有的容器已经正常的自行退出，并且k8s永远不会自动重启这些容器，一般会是在部署job的时候会出现。

异常停止 (Failed)：Pod 中的所有容器都已终止了，并且至少有一个容器是因为失败终止。也就是说，容器以非0状态退出或者被系统终止。

未知状态 (Unkonwn)：出于某种原因，无法获得Pod的状态，通常是由于与Pod主机通信时出错。

-  Pod的创建过程

Pod是Kubernetes的基础单元，了解其创建的过程，更有助于理解系统的运作。创建Pod的整个流程的时序图如下：

![](images/CF19538828AF484593B675CCD650989C56-312003948.png)

① 用户通过kubectl客户端提交Pod Spec给API Server。

② API Server尝试将Pod对象的相关信息存储到etcd中，等待写入操作完成，API Server返回确认信息到客户端。

③ API Server开始反映etcd中的状态变化。

④ 所有的Kubernetes组件通过"watch"机制跟踪检查API Server上的相关信息变动。

⑤ kube-scheduler（调度器）通过其"watcher"检测到API Server创建了新的Pod对象但是没有绑定到任何工作节点。

⑥ kube-scheduler为Pod对象挑选一个工作节点并将结果信息更新到API Server。

⑦ 调度结果新消息由API Server更新到etcd，并且API Server也开始反馈该Pod对象的调度结果。

⑧ Pod被调度到目标工作节点上的kubelet尝试在当前节点上调用docker engine进行启动容器，并将容器的状态结果返回到API Server。

⑨ API Server将Pod信息存储到etcd系统中。

⑩ 在etcd确认写入操作完成，API Server将确认信息发送到相关的kubelet。

Pod常规的排查：见这里

一个pod的完整创建，通常会伴随着各种事件的产生，kubernetes事件的种类总共只有4种：

Added EventType = "ADDED"

Modified EventType = "MODIFIED"

Deleted EventType = "DELETED"

Error EventType = "ERROR"

PodStatus 有一组PodConditions。 PodCondition中的ConditionStatus，它代表了当前pod是否处于某一个阶段（PodScheduled，Ready，Initialized，Unschedulable），"true" 表示处于，"false"表示不处于。PodCondition数组的每个元素都有一个类型字段和一个状态字段。

类型字段 PodConditionType  是一个字符串，可能的值是:

PodScheduled：pod正处于调度中，刚开始调度的时候，hostip还没绑定上，持续调度之后，有合适的节点就会绑定hostip，然后更新etcd数据

Ready: pod 已经可以开始服务，譬如被加到负载均衡里面

Initialized：所有pod 中的初始化容器已经完成了

Unschedulable：限制不能被调度，譬如现在资源不足

状态字段 ConditionStatus  是一个字符串，可能的值为True，False和Unknown

Pod的ERROR事件的情况大概有：

CrashLoopBackOff： 容器退出，kubelet正在将它重启

InvalidImageName： 无法解析镜像名称

ImageInspectError： 无法校验镜像

ErrImageNeverPull： 策略禁止拉取镜像

ImagePullBackOff： 正在重试拉取

RegistryUnavailable： 连接不到镜像中心

ErrImagePull： 通用的拉取镜像出错

CreateContainerConfigError： 不能创建kubelet使用的容器配置

CreateContainerError： 创建容器失败

m.internalLifecycle.PreStartContainer  执行hook报错

RunContainerError： 启动容器失败

PostStartHookError： 执行hook报错

ContainersNotInitialized： 容器没有初始化完毕

ContainersNotReady： 容器没有准备完毕

ContainerCreating：容器创建中

PodInitializing：pod 初始化中

DockerDaemonNotReady：docker还没有完全启动

NetworkPluginNotReady： 网络插件还没有完全启动

-  Pod的重启策略

PodSpec 中有一个 restartPolicy 字段，可能的值为 Always、OnFailure 和 Never。默认为 Always。 restartPolicy 适用于 Pod 中的所有容器。restartPolicy 仅指通过同一节点上的 kubelet 重新启动容器。失败的容器由 kubelet 以五分钟为上限的指数退避延迟（10秒，20秒，40秒...）重新启动，并在成功执行十分钟后重置。pod一旦绑定到一个节点，Pod 将永远不会重新绑定到另一个节点（除非删除这个pod，或pod所在的node节点发生故障或该node从集群中退出，则pod才会被调度到其他node节点上）。

![](images/090F2AEB5D854C6DBA344DB3CB08DFD539-458120197.png)

说明： 可以管理Pod的控制器有Replication Controller，Job，DaemonSet，及kubelet（静态Pod）。

-  RC和DaemonSet：必须设置为Always，需要保证该容器持续运行。

-  Job：OnFailure或Never，确保容器执行完后不再重启。

-  kubelet：在Pod失效的时候重启它，不论RestartPolicy设置为什么值，并且不会对Pod进行健康检查。

-  常见的状态转换场景

![](images/94A38D07DBBF41C6879227F026CFA0290-1569177475.png)

8.  Pod健康检查 (存活性探测)

在pod生命周期中可以做的一些事情。主容器启动前可以完成初始化容器，初始化容器可以有多个，他们是串行执行的，执行完成后就推出了，在主程序刚刚启动的时候可以指定一个post start 主程序启动开始后执行一些操作，在主程序结束前可以指定一个 pre stop 表示主程序结束前执行的一些操作。Pod启动后的健康状态可以由两类探针来检测：Liveness Probe（存活性探测） 和 Readiness Probe（就绪性探测）。如下图：

![](images/ED14781988004476888D1283FAAB9DA09-1181682733.png)

-  Liveness Probe

1. 用于判断容器是否存活（running状态）。

2. 如果LivenessProbe探针探测到容器非健康，则kubelet将杀掉该容器，并根据容器的重启策略做相应处理。

3. 如果容器不包含LivenessProbe探针，则kubelet认为该探针的返回值永远为“success”。

livenessProbe：指示容器是否正在运行。如果存活探测失败，则 kubelet 会杀死容器，并且容器将受到其 重启策略 的影响。如果容器不提供存活探针，则默认状态为 Success。Kubelet使用liveness probe（存活探针）来确定何时重启容器。例如，当应用程序处于运行状态但无法做进一步操作，liveness探针将捕获到deadlock，重启处于该状态下的容器，使应用程序在存在bug的情况下依然能够继续运行下去（谁的程序还没几个bug呢）。

-  Readiness Probe

1. 用于判断容器是否启动完成（read状态），可以接受请求。

2. 如果ReadnessProbe探针检测失败，则Pod的状态将被修改。Endpoint Controller将从Service的Endpoint中删除包含该容器所在Pod的Endpoint。

readinessProbe：指示容器是否准备好服务请求。如果就绪探测失败，端点控制器将从与 Pod 匹配的所有 Service 的端点中删除该 Pod 的 IP 地址。初始延迟之前的就绪状态默认为 Failure。如果容器不提供就绪探针，则默认状态为 Success。Kubelet使用readiness probe（就绪探针）来确定容器是否已经就绪可以接受流量。只有当Pod中的容器都处于就绪状态时kubelet才会认定该Pod处于就绪状态。该信号的作用是控制哪些Pod应该作为service的后端。如果Pod处于非就绪状态，那么它们将会被从service的load balancer中移除。

Kubelet 可以选择是否执行在容器上运行的两种探针执行和做出反应，每次探测都将获得以下三种结果之一：

成功：容器通过了诊断。

失败：容器未通过诊断。

未知：诊断失败，因此不会采取任何行动。

探针是由 kubelet 对容器执行的定期诊断。要执行诊断，kubelet 调用由容器实现的Handler。其存活性探测的方法有以下三种：

- ExecAction：在容器内执行指定命令。如果命令退出时返回码为 0 则认为诊断成功。

- TCPSocketAction：对指定端口上的容器的 IP 地址进行 TCP 检查。如果端口打开，则诊断被认为是成功的。

- HTTPGetAction：对指定的端口和路径上的容器的 IP 地址执行 HTTP Get 请求。如果响应的状态码大于等于200 且小于 400，则诊断被认为是成功的。

-  定义LivenessProbe命令

kubelet对非主进程崩溃类的容器错误无法感知，需要借助存活性探测livenessProbe。许多长时间运行的应用程序最终会转换到broken状态，除非重新启动，否则无法恢复。Kubernetes提供了Liveness Probe来检测和补救这种情况。LivenessProbe三种实现方式：

1）ExecAction：在一个容器内部执行一个命令，如果该命令状态返回值为0，则表明容器健康。（即定义Exec liveness探针）

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16 | apiVersion: v1<br>kind: Pod<br>metadata:<br>  labels:<br>    test: liveness-exec<br>  name: liveness-exec<br>spec:<br>  containers:<br>  - name: liveness-exec-demo<br>    image: busybox<br>    args: ["/bin/sh","-c","touch /tmp/healthy;sleep 60;rm -rf /tmp/healthy;sleep 600"]<br>    livenessProbe:<br>      exec:<br>        command: ["test","-e","/tmp/healthy"]<br>      initialDelaySeconds: 5<br>      periodSeconds: 5 |


上面的资源清单中定义了一个Pod 对象， 基于 busybox 镜像 启动 一个 运行“ touch/ tmp/ healthy； sleep 60； rm- rf/ tmp/ healthy； sleep 600” 命令 的 容器， 此 命令 在 容器 启动 时 创建/ tmp/ healthy 文件， 并于 60 秒 之后 将其 删除。 periodSeconds 规定kubelet要每隔5秒执行一次liveness probe， initialDelaySeconds 告诉kubelet在第一次执行probe之前要的等待5秒钟。存活性探针探针检测命令是在容器中执行 "test -e /tmp/healthy"命令检查/ tmp/healthy 文件的存在性。如果命令执行成功，将返回0，表示 成功 通过 测试，则kubelet就会认为该容器是活着的并且很健康。如果返回非0值，kubelet就会杀掉这个容器并重启它。

2）TCPSocketAction：通过容器IP地址和端口号执行TCP检查，如果能够建立TCP连接，则表明容器健康。这种方式使用TCP Socket，使用此配置，kubelet将尝试在指定端口上打开容器的套接字。 如果可以建立连接，容器被认为是健康的，如果不能就认为是失败的。（即定义TCP liveness探针）

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16 | apiVersion: v1<br>kind: Pod<br>metadata:<br>  labels:<br>    test: liveness-tcp<br>  name: liveness-tcp<br>spec:<br>  containers:<br>  - name: liveness-tcp-demo<br>    image: nginx:1.12-alpine<br>    ports:<br>    - name: http<br>      containerPort: 80<br>    livenessProbe:<br>      tcpSocket:<br>        port: http |


上面的资源清单文件，向Pod IP的80/tcp端口发起连接请求，并根据连接建立的状态判断Pod存活状态。

3）HTTPGetAction：通过容器IP地址、端口号及路径调用HTTP Get方法，如果响应的状态码大于等于200且小于等于400，则认为容器健康。（即定义HTTP请求的liveness探针）

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24 | apiVersion: v1<br>kind: Pod<br>metadata:<br>  labels:<br>    test: liveness-http<br>  name: liveness-http<br>spec:<br>  containers:<br>  - name: liveness-http-demo<br>    image: nginx:1.12-alpine<br>    ports:<br>    - name: http<br>      containerPort: 80<br>    lifecycle:<br>      postStart:<br>        exec:<br>          command: ["/bin/sh","-c","echo healthy &gt; /usr/share/nginx/html/healthy"]<br>    livenessProbe:<br>      httpGet:<br>        path: /healthy<br>        port: http<br>        scheme: HTTP<br>    initialDelaySeconds: 3<br>    periodSeconds: 3 |


上面 清单 文件 中 定义 的 httpGet 测试 中， 请求 的 资源 路径 为“/ healthy”， 地址 默认 为 Pod IP， 端口 使用 了 容器 中 定义 的 端口 名称 HTTP， 这也 是 明确 为 容器 指明 要 暴露 的 端口 的 用途 之一。livenessProbe 指定kubelete需要每隔3秒执行一次liveness probe。initialDelaySeconds 指定kubelet在该执行第一次探测之前需要等待3秒钟。该探针将向容器中的server的默认http端口发送一个HTTP GET请求。如果server的/healthz路径的handler返回一个成功的返回码，kubelet就会认定该容器是活着的并且很健康。如果返回失败的返回码，kubelet将杀掉该容器并重启它。任何大于200小于400的返回码都会认定是成功的返回码。其他返回码都会被认为是失败的返回码。

-  定义ReadinessProbe命令

有时，应用程序暂时无法对外部流量提供服务。 例如，应用程序可能需要在启动期间加载大量数据或配置文件。 在这种情况下，你不想杀死应用程序，但你也不想发送请求。 Kubernetes提供了readiness probe来检测和减轻这些情况。 Pod中的容器可以报告自己还没有准备，不能处理Kubernetes服务发送过来的流量。Readiness probe的配置跟liveness probe很像。唯一的不同是使用 readinessProbe而不是livenessProbe。

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16 | apiVersion: v1<br>kind: Pod<br>metadata:<br>  labels:<br>    test: readiness-exec<br>  name: readiness-exec<br>spec:<br>  containers:<br>  - name: readiness-demo<br>    image: busybox<br>    args: ["/bin/sh","-c","touch /tmp/healthy;sleep 60;rm -rf /tmp/healthy;"sleep 600]<br>    readinessProbe:<br>      exec:<br>        command: ["test","-e","/tmp/healthy"]<br>      initialDelaySeconds: 5<br>      periodSeconds: 5 |


上面定义的是一个exec的Readiness探针，另外Readiness probe的HTTP和TCP的探测器配置跟liveness probe一样。Readiness和livenss probe可以并行用于同一容器。 使用两者可以确保流量无法到达未准备好的容器，并且容器在失败时重新启动。

-  配置Probe

Probe中有很多精确和详细的配置，通过它们你能准确的控制liveness和readiness检查：

initialDelaySeconds：容器启动后第一次执行探测是需要等待多少秒。即启动容器后首次进行健康检查的等待时间，单位为秒。

periodSeconds：执行探测的频率。默认是10秒，最小1秒。

timeoutSeconds：探测超时时间。默认1秒，最小1秒。即健康检查发送请求后等待响应的时间，如果超时响应kubelet则认为容器非健康，重启该容器，单位为秒。

successThreshold：探测失败后，最少连续探测成功多少次才被认定为成功。默认是1。对于liveness必须是1。最小值是1。

failureThreshold：探测成功后，最少连续探测失败多少次才被认定为失败。默认是3。最小值是1。

HTTP probe中可以给 httpGet设置其他配置项：

host：连接的主机名，默认连接到pod的IP。你可能想在http header中设置”Host”而不是使用IP。

scheme：连接使用的schema，默认HTTP。

path: 访问的HTTP server的path。

httpHeaders：自定义请求的header。HTTP运行重复的header。

port：访问的容器的端口名字或者端口号。端口号必须介于1和65525之间。

对于HTTP探测器，kubelet向指定的路径和端口发送HTTP请求以执行检查。 Kubelet将probe发送到容器的IP地址，除非地址被httpGet中的可选host字段覆盖。 在大多数情况下，不想设置主机字段。 有一种情况下可以设置它， 假设容器在127.0.0.1上侦听，并且Pod的hostNetwork字段为true。 然后，在httpGet下的host应该设置为127.0.0.1。 如果你的pod依赖于虚拟主机，这可能是更常见的情况，你不应该是用host，而是应该在httpHeaders中设置Host头。

-  Liveness Probe和Readiness Probe使用场景

-  如果容器中的进程能够在遇到问题或不健康的情况下自行崩溃，则不一定需要存活探针; kubelet 将根据 Pod 的restartPolicy 自动执行正确的操作。

-  如果希望容器在探测失败时被杀死并重新启动，那么请指定一个存活探针，并指定restartPolicy 为 Always 或 OnFailure。

-  如果要仅在探测成功时才开始向 Pod 发送流量，请指定就绪探针。在这种情况下，就绪探针可能与存活探针相同，但是 spec 中的就绪探针的存在意味着 Pod 将在没有接收到任何流量的情况下启动，并且只有在探针探测成功后才开始接收流量。

-  如果你希望容器能够自行维护，您可以指定一个就绪探针，该探针检查与存活探针不同的端点。

请注意：如果你只想在 Pod 被删除时能够排除请求，则不一定需要使用就绪探针；在删除 Pod 时，Pod 会自动将自身置于未完成状态，无论就绪探针是否存在。当等待 Pod 中的容器停止时，Pod 仍处于未完成状态。

9.  Pod调度

在kubernetes集群中，Pod（container）是应用的载体，一般通过RC、Deployment、DaemonSet、Job等对象来完成Pod的调度与自愈功能。

0.  Pod的生命

一般来说，Pod 不会消失，直到人为销毁它们。这可能是一个人或控制器。这个规则的唯一例外是成功或失败的 phase 超过一段时间（由 master 确定）的Pod将过期并被自动销毁。有三种可用的控制器：

-  使用 Job 运行预期会终止的 Pod，例如批量计算。Job 仅适用于重启策略为 OnFailure 或 Never 的 Pod。

-  对预期不会终止的 Pod 使用 ReplicationController、ReplicaSet 和 Deployment ，例如 Web 服务器。 ReplicationController 仅适用于具有 restartPolicy 为 Always 的 Pod。

-  提供特定于机器的系统服务，使用 DaemonSet 为每台机器运行一个 Pod 。

所有这三种类型的控制器都包含一个 PodTemplate。建议创建适当的控制器，让它们来创建 Pod，而不是直接自己创建 Pod。这是因为单独的 Pod 在机器故障的情况下没有办法自动复原，而控制器却可以。如果节点死亡或与集群的其余部分断开连接，则 Kubernetes 将应用一个策略将丢失节点上的所有 Pod 的 phase 设置为 Failed。

1.  RC、Deployment：全自动调度

RC的功能即保持集群中始终运行着指定个数的Pod。在调度策略上主要有：

-   系统内置调度算法  [最优Node]

-   NodeSelector   [定向调度]

-   NodeAffinity  [亲和性调度]

-  NodeSelector  [定向调度]

kubernetes中kube-scheduler负责实现Pod的调度，内部系统通过一系列算法最终计算出最佳的目标节点。如果需要将Pod调度到指定Node上，则可以通过Node的标签（Label）和Pod的nodeSelector属性相匹配来达到目的。

1. kubectl label nodes {node-name} {label-key}={label-value}

2. nodeSelector:

{label-key}:{label-value}

如果给多个Node打了相同的标签，则scheduler会根据调度算法从这组Node中选择一个可用的Node来调度。

如果Pod的nodeSelector的标签在Node中没有对应的标签，则该Pod无法被调度成功。

Node标签的使用场景：

对集群中不同类型的Node打上不同的标签，可控制应用运行Node的范围。例如：role=frontend;role=backend;role=database。

-  NodeAffinity [亲和性调度]

NodeAffinity意为Node亲和性调度策略，NodeSelector为精确匹配，NodeAffinity为条件范围匹配，通过In（属于）、NotIn（不属于）、Exists（存在一个条件）、DoesNotExist（不存在）、Gt（大于）、Lt（小于）等操作符来选择Node，使调度更加灵活。

1. RequiredDuringSchedulingRequiredDuringExecution：类似于NodeSelector，但在Node不满足条件时，系统将从该Node上移除之前调度上的Pod。

2. RequiredDuringSchedulingIgnoredDuringExecution：与上一个类似，区别是在Node不满足条件时，系统不一定从该Node上移除之前调度上的Pod。

3. PreferredDuringSchedulingIgnoredDuringExecution：指定在满足调度条件的Node中，哪些Node应更优先地进行调度。同时在Node不满足条件时，系统不一定从该Node上移除之前调度上的Pod。

如果同时设置了NodeSelector和NodeAffinity，则系统将需要同时满足两者的设置才能进行调度。

2.  DaemonSet：特定场景调度

DaemonSet是kubernetes1.2版本新增的一种资源对象，用于管理在集群中每个Node上仅运行一份Pod的副本实例。

![](images/C7C129EEFC004794BB5734D36ED3C81622-921561421.png)

该用法适用的应用场景：

1.  在每个Node上运行一个GlusterFS存储或者Ceph存储的daemon进程。

2.  在每个Node上运行一个日志采集程序：fluentd或logstach。

3.  在每个Node上运行一个健康程序，采集该Node的运行性能数据，例如：Prometheus Node Exportor、collectd、New Relic agent或Ganglia gmond等。

DaemonSet的Pod调度策略与RC类似，除了使用系统内置算法在每台Node上进行调度，也可以通过NodeSelector或NodeAffinity来指定满足条件的Node范围进行调度。

3.  Job：批处理调度

kubernetes从1.2版本开始支持批处理类型的应用，可以通过kubernetes Job资源对象来定义并启动一个批处理任务。批处理任务通常并行（或串行）启动多个计算进程去处理一批工作项（work item），处理完后，整个批处理任务结束。

批处理的三种模式：

![](images/75155DD756D44A0687B1A82CFCB4ACE68-1482246320.png)

批处理按任务实现方式不同分为以下几种模式：

1. Job Template Expansion模式

一个Job对象对应一个待处理的Work item，有几个Work item就产生几个独立的Job，通过适用于Work item数量少，每个Work item要处理的数据量比较大的场景。例如有10个文件（Work item）,每个文件（Work item）为100G。

2. Queue with Pod Per Work Item

采用一个任务队列存放Work item，一个Job对象作为消费者去完成这些Work item，其中Job会启动N个Pod，每个Pod对应一个Work item。

3. Queue with Variable Pod Count

采用一个任务队列存放Work item，一个Job对象作为消费者去完成这些Work item，其中Job会启动N个Pod，每个Pod对应一个Work item。但Pod的数量是可变的。

Job的三种类型

1. Non-parallel Jobs

通常一个Job只启动一个Pod,除非Pod异常才会重启该Pod,一旦此Pod正常结束，Job将结束。

2. Parallel Jobs with a fixed completion count

并行Job会启动多个Pod，此时需要设定Job的.spec.completions参数为一个正数，当正常结束的Pod数量达到该值则Job结束。

3. Parallel Jobs with a work queue

任务队列方式的并行Job需要一个独立的Queue，Work item都在一个Queue中存放，不能设置Job的.spec.completions参数。

此时Job的特性：

-  每个Pod能独立判断和决定是否还有任务项需要处理;

-  如果某个Pod正常结束，则Job不会再启动新的Pod;

-  如果一个Pod成功结束，则此时应该不存在其他Pod还在干活的情况，它们应该都处于即将结束、退出的状态;

-  如果所有的Pod都结束了，且至少一个Pod成功结束，则整个Job算是成功结束;

10.  Pod伸缩

kubernetes中RC是用来保持集群中始终运行指定数目的实例，通过RC的scale机制可以完成Pod的扩容和缩容（伸缩）。

1.  手动伸缩（scale）

|   |   |
| - | - |
| 1 | \# kubectl scale rc redis-slave --replicas=3 |


2.  自动伸缩（HPA）

Horizontal Pod Autoscaler（HPA）控制器用于实现基于CPU使用率进行自动Pod伸缩的功能。HPA控制器基于Master的kube-controller-manager服务启动参数--horizontal-pod-autoscaler-sync-period定义是时长（默认30秒），周期性监控目标Pod的CPU使用率，并在满足条件时对ReplicationController或Deployment中的Pod副本数进行调整，以符合用户定义的平均Pod CPU使用率。Pod CPU使用率来源于heapster组件，因此需安装该组件。

HPA可以通过kubectl autoscale命令进行快速创建或者使用yaml配置文件进行创建。创建之前需已存在一个RC或Deployment对象，并且该RC或Deployment中的Pod必须定义resources.requests.cpu的资源请求值，以便heapster采集到该Pod的CPU。

-  通过kubectl autoscale创建。

例如php-apache-rc.yaml

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20 | apiVersion: v1<br>kind: ReplicationController<br>metadata:<br>  name: php-apache<br>spec:<br>  replicas: 1<br>  template:<br>    metadata:<br>      name: php-apache<br>      labels:<br>        app: php-apache<br>    spec:<br>      containers:<br>      - name: php-apache<br>        image: gcr.io/google\_containers/hpa-example<br>        resources:<br>          requests:<br>            cpu: 200m<br>        ports:<br>        - containerPort: 80 |


创建php-apache的RC

|   |   |
| - | - |
| 1 | kubectl create -f php-apache-rc.yaml |


php-apache-svc.yaml

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9 | apiVersion: v1<br>kind: Service<br>metadata:<br>  name: php-apache<br>spec:<br>  ports:<br>  - port: 80<br>  selector:<br>    app: php-apache |


创建php-apache的Service

|   |   |
| - | - |
| 1 | kubectl create -f php-apache-svc.yaml |


创建HPA控制器

|   |   |
| - | - |
| 1 | kubectl autoscale rc php-apache --min=1 --max=10 --cpu-percent=50 |


-  通过yaml配置文件创建

hpa-php-apache.yaml

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12 | apiVersion: v1<br>kind: HorizontalPodAutoscaler<br>metadata:<br>  name: php-apache<br>spec:<br>  scaleTargetRef:<br>    apiVersion: v1<br>    kind: ReplicationController<br>    name: php-apache<br>  minReplicas: 1<br>  maxReplicas: 10<br>  targetCPUUtilizationPercentage: 50 |


创建hpa

|   |   |
| - | - |
| 1 | kubectl create -f hpa-php-apache.yaml |


查看hpa

|   |   |
| - | - |
| 1 | kubectl get hpa |


11. Pod滚动升级和回滚

Kubernetes是一个很好的容器应用集群管理工具，尤其是采用ReplicationController这种自动维护应用生命周期事件的对象后，将容器应用管理的技巧发挥得淋漓尽致。在容器应用管理的诸多特性中，有一个特性是最能体现Kubernetes强大的集群应用管理能力的，那就是滚动升级。

滚动升级的精髓在于升级过程中依然能够保持服务的连续性，使外界对于升级的过程是无感知的。整个过程中会有三个状态：全部旧实例，新旧实例皆有，全部新实例。旧实例个数逐渐减少，新实例个数逐渐增加，最终达到旧实例个数为0，新实例个数达到理想的目标值。

1.  使用kubectl rolling-update命令完成RC的滚动升级 和 回滚

kubernetes中的RC的滚动升级通过执行 kubectl rolling-update 命令完成，该命令创建一个新的RC（与旧的RC在同一个命名空间中），然后自动控制旧的RC中的Pod副本数逐渐减少为0，同时新的RC中的Pod副本数从0逐渐增加到目标值，来完成Pod的升级。 需要注意的是：新旧RC要再同一个命名空间内。但滚动升级中Pod副本数（包括新Pod和旧Pod）保持原预期值。

1.1  通过配置文件实现

redis-master-controller-v2.yaml

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23 | apiVersion: v1<br>kind: ReplicationController<br>metadata:<br>  name: redis-master-v2<br>  labels:<br>    name: redis-master<br>    version: v2<br>spec:<br>  replicas: 1<br>  selector:<br>    name: redis-master<br>    version: v2<br>  template:<br>    metadata:<br>      labels:<br>        name: redis-master<br>        version: v2<br>    spec:<br>      containers:<br>      - name: master<br>        image: kubeguide/redis-master:2.0<br>        ports:<br>        - containerPort: 6379 |


注意事项：

-  RC的名字（name）不能与旧RC的名字相同

-  在selector中应至少有一个Label与旧的RC的Label不同，以标识其为新的RC。例如本例中新增了version的Label。

运行kubectl rolling-update

|   |   |
| - | - |
| 1 | kubectl rolling-update redis-master -f redis-master-controller-v2.yaml |


1.2  通过kubectl rolling-update命令实现

|   |   |
| - | - |
| 1 | kubectl rolling-update redis-master --image=redis-master:2.0 |


与使用配置文件实现不同在于，该执行结果旧的RC被删除，新的RC仍使用旧的RC的名字。

1.3  通过kubectl rolling-update加参数--rollback实现回滚操作

|   |   |
| - | - |
| 1 | kubectl rolling-update redis-master --image=kubeguide/redis-master:2.0 --rollback |


rollback原理很简单，kubernetes记录了各个版本的PodTemplate,把旧的PodTemplate覆盖新的Template即可。 

2.  通过Deployment的滚动升级 和 回滚

采用RS来管理Pod实例。如果当前集群中的Pod实例数少于目标值，RS会拉起新的Pod，反之，则根据策略删除多余的Pod。Deployment正是利用了这样的特性，通过控制两个RS里面的Pod，从而实现升级。滚动升级是一种平滑过渡式的升级，在升级过程中，服务仍然可用，这是kubernetes作为应用服务化管理的关键一步！！服务无处不在，并且按需使用。Kubernetes Deployment滚动更新机制不同于ReplicationController rolling update，Deployment rollout还提供了滚动进度查询，滚动历史记录，回滚等能力，无疑是使用Kubernetes进行应用滚动发布的首选。配置示例如下:

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16 | apiVersion: apps/v1beta1<br>kind: Deployment<br>metadata:<br>  name: nginx-deployment<br>spec:<br>  replicas: 3<br>  template:<br>    metadata:<br>      labels:<br>        app: nginx<br>    spec:<br>      containers:<br>      - name: nginx<br>        images: nginx:1.7.9<br>        ports:<br>        - containerPort: 80 |


2.1  通过kubectl set image命令为Deployment设置新的镜像名称

|   |   |
| - | - |
| 1 | kubectl set image deployment/nginx-deployment nginx=nginx:1.9.1 |


2.2  使用kubectl edit命令修改Deployment的配置

将spec.template.spec.containers[0].images 从nginx:1.7.9 更改为1.9.1;  保存退出后，kubernetes会自动升级镜像。

2.3  通过"kubectl rollout status"可以查看deployment的更新过程

在Deployment的定义中，可以通过spec.strategy指定Pod更新的策略：

- Recreate(重建)： 设置spec.strategy.type=Recreate,表示Deployment在更新Pod时，会先杀掉所有正在运行的Pod,然后创建新的Pod.

- RollingUpdate(滚动更新)：以滚动更新的方式来逐个更新Pod,可以通过设置spec.strategy.rollingUpdate下的两个参数（maxUnavailable和maxSurge）来控制滚动更新的过程。

通常来说，不鼓励更新Deployment的标签选择器，因为这样会导致Deployment选择的Pod列表发生变化，也可能与其它控制器产生冲突。

Deployment滚动升级的过程大致为：

- 查找新的RS和旧的RS，并计算出新的Revision（这是Revision的最大值）；

- 对新的RS进行扩容操作；

- 对旧的RS进行缩容操作；

- 完成之后，删掉旧的RS；

- 通过Deployment状态到etcd;

2.4  Deployment的回滚

所有Deployment的发布历史记录都保留在系统中，如果要进行回滚：

-  用 kubectl rollout history 命令检查这个Deployment部署的历史记录

-  用 kubectl rollout undo deployment/nginx-deployment 撤销本次发布回滚到上一个部署版本

-  用 kubectl rollout undo deployment/nginx-deployment --to-revision=2 回滚到指定版本

2.5  暂停和恢复Deployment的部署操作，以完成复杂的修改

对应一次复杂的Deployment配置修改，为了避免频繁触发Deployment的更新操作，可以暂停Deployment的更新操作，然后进行配置修改，再回复Deployment.一次性触发完整的更新操作。使用命令：kubectl rollout pause deployment/nginx-deployment

Kubernetes滚动升级和回滚操作分享 （Deployment的rollout方式）

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30 | 产品部署完成上线之后，经常遇到需要升级服务的要求（只考虑更新镜像），以往比较粗糙的操作流程大致如下：<br>方式一：找到 master具体调度到的所有目标node，删除其对应的镜像文件<br>方式二：修改 file.yaml中镜像拉取策略为Always<br>  <br>删掉旧pod，并重新创建<br>\# kubectl delete -f /path/file.yaml<br>\# kubectl create -f /path/file.yaml<br> <br>但是这样有一个比较棘手的问题，就是如果升级失败的回滚策略。因此想到利用kubernetes自身的滚动升级的工具，部署及升级流程如下：<br> <br>1）在初次创建的时候，尽量加入参数--record，这样k8s会记录下本次启动的脚本 。<br>\# kubectl create -f /path/file.yaml --record<br> <br>2）执行查看发布的历史记录，会显示现在已经记录的脚本及其序号。<br>查看历史记录<br>\# kubectl rollout history deployment deploy-apigw<br> <br>3）升级命令执行后会输出"xxx image updated"<br>升级镜像<br>\# kubectl set image deployment/deploy-name containerName=newIMG:version<br>\# kubectl set image controllerType/controllerInstanceName underInstanceContainerName=image:version<br> <br>4）查看pod状态，如果失败需要回滚操作<br>回滚到上一个操作版本<br>\# kubectl rollout undo deployment/deploy-name<br> <br>回滚到指定版本，版本号由第二步查看获得<br>\# kubectl rollout undo deployment/deploy-name --to-revision=3<br> <br>需要注意：执行rollout undo操作之后，版本号会移动，需要确认版本号无误再undo |


3.  其它管理对象的更新策略

3.1  DaemonSet的更新策略

- OnDelete: 默认配置。只有旧的Pod被用户手动删除后，才触发新建操作。

- RollingUpdate: 旧版本的Pod将被自动杀掉，然后自动创建新版本的DaemonSet Pod.

3.2  StatefulSet的更新策略

StatefulSet的更新策略正逐渐向Deployment和DaemonSet的更新策略看齐。

12.  资源需求和资源限制

在Docker的范畴内，我们知道可以对运行的容器进行请求或消耗的资源进行限制。而在Kubernetes中也有同样的机制，容器或Pod可以进行申请和消耗的计算资源就是CPU和内存，这也是目前仅有的受支持的两种类型。相比较而言，CPU属于可压缩资源，即资源额度可按需收缩；而内存则是不可压缩型资源，对其执行收缩操作可能会导致某种程度的问题。

资源的隔离目前是属于容器级别，CPU和内存资源的配置需要Pod中的容器spec字段下进行定义。其具体字段，可以使用"requests"进行定义请求的确保资源可用量。也就是说容器的运行可能用不到这样的资源量，但是必须确保有这么多的资源供给。而"limits"是用于限制资源可用的最大值，属于硬限制。

在Kubernetes中，1个单位的CPU相当于虚拟机的1颗虚拟CPU（vCPU）或者是物理机上一个超线程的CPU，它支持分数计量方式，一个核心（1core）相当于1000个微核心（millicores），因此500m相当于是0.5个核心，即二分之一个核心。内存的计量方式也是一样的，默认的单位是字节，也可以使用E、P、T、G、M和K作为单位后缀，或者是Ei、Pi、Ti、Gi、Mi、Ki等形式单位后缀。

-  容器的资源需求，资源限制

requests：需求，最低保障；

limits：限制，硬限制；

-  CPU

1 颗逻辑 CPU

1=1000，millicores (微核心)

500m=0.5CPU

-  资源需求

自主式pod要求为stress容器确保128M的内存及五分之一个cpu核心资源可用，它运行stress-ng镜像启动一个进程进行内存性能压力测试，满载测试时它也会尽可能多地占用cpu资源，另外再启动一个专用的cpu压力测试进程。stress-ng是一个多功能系统压力测试工具，master/worker模型，master为主进程，负责生成和控制子进程，worker是负责执行各类特定测试的子进程。

集群中的每个节点都拥有定量的cpu和内存资源，调度pod时，仅那些被请求资源的余量可容纳当前调度的pod的请求量的节点才可作为目标节点。也就是说，kubernetes的调度器会根据容器的requests属性中定义的资源需求量来判定仅哪些节点可接受运行相关的pod资源，而对于一个节点的资源来说，每运行一个pod对象，其requestes中定义的请求量都要被预留，直到被所有pod对象瓜分完毕为止。

资源需求配置示例:

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12 | apiVersion: v1<br>kind: Pod<br>metadata:<br>  name: nginx-pod<br>spec:<br>  containers:<br>  - name: nginx<br>    image: nginx<br>    resources:<br>      requests:<br>        memory: "128Mi"<br>        cpu: "200m" |


上面的配置清单中，nginx请求的CPU资源大小为200m，这意味着一个CPU核心足以满足nginx以最快的方式运行，其中对内存的期望可用大小为128Mi，实际运行时不一定会用到这么多的资源。考虑到内存的资源类型，在超出指定大小运行时存在会被OOM killer杀死的可能性，于是该请求值属于理想中使用的内存上限。

-  资源限制

容器的资源需求仅能达到为其保证可用的最少资源量的目的，它并不会限制容器的可用资源上限，因此对因应用程序自身存在bug等多种原因而导致的系统资源被长期占用的情况则无计可施，这就需要通过limits属性定义资源的最大可用量。资源分配时，可压缩型资源cpu的控制阈可自由调节，容器进程无法获得超出其cpu配额的可用时间。不过，如果进程申请分配超出其limits属性定义的硬限制的内存资源时，它将被OOM killer杀死。不过，随后可能会被其控制进程所重启。例如，容器进程的pod对象会被杀死并重启（重启策略为always或onfailure时），或者是容器进程的子进程被其父进程所重启。也就是说，CPU是属于可压缩资源，可进行自由地调节。内存属于硬限制性资源，当进程申请分配超过limit属性定义的内存大小时，该Pod将被OOM killer杀死。

与requests不同的是，limits并不会影响pod的调度结果，也就是说，一个节点上的所有pod对象的limits数量之和可以大于节点所拥有的资源量，即支持资源的过载使用。不过，这么一来一旦资源耗尽，尤其是内存资源耗尽，则必然会有容器因OOMKilled而终止。另外，kubernetes仅会确保pod能够获得他们请求的cpu时间额度，他们能否获得额外的cpu时间，则取决于其他正在运行的作业对cpu资源的占用情况。例如，对于总数为1000m的cpu来说，容器a请求使用200m，容器b请求使用500m，在不超出它们各自的最大限额的前提下，余下的300m在双方都需要时会以2:5的方式进行配置。

资源限制配置示例:

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27 | [root@k8s-master ~]\# vim memleak-pod.yaml<br>apiVersion: v1<br>kind: Pod<br>metadata:<br>  name: memleak-pod<br>  labels:<br>    app: memleak<br>spec:<br>  containers:<br>  - name: simmemleak<br>    image: saadali/simmemleak<br>    resources:<br>      requests:<br>        memory: "64Mi"<br>        cpu: "1"<br>      limits:<br>        memory: "64Mi"<br>        cpu: "1"<br> <br>[root@k8s-master ~]\# kubectl apply -f memleak-pod.yaml<br>pod/memleak-pod created<br>[root@k8s-master ~]\# kubectl get pods -l app=memleak<br>NAME          READY     STATUS      RESTARTS   AGE<br>memleak-pod   0/1       OOMKilled   2          12s<br>[root@k8s-master ~]\# kubectl get pods -l app=memleak<br>NAME          READY     STATUS             RESTARTS   AGE<br>memleak-pod   0/1       CrashLoopBackOff   2          28s |


Pod资源默认的重启策略为Always，在上面例子中memleak因为内存限制而终止会立即重启，此时该Pod会被OOM killer杀死，在多次重复因为内存资源耗尽重启会触发Kunernetes系统的重启延迟，每次重启的时间会不断拉长，后面看到的Pod的状态通常为"CrashLoopBackOff"。

-  容器的可见资源

对于容器中运行top等命令观察资源可用量信息时，即便定义了requests和limits属性，虽然其可用资源受限于此两个属性的定义，但容器中可见资源量依然是节点级别可用总量。

-  Pod的服务质量类别（QoS）

这里还需要明确的是，kubernetes允许节点资源对limits的过载使用，这意味着节点无法同时满足其上的所有pod对象以资源满载的方式运行。在一个Kubernetes集群上，运行的Pod众多，那么当node节点都无法满足多个Pod对象的资源使用时 (节点内存资源紧缺时)，应该按照什么样的顺序去终止这些Pod对象呢？kubernetes无法自行对此做出决策，它需要借助于pod对象的优先级来判定终止Pod的优先问题。根据pod对象的requests和limits属性，kubernetes将pod对象归类到BestEffort、Burstable和Guaranteed三个服务质量类别：

Guaranteed：每个容器都为cpu资源设置了具有相同值的requests和limits属性，以及每个容器都为内存资源设置了具有相同值的requests和limits属性的pod资源会自动归属于此类别，这类pod资源具有最高优先级.

Burstable：至少有一个容器设置了cpu或内存资源的requests属性，但不满足Guaranteed类别要求的pod资源将自动归属此类别，它们具有中等优先级。

BestEffort：未为任何一个容器设置requests和limits属性的pod资源将自动归属于此类别，它们的优先级为最低级别。

内存资源紧缺时，BestEfford类别的容器将首当其冲地终止，因为系统不为其提供任何级别的资源保证，但换来的好处是：它们能够在可用时做到尽可能多地占用资源。若已然不存在BestEfford类别的容器，则接下来是有着中等优先级的Burstable类别的pod被终止。Guaranteed类别的容器拥有最高优先级，它们不会被杀死，除非其内存资源需求超限，或者OOM时没有其他更低优先级的pod资源存在。

每个运行状态的容器都有其OOM得分，得分越高越会被优先杀死。OOM得分主要根据两个维度进行计算：由QoS类别继承而来的默认分值和容器的可用内存资源比例。同等类别的pod资源的默认分值相同。同等级别优先级的pod资源在OOM时，与自身requests属性相比，其内存占用比例最大的pod对象将被首先杀死。需要特别说明的是，OOM是内存耗尽时的处理机制，它们与可压缩型资源cpu无关，因此cpu资源的需求无法得到保证时，pod仅仅是暂时获取不到相应的资源而已。

|   |   |
| - | - |
| 1<br>2<br>3 | 查看 Qos<br>[root@k8s-master01 ~]\# kubectl describe pod/prometheus-858989bcfb-ml5gk -n kube-system|grep "QoS Class"<br>QoS Class:       Burstable |


13.  Pod持久存储方式

volume是kubernetes Pod中多个容器访问的共享目录。volume被定义在pod上，被这个pod的多个容器挂载到相同或不同的路径下。volume的生命周期与pod的生命周期相同，pod内的容器停止和重启时一般不会影响volume中的数据。所以一般volume被用于持久化pod产生的数据。Kubernetes提供了众多的volume类型，包括emptyDir、hostPath、nfs、glusterfs、cephfs、ceph rbd等。

1.  emptyDir

emptyDir类型的volume在pod分配到node上时被创建，kubernetes会在node上自动分配 一个目录，因此无需指定宿主机node上对应的目录文件。这个目录的初始内容为空，当Pod从node上移除时，emptyDir中的数据会被永久删除。emptyDir Volume主要用于某些应用程序无需永久保存的临时目录，多个容器的共享目录等。下面是pod挂载emptyDir的示例:

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14 | apiVersion: v1<br>kind: Pod<br>metadata:<br>  name: test-pd<br>spec:<br>  containers:<br>  - image: gcr.io/google\_containers/test-webserver<br>    name: test-container<br>    volumeMounts:<br>    - mountPath: /cache<br>      name: cache-volume<br>  volumes:<br>  - name: cache-volume<br>    emptyDir: {} |


2.  hostPath

hostPath Volume为pod挂载宿主机上的目录或文件，使得容器可以使用宿主机的高速文件系统进行存储。缺点是，在k8s中，pod都是动态在各node节点上调度。当一个pod在当前node节点上启动并通过hostPath存储了文件到本地以后，下次调度到另一个节点上启动时，就无法使用在之前节点上存储的文件。下面是pod挂载hostPath的示例:

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16 | apiVersion: v1<br>kind: Pod<br>metadata:<br>  name: test-pd<br>spec:<br>  containers:<br>  - image: gcr.io/google\_containers/test-webserver<br>    name: test-container<br>    volumeMounts:<br>    - mountPath: /test-pd<br>      name: test-volume<br>  volumes:<br>  - name: test-volume<br>    hostPath:<br>      \# directory location on host<br>      path: /data |


3.  pod持久存储

方式一： pod直接挂载nfs-server

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5 | volumes:<br>  - name: nfs<br>    nfs:<br>      server: 192.168.1.1<br>      path:"/" |


静态提供：管理员手动创建多个PV，供PVC使用。

动态提供：动态创建PVC特定的PV，并绑定。

方式二： 手动创建PV

Persistent Volume(持久化卷)简称PV，是一个Kubernetes资源对象，我们可以单独创建一个PV，它不和Pod直接发生关系，而是通过Persistent Volume Claim，简称PVC来实现动态绑定, 我们会在Pod定义里指定创建好的PVC, 然后PVC会根据Pod的要求去自动绑定合适的PV给Pod使用。

持久化卷下PV和PVC概念

Persistent Volume（PV）是由管理员设置的存储，它是群集的一部分。就像节点是集群中的资源一样，PV 也是集群中的资源。 PV 是 Volume 之类的卷插件，但具有独立于使用 PV 的 Pod 的生命周期。此 API 对象包含存储实现的细节，即 NFS、iSCSI 或特定于云供应商的存储系统。

PersistentVolumeClaim（PVC）是用户存储的请求。它与 Pod 相似，Pod 消耗节点资源，PVC 消耗 PV 资源。Pod 可以请求特定级别的资源（CPU 和内存）。PVC声明可以请求特定的大小和访问模式（例如，可以以读/写一次或只读多次模式挂载）。

它和普通Volume的区别是什么呢？

普通Volume和使用它的Pod之间是一种静态绑定关系，在定义Pod的文件里，同时定义了它使用的Volume。Volume是Pod的附属品，我们无法单独创建一个Volume，因为它不是一个独立的Kubernetes资源对象。

配置示例:

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13 | pv.yaml<br>apiVersion: v1<br>kind: PersistentVolume<br>metadata:<br>  name: pv003<br>spec:<br>  capacity:<br>    storage: 5Gi<br>  accessModes:<br>    - ReadWriteOnce<br>  nfs:<br>    path: /somepath<br>    server: 192.168.1.1 |


查看PV

|   |   |
| - | - |
| 1<br>2<br>3<br>4 | \# kubectl get pv<br>NAME                                       CAPACITY   ACCESSMODES   RECLAIMPOLICY   STATUS    CLAIM                             STORAGECLASS     REASON    AGE<br>nfs-pv-heketi                              300Mi      ROX           Retain          Bound     default/nfs-pvc-heketi                                       7d<br>pvc-02b8a30d-8e28-11e7-a07a-025622f1d9fa   50Gi       RWX           Retain          Bound     kube-public/jenkins-pvc           heketi-storage             5d |


PV可以设置三种回收策略：保留（Retain），回收（Recycle）和删除（Delete）。

保留策略：允许人工处理保留的数据。

删除策略：将删除pv和外部关联的存储资源，需要插件支持。

回收策略：将执行清除操作，之后可以被新的pvc使用，需要插件支持。

PV的状态:

Available ：资源尚未被claim使用

Bound ：已经绑定到某个pvc上

Released ： 对应的pvc被删除,但是资源还没有被集群回收

Failed ： 自动回收失败

PV访问权限

ReadWriteOnce ： 被单个节点mount为读写rw模式

ReadOnlyMany ： 被多个节点mount为只读ro模式

ReadWriteMany ： 被多个节点mount为读写rw模式

配置示例

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19 | pv的配置定义<br>\# pvc.yaml<br>kind: PersistentVolumeClaim<br>apiVersion: v1<br>metadata:<br>  name: myclaim<br>spec:<br>  accessModes:<br>    - ReadWriteOnce<br>  resources:<br>    requests:<br>      storage: 5Gi<br> <br>pod配置文件中应用pv<br>\# mypod.yaml<br>volumes:<br>  - name: mypod<br>    persistentVolumeClaim:<br>      claimName: myclaim |


kubernetes 快速批量创建 PV & PVC 脚本

-  快速批量创建nfs pv

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17 | for i in {3..6}; do<br>cat &lt;&lt;EOF | kubectl apply -f -<br>apiVersion: v1<br>kind: PersistentVolume<br>metadata:<br>  name: pv00${i}<br>spec:<br>  capacity:<br>    storage: 100Gi<br>  accessModes:<br>    - ReadWriteOnce  \#这里根据需要配置ReadWriteOnce或者ReadWriteMany<br>  persistentVolumeReclaimPolicy: Recycle<br>  nfs:<br>    path: /volume1/harbor/nfs${i}<br>    server: 192.168.2.4<br>EOF<br>done          |


-  快速批量创建nfs pvc

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14 | for i in {3..6}; do<br>cat &lt;&lt;EOF | kubectl delete -f -<br>kind: PersistentVolumeClaim<br>apiVersion: v1<br>metadata: <br>  name: pvc00${i}-claim<br>spec: <br>  accessModes:  <br>    - ReadWriteOnce<br>  resources:   <br>    requests:     <br>      storage: 100Gi<br>EOF<br>done |


14.  Pod水平自动扩展（HPA）

Kubernetes有一个强大的功能，它能在运行的服务上进行编码并配置弹性伸缩。如果没有弹性伸缩功能，就很难适应部署的扩展和满足SLAs。这一功能称为Horizontal Pod Autoscaler (HPA)，这是kubernetes的一个很重要的资源对象。HPA是Kubernetes中弹性伸缩API组下的一个API资源。当前稳定的版本是autoscaling/v1，它只提供了对CPU自动缩放的支持。

Horizontal Pod Autoscaling，即pod的水平自动扩展。自动扩展主要分为两种，其一为水平扩展，针对于实例数目的增减；其二为垂直扩展，即单个实例可以使用的资源的增减。HPA属于水平自动扩展。HPA的操作对象是RC、RS或Deployment对应的Pod，根据观察到的CPU等实际使用量与用户的期望值进行比对，做出是否需要增减实例数量的决策。

1.  为什么使用HPA

使用HPA，可以根据资源的使用情况或者自定义的指标，实现部署的自动扩展和缩减，让部署的规模接近于实际服务的负载。HPA可以为您的服务带来两个直接的帮助：

- 在需要计算和内存资源时提供资源，在不需要时释放它们

- 按需增加/降低性能以实现SLA

2.  HPA原理

它根据Pod当前系统的负载来自动水平扩容，如果系统负载超过预定值，就开始增加Pod的个数，如果低于某个值，就自动减少Pod的个数。目前Kubernetes的HPA只能根据CPU等资源使用情况去度量系统的负载。HPA会根据监测到的CPU/内存利用率（资源指标），或基于第三方指标应用程序（如Prometheus等）提供的自定义指标，自动调整副本控制器、部署或者副本集合的pods数量（定义最小和最大pods数）。HPA是一种控制回路，它的周期由Kubernetes的controller manager 的--horizontal-pod-autoscaler-sync-period标志控制（默认值是30s）。

![](images/05695F1211004ED295664C1E04667D0C06-983371113.png)

在一般情况下HPA是由kubectl来提供支持的。可以使用kubectl进行创建、管理和删除：

创建HPA

- 带有manifest: "kubectl create -f <HPA_MANIFEST>"

- 没有manifest(只支持CPU)："kubectl autoscale deployment hello-world –min=2 --man=5 –-cpu-percent=50"

获取hpa信息

- 基本信息: "kubectl get hpa hello-world"

- 细节描述: "kubectl describe hpa hello-world"

删除hpa

# kubectl delete hpa hello-world

下面是一个HPA manifest定义的例子：

![](images/F53D9336CA45457CAFD09DED2E63D80A96-452606415.png)

这里使用了autoscaling/v2beta1版本，用到了cpu和内存指标

控制hello-world项目部署的自动缩放

定义了副本的最小值1

定义了副本的最大值10

当满足时调整大小：

- CPU使用率超过50%

- 内存使用超过100Mi

3.  HPA条件

HPA通过定期（定期轮询的时间通过--horizontal-pod-autoscaler-sync-period选项来设置，默认的时间为30秒）通过Status.PodSelector来查询pods的状态，获得pod的CPU使用率。然后，通过现有pods的CPU使用率的平均值（计算方式是最近的pod使用量（最近一分钟的平均值，从heapster中获得）除以设定的每个Pod的CPU使用率限额）跟目标使用率进行比较，并且在扩容时，还要遵循预先设定的副本数限制：MinReplicas <= Replicas <= MaxReplicas。

计算扩容后Pod的个数：sum(最近一分钟内某个Pod的CPU使用率的平均值)/CPU使用上限的整数+1

4.  HPA流程

- 创建HPA资源，设定目标CPU使用率限额，以及最大、最小实例数

- 收集一组中（PodSelector）每个Pod最近一分钟内的CPU使用率，并计算平均值

- 读取HPA中设定的CPU使用限额

- 计算：平均值之和/限额，求出目标调整的实例个数

- 目标调整的实例数不能超过1中设定的最大、最小实例数，如果没有超过，则扩容；超过，则扩容至最大的实例个数

- 回到2，不断循环

5.  HPA例外

考虑到自动扩展的决策可能需要一段时间才会生效，甚至在短时间内会引入一些噪声。例如当pod所需要的CPU负荷过大，从而运行一个新的pod进行分流，在创建过程中，系统的CPU使用量可能会有一个攀升的过程。所以，在每一次作出决策后的一段时间内，将不再进行扩展决策。对于ScaleUp (纵向扩展)而言，这个时间段为3分钟，Scaledown为5分钟。

HPA允许一定范围内的CPU使用量的不稳定，只有 avg(CurrentPodsConsumption) / Target 小于90%或者大于110%时才会触发扩容或缩容，避免频繁扩容、缩容造成颠簸。

【扩展】

Scale Up (纵向扩展) ：主要是利用现有的存储系统，通过不断增加存储容量来满足数据增长的需求。但是这种方式只增加了容量，而带宽和计算能力并没有相应的增加。所以，整个存储系统很快就会达到性能瓶颈，需要继续扩展。

Scale-out (横向扩展)：通常是以节点为单位，每个节点往往将包含容量、处理能力和I / O带宽。一个节点被添加到存储系统，系统中的三种资源将同时升级。这种方式容量增长和性能扩展(即增加额外的控制器)是同时进行。而且，Scale-out架构的存储系统在扩展之后，从用户的视角看起来仍然是一个单一的系统，这一点与我们将多个相互独立的存储系统简单的叠加在一个机柜中是完全不同的。所以scale out方式使得存储系统升级工作大大简化，用户能够真正实现按需购买，降低TCO。

6.  为什么HPA选择相对比率

为了简便，选用了相对比率（90%的CPU资源）而不是0.6个CPU core来描述扩容、缩容条件。如果选择使用绝对度量，用户需要保证目标（限额）要比请求使用的低，否则，过载的Pod未必能够消耗那么多，从而自动扩容永远不会被触发：假设设置CPU为1个核，那么这个pod只能使用1个核，可能Pod在过载的情况下也不能完全利用这个核，所以扩容不会发生。在修改申请资源时，还有同时调整扩容的条件，比如将1个core变为1.2core，那么扩容条件应该同步改为1.2core，这样的话，就真是太麻烦了，与自动扩容的目标相悖。

7.  安装需求

在HPA可以在Kubernetes集群上使用之前，有一些元素需要在系统中安装和配置。检查确定Kubernetes集群服务正在运行并且至少包含了这些标志:

kube-api：requestheader-client-ca-file

kubelet：read-only-port 在端口10255

kube-controller：可选，只在需要和默认值不同时使用

horizontal-pod-autoscaler-downscale-delay：”5m0s”

horizontal-pod-autoscaler-upscale-delay：”3m0s”

horizontal-pod-autoscaler-sync-period： “30s”

HPA的实例说明：

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41<br>42<br>43<br>44<br>45<br>46<br>47<br>48<br>49<br>50<br>51<br>52<br>53<br>54<br>55<br>56<br>57<br>58<br>59<br>60<br>61<br>62<br>63<br>64<br>65<br>66<br>67<br>68<br>69<br>70<br>71<br>72<br>73<br>74<br>75<br>76<br>77<br>78<br>79<br>80<br>81<br>82<br>83<br>84<br>85<br>86<br>87<br>88<br>89<br>90<br>91<br>92<br>93<br>94<br>95<br>96<br>97<br>98<br>99<br>100<br>101<br>102<br>103<br>104 | 1）创建Deployment<br>[root@k8s-master01 ~]\# cat &lt;&lt; EOF &gt; lykops-hpa-deploy.yaml<br>apiVersion: extensions/v1beta1<br>kind: Deployment<br>metadata:<br>  name: lykops-hpa-deploy<br>  labels:<br>    software: apache<br>    project: lykops<br>    app: hpa<br>    version: v1     <br>spec:<br>  replicas: 1<br>  selector:<br>    matchLabels:<br>      name: lykops-hpa-deploy<br>      software: apache<br>      project: lykops<br>      app: hpa<br>      version: v1<br>  template:<br>    metadata:<br>      labels:<br>        name: lykops-hpa-deploy<br>        software: apache<br>        project: lykops<br>        app: hpa<br>        version: v1<br>    spec:<br>      containers:<br>      - name: lykops-hpa-deploy<br>        image: web:apache<br>        command: [ "sh", "/etc/run.sh" ]<br>        ports:<br>        - containerPort: 80<br>          name: http<br>          protocol: TCP<br>        resources:<br>          requests:<br>            cpu: 0.001<br>            memory: 4Mi<br>          limits:<br>            cpu: 0.01<br>            memory: 16Mi<br>EOF<br> <br>创建这个实例<br>[root@k8s-master01 ~]\# kubectl create -f lykops-hpa-deploy.yaml --record<br> <br>2）创建service<br>[root@k8s-master01 ~]\#<br>cat &lt;&lt; EOF &gt; lykops-hpa-deploy-svc.yaml<br>apiVersion: v1<br>kind: Service<br>metadata:<br>  name: lykops-hpa-svc<br>  labels:<br>    software: apache<br>    project: lykops<br>    app: hpa<br>    version: v1<br>spec:<br>  selector:<br>    software: apache<br>    project: lykops<br>    app: hpa<br>    version: v1<br>    name: lykops-hpa-deploy<br>  ports:<br>  - name: http<br>    port: 80<br>    protocol: TCP<br>EOF<br> <br>创建这个service<br>[root@k8s-master01 ~]\# kubectl create -f lykops-hpa-deploy-svc.yaml<br> <br>3）创建HPA<br>[root@k8s-master01 ~]\# cat &lt;&lt; EOF &gt; lykops-hpa.yaml<br>apiVersion: autoscaling/v1<br>kind: HorizontalPodAutoscaler<br>metadata:<br>  name: lykops-hpa<br>  labels:<br>    software: apache<br>    project: lykops<br>    app: hpa<br>    version: v1<br>spec:<br>  scaleTargetRef:<br>    apiVersion: v1<br>    kind: Deployment<br>    name: lykops-hpa-deploy<br>    \#这里只能为这三项<br>  minReplicas: 1<br>  maxReplicas: 10<br>  targetCPUUtilizationPercentage: 5<br>EOF<br> <br>创建这个HPA<br>[root@k8s-master01 ~]\# kubectl create -f lykops-hpa.yaml<br> <br>4）测试<br>多台机器不断访问service的clusterIP地址，然后可以看出是否增加pod数了 |


*************** 当你发现自己的才华撑不起野心时，就请安静下来学习吧！***************
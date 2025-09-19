Kubernetes容器集群 - Secret（特殊存储卷）

 

一、Secret介绍

在Kubernetes集群资源中，Secret对象与ConfigMap对象类似，但它主要是用于存储小片敏感的需要加密的数据，例如密码，token和SSH key密钥等等。这类数据当然也可以存放在Pod的定义中或者镜像中，但是放在Secret中是为了更方便的控制如何使用数据，更加安全和灵活，并减少信息暴露的风险。在secret中存储的数据都需要通过base64进行转换加密后存放。Secret解决了密码、token、密钥等敏感数据的配置问题，使用Secret可以避免把这些敏感数据以明文的形式暴露到镜像或者Pod Spec中。用户可以创建自己的secret，系统也会有自己的secret。

Secret一旦被创建，则可以通过以下三种方式来使用：

-> 在创建Pod时，通过为pod指定Service Account来自动使用该Secret，主要用于API Server鉴权的过程；

-> 通过挂载Secret到Pod来使用它。即作为volume的一个域被一个或多个容器挂载；

-> Docker镜像下载时使用，通过指定Pod的spc.ImagePullSecret来引用。一般用于私有仓库登录拉取镜像。即在拉取镜像的时候被kubelet引用。

Kubernetes集群中有內建的Secrets：即由ServiceAccount创建的API证书附加的秘钥，Kubernetes会自动生成的用来访问apiserver的Secret，所有Pod会默认使用这个Secret与apiserver通信。这是Kubernetes 默认的行为，也可以通过自定义的方式禁用或者创建我们所需要的Secret。

二、Secret 类型和使用

-> Opaque：使用base64编码存储信息，可以通过base64 --decode解码获得原始数据，因此安全性弱。

-> kubernetes.io/dockerconfigjson：用于存储docker registry的认证信息。

-> kubernetes.io/service-account-token （即Service Account）：用于被 serviceaccount 引用。serviceaccout 创建时，Kubernetes 会默认创建对应的 secret。Pod 如果使用了 serviceaccount，对应的 secret 会自动挂载到 Pod 的 /run/secrets/kubernetes.io/serviceaccount 目录中。Service Account 是内置secret，使用 API 凭证自动创建和附加secret。Kubernetes 自动创建包含访问API凭据的secret，并自动修改pod以使用此类型的secret。如果需要，可以禁用或覆盖自动创建和使用API凭据。但是，如果需要的只是安全地访问apiserver，则推荐这样的工作流程。

第一种类型： Opaque Secret

Opaque类型的Secret，其value为base64编码后的值。

1）从文件中创建Secret：分别创建两个名为username.txt和password.txt的文件

|   |   |
| - | - |
| 1<br>2 | [root@k8s-master01 ~]\# echo -n "shibo" &gt; ./username.txt    <br>[root@k8s-master01 ~]\# echo -n "shibo@123" &gt; ./password.txt |


使用kubectl create secret命令创建secret，该命令将这些文件打包到一个Secret中并在API server中创建了一个对象。

|   |   |
| - | - |
| 1<br>2 | [root@k8s-master01 ~]\# kubectl create secret generic shibo-secret --from-file=./username.txt --from-file=./password.txt    <br>secret/shibo-secret created |


2）使用描述文件创建Secret:  首先使用base64对数据进行编码

|   |   |
| - | - |
| 1<br>2<br>3<br>4 | [root@k8s-master01 ~]\# echo -n 'kevin\_bo' | base64<br>a2V2aW5fYm8=<br>[root@k8s-master01 ~]\# echo -n 'kevin@123' | base64<br>a2V2aW5AMTIz |


创建一个类型为Secret的描述文件

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9 | [root@k8s-master01 ~]\# cat secret.yaml<br>apiVersion: v1<br>kind: Secret<br>metadata:<br>  name: mysecret<br>type: Opaque<br>data:<br>  username: a2V2aW5fYm8=<br>  password: a2V2aW5AMTIz |


执行创建

|   |   |
| - | - |
| 1<br>2 | [root@k8s-master01 ~]\# kubectl create -f secret.yaml<br>secret/mysecret created |


查看此Secret

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30 | [root@k8s-master01 ~]\# kubectl get secret|grep "shibo"<br>shibo-secret                   Opaque                                2      2m27s<br> <br>[root@k8s-master01 ~]\# kubectl get secret shibo-secret -o yaml <br>apiVersion: v1<br>data:<br>  password.txt: c2hpYm9AMTIz<br>  username.txt: c2hpYm8=<br>kind: Secret<br>metadata:<br>  creationTimestamp: "2019-06-26T11:20:17Z"<br>  name: shibo-secret<br>  namespace: default<br>  resourceVersion: "1152263"<br>  selfLink: /api/v1/namespaces/default/secrets/shibo-secret<br>  uid: 607ea323-9804-11e9-90d4-005056ac7c81<br>type: Opaque<br> <br>[root@k8s-master01 ~]\# kubectl describe secret/shibo-secret    <br>Name:         shibo-secret<br>Namespace:    default<br>Labels:       &lt;none&gt;<br>Annotations:  &lt;none&gt;<br> <br>Type:  Opaque<br> <br>Data<br>====<br>username.txt:  5 bytes<br>password.txt:  9 bytes |


需要注意：默认情况下，get 和 describe 命令都不会显示文件的内容。这是为了防止将secret中的内容被意外暴露给从终端日志记录中刻意寻找它们的人。

3）Secret的使用

创建好Secret之后，可以通过两种方式使用：

-> 以Volume方式

-> 以环境变量方式

Secret 可以作为数据卷被挂载，或作为环境变量暴露出来以供 pod 中的容器使用。它们也可以被系统的其他部分使用，而不直接暴露在 pod 内。例如，它们可以保存凭据，系统的其他部分应该用它来代表您与外部系统进行交互。

在 Pod 中的 volume 里使用 Secret：

-> 创建一个 secret 或者使用已有的 secret。多个 pod 可以引用同一个 secret。

-> 修改您的 pod 的定义在 spec.volumes[] 下增加一个 volume。可以给这个 volume 随意命名，它的 spec.volumes[].secret.secretName 必须等于 secret 对象的名字。

-> 将下面的配置

|   |   |
| - | - |
| 1 | spec.containers[].volumeMounts[] |


加到需要用到该 secret 的容器中。指定下面的配置

|   |   |
| - | - |
| 1 | spec.containers[].volumeMounts[].readOnly = true |


并设置下面内容为想要该 secret 出现的尚未使用的目录。

|   |   |
| - | - |
| 1 | spec.containers[].volumeMounts[].mountPath |


-> 修改镜像并且/或者命令行让程序从该目录下寻找文件。Secret的data映射中的每一个键都成为了mountPath下的一个文件名。

3.1   将Secret挂载到Volume中 （下面是一个在pod中使用volume挂载secret的例子）

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16 | apiVersion: v1<br>kind: Pod<br>metadata:<br>  name: mypod<br>spec:<br>  containers:<br>  - name: mypod<br>    image: redis<br>    volumeMounts:<br>    - name: data<br>      mountPath: "/etc/data"<br>      readOnly: true<br>  volumes:<br>  - name: data<br>    secret:<br>      secretName: shibo-secret |


进入Pod查看挂载的Secret：

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6 | \# ls /etc/data<br>password.txt  username.txt<br>\# cat  /etc/data/username.txt<br>kevin<br>\# cat  /etc/data/password.txt<br>kevin@123 |


想要用的每个secret都需要在spec.volumes 中指明。如果pod中有多个容器，每个容器都需要自己的volumeMounts配置块，但是每个secret只需要一个spec.volumes。还可以打包多个文件到一个secret中，或者使用的多个secret，怎样方便就怎样来。也可以向特性路径映射secret密钥。

还可以控制Secret key映射在 volume 中的路径，可以使用 spec.volumes[].secret.items字段修改每个key的目标路径。也就是说可以只挂载Secret中特定的key：

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19 | apiVersion: v1<br>kind: Pod<br>metadata:<br>  name: mypod<br>spec:<br>  containers:<br>  - name: mypod<br>    image: redis<br>    volumeMounts:<br>    - name: data<br>      mountPath: "/etc/data"<br>      readOnly: true<br>  volumes:<br>  - name: data<br>    secret:<br>      secretName: shibo-secret<br>      items:<br>      - key: username<br>        path: my-group/my-username |


需要注意，在这种情况下：

username 存储在 /etc/data/my-group/my-username中

password 未被挂载

如果使用了 spec.volumes[].secret.items，只有在 items 中指定的 key 被影射。要使用 secret 中所有的 key，所有这些都必须列在 items 字段中。所有列出的密钥必须存在于相应的 secret 中。否则，不会创建卷。

3.2   将Secret设置为环境变量

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20 | apiVersion: v1<br>kind: Pod<br>metadata:<br>  name: secret-env-pod<br>spec:<br>  containers:<br>  - name: mycontainer<br>    image: redis<br>    env:<br>      - name: SECRET\_USERNAME<br>        valueFrom:<br>          secretKeyRef:<br>            name: shibo-secret<br>            key: username<br>      - name: SECRET\_PASSWORD<br>        valueFrom:<br>          secretKeyRef:<br>            name: shibo-secret<br>            key: password<br>  restartPolicy: Never |


第二种类型：kubernetes.io/dockerconfigjson

kubernetes.io/dockerconfigjson用于存储docker registry的认证信息，可以直接使用kubectl create secret命令创建：

|   |   |
| - | - |
| 1<br>2 | [root@k8s-master01 ~]\# kubectl create secret docker-registry myregistrykey --docker-server=DOCKER\_REGISTRY\_SERVER --docker-username=DOCKER\_USER --docker-password=DOCKER\_PASSWORD --docker-email=DOCKER\_EMAIL<br>secret/myregistrykey created |


查看secret的内容：

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16 | [root@k8s-master01 ~]\# kubectl get secret|grep myregistrykey<br>myregistrykey                  kubernetes.io/dockerconfigjson        1      54s<br> <br>[root@k8s-master01 ~]\# kubectl get secret myregistrykey  -o yaml<br>apiVersion: v1<br>data:<br>  .dockerconfigjson: eyJhdXRocyI6eyJET0NLRVJfUkVHSVNUUllfU0VSVkVSIjp7InVzZXJuYW1lIjoiRE9DS0VSX1VTRVIiLCJwYXNzd29yZCI6IkRPQ0tFUl9QQVNTV09SRCIsImVtYWlsIjoiRE9DS0VSX0VNQUlMIiwiYXV0aCI6IlJFOURTMFZTWDFWVFJWSTZSRTlEUzBWU1gxQkJVMU5YVDFKRSJ9fX0=<br>kind: Secret<br>metadata:<br>  creationTimestamp: "2019-06-26T11:35:22Z"<br>  name: myregistrykey<br>  namespace: default<br>  resourceVersion: "1153734"<br>  selfLink: /api/v1/namespaces/default/secrets/myregistrykey<br>  uid: 7b769a8a-9806-11e9-90d4-005056ac7c81<br>type: kubernetes.io/dockerconfigjson |


通过 base64 对 secret 中的内容解码：

|   |   |
| - | - |
| 1<br>2 | [root@k8s-master01 ~]\# echo "eyJhdXRocyI6eyJET0NLRVJfUkVHSVNUUllfU0VSVkVSIjp7InVzZXJuYW1lIjoiRE9DS0VSX1VTRVIiLCJwYXNzd29yZCI6IkRPQ0tFUl9QQVNTV09SRCIsImVtYWlsIjoiRE9DS0VSX0VNQUlMIiwiYXV0aCI6IlJFOURTMFZTWDFWVFJWSTZSRTlEUzBWU1gxQkJVMU5YVDFKRSJ9fX0=" | base64 --decode<br>{"auths":{"DOCKER\_REGISTRY\_SERVER":{"username":"DOCKER\_USER","password":"DOCKER\_PASSWORD","email":"DOCKER\_EMAIL","auth":"RE9DS0VSX1VTRVI6RE9DS0VSX1BBU1NXT1JE"}}} |


在创建 Pod 的时候，通过 imagePullSecrets 来引用刚创建的 myregistrykey:

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10 | apiVersion: v1<br>kind: Pod<br>metadata:<br>  name: data<br>spec:<br>  containers:<br>    - name: data<br>      image: janedoe/awesomeapp:v1<br>  imagePullSecrets:<br>    - name: myregistrykey |


第三种类型：kubernetes.io/service-account-token

用于被 serviceaccount 引用。serviceaccout 创建时 Kubernetes 会默认创建对应的 secret。Pod 如果使用了 serviceaccount，对应的 secret 会自动挂载到 Pod 的 /run/secrets/kubernetes.io/serviceaccount 目录中。

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11 | [root@k8s-master01 ~]\# kubectl run kevin\_nginx --image nginx<br>deployment "nginx" created<br> <br>[root@k8s-master01 ~]\# kubectl get pods<br>NAME                           READY     STATUS    RESTARTS   AGE<br>kevin\_nginx-3137573019-md1u2   1/1       Running   0          13s<br> <br>[root@k8s-master01 ~]\# kubectl exec kevin\_nginx-3137573019-md1u2 ls /run/secrets/kubernetes.io/serviceaccount<br>ca.crt<br>namespace<br>token |


*************** 当你发现自己的才华撑不起野心时，就请安静下来学习吧！***************

分类: Docker

好文要顶 关注我 收藏该文 

![](images/EA8DF6F562FA4E89BBF039E6B11A85B6con_weibo_24.png)

 

![](images/D7A49AD0E5974A108B7EC8BA4BE41150wechat.png)

![](images/859A96D78CBF438EAA1C3B1348E2AD0D161124180837.png)

散尽浮华

关注 - 23

粉丝 - 3133

+加关注

0

0

« 上一篇： Nginx/Apache之伪静态设置 - 运维小结

» 下一篇： ProxySQL Cluster 高可用集群环境部署记录
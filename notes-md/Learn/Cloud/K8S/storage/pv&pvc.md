利用 AWS 的 EBS 为 kubernetes 集群添加持久化存储

Nov 22, 2017 |  阅读 |  459 字 |  2 分钟

0 条评论

文章目录

1. 1. 创建一个 EBS 卷

1. 2. 创建 K8S 中的 Persistent Volume (PV)

1. 3. 创建 Persistent Volume Claim

1. 4. 在 POD 中使用 PVC

1. 5. Some Tips

1. 6. References

推荐文章（由hexo文章推荐插件驱动）

本文介绍如何创建一个 EBS 卷，并把这个 EBS 卷挂载到 kubernetes 集群里的 POD 上。

创建一个 EBS 卷

用 aws configure 配置好 aws 命令行之后（如果开启了 mfa ，需要先调用下 eval $(aws-mfa)），我们便可以调用下面的命令创建一个 EBS 卷：

|   |
| - |
| aws ec2 create-volume --availability-zone us-east-1a --size 20 --volume-type gp2 |


上面的命令会得到类似下面的输出：

|   |
| - |
| {<br>    "AvailabilityZone": "us-east-1a",<br>    "Encrypted": false,<br>    "VolumeType": "gp2",<br>    "VolumeId": "vol-123456we7890ilk12",<br>    "State": "creating",<br>    "Iops": 100,<br>    "SnapshotId": "",<br>    "CreateTime": "2017-01-04T03:53:00.298Z",<br>    "Size": 20<br>} |


记录下 VolumeId ，会在后面的步骤中用到。

创建 K8S 中的 Persistent Volume (PV)

创建文件 aws-pv.yaml：

|   |
| - |
| apiVersion: "v1"<br>kind: "PersistentVolume"<br>metadata:<br>  name: "aws-pv" <br>  labels:<br>    type: amazonEBS<br>spec:<br>  capacity:<br>    storage: "10Gi" <br>  accessModes:<br>    - ReadWriteOnce<br>  awsElasticBlockStore: <br>    fsType: "ext4" <br>    volumeID: "vol-123456we7890ilk12" |


利用 kubectl 创建 Persistent Volume ：

|   |
| - |
| kubectl apply -f aws-pv.yaml |


可用命令 kubectl get pv 来查看创建的 Persistent Volume 的状态：

|   |
| - |
| NAME       CAPACITY   ACCESSMODES   RECLAIMPOLICY   STATUS      CLAIM               REASON    AGE<br>aws-pv     10Gi        RWX           Retain          Available                                7s |


创建 Persistent Volume Claim

创建 Persistent Volume Claim (PVC) 和之前创建的 PV 进行绑定，K8S 中的 POD 通过 PVC 来使用 PV 。

创建文件 pvc.yaml ：

|   |
| - |
| kind: PersistentVolumeClaim<br>apiVersion: v1<br>metadata:<br>  name: aws-pvc<br>  labels:<br>    type: amazonEBS<br>spec:<br>  accessModes:<br>    - ReadWriteOnce<br>  resources:<br>    requests:<br>      storage: 10Gi |


通过 kubectl 创建 PVC ：

|   |
| - |
| kubectl apply -f pvc.yaml |


查看创建的 PVC ：

|   |
| - |
| kubectl get pvc |


在 POD 中使用 PVC

先创建对应 PVC 的 volume ：

|   |
| - |
| volumes:<br>- name: data-repa<br>  persistentVolumeClaim:<br>    claimName: aws-pvc |


再添加 mount ：

|   |
| - |
| volumeMounts:<br>- name: data-repa<br>  mountPath: /ads/data/pusher |


Some Tips

一个 EBS 最多只能挂在到一台 EC2 上，如果希望多台机器上的 POD 能共享数据， 则需要使用 EFS、NFS 或 GlusterFS。

References
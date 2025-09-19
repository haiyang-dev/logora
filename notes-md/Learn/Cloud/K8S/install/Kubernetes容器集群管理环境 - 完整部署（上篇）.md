 Kubernetes容器集群管理环境 - 完整部署（上篇）

Kubernetes（通常称为"K8S"）是Google开源的容器集群管理系统。其设计目标是在主机集群之间提供一个能够自动化部署、可拓展、应用容器可运营的平台。Kubernetes通常结合docker容器工具工作，并且整合多个运行着docker容器的主机集群，Kubernetes不仅仅支持Docker，还支持Rocket，这是另一种容器技术。Kubernetes是一个用于容器集群的自动化部署、扩容以及运维的开源平台。通过Kubernetes, 可以快速有效地响应用户需求：

->  快速而有预期地部署应用；

->  极速地扩展你的应用；

->  无缝对接新的应用功能；

->  节省资源，优化硬件资源的使用；

Kubernetes功能特性：

->  自动化容器部署与复制

->  随时扩展或收缩容器规模

->  组织容器成组，提供容器间的负载均衡

->  快速更新及回滚容器版本

->  提供弹性伸缩，如果某个容器失效就进行替换

Kubernetes重要组件：

1）Master组件

Master节点上面主要由四个模块组成：APIServer、scheduler、controller manager、etcd

->  APIServer: 负责对外提供RESTful的Kubernetes API服务，它是系统管理指令的统一入口，任何对资源进行增删改查的操作都要交给APIServer处理后再提交给etcd。kubectl（k8s提供的客户端工具，该工具内部就是对Kubernetes API的调用）是直接和APIServer交互的。

->  schedule: 它的职责很明确，就是负责调度pod到合适的Node上。如果把scheduler看成一个黑匣子，那么它的输入是pod和由多个Node组成的列表，输出是Pod和一个Node的绑定，即将这个pod部署到这个Node上。Kubernetes目前提供了调度算法，但是同样也保留了接口，用户可以根据自己的需求定义自己的调度算法。

->  controller manager: 如果说APIServer做的是“前台”的工作的话，那controller manager就是负责“后台”的。每个资源一般都对应有一个控制器，而controller manager就是负责管理这些控制器的。比如我们通过APIServer创建一个pod，当这个pod创建成功后，APIServer的任务就算完成了。而后面保证Pod的状态始终和我们预期的一样的重任就由controller manager去保证了。

-> etcd: 它是一个高可用的键值存储系统，Kubernetes使用它来存储各个资源的状态，从而实现了Restful的API。

2）Node组件

每个Node节点主要由三个模块组成：kubelet、kube-proxy、runtime。

runtime。runtime指的是容器运行环境，目前Kubernetes支持docker和rkt两种容器。

-> kubelet:Kubelet是Master在每个Node节点上面的agent，是Node节点上面最重要的模块，它负责维护和管理该Node上面的所有容器，但是如果容器不是通过Kubernetes创建的，它并不会管理。本质上，它负责使Pod得运行状态与期望的状态一致。

-> kube-proxy:该模块实现了Kubernetes中的服务发现和反向代理功能。反向代理方面：kube-proxy支持TCP和UDP连接转发，默认基于Round Robin算法将客户端流量转发到与service对应的一组后端pod。服务发现方面，kube-proxy使用etcd的watch机制，监控集群中service和endpoint对象数据的动态变化，并且维护一个service到endpoint的映射关系，从而保证了后端pod的IP变化不会对访问者造成影响。另外kube-proxy还支持session affinity。

3）Pod

Pod是k8s进行资源调度的最小单位，每个Pod中运行着一个或多个密切相关的业务容器，这些业务容器共享这个Pause容器的IP和Volume，我们以这个不易死亡的Pause容器作为Pod的根容器，以它的状态表示整个容器组的状态。一个Pod一旦被创建就会放到Etcd中存储，然后由Master调度到一个Node绑定，由这个Node上的Kubelet进行实例化。每个Pod会被分配一个单独的Pod IP，Pod IP + ContainerPort 组成了一个Endpoint。

4）Service

Service其功能使应用暴露，Pods 是有生命周期的，也有独立的 IP 地址，随着 Pods 的创建与销毁，一个必不可少的工作就是保证各个应用能够感知这种变化。这就要提到 Service 了，Service 是 YAML 或 JSON 定义的由 Pods 通过某种策略的逻辑组合。更重要的是，Pods 的独立 IP 需要通过 Service 暴露到网络中。

K8s集群可以帮助培育出一个组件及工具的生态，帮助减轻在公有云及私有云上运行应用的负担。之前已经详细介绍了Kubernetes的概念和原理， 对Kubernetes集群部署做一整理和记录，方便后续作为手册来用（参考来源）。

搭建Kubernetes集群环境有以下三种方式：

1. Minikube安装方式

Minikube是一个工具，可以在本地快速运行一个单点的Kubernetes，尝试Kubernetes或日常开发的用户使用。但是这种方式仅可用于学习和测试部署，不能用于生产环境。

2. Kubeadm安装方式

kubeadm是一个kubernetes官方提供的快速安装和初始化拥有最佳实践（best practice）的kubernetes集群的工具，提供kubeadm init和kubeadm join，用于快速部署Kubernetes集群。目前kubeadm还处于beta 和alpha状态，不推荐用在生产环境，但是可以通过学习这种部署方法来体会一些官方推荐的kubernetes最佳实践的设计和思想。

kubeadm的目标是提供一个最小可用的可以通过Kubernetes一致性测试的集群，所以并不会安装任何除此之外的非必须的addon。kubeadm默认情况下并不会安装一个网络解决方案，所以用kubeadm安装完之后，需要自己来安装一个网络的插件。所以说，目前的kubeadm是不能用于生产环境的

3. 二进制包安装方式（生产部署的推荐方式）

从官方下载发行版的二进制包，手动部署每个组件，组成Kubernetes集群，这种方式符合企业生产环境标准的Kubernetes集群环境的安装，可用于生产方式部署。

一、基础信息

使用Kubernetes1.14.2，所有节点机操作系统是Centos7.5。本文档部署中所需kubernetes相关安装包和镜像可提前在翻墙服务器上下载，然后同步到k8s部署机器上。具体信息如下:

| ip地址 | 主机名 | 角色 |
| - | - | - |
| 172.16.60.241 | k8s-master01 | 主节点1、etc节点1 |
| 172.16.60.242 | k8s-master02 | 主节点2、etc节点2 |
| 172.16.60.243 | k8s-master03 | 主节点3、etc节点3 |
| 172.16.60.244　 | k8s-node01 | 工作节点1 |
| 172.16.60.245 | k8s-node02 | 工作节点2 |
| 172.16.60.246 | k8s-node03 | 工作节点3 |
| 172.16.60.247 | k8s-ha01 | nginx节点1、harbor节点1 |
| 172.16.60.248 | k8s-ha02 | nginx节点2、harbor节点2 |


本套Kubernetes集群环境版本

-  Kubernetes 1.14.2

-  Docker 18.09.6-ce

-  Etcd 3.3.13

-  Flanneld 0.11.0

插件：

-  Coredns

-  Dashboard

-  Metrics-server

镜像仓库：

-  harbor（两个仓库相互同步，对外提供统一入口VIP地址）

主要配置策略

kube-apiserver高可用（Nginx负载层）：

- 使用Nginx+Keepalived实现高可用, VIP1：172.16.60.250；

- 关闭非安全端口 8080 和匿名访问；

- 在安全端口 6443 接收 https 请求；

- 严格的认证和授权策略 (x509、token、RBAC)；

- 开启 bootstrap token 认证，支持 kubelet TLS bootstrapping；

- 使用 https 访问 kubelet、etcd，加密通信；

kube-controller-manager高可用：

-  3节点高可用；

-  关闭非安全端口，在安全端口 10252 接收 https 请求；

-  使用 kubeconfig 访问 apiserver 的安全端口；

-  自动 approve kubelet 证书签名请求 (CSR)，证书过期后自动轮转；

-  各controller 使用自己的 ServiceAccount 访问 apiserver；

kube-scheduler高可用：

-  3节点高可用；

-  使用 kubeconfig 访问 apiserver 的安全端口；

kubelet：

-  使用 kubeadm 动态创建 bootstrap token，而不是在 apiserver 中静态配置；

-  使用TLS bootstrap机制自动生成 client 和 server 证书，过期后自动轮转；

-  在 kubeletConfiguration 类型的 JSON 文件配置主要参数；

-  关闭只读端口，在安全端口 10250 接收 https 请求，对请求进行认证和授权，拒绝匿名访问和非授权访问；

-  使用 kubeconfig 访问 apiserver 的安全端口；

kube-proxy：

-  使用kubeconfig 访问 apiserver 的安全端口；

-  在KubeProxyConfiguration 类型的 JSON 文件配置主要参数；

-  使用ipvs代理模式；

集群插件：

-  DNS：使用功能、性能更好的 coredns；

-  Dashboard：支持登录认证；

-  Metric：metrics-server，使用 https 访问 kubelet 安全端口；

-  Log：Elasticsearch、Fluend、Kibana；

-  Registry 镜像库：Harbor私有仓库，两个节点相互同步；

                                                                                                                   

kubernetes集群部署中生成的证书文件如下：

ca-key.pem                       根私钥（controller-manager配置的时候，跟上--service-account-private-key-file）

ca.pem                              根证书（apiserver配置的时候，跟上--service-account-key-file）

kubernetes-key.pem         集群私钥

kubernetes.pem                集群证书

kube-proxy.pem                 proxy证书-node节点进行认证

kube-proxy-key.pem           proxy私钥-node节点进行认证

admin.pem                         管理员证书-主要用于kubectl认证

admin-key.pem                   管理员私钥-主要用于kubectl认证

                                                                                                                   

TLS作用：就是对通讯加密，防止中间人窃听；同时如果证书不信任的话根本就无法与 apiserver 建立连接，更不用提有没有权限向 apiserver 请求指定内容。

RBAC作用：RBAC 中规定了一个用户或者用户组(subject)具有请求哪些 api 的权限；在配合 TLS 加密的时候，实际上 apiserver 读取客户端证书的 CN 字段作为用户名，读取 O 字段作为用户组。

总之想要与apiserver通讯就必须采用由apiserver CA签发的证书，这样才能形成信任关系，建立TLS连接；另外可通过证书的CN、O字段来提供RBAC所需用户与用户组。

                                                                                                                   

kubernetes集群会默认开启RABC（角色访问控制机制），这里提前了解几个重要概念：

- DRBC

K8S 1.6引进，是让用户能够访问K8S API资源的授权方式（不授权就没有资格访问K8S的资源）

- 用户

K8S有两种用户：User 和 Service Account。其中，User给用户使用，Service Account给进程使用，让进程有相关权限。如Dashboard就是一个进程，可以创建一个Service Account给它使用。

- 角色

Role是一系列权限的集合，例如一个Role可包含读取和列出Pod的权限（ClusterRole和Role类似，其权限范围是整个集群）

- 角色绑定

RoleBinding把角色映射到用户，从而让这些用户拥有该角色的权限（ClusterRoleBinding和RoleBinding类似，可让用户拥有ClusteRole的权限）

- Secret

Secret是一个包含少量敏感信息如密码，令牌或密钥的对象。把这些信息保存在Secret对象中，可以在这些信息被使用时加以控制，并可以减低信息泄露的风险。

二、环境初始化准备

Kubernetes集群部署过程均需要使用root账号操作，下面初始化操作在k8s的master和node节点上操作。

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41<br>42<br>43<br>44<br>45<br>46<br>47<br>48<br>49<br>50<br>51<br>52<br>53<br>54<br>55<br>56<br>57<br>58<br>59<br>60<br>61<br>62<br>63<br>64<br>65<br>66<br>67<br>68<br>69<br>70<br>71<br>72<br>73<br>74<br>75<br>76<br>77<br>78<br>79<br>80<br>81<br>82<br>83<br>84<br>85<br>86<br>87<br>88<br>89<br>90<br>91<br>92<br>93<br>94<br>95<br>96<br>97<br>98<br>99<br>100<br>101<br>102<br>103<br>104<br>105<br>106<br>107<br>108<br>109<br>110<br>111<br>112<br>113<br>114<br>115<br>116<br>117<br>118<br>119<br>120<br>121<br>122<br>123<br>124<br>125<br>126<br>127<br>128<br>129<br>130<br>131<br>132<br>133<br>134<br>135<br>136<br>137<br>138<br>139<br>140<br>141<br>142<br>143<br>144<br>145<br>146<br>147<br>148<br>149<br>150<br>151<br>152<br>153<br>154<br>155<br>156<br>157<br>158<br>159<br>160<br>161<br>162<br>163<br>164<br>165<br>166<br>167<br>168<br>169<br>170<br>171<br>172<br>173<br>174<br>175<br>176<br>177<br>178<br>179<br>180<br>181<br>182<br>183<br>184<br>185<br>186<br>187<br>188<br>189<br>190<br>191<br>192<br>193<br>194<br>195<br>196<br>197<br>198<br>199<br>200<br>201<br>202<br>203<br>204<br>205<br>206<br>207<br>208<br>209<br>210<br>211<br>212<br>213<br>214<br>215<br>216<br>217<br>218<br>219<br>220<br>221<br>222<br>223<br>224<br>225<br>226<br>227<br>228<br>229<br>230<br>231<br>232<br>233<br>234<br>235<br>236<br>237<br>238<br>239<br>240<br>241<br>242<br>243<br>244<br>245<br>246<br>247<br>248<br>249<br>250<br>251<br>252<br>253<br>254<br>255<br>256<br>257<br>258<br>259<br>260<br>261<br>262<br>263<br>264<br>265<br>266<br>267<br>268<br>269<br>270<br>271<br>272<br>273<br>274<br>275<br>276<br>277<br>278<br>279 | 这里先以k8s-master01节点为例，其他节点类似操作。<br>   <br>1）主机名修改<br>[root@k8s-master01 ~]\# hostnamectl set-hostname k8s-master01<br>     <br>如果DNS不支持解析主机名称，则需要修改/etc/hosts文件，添加主机名和IP的对应关系：<br>[root@k8s-master01 ~]\# cat &gt;&gt; /etc/hosts &lt;&lt;EOF<br>172.16.60.241   k8s-master01<br>172.16.60.242   k8s-master02<br>172.16.60.243   k8s-master03<br>172.16.60.241   k8s-etcd01<br>172.16.60.242   k8s-etcd02<br>172.16.60.243   k8s-etcd03<br>172.16.60.244   k8s-node01<br>172.16.60.245   k8s-node02<br>172.16.60.246   k8s-node03<br>EOF<br>   <br>2) 添加docker账户<br>[root@k8s-master01 ~]\# useradd -m docker<br>   <br>3) 无密码ssh信任关系<br>本篇部署文档有很有操作都是在k8s-master01节点上执行，然后远程分发文件到其他节点机器上并远程执行命令，所以需要添加该节点到其它节点的ssh信任关系。<br>[root@k8s-master01 ~]\# ssh-keygen -t rsa<br>[root@k8s-master01 ~]\# cp /root/.ssh/id\_rsa.pub /root/.ssh/authorized\_keys<br>[root@k8s-master01 ~]\# ssh-copy-id -i /root/.ssh/id\_rsa.pub -p22 root@k8s-master01<br>[root@k8s-master01 ~]\# ssh-copy-id -i /root/.ssh/id\_rsa.pub -p22 root@k8s-master02<br>[root@k8s-master01 ~]\# ssh-copy-id -i /root/.ssh/id\_rsa.pub -p22 root@k8s-master03<br>[root@k8s-master01 ~]\# ssh-copy-id -i /root/.ssh/id\_rsa.pub -p22 root@k8s-node01<br>[root@k8s-master01 ~]\# ssh-copy-id -i /root/.ssh/id\_rsa.pub -p22 root@k8s-node02<br>[root@k8s-master01 ~]\# ssh-copy-id -i /root/.ssh/id\_rsa.pub -p22 root@k8s-node03<br>   <br>以上信任关系设置后，最好手动验证下本节点登陆到其他节点的ssh无密码信任关系<br>   <br>4) 更新PATH变量，将可执行文件目录添加到PATH环境变量中<br>将可执行文件目录添加到PATH环境变量中<br>[root@k8s-master01 ~]\# echo 'PATH=/opt/k8s/bin:$PATH' &gt;&gt;/root/.bashrc<br>[root@k8s-master01 ~]\# source /root/.bashrc<br>     <br>5) 安装依赖包<br>[root@k8s-master01 ~]\# yum install -y epel-release<br>[root@k8s-master01 ~]\# yum install -y conntrack ntpdate ntp ipvsadm ipset jq iptables curl sysstat libseccomp wget lsof telnet<br>     <br>关闭无关的服务<br>[root@k8s-master01 ~]\# systemctl stop postfix &amp;&amp; systemctl disable postfix<br>     <br>6）关闭防火墙<br>在每台机器上关闭防火墙，清理防火墙规则，设置默认转发策略：<br>[root@k8s-master01 ~]\# systemctl stop firewalld<br>[root@k8s-master01 ~]\# systemctl disable firewalld<br>[root@k8s-master01 ~]\# iptables -F &amp;&amp; iptables -X &amp;&amp; iptables -F -t nat &amp;&amp; iptables -X -t nat<br>[root@k8s-master01 ~]\# iptables -P FORWARD ACCEPT<br>[root@k8s-master01 ~]\# firewall-cmd --state<br>not running<br>   <br>7) 关闭SELinux<br>关闭SELinux，否则后续K8S挂载目录时可能报错 Permission denied：<br>[root@k8s-master01 ~]\# setenforce 0<br>[root@k8s-master01 ~]\# sed -i 's/^SELINUX=.\*/SELINUX=disabled/' /etc/selinux/config<br>     <br>8) 关闭swap分区<br>如果开启了swap分区，kubelet会启动失败(可以通过将参数 --fail-swap-on 设置为false来忽略swap on)，故需要在每个node节点机器上关闭swap分区。<br>这里索性将所有节点的swap分区都关闭，同时注释/etc/fstab中相应的条目，防止开机自动挂载swap分区：<br>[root@k8s-master01 ~]\# swapoff -a<br>[root@k8s-master01 ~]\# sed -i '/ swap / s/^\\(.\*\\)$/\#\\1/g' /etc/fstab<br>     <br>9) 关闭dnsmasq<br>linux系统开启了dnsmasq后(如 GUI 环境)，将系统DNS Server设置为 127.0.0.1，这会导致docker容器无法解析域名，需要关闭它 (centos7系统可能默认没有安装这个服务)<br>[root@k8s-node01 ~]\# systemctl stop dnsmasq<br>[root@k8s-node01 ~]\# systemctl disable dnsmasq<br>     <br>10）加载内核模块<br>[root@k8s-master01 ~]\# modprobe ip\_vs\_rr<br>[root@k8s-master01 ~]\# modprobe br\_netfilter<br>     <br>11）优化内核参数<br>[root@k8s-master01 ~]\# cat &gt; kubernetes.conf &lt;&lt;EOF<br>net.bridge.bridge-nf-call-iptables=1<br>net.bridge.bridge-nf-call-ip6tables=1<br>net.ipv4.ip\_forward=1<br>net.ipv4.tcp\_tw\_recycle=0  \#由于tcp\_tw\_recycle与kubernetes的NAT冲突，必须关闭！否则会导致服务不通。<br>vm.swappiness=0            \#禁止使用 swap 空间，只有当系统 OOM 时才允许使用它<br>vm.overcommit\_memory=1     \#不检查物理内存是否够用<br>vm.panic\_on\_oom=0          \#开启 OOM<br>fs.inotify.max\_user\_instances=8192<br>fs.inotify.max\_user\_watches=1048576<br>fs.file-max=52706963<br>fs.nr\_open=52706963<br>net.ipv6.conf.all.disable\_ipv6=1  \#关闭不使用的ipv6协议栈，防止触发docker BUG.<br>net.netfilter.nf\_conntrack\_max=2310720<br>EOF<br>     <br>[root@k8s-master01 ~]\# cp kubernetes.conf  /etc/sysctl.d/kubernetes.conf<br>[root@k8s-master01 ~]\# sysctl -p /etc/sysctl.d/kubernetes.conf<br>     <br>这里需要注意：<br>必须关闭 tcp\_tw\_recycle，否则和 NAT 冲突，会导致服务不通；<br>关闭 IPV6，防止触发 docker BUG；<br>     <br>12）设置系统时区<br>\# 调整系统 TimeZone<br>[root@k8s-master01 ~]\# timedatectl set-timezone Asia/Shanghai<br>     <br>\# 将当前的 UTC 时间写入硬件时钟<br>[root@k8s-master01 ~]\# timedatectl set-local-rtc 0<br>     <br>\# 重启依赖于系统时间的服务<br>[root@k8s-master01 ~]\# systemctl restart rsyslog<br>[root@k8s-master01 ~]\# systemctl restart crond<br>     <br>13）设置rsyslogd 和systemd journald (每台节点机都要操作)<br>systemd 的 journald 是 Centos 7 缺省的日志记录工具，它记录了所有系统、内核、Service Unit 的日志。相比 systemd，journald 记录的日志有如下优势：<br>-&gt; 可以记录到内存或文件系统；(默认记录到内存，对应的位置为 /run/log/jounal)；<br>-&gt; 可以限制占用的磁盘空间、保证磁盘剩余空间；<br>-&gt; 可以限制日志文件大小、保存的时间；<br>-&gt; journald 默认将日志转发给 rsyslog，这会导致日志写了多份，/var/log/messages 中包含了太多无关日志，不方便后续查看，同时也影响系统性能。<br>     <br>[root@k8s-master01 ~]\# mkdir /var/log/journal           \#持久化保存日志的目录<br>[root@k8s-master01 ~]\# mkdir /etc/systemd/journald.conf.d<br>[root@k8s-master01 ~]\# cat &gt; /etc/systemd/journald.conf.d/99-prophet.conf &lt;&lt;EOF<br>[Journal]<br>\# 持久化保存到磁盘<br>Storage=persistent<br>     <br>\# 压缩历史日志<br>Compress=yes<br>     <br>SyncIntervalSec=5m<br>RateLimitInterval=30s<br>RateLimitBurst=1000<br>     <br>\# 最大占用空间 10G<br>SystemMaxUse=10G<br>     <br>\# 单日志文件最大 200M<br>SystemMaxFileSize=200M<br>     <br>\# 日志保存时间 2 周<br>MaxRetentionSec=2week<br>     <br>\# 不将日志转发到 syslog<br>ForwardToSyslog=no<br>EOF<br>     <br>[root@k8s-master01 ~]\# systemctl restart systemd-journald<br>     <br>14) 创建k8s相关目录 (每台节点机都要操作)<br>[root@k8s-master01 ~]\# mkdir -p /opt/k8s/{bin,work} /etc/{kubernetes,etcd}/cert<br>     <br>15) 升级内核 (每台节点机都要操作)<br>CentOS 7.x系统自带的3.10.x内核存在一些Bugs，导致运行的Docker、Kubernetes不稳定，例如：<br>-&gt; 高版本的 docker(1.13 以后) 启用了3.10 kernel实验支持的kernel memory account功能(无法关闭)，当节点压力大如频繁启动和停止容器时会导致 cgroup memory leak；<br>-&gt; 网络设备引用计数泄漏，会导致类似于报错："kernel:unregister\_netdevice: waiting for eth0 to become free. Usage count = 1";<br>     <br>解决方案如下：<br>-&gt; 升级内核到 4.4.X 以上；<br>-&gt; 或者，手动编译内核，disable CONFIG\_MEMCG\_KMEM 特性；<br>-&gt; 或者安装修复了该问题的 Docker 18.09.1 及以上的版本。但由于 kubelet 也会设置 kmem（它 vendor 了 runc），所以需要重新编译 kubelet 并指定 GOFLAGS="-tags=nokmem"；<br>     <br>这里升级内核方法：<br>[root@k8s-master01 ~]\# uname  -r<br>3.10.0-862.el7.x86\_64<br>     <br>[root@k8s-master01 ~]\# rpm -Uvh http://www.elrepo.org/elrepo-release-7.0-3.el7.elrepo.noarch.rpm<br>     <br>安装完成后检查 /boot/grub2/grub.cfg 中对应内核 menuentry 中是否包含 initrd16 配置，如果没有，再安装一次！<br>[root@k8s-master01 ~]\# yum --enablerepo=elrepo-kernel install -y kernel-lt<br>     <br>设置开机从新内核启动<br>[root@k8s-master01 ~]\# grub2-set-default 0<br>     <br>重启机器<br>[root@k8s-master01 ~]\# init 6<br>     <br>安装内核源文件（在升级完内核并重启机器后执行，也可以不用执行这一步。可选）:<br>[root@k8s-master01 ~]\# yum --enablerepo=elrepo-kernel install kernel-lt-devel-$(uname -r) kernel-lt-headers-$(uname -r)<br>     <br>[root@k8s-master01 ~]\# uname -r<br>4.4.180-2.el7.elrepo.x86\_64<br>     <br>====================================================================================================================================<br>或者也可以采用下面升级内核的方法：<br>\# git clone --branch v1.14.1 --single-branch --depth 1 https://github.com/kubernetes/kubernetes<br>\# cd kubernetes<br>\# KUBE\_GIT\_VERSION=v1.14.1 ./build/run.sh make kubelet GOFLAGS="-tags=nokmem"<br>\# init 6<br>====================================================================================================================================<br>     <br>16) 关闭NUMA<br>[root@k8s-master01 ~]\# cp /etc/default/grub{,.bak}<br>[root@k8s-master01 ~]\# vim /etc/default/grub   <br>.........<br>GRUB\_CMDLINE\_LINUX="...... numa=off"      \# 即添加"numa=0ff"内容<br>     <br>重新生成 grub2 配置文件：<br>\# cp /boot/grub2/grub.cfg{,.bak}<br>\# grub2-mkconfig -o /boot/grub2/grub.cfg<br>   <br>17) 变量脚本文件 （这一步很关键）<br>[root@k8s-master01 ~]\# vim /opt/k8s/bin/environment.sh<br>\#!/usr/bin/bash<br>    <br>\# 生成 EncryptionConfig 所需的加密 key<br>export ENCRYPTION\_KEY=$(head -c 32 /dev/urandom | base64)<br>    <br>\# 集群中所有节点机器IP数组（master,node,etcd节点）<br>export NODE\_ALL\_IPS=(172.16.60.241 172.16.60.242 172.16.60.243 172.16.60.244 172.16.60.245 172.16.60.246)<br>\# 集群中所有节点IP对应的主机名数组<br>export NODE\_ALL\_NAMES=(k8s-master01 k8s-master02 k8s-master03 k8s-node01 k8s-node02 k8s-node03)<br>   <br>\# 集群中所有master节点集群IP数组<br>export NODE\_MASTER\_IPS=(172.16.60.241 172.16.60.242 172.16.60.243)<br>\# 集群中master节点IP对应的主机名数组<br>export NODE\_MASTER\_NAMES=(k8s-master01 k8s-master02 k8s-master03)<br>   <br>\# 集群中所有node节点集群IP数组<br>export NODE\_NODE\_IPS=(172.16.60.244 172.16.60.245 172.16.60.246)<br>\# 集群中node节点IP对应的主机名数组<br>export NODE\_NODE\_NAMES=(k8s-node01 k8s-node02 k8s-node03)<br>   <br>\# 集群中所有etcd节点集群IP数组<br>export NODE\_ETCD\_IPS=(172.16.60.241 172.16.60.242 172.16.60.243)<br>\# 集群中etcd节点IP对应的主机名数组(这里是和master三节点机器共用)<br>export NODE\_ETCD\_NAMES=(k8s-etcd01 k8s-etcd02 k8s-etcd03)<br>   <br>\# etcd 集群服务地址列表<br>export ETCD\_ENDPOINTS="https://172.16.60.241:2379,https://172.16.60.242:2379,https://172.16.60.243:2379"<br>    <br>\# etcd 集群间通信的 IP 和端口<br>export ETCD\_NODES="k8s-etcd01=https://172.16.60.241:2380,k8s-etcd02=https://172.16.60.242:2380,k8s-etcd03=https://172.16.60.243:2380"<br>    <br>\# kube-apiserver 的反向代理(地址端口.这里也就是nginx代理层的VIP地址<br>export KUBE\_APISERVER="https://172.16.60.250:8443"<br>    <br>\# 节点间互联网络接口名称. 这里我所有的centos7节点机的网卡设备是ens192，而不是eth0<br>export IFACE="ens192"<br>    <br>\# etcd 数据目录<br>export ETCD\_DATA\_DIR="/data/k8s/etcd/data"<br>    <br>\# etcd WAL 目录，建议是 SSD 磁盘分区，或者和 ETCD\_DATA\_DIR 不同的磁盘分区<br>export ETCD\_WAL\_DIR="/data/k8s/etcd/wal"<br>    <br>\# k8s 各组件数据目录<br>export K8S\_DIR="/data/k8s/k8s"<br>    <br>\# docker 数据目录<br>export DOCKER\_DIR="/data/k8s/docker"<br>    <br>\#\# 以下参数一般不需要修改<br>    <br>\# TLS Bootstrapping 使用的 Token，可以使用命令 head -c 16 /dev/urandom | od -An -t x | tr -d ' ' 生成<br>BOOTSTRAP\_TOKEN="41f7e4ba8b7be874fcff18bf5cf41a7c"<br>    <br>\# 最好使用 当前未用的网段 来定义服务网段和 Pod 网段<br>    <br>\# 服务网段，部署前路由不可达，部署后集群内路由可达(kube-proxy 保证)<br>SERVICE\_CIDR="10.254.0.0/16"<br>    <br>\# Pod 网段，建议 /16 段地址，部署前路由不可达，部署后集群内路由可达(flanneld 保证)<br>CLUSTER\_CIDR="172.30.0.0/16"<br>    <br>\# 服务端口范围 (NodePort Range)<br>export NODE\_PORT\_RANGE="30000-32767"<br>    <br>\# flanneld 网络配置前缀<br>export FLANNEL\_ETCD\_PREFIX="/kubernetes/network"<br>    <br>\# kubernetes 服务 IP (一般是 SERVICE\_CIDR 中第一个IP)<br>export CLUSTER\_KUBERNETES\_SVC\_IP="10.254.0.1"<br>    <br>\# 集群 DNS 服务 IP (从 SERVICE\_CIDR 中预分配)<br>export CLUSTER\_DNS\_SVC\_IP="10.254.0.2"<br>    <br>\# 集群 DNS 域名（末尾不带点号）<br>export CLUSTER\_DNS\_DOMAIN="cluster.local"<br>    <br>\# 将二进制目录 /opt/k8s/bin 加到 PATH 中<br>export PATH=/opt/k8s/bin:$PATH |


三、创建集群中需要的CA证书和秘钥

为确保安全，kubernetes 系统各组件需要使用 x509 证书对通信进行加密和认证。CA (Certificate Authority) 是自签名的根证书，用来签名后续创建的其它证书。这里使用 CloudFlare 的 PKI 工具集 cfssl 创建所有证书。下面部署命令均在k8s-master01节点上执行，然后远程分发文件和执行命令。

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41<br>42<br>43<br>44<br>45<br>46<br>47<br>48<br>49<br>50<br>51<br>52<br>53<br>54<br>55<br>56<br>57<br>58<br>59<br>60<br>61<br>62<br>63<br>64<br>65<br>66<br>67<br>68<br>69<br>70<br>71<br>72<br>73<br>74<br>75<br>76<br>77<br>78<br>79<br>80<br>81<br>82<br>83<br>84<br>85<br>86<br>87<br>88 | 1）安装cfssl工具集<br>[root@k8s-master01 ~]\# mkdir -p /opt/k8s/work &amp;&amp; cd /opt/k8s/work<br>[root@k8s-master01 work]\# wget https://pkg.cfssl.org/R1.2/cfssl\_linux-amd64<br>[root@k8s-master01 work]\# mv cfssl\_linux-amd64 /opt/k8s/bin/cfssl<br>   <br>[root@k8s-master01 work]\# wget https://pkg.cfssl.org/R1.2/cfssljson\_linux-amd64<br>[root@k8s-master01 work]\# mv cfssljson\_linux-amd64 /opt/k8s/bin/cfssljson<br>   <br>[root@k8s-master01 work]\# wget https://pkg.cfssl.org/R1.2/cfssl-certinfo\_linux-amd64<br>[root@k8s-master01 work]\# mv cfssl-certinfo\_linux-amd64 /opt/k8s/bin/cfssl-certinfo<br>   <br>[root@k8s-master01 work]\# chmod +x /opt/k8s/bin/\*<br>[root@k8s-master01 work]\# export PATH=/opt/k8s/bin:$PATH<br>   <br>2）创建根证书 (CA)<br>CA 证书是集群所有节点共享的，只需要创建一个 CA 证书，后续创建的所有证书都由它签名。<br>2.1）创建配置文件<br>CA 配置文件用于配置根证书的使用场景 (profile) 和具体参数 (usage，过期时间、服务端认证、客户端认证、加密等)，后续在签名其它证书时需要指定特定场景。<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# cat &gt; ca-config.json &lt;&lt;EOF<br>{<br>  "signing": {<br>    "default": {<br>      "expiry": "87600h"<br>    },<br>    "profiles": {<br>      "kubernetes": {<br>        "usages": [<br>            "signing",<br>            "key encipherment",<br>            "server auth",<br>            "client auth"<br>        ],<br>        "expiry": "87600h"<br>      }<br>    }<br>  }<br>}<br>EOF<br>   <br>配置说明：<br>signing：表示该证书可用于签名其它证书，生成的 ca.pem 证书中 CA=TRUE；<br>server auth：表示 client 可以用该该证书对 server 提供的证书进行验证；<br>client auth：表示 server 可以用该该证书对 client 提供的证书进行验证；<br>   <br>2.2）创建证书签名请求文件<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# cat &gt; ca-csr.json &lt;&lt;EOF<br>{<br>  "CN": "kubernetes",<br>  "key": {<br>    "algo": "rsa",<br>    "size": 2048<br>  },<br>  "names": [<br>    {<br>      "C": "CN",<br>      "ST": "BeiJing",<br>      "L": "BeiJing",<br>      "O": "k8s",<br>      "OU": "4Paradigm"<br>    }<br>  ]<br>}<br>EOF<br>   <br>配置说明：<br>CN：Common Name，kube-apiserver 从证书中提取该字段作为请求的用户名 (User Name)，浏览器使用该字段验证网站是否合法；<br>O：Organization，kube-apiserver 从证书中提取该字段作为请求用户所属的组 (Group)；<br>kube-apiserver 将提取的 User、Group 作为 RBAC 授权的用户标识；<br>   <br>2.3）生成 CA 证书和私钥<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# cfssl gencert -initca ca-csr.json | cfssljson -bare ca<br>[root@k8s-master01 work]\# ls ca\*<br>ca-config.json  ca.csr  ca-csr.json  ca-key.pem  ca.pem<br>[root@k8s-master01 work]\#<br>   <br>3）分发证书文件<br>将生成的 CA 证书、秘钥文件、配置文件拷贝到所有节点的 /etc/kubernetes/cert 目录下：<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_all\_ip in ${NODE\_ALL\_IPS[@]}<br>  do<br>    echo "&gt;&gt;&gt; ${node\_all\_ip}"<br>    ssh root@${node\_all\_ip} "mkdir -p /etc/kubernetes/cert"<br>    scp ca\*.pem ca-config.json root@${node\_all\_ip}:/etc/kubernetes/cert<br>  done |


四、部署kubectl命令行工具

kubectl 是 kubernetes 集群的命令行管理工具. kubectl 默认从 ~/.kube/config 文件读取kube-apiserver地址和认证信息，如果没有配置，执行kubectl命令时就会报错！kubectl只需要部署一次，生成的kubeconfig文件是通用的，可以拷贝到需要执行kubectl命令的节点机器，重命名为 ~/.kube/config；这里我将kubectl节点只部署到三个master节点机器上，其他节点不部署kubectl命令。也就是说后续进行kubectl命令管理就只能在master节点上操作。下面部署命令均在k8s-master01节点上执行，然后远程分发文件和执行命令。

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41<br>42<br>43<br>44<br>45<br>46<br>47<br>48<br>49<br>50<br>51<br>52<br>53<br>54<br>55<br>56<br>57<br>58<br>59<br>60<br>61<br>62<br>63<br>64<br>65<br>66<br>67<br>68<br>69<br>70<br>71<br>72<br>73<br>74<br>75<br>76<br>77<br>78<br>79<br>80<br>81<br>82<br>83<br>84<br>85<br>86<br>87<br>88<br>89<br>90<br>91<br>92<br>93<br>94<br>95<br>96<br>97<br>98<br>99<br>100<br>101<br>102<br>103<br>104<br>105 | 如果没有部署kubectl工具，则执行时会报错说没有该命令：<br>[root@k8s-master01 ~]\# kubectl get pods<br>-bash: kubectl: command not found<br>  <br>1）下载和分发kubectl二进制文件<br>二进制包下载地址：https://pan.baidu.com/s/1HUWFqKVLyxIzoX2LDQSEBg<br>提取密码：7kaf<br>[root@k8s-master01 ~]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# wget https://dl.k8s.io/v1.14.2/kubernetes-client-linux-amd64.tar.gz<br>[root@k8s-master01 work]\# tar -xzvf kubernetes-client-linux-amd64.tar.gz<br>  <br>分发到所有使用kubectl的节点，这里只分发到三个master节点<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_master\_ip in ${NODE\_MASTER\_IPS[@]}<br>do<br>  echo "&gt;&gt;&gt; ${node\_master\_ip}"<br>  scp kubernetes/client/bin/kubectl root@${node\_master\_ip}:/opt/k8s/bin/<br>  ssh root@${node\_master\_ip} "chmod +x /opt/k8s/bin/\*"<br>done<br>  <br>2) 创建admin证书和私钥<br>kubectl与apiserver https安全端口通信，apiserver 对提供的证书进行认证和授权。<br>kubectl作为集群的管理工具，需要被授予最高权限，这里创建具有最高权限的 admin 证书。<br>创建证书签名请求：<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# cat &gt; admin-csr.json &lt;&lt;EOF<br>{<br>  "CN": "admin",<br>  "hosts": [],<br>  "key": {<br>    "algo": "rsa",<br>    "size": 2048<br>  },<br>  "names": [<br>    {<br>      "C": "CN",<br>      "ST": "BeiJing",<br>      "L": "BeiJing",<br>      "O": "system:masters",<br>      "OU": "4Paradigm"<br>    }<br>  ]<br>}<br>EOF<br>  <br>配置说明：<br>O为system:masters，kube-apiserver 收到该证书后将请求的 Group 设置为 system:masters；<br>预定义的 ClusterRoleBinding cluster-admin 将Group system:masters 与 Role cluster-admin 绑定，该 Role 授予所有 API的权限；<br>该证书只会被kubectl当做client证书使用，所以hosts字段为空；<br>  <br>生成证书和私钥：<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# cfssl gencert -ca=/opt/k8s/work/ca.pem \\<br>  -ca-key=/opt/k8s/work/ca-key.pem \\<br>  -config=/opt/k8s/work/ca-config.json \\<br>  -profile=kubernetes admin-csr.json | cfssljson -bare admin<br>  <br>[root@k8s-master01 work]\# ls admin\*<br>admin.csr  admin-csr.json  admin-key.pem  admin.pem<br>  <br>3）创建 kubeconfig 文件<br>kubeconfig 为 kubectl 的配置文件，包含访问 apiserver 的所有信息，如 apiserver 地址、CA 证书和自身使用的证书；<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>  <br>设置集群参数<br>[root@k8s-master01 work]\# kubectl config set-cluster kubernetes \\<br>  --certificate-authority=/opt/k8s/work/ca.pem \\<br>  --embed-certs=true \\<br>  --server=${KUBE\_APISERVER} \\<br>  --kubeconfig=kubectl.kubeconfig<br>  <br>设置客户端认证参数<br>[root@k8s-master01 work]\# kubectl config set-credentials admin \\<br>  --client-certificate=/opt/k8s/work/admin.pem \\<br>  --client-key=/opt/k8s/work/admin-key.pem \\<br>  --embed-certs=true \\<br>  --kubeconfig=kubectl.kubeconfig<br>  <br>设置上下文参数<br>[root@k8s-master01 work]\# kubectl config set-context kubernetes \\<br>  --cluster=kubernetes \\<br>  --user=admin \\<br>  --kubeconfig=kubectl.kubeconfig<br>  <br>设置默认上下文<br>[root@k8s-master01 work]\# kubectl config use-context kubernetes --kubeconfig=kubectl.kubeconfig<br>  <br>配置说明：<br>--certificate-authority：验证 kube-apiserver 证书的根证书；<br>--client-certificate、--client-key：刚生成的 admin 证书和私钥，连接 kube-apiserver 时使用；<br>--embed-certs=true：将 ca.pem 和 admin.pem 证书内容嵌入到生成的 kubectl.kubeconfig 文件中(不加时，写入的是证书文件路径，<br>后续拷贝 kubeconfig 到其它机器时，还需要单独拷贝证书文件，这就很不方便了)<br>  <br>4）分发 kubeconfig 文件, 保存的文件名为 ~/.kube/config；<br>分发到所有使用 kubectl 命令的节点，即分发到三个master节点上<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_master\_ip in ${NODE\_MASTER\_IPS[@]}<br>do<br>  echo "&gt;&gt;&gt; ${node\_master\_ip}"<br>  ssh root@${node\_master\_ip} "mkdir -p ~/.kube"<br>  scp kubectl.kubeconfig root@${node\_master\_ip}:~/.kube/config<br>done |


五、部署etcd集群

etcd是基于Raft的分布式key-value存储系统，由CoreOS开发，常用于服务发现、共享配置以及并发控制（如leader选举、分布式锁等）。kubernetes使用etcd存储所有运行数据。需要注意的是：由于etcd是负责存储，所以不建议搭建单点集群，如zookeeper一样，由于存在选举策略，所以一般推荐奇数个集群，如3，5，7。只要集群半数以上的结点存活，那么集群就可以正常运行，否则集群可能无法正常使用。下面部署命令均在k8s-master01节点上执行，然后远程分发文件和执行命令。

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41<br>42<br>43<br>44<br>45<br>46<br>47<br>48<br>49<br>50<br>51<br>52<br>53<br>54<br>55<br>56<br>57<br>58<br>59<br>60<br>61<br>62<br>63<br>64<br>65<br>66<br>67<br>68<br>69<br>70<br>71<br>72<br>73<br>74<br>75<br>76<br>77<br>78<br>79<br>80<br>81<br>82<br>83<br>84<br>85<br>86<br>87<br>88<br>89<br>90<br>91<br>92<br>93<br>94<br>95<br>96<br>97<br>98<br>99<br>100<br>101<br>102<br>103<br>104<br>105<br>106<br>107<br>108<br>109<br>110<br>111<br>112<br>113<br>114<br>115<br>116<br>117<br>118<br>119<br>120<br>121<br>122<br>123<br>124<br>125<br>126<br>127<br>128<br>129<br>130<br>131<br>132<br>133<br>134<br>135<br>136<br>137<br>138<br>139<br>140<br>141<br>142<br>143<br>144<br>145<br>146<br>147<br>148<br>149<br>150<br>151<br>152<br>153<br>154<br>155<br>156<br>157<br>158<br>159<br>160<br>161<br>162<br>163<br>164<br>165<br>166<br>167<br>168<br>169<br>170<br>171<br>172<br>173<br>174<br>175<br>176<br>177<br>178<br>179<br>180<br>181<br>182<br>183<br>184<br>185<br>186<br>187<br>188<br>189<br>190<br>191<br>192<br>193<br>194<br>195<br>196<br>197<br>198<br>199<br>200<br>201<br>202<br>203<br>204<br>205<br>206<br>207<br>208<br>209<br>210<br>211<br>212<br>213<br>214<br>215<br>216<br>217<br>218<br>219<br>220<br>221<br>222<br>223<br>224<br>225<br>226<br>227<br>228<br>229<br>230<br>231<br>232<br>233<br>234<br>235 | 1）下载和分发etcd二进制文件<br>[root@k8s-master01 ~]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# wget https://github.com/coreos/etcd/releases/download/v3.3.13/etcd-v3.3.13-linux-amd64.tar.gz<br>[root@k8s-master01 work]\# tar -xvf etcd-v3.3.13-linux-amd64.tar.gz<br>   <br>分发二进制文件到etcd集群所有节点：<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_etcd\_ip in ${NODE\_ETCD\_IPS[@]}<br>  do<br>    echo "&gt;&gt;&gt; ${node\_etcd\_ip}"<br>    scp etcd-v3.3.13-linux-amd64/etcd\* root@${node\_etcd\_ip}:/opt/k8s/bin<br>    ssh root@${node\_etcd\_ip} "chmod +x /opt/k8s/bin/\*"<br>  done<br>   <br>2) 创建etcd证书和私钥<br>创建证书签名请求：<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# cat &gt; etcd-csr.json &lt;&lt;EOF<br>{<br>  "CN": "etcd",<br>  "hosts": [<br>    "127.0.0.1",<br>    "172.16.60.241",<br>    "172.16.60.242",<br>    "172.16.60.243"<br>  ],<br>  "key": {<br>    "algo": "rsa",<br>    "size": 2048<br>  },<br>  "names": [<br>    {<br>      "C": "CN",<br>      "ST": "BeiJing",<br>      "L": "BeiJing",<br>      "O": "k8s",<br>      "OU": "4Paradigm"<br>    }<br>  ]<br>}<br>EOF<br>   <br>配置说明：<br>hosts 字段指定授权使用该证书的 etcd 节点 IP 或域名列表，需要将 etcd 集群的三个节点 IP 都列在其中；<br>   <br>生成证书和私钥<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# cfssl gencert -ca=/opt/k8s/work/ca.pem \\<br>    -ca-key=/opt/k8s/work/ca-key.pem \\<br>    -config=/opt/k8s/work/ca-config.json \\<br>    -profile=kubernetes etcd-csr.json | cfssljson -bare etcd<br>   <br>[root@k8s-master01 work]\# ls etcd\*pem<br>etcd-key.pem  etcd.pem<br>   <br>分发生成的证书和私钥到各etcd节点<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_etcd\_ip in ${NODE\_ETCD\_IPS[@]}<br>  do<br>    echo "&gt;&gt;&gt; ${node\_etcd\_ip}"<br>    ssh root@${node\_etcd\_ip} "mkdir -p /etc/etcd/cert"<br>    scp etcd\*.pem root@${node\_etcd\_ip}:/etc/etcd/cert/<br>  done<br>   <br>3) 创建etcd的systemd unit模板文件<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# cat &gt; etcd.service.template &lt;&lt;EOF<br>[Unit]<br>Description=Etcd Server<br>After=network.target<br>After=network-online.target<br>Wants=network-online.target<br>Documentation=https://github.com/coreos<br>   <br>[Service]<br>Type=notify<br>WorkingDirectory=${ETCD\_DATA\_DIR}<br>ExecStart=/opt/k8s/bin/etcd \\\\<br>  --data-dir=${ETCD\_DATA\_DIR} \\\\<br>  --wal-dir=${ETCD\_WAL\_DIR} \\\\<br>  --name=\#\#NODE\_ETCD\_NAME\#\# \\\\<br>  --cert-file=/etc/etcd/cert/etcd.pem \\\\<br>  --key-file=/etc/etcd/cert/etcd-key.pem \\\\<br>  --trusted-ca-file=/etc/kubernetes/cert/ca.pem \\\\<br>  --peer-cert-file=/etc/etcd/cert/etcd.pem \\\\<br>  --peer-key-file=/etc/etcd/cert/etcd-key.pem \\\\<br>  --peer-trusted-ca-file=/etc/kubernetes/cert/ca.pem \\\\<br>  --peer-client-cert-auth \\\\<br>  --client-cert-auth \\\\<br>  --listen-peer-urls=https://\#\#NODE\_ETCD\_IP\#\#:2380 \\\\<br>  --initial-advertise-peer-urls=https://\#\#NODE\_ETCD\_IP\#\#:2380 \\\\<br>  --listen-client-urls=https://\#\#NODE\_ETCD\_IP\#\#:2379,http://127.0.0.1:2379 \\\\<br>  --advertise-client-urls=https://\#\#NODE\_ETCD\_IP\#\#:2379 \\\\<br>  --initial-cluster-token=etcd-cluster-0 \\\\<br>  --initial-cluster=${ETCD\_NODES} \\\\<br>  --initial-cluster-state=new \\\\<br>  --auto-compaction-mode=periodic \\\\<br>  --auto-compaction-retention=1 \\\\<br>  --max-request-bytes=33554432 \\\\<br>  --quota-backend-bytes=6442450944 \\\\<br>  --heartbeat-interval=250 \\\\<br>  --election-timeout=2000<br>Restart=on-failure<br>RestartSec=5<br>LimitNOFILE=65536<br>   <br>[Install]<br>WantedBy=multi-user.target<br>EOF<br>   <br>配置说明：<br>WorkingDirectory、--data-dir：指定工作目录和数据目录为 ${ETCD\_DATA\_DIR}，需在启动服务前创建这个目录；<br>--wal-dir：指定 wal 目录，为了提高性能，一般使用 SSD 或者和 --data-dir 不同的磁盘；<br>--name：指定节点名称，当 --initial-cluster-state 值为 new 时，--name 的参数值必须位于 --initial-cluster 列表中；<br>--cert-file、--key-file：etcd server 与 client 通信时使用的证书和私钥；<br>--trusted-ca-file：签名 client 证书的 CA 证书，用于验证 client 证书；<br>--peer-cert-file、--peer-key-file：etcd 与 peer 通信使用的证书和私钥；<br>--peer-trusted-ca-file：签名 peer 证书的 CA 证书，用于验证 peer 证书；<br>   <br>4）为各etcd节点创建和分发 etcd systemd unit 文件<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for (( i=0; i &lt; 3; i++ ))<br>  do<br>    sed -e "s/\#\#NODE\_ETCD\_NAME\#\#/${NODE\_ETCD\_NAMES[i]}/" -e "s/\#\#NODE\_ETCD\_IP\#\#/${NODE\_ETCD\_IPS[i]}/" etcd.service.template &gt; etcd-${NODE\_ETCD\_IPS[i]}.service<br>  done<br>   <br>[root@k8s-master01 work]\# ls \*.service                <br>etcd-172.16.60.241.service  etcd-172.16.60.242.service  etcd-172.16.60.243.service<br>   <br>最好手动查看其中一个etcd节点的启动文件里的--name名称和ip是否都已修改过来了<br>[root@k8s-master01 work]\# cat etcd-172.16.60.241.service<br>.......<br>--name=k8s-etcd01 \\<br>.......<br>  --listen-peer-urls=https://172.16.60.241:2380 \\<br>  --initial-advertise-peer-urls=https://172.16.60.241:2380 \\<br>  --listen-client-urls=https://172.16.60.241:2379,http://127.0.0.1:2379 \\<br>  --advertise-client-urls=https://172.16.60.241:2379 \\<br>  --initial-cluster-token=etcd-cluster-0 \\<br>  --initial-cluster=k8s-etcd01=https://172.16.60.241:2380,k8s-etcd02=https://172.16.60.242:2380,k8s-etcd03=https://172.16.60.243:2380 \\<br>.......<br>   <br>配置说明：<br>NODE\_ETCD\_NAMES 和 NODE\_ETCD\_IPS 为相同长度的bash数组，分别为etcd集群节点名称和对应的IP；<br>   <br>分发生成的 systemd unit 文件：<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_etcd\_ip in ${NODE\_ETCD\_IPS[@]}<br>  do<br>    echo "&gt;&gt;&gt; ${node\_etcd\_ip}"<br>    scp etcd-${node\_etcd\_ip}.service root@${node\_etcd\_ip}:/etc/systemd/system/etcd.service<br>  done<br>   <br>配置说明： 文件重命名为 etcd.service;<br>   <br>5）启动 etcd 服务<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_etcd\_ip in ${NODE\_ETCD\_IPS[@]}<br>  do<br>    echo "&gt;&gt;&gt; ${node\_etcd\_ip}"<br>    ssh root@${node\_etcd\_ip} "mkdir -p ${ETCD\_DATA\_DIR} ${ETCD\_WAL\_DIR}"<br>    ssh root@${node\_etcd\_ip} "systemctl daemon-reload &amp;&amp; systemctl enable etcd &amp;&amp; systemctl restart etcd " &amp;<br>  done<br>   <br>配置说明：<br>必须先创建 etcd 数据目录和工作目录;<br>etcd 进程首次启动时会等待其它节点的 etcd 加入集群，命令 systemctl start etcd 会卡住一段时间，为正常现象；<br>   <br>6）检查etcd服务启动结果<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_etcd\_ip in ${NODE\_ETCD\_IPS[@]}<br>  do<br>    echo "&gt;&gt;&gt; ${node\_etcd\_ip}"<br>    ssh root@${node\_etcd\_ip} "systemctl status etcd|grep Active"<br>  done<br>   <br>预期输出结果为：<br>&gt;&gt;&gt; 172.16.60.241<br>   Active: active (running) since Tue 2019-06-04 19:55:32 CST; 7min ago<br>&gt;&gt;&gt; 172.16.60.242<br>   Active: active (running) since Tue 2019-06-04 19:55:32 CST; 7min ago<br>&gt;&gt;&gt; 172.16.60.243<br>   Active: active (running) since Tue 2019-06-04 19:55:32 CST; 7min ago<br>   <br>确保状态均为为active (running)，否则查看日志，确认原因 (可以执行"journalctl -u etcd"命令查看启动失败原因）<br>   <br>6）验证服务状态<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_etcd\_ip in ${NODE\_ETCD\_IPS[@]}<br>  do<br>    echo "&gt;&gt;&gt; ${node\_etcd\_ip}"<br>    ssh root@${node\_etcd\_ip} "<br>    ETCDCTL\_API=3 /opt/k8s/bin/etcdctl \\<br>    --endpoints=https://${node\_etcd\_ip}:2379 \\<br>    --cacert=/etc/kubernetes/cert/ca.pem \\<br>    --cert=/etc/etcd/cert/etcd.pem \\<br>    --key=/etc/etcd/cert/etcd-key.pem endpoint health "<br>  done<br>   <br>预期输出结果为：<br>https://172.16.60.241:2379 is healthy: successfully committed proposal: took = 2.44394ms<br>&gt;&gt;&gt; 172.16.60.242<br>https://172.16.60.242:2379 is healthy: successfully committed proposal: took = 7.044349ms<br>&gt;&gt;&gt; 172.16.60.243<br>https://172.16.60.243:2379 is healthy: successfully committed proposal: took = 1.865713ms<br>   <br>输出均为 healthy 时表示集群服务正常。<br>   <br>7）查看当前etcd集群中的leader<br>在三台etcd节点中的任意一个节点机器上执行下面命令：<br>[root@k8s-etcd03 ~]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-etcd03 ~]\# ETCDCTL\_API=3 /opt/k8s/bin/etcdctl \\<br>  -w table --cacert=/etc/kubernetes/cert/ca.pem \\<br>  --cert=/etc/etcd/cert/etcd.pem \\<br>  --key=/etc/etcd/cert/etcd-key.pem \\<br>  --endpoints=${ETCD\_ENDPOINTS} endpoint status<br>   <br>预期输出结果为：<br>+----------------------------+------------------+---------+---------+-----------+-----------+------------+<br>|          ENDPOINT          |        ID        | VERSION | DB SIZE | IS LEADER | RAFT TERM | RAFT INDEX |<br>+----------------------------+------------------+---------+---------+-----------+-----------+------------+<br>| https://172.16.60.241:2379 | 577381f5de0f4495 |  3.3.13 |   16 kB |     false |         2 |          8 |<br>| https://172.16.60.242:2379 | bf4ce221cdf39fb0 |  3.3.13 |   16 kB |     false |         2 |          8 |<br>| https://172.16.60.243:2379 |  3bc2e49bc639590 |  3.3.13 |   16 kB |      true |         2 |          8 |<br>+----------------------------+------------------+---------+---------+-----------+-----------+------------+<br>   <br>由上面结果可见，当前的leader节点为172.16.60.243 |


六、Flannel容器网络方案部署

kubernetes要求集群内各节点(这里指master和node节点)能通过Pod网段互联互通。flannel使用vxlan技术为各节点创建一个可以互通的Pod网络，使用的端口为UDP 8472（需要开放该端口，如公有云AWS等）。flanneld第一次启动时，从etcd获取配置的Pod网段信息，为本节点分配一个未使用的地址段，然后创建flannedl.1网络接口（也可能是其它名称，如flannel1等）。flannel将分配给自己的Pod网段信息写入/run/flannel/docker文件，docker后续使用这个文件中的环境变量设置docker0网桥，从而从这个地址段为本节点的所有Pod容器分配IP。下面部署命令均在k8s-master01节点上执行，然后远程分发文件和执行命令。

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41<br>42<br>43<br>44<br>45<br>46<br>47<br>48<br>49<br>50<br>51<br>52<br>53<br>54<br>55<br>56<br>57<br>58<br>59<br>60<br>61<br>62<br>63<br>64<br>65<br>66<br>67<br>68<br>69<br>70<br>71<br>72<br>73<br>74<br>75<br>76<br>77<br>78<br>79<br>80<br>81<br>82<br>83<br>84<br>85<br>86<br>87<br>88<br>89<br>90<br>91<br>92<br>93<br>94<br>95<br>96<br>97<br>98<br>99<br>100<br>101<br>102<br>103<br>104<br>105<br>106<br>107<br>108<br>109<br>110<br>111<br>112<br>113<br>114<br>115<br>116<br>117<br>118<br>119<br>120<br>121<br>122<br>123<br>124<br>125<br>126<br>127<br>128<br>129<br>130<br>131<br>132<br>133<br>134<br>135<br>136<br>137<br>138<br>139<br>140<br>141<br>142<br>143<br>144<br>145<br>146<br>147<br>148<br>149<br>150<br>151<br>152<br>153<br>154<br>155<br>156<br>157<br>158<br>159<br>160<br>161<br>162<br>163<br>164<br>165<br>166<br>167<br>168<br>169<br>170<br>171<br>172<br>173<br>174<br>175<br>176<br>177<br>178<br>179<br>180<br>181<br>182<br>183<br>184<br>185<br>186<br>187<br>188<br>189<br>190<br>191<br>192<br>193<br>194<br>195<br>196<br>197<br>198<br>199<br>200<br>201<br>202<br>203<br>204<br>205<br>206<br>207<br>208<br>209<br>210<br>211<br>212<br>213<br>214<br>215<br>216<br>217<br>218<br>219<br>220<br>221<br>222<br>223<br>224<br>225<br>226<br>227<br>228<br>229<br>230<br>231<br>232<br>233<br>234<br>235<br>236<br>237<br>238<br>239<br>240<br>241<br>242<br>243<br>244 | 1) 下载和分发 flanneld 二进制文件<br>从flannel的release页面(https://github.com/coreos/flannel/releases)下载最新版本的安装包：<br>[root@k8s-master01 ~]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# mkdir flannel<br>[root@k8s-master01 work]\# wget https://github.com/coreos/flannel/releases/download/v0.11.0/flannel-v0.11.0-linux-amd64.tar.gz<br>[root@k8s-master01 work]\# tar -zvxf flannel-v0.11.0-linux-amd64.tar.gz -C flannel<br> <br>分发二进制文件到集群所有节点：<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_all\_ip in ${NODE\_ALL\_IPS[@]}<br>  do<br>    echo "&gt;&gt;&gt; ${node\_all\_ip}"<br>    scp flannel/{flanneld,mk-docker-opts.sh} root@${node\_all\_ip}:/opt/k8s/bin/<br>    ssh root@${node\_all\_ip} "chmod +x /opt/k8s/bin/\*"<br>  done<br> <br>2) 创建 flannel 证书和私钥<br>flanneld 从 etcd 集群存取网段分配信息，而 etcd 集群启用了双向 x509 证书认证，所以需要为 flanneld 生成证书和私钥。<br>创建证书签名请求：<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# cat &gt; flanneld-csr.json &lt;&lt;EOF<br>{<br>  "CN": "flanneld",<br>  "hosts": [],<br>  "key": {<br>    "algo": "rsa",<br>    "size": 2048<br>  },<br>  "names": [<br>    {<br>      "C": "CN",<br>      "ST": "BeiJing",<br>      "L": "BeiJing",<br>      "O": "k8s",<br>      "OU": "4Paradigm"<br>    }<br>  ]<br>}<br>EOF<br> <br>该证书只会被 kubectl 当做 client 证书使用，所以 hosts 字段为空；<br> <br>生成证书和私钥：<br>[root@k8s-master01 work]\# cfssl gencert -ca=/opt/k8s/work/ca.pem \\<br>  -ca-key=/opt/k8s/work/ca-key.pem \\<br>  -config=/opt/k8s/work/ca-config.json \\<br>  -profile=kubernetes flanneld-csr.json | cfssljson -bare flanneld<br> <br>将生成的证书和私钥分发到所有节点（master 和 node）：<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_all\_ip in ${NODE\_ALL\_IPS[@]}<br>  do<br>    echo "&gt;&gt;&gt; ${node\_all\_ip}"<br>    ssh root@${node\_all\_ip} "mkdir -p /etc/flanneld/cert"<br>    scp flanneld\*.pem root@${node\_all\_ip}:/etc/flanneld/cert<br>  done<br> <br>3）向 etcd 写入集群 Pod 网段信息 （注意：本步骤只需执行一次）<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# etcdctl \\<br>  --endpoints=${ETCD\_ENDPOINTS} \\<br>  --ca-file=/opt/k8s/work/ca.pem \\<br>  --cert-file=/opt/k8s/work/flanneld.pem \\<br>  --key-file=/opt/k8s/work/flanneld-key.pem \\<br>  mk ${FLANNEL\_ETCD\_PREFIX}/config '{"Network":"'${CLUSTER\_CIDR}'", "SubnetLen": 21, "Backend": {"Type": "vxlan"}}'<br> <br>解决说明：<br>flanneld 当前版本 (v0.11.0) 不支持 etcd v3，故使用 etcd v2 API 写入配置 key 和网段数据；<br>写入的 Pod 网段 ${CLUSTER\_CIDR} 地址段（如 /16）必须小于 SubnetLen，必须与 kube-controller-manager 的 --cluster-cidr 参数值一致；<br> <br>4）创建 flanneld 的 systemd unit 文件<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# cat &gt; flanneld.service &lt;&lt; EOF<br>[Unit]<br>Description=Flanneld overlay address etcd agent<br>After=network.target<br>After=network-online.target<br>Wants=network-online.target<br>After=etcd.service<br>Before=docker.service<br> <br>[Service]<br>Type=notify<br>ExecStart=/opt/k8s/bin/flanneld \\\\<br>  -etcd-cafile=/etc/kubernetes/cert/ca.pem \\\\<br>  -etcd-certfile=/etc/flanneld/cert/flanneld.pem \\\\<br>  -etcd-keyfile=/etc/flanneld/cert/flanneld-key.pem \\\\<br>  -etcd-endpoints=${ETCD\_ENDPOINTS} \\\\<br>  -etcd-prefix=${FLANNEL\_ETCD\_PREFIX} \\\\<br>  -iface=${IFACE} \\\\<br>  -ip-masq<br>ExecStartPost=/opt/k8s/bin/mk-docker-opts.sh -k DOCKER\_NETWORK\_OPTIONS -d /run/flannel/docker<br>Restart=always<br>RestartSec=5<br>StartLimitInterval=0<br> <br>[Install]<br>WantedBy=multi-user.target<br>RequiredBy=docker.service<br>EOF<br> <br>解决说明：<br>mk-docker-opts.sh 脚本将分配给 flanneld 的 Pod 子网段信息写入 /run/flannel/docker 文件，后续 docker 启动时使用这个文件中的环境变量配置 docker0 网桥；<br>flanneld 使用系统缺省路由所在的接口与其它节点通信，对于有多个网络接口（如内网和公网）的节点，可以用 -iface 参数指定通信接口;<br>flanneld 运行时需要 root 权限；<br>-ip-masq: flanneld 为访问 Pod 网络外的流量设置 SNAT 规则，同时将传递给 Docker 的变量 --ip-masq（/run/flannel/docker 文件中）设置为 false，这样 Docker 将不再创建 SNAT 规则； Docker 的 --ip-masq 为 true 时，创建的 SNAT 规则比较&quot;暴力”：将所有本节点 Pod 发起的、访问非 docker0 接口的请求做 SNAT，这样访问其他节点 Pod 的请求来源 IP 会被设置为 flannel.1 接口的 IP，导致目的 Pod 看不到真实的来源 Pod IP。 flanneld 创建的 SNAT 规则比较温和，只对访问非 Pod 网段的请求做 SNAT。<br> <br>5）分发 flanneld systemd unit 文件到所有节点<br>[root@k8s-master01 work]\# cd /opt/k8s/work<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_all\_ip in ${NODE\_ALL\_IPS[@]}<br>  do<br>    echo "&gt;&gt;&gt; ${node\_all\_ip}"<br>    scp flanneld.service root@${node\_all\_ip}:/etc/systemd/system/<br>  done<br> <br>6）启动 flanneld 服务<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_all\_ip in ${NODE\_ALL\_IPS[@]}<br>  do<br>    echo "&gt;&gt;&gt; ${node\_all\_ip}"<br>    ssh root@${node\_all\_ip} "systemctl daemon-reload &amp;&amp; systemctl enable flanneld &amp;&amp; systemctl restart flanneld"<br>  done<br> <br>6）检查启动结果<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_all\_ip in ${NODE\_ALL\_IPS[@]}<br>  do<br>    echo "&gt;&gt;&gt; ${node\_all\_ip}"<br>    ssh root@${node\_all\_ip} "systemctl status flanneld|grep Active"<br>  done<br> <br>确保状态为 active (running)，否则查看日志，确认原因"journalctl -u flanneld"<br> <br>7) 检查分配给各 flanneld 的 Pod 网段信息<br>查看集群 Pod 网段(/16)：<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# etcdctl \\<br>  --endpoints=${ETCD\_ENDPOINTS} \\<br>  --ca-file=/etc/kubernetes/cert/ca.pem \\<br>  --cert-file=/etc/flanneld/cert/flanneld.pem \\<br>  --key-file=/etc/flanneld/cert/flanneld-key.pem \\<br>  get ${FLANNEL\_ETCD\_PREFIX}/config<br> <br>预期输出： {"Network":"172.30.0.0/16", "SubnetLen": 21, "Backend": {"Type": "vxlan"}}<br> <br>查看已分配的 Pod 子网段列表(/24):<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# etcdctl \\<br>  --endpoints=${ETCD\_ENDPOINTS} \\<br>  --ca-file=/etc/kubernetes/cert/ca.pem \\<br>  --cert-file=/etc/flanneld/cert/flanneld.pem \\<br>  --key-file=/etc/flanneld/cert/flanneld-key.pem \\<br>  ls ${FLANNEL\_ETCD\_PREFIX}/subnets<br> <br>预期输出：<br>/kubernetes/network/subnets/172.30.40.0-21<br>/kubernetes/network/subnets/172.30.88.0-21<br>/kubernetes/network/subnets/172.30.56.0-21<br>/kubernetes/network/subnets/172.30.72.0-21<br>/kubernetes/network/subnets/172.30.232.0-21<br>/kubernetes/network/subnets/172.30.152.0-21<br> <br>查看某一 Pod 网段对应的节点 IP 和 flannel 接口地址:<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# etcdctl \\<br>  --endpoints=${ETCD\_ENDPOINTS} \\<br>  --ca-file=/etc/kubernetes/cert/ca.pem \\<br>  --cert-file=/etc/flanneld/cert/flanneld.pem \\<br>  --key-file=/etc/flanneld/cert/flanneld-key.pem \\<br>  get ${FLANNEL\_ETCD\_PREFIX}/subnets/172.30.40.0-21<br> <br>预期输出：{"PublicIP":"172.16.60.243","BackendType":"vxlan","BackendData":{"VtepMAC":"f2:de:47:06:4b:d3"}}<br> <br>解决说明：<br>172.30.40.0/21 被分配给节点k8s-master03（172.16.60.243）；<br>VtepMAC 为k8s-master03节点的 flannel.1 网卡 MAC 地址；<br> <br>8）检查节点 flannel 网络信息 （比如k8s-master01节点）<br>[root@k8s-master01 work]\# ip addr show<br>1: lo: &lt;LOOPBACK,UP,LOWER\_UP&gt; mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1<br>    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00<br>    inet 127.0.0.1/8 scope host lo<br>       valid\_lft forever preferred\_lft forever<br>2: ens192: &lt;BROADCAST,MULTICAST,UP,LOWER\_UP&gt; mtu 1500 qdisc mq state UP group default qlen 1000<br>    link/ether 00:50:56:ac:7c:81 brd ff:ff:ff:ff:ff:ff<br>    inet 172.16.60.241/24 brd 172.16.60.255 scope global ens192<br>       valid\_lft forever preferred\_lft forever<br>3: flannel.1: &lt;BROADCAST,MULTICAST,UP,LOWER\_UP&gt; mtu 1450 qdisc noqueue state UNKNOWN group default<br>    link/ether 7a:2a:36:99:75:5f brd ff:ff:ff:ff:ff:ff<br>    inet 172.30.232.0/32 scope global flannel.1<br>       valid\_lft forever preferred\_lft forever<br> <br>注意： flannel.1 网卡的地址为分配的 Pod 子网段的第一个 IP（.0），且是 /32 的地址；<br> <br>[root@k8s-master01 work]\# ip route show |grep flannel.1<br>172.30.40.0/21 via 172.30.40.0 dev flannel.1 onlink<br>172.30.56.0/21 via 172.30.56.0 dev flannel.1 onlink<br>172.30.72.0/21 via 172.30.72.0 dev flannel.1 onlink<br>172.30.88.0/21 via 172.30.88.0 dev flannel.1 onlink<br>172.30.152.0/21 via 172.30.152.0 dev flannel.1 onlink<br> <br>到其它节点 Pod 网段请求都被转发到 flannel.1 网卡；<br>flanneld 根据 etcd 中子网段的信息，如 ${FLANNEL\_ETCD\_PREFIX}/subnets/172.30.232.0-21 ，来决定进请求发送给哪个节点的互联 IP；<br> <br>9）验证各节点能通过 Pod 网段互通<br>在各节点上部署 flannel 后，检查是否创建了 flannel 接口(名称可能为 flannel0、flannel.0、flannel.1 等)：<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_all\_ip in ${NODE\_ALL\_IPS[@]}<br>  do<br>    echo "&gt;&gt;&gt; ${node\_all\_ip}"<br>    ssh ${node\_all\_ip} "/usr/sbin/ip addr show flannel.1|grep -w inet"<br>  done<br> <br>预期输出：<br>&gt;&gt;&gt; 172.16.60.241<br>    inet 172.30.232.0/32 scope global flannel.1<br>&gt;&gt;&gt; 172.16.60.242<br>    inet 172.30.152.0/32 scope global flannel.1<br>&gt;&gt;&gt; 172.16.60.243<br>    inet 172.30.40.0/32 scope global flannel.1<br>&gt;&gt;&gt; 172.16.60.244<br>    inet 172.30.88.0/32 scope global flannel.1<br>&gt;&gt;&gt; 172.16.60.245<br>    inet 172.30.56.0/32 scope global flannel.1<br>&gt;&gt;&gt; 172.16.60.246<br>    inet 172.30.72.0/32 scope global flannel.1<br> <br>在各节点上 ping 所有 flannel 接口 IP，确保能通：<br>[root@k8s-master01 work]\# source /opt/k8s/bin/environment.sh<br>[root@k8s-master01 work]\# for node\_all\_ip in ${NODE\_ALL\_IPS[@]}<br>  do<br>    echo "&gt;&gt;&gt; ${node\_all\_ip}"<br>    ssh ${node\_all\_ip} "ping -c 1 172.30.232.0"<br>    ssh ${node\_all\_ip} "ping -c 1 172.30.152.0"<br>    ssh ${node\_all\_ip} "ping -c 1 172.30.40.0"<br>    ssh ${node\_all\_ip} "ping -c 1 172.30.88.0"<br>    ssh ${node\_all\_ip} "ping -c 1 172.30.56.0"<br>    ssh ${node\_all\_ip} "ping -c 1 172.30.72.0"<br>  done |


七、基于nginx 四层代理环境

这里采用nginx 4 层透明代理功能实现 K8S 节点( master 节点和 worker 节点)高可用访问 kube-apiserver。控制节点的 kube-controller-manager、kube-scheduler 是多实例(3个)部署，所以只要有一个实例正常，就可以保证高可用；搭建nginx+keepalived环境，对外提供一个统一的vip地址，后端对接多个 apiserver 实例，nginx 对它们做健康检查和负载均衡；kubelet、kube-proxy、controller-manager、scheduler 通过vip地址访问 kube-apiserver，从而实现 kube-apiserver 的高可用；

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41<br>42<br>43<br>44<br>45<br>46<br>47<br>48<br>49<br>50<br>51<br>52<br>53<br>54<br>55<br>56<br>57<br>58<br>59<br>60<br>61<br>62<br>63<br>64<br>65<br>66<br>67<br>68<br>69<br>70<br>71<br>72<br>73<br>74<br>75<br>76<br>77<br>78<br>79<br>80<br>81<br>82<br>83<br>84<br>85<br>86<br>87<br>88<br>89<br>90<br>91<br>92<br>93<br>94<br>95<br>96<br>97<br>98<br>99<br>100<br>101<br>102<br>103<br>104<br>105<br>106<br>107<br>108<br>109<br>110<br>111<br>112<br>113<br>114<br>115<br>116<br>117<br>118<br>119<br>120<br>121<br>122<br>123<br>124<br>125<br>126<br>127<br>128<br>129<br>130<br>131<br>132<br>133<br>134<br>135<br>136<br>137<br>138<br>139<br>140<br>141<br>142<br>143<br>144<br>145<br>146<br>147<br>148<br>149<br>150<br>151<br>152<br>153<br>154<br>155<br>156<br>157<br>158<br>159<br>160<br>161<br>162<br>163<br>164<br>165<br>166<br>167<br>168<br>169<br>170<br>171<br>172<br>173<br>174<br>175<br>176<br>177<br>178<br>179<br>180<br>181<br>182<br>183<br>184<br>185<br>186<br>187<br>188<br>189<br>190<br>191<br>192<br>193<br>194<br>195<br>196<br>197<br>198<br>199<br>200<br>201<br>202<br>203<br>204<br>205<br>206<br>207<br>208<br>209<br>210<br>211<br>212<br>213<br>214<br>215<br>216<br>217<br>218<br>219<br>220<br>221<br>222<br>223<br>224<br>225<br>226<br>227<br>228<br>229<br>230<br>231<br>232<br>233<br>234<br>235<br>236<br>237<br>238<br>239<br>240<br>241<br>242<br>243<br>244<br>245<br>246<br>247<br>248<br>249<br>250<br>251<br>252<br>253<br>254<br>255<br>256<br>257<br>258<br>259<br>260<br>261<br>262<br>263<br>264<br>265<br>266<br>267<br>268<br>269<br>270<br>271<br>272<br>273<br>274<br>275<br>276<br>277<br>278 | 一、安装和配置nginx，下面操作在172.16.60.247、172.16.60.247两个节点机器上操作<br> <br>1）下载和编译 nginx<br>[root@k8s-ha01 ~]\# yum -y install gcc pcre-devel zlib-devel openssl-devel wget lsof<br>[root@k8s-ha01 ~]\# cd /opt/k8s/work<br>[root@k8s-ha01 work]\# wget http://nginx.org/download/nginx-1.15.3.tar.gz<br>[root@k8s-ha01 work]\# tar -xzvf nginx-1.15.3.tar.gz<br>[root@k8s-ha01 work]\# cd nginx-1.15.3<br>[root@k8s-ha01 nginx-1.15.3]\# mkdir nginx-prefix<br>[root@k8s-ha01 nginx-1.15.3]\# ./configure --with-stream --without-http --prefix=$(pwd)/nginx-prefix --without-http\_uwsgi\_module --without-http\_scgi\_module --without-http\_fastcgi\_module<br> <br>解决说明：<br>--with-stream：开启 4 层透明转发(TCP Proxy)功能；<br>--without-xxx：关闭所有其他功能，这样生成的动态链接二进制程序依赖最小；<br> <br>预期输出：<br>Configuration summary<br>  + PCRE library is not used<br>  + OpenSSL library is not used<br>  + zlib library is not used<br> <br>  nginx path prefix: "/root/tmp/nginx-1.15.3/nginx-prefix"<br>  nginx binary file: "/root/tmp/nginx-1.15.3/nginx-prefix/sbin/nginx"<br>  nginx modules path: "/root/tmp/nginx-1.15.3/nginx-prefix/modules"<br>  nginx configuration prefix: "/root/tmp/nginx-1.15.3/nginx-prefix/conf"<br>  nginx configuration file: "/root/tmp/nginx-1.15.3/nginx-prefix/conf/nginx.conf"<br>  nginx pid file: "/root/tmp/nginx-1.15.3/nginx-prefix/logs/nginx.pid"<br>  nginx error log file: "/root/tmp/nginx-1.15.3/nginx-prefix/logs/error.log"<br>  nginx http access log file: "/root/tmp/nginx-1.15.3/nginx-prefix/logs/access.log"<br>  nginx http client request body temporary files: "client\_body\_temp"<br>  nginx http proxy temporary files: "proxy\_temp"<br> <br>继续编译和安装：<br>[root@k8s-ha01 nginx-1.15.3]\# make &amp;&amp; make install<br> <br>2）验证编译的 nginx<br>[root@k8s-ha01 nginx-1.15.3]\# ./nginx-prefix/sbin/nginx -v<br>nginx version: nginx/1.15.3<br> <br>查看 nginx 动态链接的库：<br>[root@k8s-ha01 nginx-1.15.3]\# ldd ./nginx-prefix/sbin/nginx<br>        linux-vdso.so.1 =&gt;  (0x00007ffc7e0ef000)<br>        libdl.so.2 =&gt; /lib64/libdl.so.2 (0x00007f00b5c2d000)<br>        libpthread.so.0 =&gt; /lib64/libpthread.so.0 (0x00007f00b5a11000)<br>        libc.so.6 =&gt; /lib64/libc.so.6 (0x00007f00b5644000)<br>        /lib64/ld-linux-x86-64.so.2 (0x00007f00b5e31000)<br> <br>由于只开启了 4 层透明转发功能，所以除了依赖 libc 等操作系统核心 lib 库外，没有对其它 lib 的依赖(如 libz、libssl 等)，这样可以方便部署到各版本操作系统中；<br> <br>3）安装和部署 nginx<br>[root@k8s-ha01 ~]\# cp /opt/k8s/work/nginx-1.15.3/nginx-prefix/sbin/nginx /opt/k8s/kube-nginx/sbin/kube-nginx<br>[root@k8s-ha01 ~]\# chmod a+x /opt/k8s/kube-nginx/sbin/\*<br>[root@k8s-ha01 ~]\# mkdir -p /opt/k8s/kube-nginx/{conf,logs,sbin}<br> <br>配置 nginx，开启 4 层透明转发功能：<br>[root@k8s-ha01 ~]\# vim /opt/k8s/kube-nginx/conf/kube-nginx.conf<br>worker\_processes 2;<br> <br>events {<br>    worker\_connections  65525;<br>}<br> <br>stream {<br>    upstream backend {<br>        hash $remote\_addr consistent;<br>        server 172.16.60.241:6443        max\_fails=3 fail\_timeout=30s;<br>        server 172.16.60.242:6443        max\_fails=3 fail\_timeout=30s;<br>        server 172.16.60.243:6443        max\_fails=3 fail\_timeout=30s;<br>    }<br> <br>    server {<br>        listen 8443;<br>        proxy\_connect\_timeout 1s;<br>        proxy\_pass backend;<br>    }<br>}<br> <br>[root@k8s-ha01 ~]\# ulimit -n 65525<br>[root@k8s-ha01 ~]\# vim /etc/security/limits.conf     \# 文件底部添加下面四行内容<br>\* soft nofile 65525<br>\* hard nofile 65525<br>\* soft nproc 65525<br>\* hard nproc 65525<br> <br>4) 配置 systemd unit 文件，启动服务<br>[root@k8s-ha01 ~]\# vim /etc/systemd/system/kube-nginx.service<br>[Unit]<br>Description=kube-apiserver nginx proxy<br>After=network.target<br>After=network-online.target<br>Wants=network-online.target<br> <br>[Service]<br>Type=forking<br>ExecStartPre=/opt/k8s/kube-nginx/sbin/kube-nginx -c /opt/k8s/kube-nginx/conf/kube-nginx.conf -p /opt/k8s/kube-nginx -t<br>ExecStart=/opt/k8s/kube-nginx/sbin/kube-nginx -c /opt/k8s/kube-nginx/conf/kube-nginx.conf -p /opt/k8s/kube-nginx<br>ExecReload=/opt/k8s/kube-nginx/sbin/kube-nginx -c /opt/k8s/kube-nginx/conf/kube-nginx.conf -p /opt/k8s/kube-nginx -s reload<br>PrivateTmp=true<br>Restart=always<br>RestartSec=5<br>StartLimitInterval=0<br>LimitNOFILE=65536<br> <br>[Install]<br>WantedBy=multi-user.target<br> <br>[root@k8s-ha01 ~]\# systemctl daemon-reload &amp;&amp; systemctl enable kube-nginx &amp;&amp; systemctl restart kube-nginx<br>[root@k8s-ha01 ~]\# lsof -i:8443<br>COMMAND     PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME<br>kube-ngin 31980   root    5u  IPv4 145789      0t0  TCP localhost:pcsync-https (LISTEN)<br>kube-ngin 31981 nobody    5u  IPv4 145789      0t0  TCP localhost:pcsync-https (LISTEN)<br>kube-ngin 31982 nobody    5u  IPv4 145789      0t0  TCP localhost:pcsync-https (LISTEN)<br> <br>测试下8443代理端口连通性<br>[root@k8s-ha01 ~]\# telnet 172.16.60.250 8443<br>Trying 172.16.60.250...<br>Connected to 172.16.60.250.<br>Escape character is '^]'.<br>Connection closed by foreign host.<br> <br>这是因为三个kube-apiserver服务还没有部署，即后端三个apiserver实例的6443端口还没有起来。<br> <br>二、安装和配置keepalived<br>1）编译安装keepalived （两个节点上同样操作）<br>[root@k8s-ha01 ~]\# cd /opt/k8s/work/<br>[root@k8s-ha01 work]\# wget https://www.keepalived.org/software/keepalived-2.0.16.tar.gz<br>[root@k8s-ha01 work]\# tar -zvxf keepalived-2.0.16.tar.gz<br>[root@k8s-ha01 work]\# cd keepalived-2.0.16<br>[root@k8s-ha01 keepalived-2.0.16]\# ./configure<br>[root@k8s-ha01 keepalived-2.0.16]\# make &amp;&amp; make install<br> <br>[root@k8s-ha01 keepalived-2.0.16]\# cp keepalived/etc/init.d/keepalived /etc/rc.d/init.d/<br>[root@k8s-ha01 keepalived-2.0.16]\# cp /usr/local/etc/sysconfig/keepalived /etc/sysconfig/<br>[root@k8s-ha01 keepalived-2.0.16]\# mkdir /etc/keepalived<br>[root@k8s-ha01 keepalived-2.0.16]\# cp /usr/local/etc/keepalived/keepalived.conf /etc/keepalived/<br>[root@k8s-ha01 keepalived-2.0.16]\# cp /usr/local/sbin/keepalived /usr/sbin/<br>[root@k8s-ha01 keepalived-2.0.16]\# echo "/etc/init.d/keepalived start" &gt;&gt; /etc/rc.local<br> <br>2) 配置keepalived<br>172.16.60.207节点上的keepalived配置内容<br>[root@k8s-ha01 ~]\# cp /etc/keepalived/keepalived.conf /etc/keepalived/keepalived.conf.bak<br>[root@k8s-ha01 ~]\# &gt;/etc/keepalived/keepalived.conf<br>[root@k8s-ha01 ~]\# vim /etc/keepalived/keepalived.conf<br>! Configuration File for keepalived    <br>   <br>global\_defs {<br>notification\_email {    <br>ops@wangshibo.cn <br>tech@wangshibo.cn<br>}<br>   <br>notification\_email\_from ops@wangshibo.cn <br>smtp\_server 127.0.0.1     <br>smtp\_connect\_timeout 30   <br>router\_id master-node    <br>}<br>   <br>vrrp\_script chk\_http\_port {     <br>    script "/opt/chk\_nginx.sh" <br>    interval 2                  <br>    weight -5                  <br>    fall 2              <br>    rise 1                 <br>}<br>   <br>vrrp\_instance VI\_1 {   <br>    state MASTER   <br>    interface ens192     <br>    mcast\_src\_ip 172.16.60.247<br>    virtual\_router\_id 51        <br>    priority 101               <br>    advert\_int 1                <br>    authentication {           <br>        auth\_type PASS         <br>        auth\_pass 1111         <br>    }<br>    virtual\_ipaddress {       <br>        172.16.60.250<br>    }<br>  <br>track\_script {                     <br>   chk\_http\_port                   <br>}<br>}<br> <br>另一个节点172.16.60.248上的keepalived配置内容为：<br>[root@k8s-ha02 ~]\# cp /etc/keepalived/keepalived.conf /etc/keepalived/keepalived.conf.bak<br>[root@k8s-ha02 ~]\# &gt;/etc/keepalived/keepalived.conf<br>[root@k8s-ha02 ~]\# vim /etc/keepalived/keepalived.conf<br>! Configuration File for keepalived    <br>   <br>global\_defs {<br>notification\_email {    <br>ops@wangshibo.cn <br>tech@wangshibo.cn<br>}<br>   <br>notification\_email\_from ops@wangshibo.cn <br>smtp\_server 127.0.0.1     <br>smtp\_connect\_timeout 30   <br>router\_id slave-node    <br>}<br>   <br>vrrp\_script chk\_http\_port {     <br>    script "/opt/chk\_nginx.sh" <br>    interval 2                  <br>    weight -5                  <br>    fall 2              <br>    rise 1                 <br>}<br>   <br>vrrp\_instance VI\_1 {   <br>    state MASTER   <br>    interface ens192     <br>    mcast\_src\_ip 172.16.60.248<br>    virtual\_router\_id 51        <br>    priority 99              <br>    advert\_int 1                <br>    authentication {           <br>        auth\_type PASS         <br>        auth\_pass 1111         <br>    }<br>    virtual\_ipaddress {       <br>        172.16.60.250<br>    }<br>  <br>track\_script {                     <br>   chk\_http\_port                   <br>}<br>}<br> <br>2) 配置两个节点的nginx监控脚本（该脚本会在keepalived.conf配置中被引用）<br>[root@k8s-ha01 ~]\# vim /opt/chk\_nginx.sh<br>\#!/bin/bash<br>counter=$(ps -ef|grep -w kube-nginx|grep -v grep|wc -l)<br>if [ "${counter}" = "0" ]; then<br>    systemctl start kube-nginx<br>    sleep 2<br>    counter=$(ps -ef|grep kube-nginx|grep -v grep|wc -l)<br>    if [ "${counter}" = "0" ]; then<br>        /etc/init.d/keepalived stop<br>    fi<br>fi<br> <br>[root@k8s-ha01 ~]\# chmod 755 /opt/chk\_nginx.sh<br> <br>3) 启动两个节点的keepalived服务<br>[root@k8s-ha01 ~]\# /etc/init.d/keepalived start<br>Starting keepalived (via systemctl):                       [  OK  ]<br> <br>[root@k8s-ha01 ~]\# ps -ef|grep keepalived<br>root      5358     1  0 00:32 ?        00:00:00 /usr/local/sbin/keepalived -D<br>root      5359  5358  0 00:32 ?        00:00:00 /usr/local/sbin/keepalived -D<br>root      5391 29606  0 00:32 pts/0    00:00:00 grep --color=auto keepalived<br> <br>查看vip情况. 发现vip默认起初会在master节点上<br>[root@k8s-ha01 ~]\# ip addr<br>1: lo: &lt;LOOPBACK,UP,LOWER\_UP&gt; mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000<br>    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00<br>    inet 127.0.0.1/8 scope host lo<br>       valid\_lft forever preferred\_lft forever<br>    inet6 ::1/128 scope host<br>       valid\_lft forever preferred\_lft forever<br>2: ens192: &lt;BROADCAST,MULTICAST,UP,LOWER\_UP&gt; mtu 1500 qdisc mq state UP group default qlen 1000<br>    link/ether 00:50:56:ac:3a:a6 brd ff:ff:ff:ff:ff:ff<br>    inet 172.16.60.247/24 brd 172.16.60.255 scope global ens192<br>       valid\_lft forever preferred\_lft forever<br>    inet 172.16.60.250/32 scope global ens192<br>       valid\_lft forever preferred\_lft forever<br>    inet6 fe80::250:56ff:feac:3aa6/64 scope link<br>       valid\_lft forever preferred\_lft forever<br> <br>4) 测试vip故障转移<br>参考：https://www.cnblogs.com/kevingrace/p/6138185.html<br> <br>当master节点的keepalived服务挂掉，vip会自动漂移到slave节点上<br>当master节点的keepliaved服务恢复后，从将vip资源从slave节点重新抢占回来（keepalived配置文件中的priority优先级决定的）<br>当两个节点的nginx挂掉后，keepaived会引用nginx监控脚本自启动nginx服务，如启动失败，则强杀keepalived服务，从而实现vip转移。 |


*************** 当你发现自己的才华撑不起野心时，就请安静下来学习吧！***************

分类: Docker

好文要顶 关注我 收藏该文 

![](images/B709DA850AA1484A9874E8AD0D4A58C3con_weibo_24.png)

 

![](images/0B2FAE9B9A874A03987BDD75485D3AECwechat.png)

![](images/F6F9ABB6933642619B77421A8D6B9BEE161124180837.png)

散尽浮华

关注 - 23

粉丝 - 3133

+加关注

5

0

« 上一篇： Elasticsearch 最佳运维实践 - 总结（二）

» 下一篇： 应用指标数据采集并录入Elasticsearch仓库 - 运维笔记

posted @ 2019-06-01 22:21  散尽浮华  阅读(10402)  评论(4)  编辑  收藏



评论

  

#1楼 2019-12-19 10:10 | 故知之始已

大佬，软件包在哪下的能留下链接吗

支持(1) 反对(0)

  

#2楼 2020-08-14 23:53 | 磐石yys

我吐了，一个软件部署这么麻烦，觉得谷歌做的真不好，现在有个叫rancher 的，听说用这个部署方便多了。

支持(1) 反对(1)

  

#3楼 2021-01-26 10:07 | XWD2020

大佬，所有软件包在哪下的能留下百度链接吗 ，谢谢

支持(0) 反对(0)

  

#4楼 2021-01-31 21:22 | XWD2020

一、安装和配置nginx，下面操作在172.16.60.247、172.16.60.247两个节点机器上操作
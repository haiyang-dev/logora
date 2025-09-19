[https://aws.amazon.com/blogs/opensource/a-container-free-way-to-configure-kubernetes-using-aws-lambda/](https://aws.amazon.com/blogs/opensource/a-container-free-way-to-configure-kubernetes-using-aws-lambda/)

现阶段发现RBAC分三种使用方式：

 第一种是集群内部的pod访问集群的资源，例如一个pod需要修改statefulset,这种只需要创建一个role, role binding, service account, pod来使用这个service account就有权限了

第二种： 类似于ebs csi， 它需要IAM role里面做配置，然后eks 内部需要有service account

第三种： 类似于eks自身的管理，就是创建IAM role, k8s里面创建 role + group( eg. read_only) = role binding, 然后再aws-authconfigmap里面加上role arn

.\eksctl.exe create iamidentitymapping --cluster a250065-pricingsnapshot-qa-use1 --group inspector-read-only --arn arn:aws:iam::205358287074:role/a250065-iam-for-dr-lambda-pricingsnapshot-qa-use1   

```
- rolearn: arn:aws:iam::205358287074:role/a250065-snapshot-qa-use22024010313121845050000000a
  username: system:node:{{EC2PrivateDNSName}}
  groups:
    - system:bootstrappers
    - system:nodes
- rolearn: arn:aws:iam::205358287074:role/a250065-iam-for-dr-lambda-pricingsnapshot-qa-use2
  username: lambda
  groups:
    - read_only
    - system:master
```

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: aws-auth
  namespace: kube-system
data:
  mapRoles: |
    ${existing_mapRoles}
    - rolearn: arn:aws:iam::205358287074:role/a250065-iam-for-dr-lambda-pricingsnapshot-qa-use2
      username: lambda
```

其中，${existing_mapRoles}是一个变量，你可以通过读取现有的configmap的内容来赋值，例如：

```
data "external" "configmap_auth" {
  program = ["bash", "-c", "kubectl get configmap aws-auth -n kube-system -o json | jq -r '.data.mapRoles'"]
}

data "template_file" "configmap_auth" {
  template = file("aws-auth.yaml")
  vars = {
    existing_mapRoles = data.external.configmap_auth.result.stdout
  }
}
```

介绍

您的问题涉及到Kubernetes的角色访问控制（RBAC）的概念，我会尽量简明地回答。

- ClusterRole和Role都是定义一组权限规则（rules）的资源，不同的是，ClusterRole是集群范围的，可以控制所有命名空间（namespace）的资源，而Role是命名空间范围的，只能控制一个命名空间的资源

- ServiceAccount和UserAccount都是代表用户或进程的身份（subject），不同的是，ServiceAccount是针对运行在Pods中的进程，而UserAccount是针对人类用户

- ClusterRoleBinding和RoleBinding都是将身份（subject）绑定到角色（role）的资源，不同的是，ClusterRoleBinding可以绑定ClusterRole或Role，而RoleBinding只能绑定Role

[ClusterRoleBinding和RoleBinding都是将role和subject绑起来的。subject是指用户、服务账号或组，它们代表了执行操作的实体。role是指定义了一组权限规则的资源，它们可以是集群范围的ClusterRole，也可以是命名空间范围的Role。](https://zhuanlan.zhihu.com/p/434245535)[1](https://zhuanlan.zhihu.com/p/434245535)[2](https://blog.csdn.net/qq_37633935/article/details/134168446)

[ClusterRoleBinding和RoleBinding的区别在于，ClusterRoleBinding可以将ClusterRole或Role绑定到任意的subject，而RoleBinding只能将Role绑定到同一命名空间的subject。](https://zhuanlan.zhihu.com/p/434245535)[1](https://zhuanlan.zhihu.com/p/434245535)[2](https://blog.csdn.net/qq_37633935/article/details/134168446)

[例如，如果你想让用户jane在default命名空间中有读取pods的权限，你可以创建一个RoleBinding，将Role pod-reader和subject jane绑定在一起。如果你想让用户dave在所有命名空间中有读取secrets的权限，你可以创建一个ClusterRoleBinding，将ClusterRole secret-reader和subject dave绑定在一起。](https://zhuanlan.zhihu.com/p/434245535)

[Kubernetes 中的用户分为两类：由 Kubernetes 管理的服务账号（ServiceAccount），和由外部服务管理的普通用户（UserAccount）](https://jimmysong.io/kubernetes-handbook/guide/auth-with-kubeconfig-or-token.html)[1](https://jimmysong.io/kubernetes-handbook/guide/auth-with-kubeconfig-or-token.html)[2](https://kubernetes.io/zh/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)。

- 服务账号是针对运行在 Pods 中的进程的，它们是 Kubernetes API 的资源，可以通过 API 调用创建、删除或修改

- 普通用户是针对人类用户的，它们不是 Kubernetes API 的资源，而是由外部服务（如 LDAP、OpenID Connect、Google Accounts 等）管理的

[如果你想创建一个普通用户，你需要使用一个支持用户管理的外部服务，或者手动分发私钥和证书](https://kubernetes.io/docs/reference/access-authn-authz/authentication/)[4](https://kubernetes.io/docs/reference/access-authn-authz/authentication/)[。你也可以使用 kubeadm 工具来生成证书和令牌，然后将它们分配给用户](https://jimmysong.io/kubernetes-handbook/guide/auth-with-kubeconfig-or-token.html)[1](https://jimmysong.io/kubernetes-handbook/guide/auth-with-kubeconfig-or-token.html)。具体的步骤可以参考 [这篇文档](https://jimmysong.io/kubernetes-handbook/guide/auth-with-kubeconfig-or-token.html)。
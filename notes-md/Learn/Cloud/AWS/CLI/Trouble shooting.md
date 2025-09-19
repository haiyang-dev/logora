因为 CLI 集成了aws-iam-authenticator，所以 client.authentication.k8s.io/v1alpha1 和 client.authentication.k8s.io/v1beta1取决于aws cli 版本

[您好，这是Bing。您的消息是关于AWS IAM Authenticator for Kubernetes的问题，这是一个工具，可以使用AWS IAM凭证来验证Kubernetes集群的访问](https://stackoverflow.com/questions/71318743/kubectl-versions-error-exec-plugin-is-configured-to-use-api-version-client-auth)[1](https://stackoverflow.com/questions/71318743/kubectl-versions-error-exec-plugin-is-configured-to-use-api-version-client-auth)[。您的问题是，为什么CLI集成了aws-iam-authenticator，导致client.authentication.k8s.io/v1alpha1和client.authentication.k8s.io/v1beta1之间的不兼容性。根据我从网络搜索中获得的信息，这是因为AWS在0.5.4版本中改变了aws-iam-authenticator的行为方式，要求使用v1beta1 API版本](https://github.com/kubernetes-sigs/aws-iam-authenticator)[2](https://github.com/kubernetes-sigs/aws-iam-authenticator)。这可能导致您的kubectl命令出现错误，例如：

```
Unable to connect to the server: getting credentials: exec plugin is configured to use API version client.authentication.k8s.io/v1alpha1, plugin returned version client.authentication.k8s.io/v1beta1

```

为了解决这个问题，您有两种选择：

- 您可以修改您的kubeconfig文件（通常在

- 您可以切换回aws-iam-authenticator 0.5.3版本，但是如果您使用的是M1架构，您可能需要从源代码构建它，因为没有为它构建的darwin-arm64二进制文件
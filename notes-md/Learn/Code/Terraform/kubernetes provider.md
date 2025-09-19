For short-lived authentication tokens, like those found in EKS, which [expire in 15 minutes](https://aws.github.io/aws-eks-best-practices/security/docs/iam#controlling-access-to-eks-clusters), an exec-based credential plugin can be used to ensure the token is always up to date:

```
data "aws_eks_cluster" "example" {
  name = "example"
}
data "aws_eks_cluster_auth" "example" {
  name = "example"
}
provider "kubernetes" {
  host                   = data.aws_eks_cluster.example.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.example.certificate_authority[0].data)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    args        = ["eks", "get-token", "--cluster-name", var.cluster_name]
    command     = "aws"
  }
}
```
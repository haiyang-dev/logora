1.  Q: # error 80， remove 3 service

kubernetes_service.snapshot-cache-headless: Refreshing state... [id=default/tscc-is-headless]
╷
│ Error: Get "http://localhost/api/v1/namespaces/default/services/tscc-is-headless": dial tcp 127.0.0.1:80: connect: connection refused
│ 
│   with kubernetes_service.snapshot-cache-headless,
│   on service.tf line 7, in resource "kubernetes_service" "snapshot-cache-headless":
│    7: resource "kubernetes_service" "snapshot-cache-headless" {
│ 
╵
Releasing state lock. This may take a few moments...



```javascript
terraform destroy -target kubernetes_namespace_v1.ingress-nginx-namespace
terraform destroy -target kubernetes_cluster_role_v1.nginx-ingress-controller-cluster-role
terraform destroy -target kubernetes_ingress_class_v1.nginx-ingress-class
terraform destroy -target kubernetes_service_v1.snapshot-web-service
terraform destroy -target kubernetes_service_v1.snapshot-cache-headless
terraform destroy -target kubernetes_service_v1.cassandra-headless
terraform destroy -target kubernetes_service_v1.snapshot-cachescaler-headless
terraform destroy -target kubernetes_service.snapshot-inspector-headless
terraform destroy -target kubernetes_service_v1.ingress-nginx-controller-service
```

then remove state

 terraform state list

```javascript
terraform state rm kubernetes_namespace_v1.ingress-nginx-namespace
terraform state rm kubernetes_cluster_role_v1.nginx-ingress-controller-cluster-role
terraform state rm kubernetes_ingress_class_v1.nginx-ingress-class
terraform state rm kubernetes_service_v1.snapshot-web-service
terraform state rm kubernetes_service_v1.snapshot-cache-headless
terraform state rm kubernetes_service_v1.cassandra-headless
terraform state rm kubernetes_service_v1.snapshot-cachescaler-headless
terraform state rm kubernetes_service.snapshot-inspector-headless
```

2. Q: module.eks_modules.null_resource.update_config_map_aws_auth[0] (local-exec): Unable to connect to the server: getting credentials: exec: executable aws-iam-authenticator not found 

module.eks_modules.null_resource.update_config_map_aws_auth[0] (local-exec): It looks like you are trying to use a client-go credential plugin that is not installed.

A: install aws-iam-authenticator https://docs.aws.amazon.com/eks/latest/userguide/install-aws-iam-authenticator.html  https://docs.aws.amazon.com/eks/latest/userguide/troubleshooting.html



3. kubernetes_service.tscc-is-headless: Creating...
╷
│ Error: Unauthorized
│ 
│   with kubernetes_service.tscc-is-headless,
│   on service.tf line 7, in resource "kubernetes_service" "tscc-is-headless":
│    7: resource "kubernetes_service" "tscc-is-headless" {
│ 
╵
Releasing state lock. This may take a few moments...

token expired at 15 mins after cluster created,

need to change to provider like below:

```javascript
provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
  # to ensure the kube token always up to date, required: aws cli
  # NOTE: Once aws cli updated, need to check the client.authentication.k8s.io version, v1alpha1 or v1beta1(since aws cli 1.24.0)
  exec {
    api_version = "client.authentication.k8s.io/v1alpha1"
    args        = ["eks", "get-token", "--cluster-name", module.eks_modules.cluster_id]
    command     = "aws"
  }
}
```

│ Error: namespaces "ingress-nginx" is forbidden: User "system:serviceaccount:gitlab-shared-runners:gitlab-runner-job" cannot get resource "namespaces" in API group "" in the namespace "ingress-nginx"

6842│ 

6843│   with kubernetes_namespace_v1.ingress-nginx-namespace,

6844│   on service.tf line 22, in resource "kubernetes_namespace_v1" "ingress-nginx-namespace":

6845│   22: resource "kubernetes_namespace_v1" "ingress-nginx-namespace" {

6846│ 

6847╵

如果报这个错，那很大原因是改了subnet导致的，要在原来的版本
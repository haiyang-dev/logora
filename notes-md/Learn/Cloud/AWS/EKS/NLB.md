https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/main/docs/guide/service/annotations.md



https://kubernetes.io/docs/concepts/services-networking/service/



https://docs.aws.amazon.com/eks/latest/userguide/load-balancing.html





https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/guide/ingress/annotations/



create NLB

```javascript
resource "kubernetes_service" "snapshot-web-service" {
  metadata {
    name = "snapshot-web-service"
    labels = {
      app = "snapshot-web"
    }
    annotations = {
      "service.beta.kubernetes.io/aws-load-balancer-type" = "nlb"
      "service.beta.kubernetes.io/aws-load-balancer-internal" = "true"
      "service.beta.kubernetes.io/aws-load-balancer-backend-protocol" = "(https|http|ssl)"
      "service.beta.kubernetes.io/aws-load-balancer-ssl-ports" = "443"
      "service.beta.kubernetes.io/aws-load-balancer-ssl-cert" = aws_acm_certificate.internal_dns_cert.arn
    }
  }

  spec {
    selector = {
      app = "snapshot-web"
    }
    port {
      name        = "https"
      port        = 443
      protocol    = "TCP"
      target_port = 80
    }
    load_balancer_source_ranges = var.web_service_lb_source_range
    type = "LoadBalancer"
  }
}
```


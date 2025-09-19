在 AWS EKS 中，**Ingress**、**Service**（尤其是 `LoadBalancer` 类型）和 **ELB**（Elastic Load Balancer）是 Kubernetes 网络模型与 AWS 基础设施结合的关键组件。它们的区别和关系如下：

---

### 1. **Service（Kubernetes Service）**

- **作用**：

  - 定义如何访问一组 Pod（如负载均衡、服务发现）。

  - 类型包括 `ClusterIP`（默认，仅集群内部访问）、`NodePort`（通过节点端口暴露）和 **`LoadBalancer`**（通过云平台的负载均衡器暴露）。

- **与 ELB 的关系**：

  - 当创建 `type: LoadBalancer` 的 Service 时，**EKS 会自动创建一个 AWS 网络负载均衡器（NLB）或经典负载均衡器（CLB）**（具体类型由配置决定）。

  - Service 的每个 `LoadBalancer` 实例会生成独立的 ELB，**每个 ELB 对应一个 Service**。

- **典型场景**：

  - 暴露单个服务到公网（如数据库、非 HTTP 服务）。

  - 直接通过 ELB 的 DNS 或 IP 访问服务。

---

### 2. **Ingress（Kubernetes Ingress）**

- **作用**：

  - 管理外部访问集群内服务的 **HTTP/HTTPS 路由规则**（如基于域名、路径的路由，TLS 终止等）。

  - 本身不创建负载均衡器，需要配合 **Ingress Controller**（如 AWS ALB Ingress Controller）使用。

- **与 ELB 的关系**：

  - 当部署 Ingress 资源时，**Ingress Controller 会动态创建或配置一个 AWS ALB（Application Load Balancer）**。

  - **一个 ALB 可以处理多个 Ingress 规则**，路由到不同的 Service（如按域名或路径区分）。

- **典型场景**：

  - 需要复杂的 HTTP 路由（如多个服务共享同一个 ALB）。

  - 降低成本（一个 ALB 支持多个服务，而非每个 Service 单独使用一个 NLB）。

---

### 3. **ELB（Elastic Load Balancer）**

- **作用**：

  - AWS 提供的负载均衡服务，分为三种类型：

    - **ALB（Application Load Balancer）**：七层（HTTP/HTTPS），支持基于内容的路由。

    - **NLB（Network Load Balancer）**：四层（TCP/UDP），高性能、低延迟。

    - **CLB（Classic Load Balancer）**：旧版，支持四层和七层。

- **与 Service/Ingress 的关系**：

  - **Service（`LoadBalancer` 类型）** → 创建 NLB 或 CLB。

  - **Ingress（配合 ALB Ingress Controller）** → 创建 ALB。

---

### 三者的关系总结

| 组件                | 创建者                     | ELB 类型       | 核心作用                              | 适用场景                          |

|---------------------|---------------------------|---------------|--------------------------------------|----------------------------------|

| `Service: LoadBalancer` | Kubernetes Service        | NLB 或 CLB    | 直接暴露单个服务到公网                | 非 HTTP 服务、简单四层负载均衡   |

| `Ingress`           | Ingress Controller (ALB)  | ALB           | 基于 HTTP/HTTPS 的复杂路由规则        | 多服务共享、七层路由、TLS 终止   |

| ELB                 | AWS 基础设施              | ALB/NLB/CLB   | 流量分发到后端实例（Pod 或 Node）     | 所有外部流量入口                 |

---

### 协作流程示例

1. **用户访问流程**：

   ```

   用户 → ALB（由 Ingress 创建） → Ingress 路由规则 → 目标 Service（ClusterIP） → Pod

   ```

2. **资源创建顺序**：

   - 部署 `ALB Ingress Controller`（负责监听 Ingress 资源并创建 ALB）。

   - 创建 `Ingress` 资源定义路由规则。

   - 创建 `Service`（通常为 `ClusterIP` 类型，供 Ingress 路由到后端）。

---

### 关键区别

| 特性                | Service (LoadBalancer)          | Ingress (ALB)                   |

|---------------------|--------------------------------|---------------------------------|

| **ELB 类型**        | NLB/CLB                       | ALB                            |

| **层级**            | 四层（TCP/UDP）               | 七层（HTTP/HTTPS）             |

| **路由能力**        | 无，仅负载均衡                | 支持域名、路径、TLS 等复杂路由 |

| **成本**            | 每个 Service 一个 ELB（较贵） | 一个 ALB 支持多个服务（更经济） |

| **适用协议**        | 任意协议（TCP/UDP）           | 仅 HTTP/HTTPS                  |

---

### 选择建议

- **使用 `Service: LoadBalancer`**：

  - 需要暴露非 HTTP 服务（如数据库、gRPC）。

  - 需要极低延迟（NLB 性能优于 ALB）。

- **使用 `Ingress + ALB`**：

  - 需要基于域名或路径的路由。

  - 需要 TLS 终止、重定向等 HTTP 高级功能。

  - 需要降低成本（避免为每个 Service 单独创建 ELB）。

通过合理组合 Service 和 Ingress，可以在 EKS 中实现灵活、高效且经济的外部访问架构。
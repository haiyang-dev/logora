```
module "self_managed_node_group" {
  source = "./modules/self-managed-node-group"

  for_each = { for k, v in var.self_managed_node_groups : k => v if var.create }

  create = try(each.value.create, true)

  cluster_name = time_sleep.this[0].triggers["cluster_name"]

  # Autoscaling Group
  create_autoscaling_group = try(each.value.create_autoscaling_group, var.self_managed_node_group_defaults.create_autoscaling_group, true)

  name            = try(each.value.name, each.key)
  use_name_prefix = try(each.value.use_name_prefix, var.self_managed_node_group_defaults.use_name_prefix, true)
```

self managed node group里面存在两个参数， 一个是self_managed_node_groups， 另一个是self_managed_node_group_defaults

它每一个都是用try来取的，也就是当self_managed_node_groups没有，那就使用self_managed_node_group_defaults， 如果都没有那么使用默认值

```
metadata_options = {
  http_endpoint               = "enabled"
  http_tokens                 = "required"
  http_put_response_hop_limit = 2
}
```

这个是控制 IMDSv2的， 控制了pod访问aws 其他的service
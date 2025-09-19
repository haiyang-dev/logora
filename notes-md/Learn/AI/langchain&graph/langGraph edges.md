### add_conditional_edges 是什么？

这是 LangGraph 中用于**添加条件跳转逻辑**的方法。

它允许你在某个节点执行完后，根据状态（state）或配置（config）的内容，**动态决定跳转到哪个节点**，甚至可以**并发跳转多个节点并传递数据**。

###### ✅ 函数签名

```python
graph.add_conditional_edges(
    node_name: str,
    condition: Callable,
    path_map: Optional[Union[Dict[str, str], List[str]]] = None
)
```

###### ✅ 参数说明

| 参数 | 类型 | 说明 | 
| -- | -- | -- |
| node_name | str | 当前节点名称（从这里出发） | 
| condition | Callable | 条件函数，接收  | 
| path_map | dict | 映射返回值到节点名，或列出允许跳转的节点名 | 


###### ✅ 条件函数的返回值支持以下几种形式：

| 返回类型 | 说明 | 是否需要  | 
| -- | -- | -- |
| "node_name" | 跳转到该节点 | ❌（除非你想映射） | 
| ["node1", "node2"] | 并发跳转多个节点 | ❌ | 
| Send("node", {...}) | 跳转并传递数据 | ❌ | 
| [Send(...), Send(...)] | 并发跳转多个节点并传递不同数据 | ❌ | 
| "label" | 跳转标签（非节点名） | ✅（需要  | 


###### ✅ path_map 的两种形式

| 类型 | 示例 | 用途 | 
| -- | -- | -- |
| dict | {"short": "node_a", "long": "node_b"} | 当返回值是语义标签时 | 
| list | ["node_a", "node_b"] | 当返回值就是节点名时，用于限制合法跳转目标 | 


##### ✅ 示例对比

###### 1. **返回节点名字符串（最简单）**

```python
def route(state):
    return "step_b"

graph.add_conditional_edges("step_a", route)
```

###### 2. **使用 ****path_map**** 字典映射语义标签**

```python
def classify(state):
    return "short" if len(state["text"]) < 100 else "long"

graph.add_conditional_edges("check", classify, {
    "short": "skip_summary",
    "long": "summarize"
})
```

###### 3. **使用 ****path_map**** 列表限制跳转目标**

```python
def route(state):
    return "step_b"

graph.add_conditional_edges("step_a", route, ["step_b", "step_c"])
```

###### 4. **返回 ****Send(...)****（跳转 + 数据）**

```python
def route_with_data(state):
    return Send("process", {"input": state["raw_data"]})

graph.add_conditional_edges("prepare", route_with_data)
```

###### 5. **返回多个 ****Send(...)****（并发跳转 + 数据）**

```python
def fan_out(state):
    return [
        Send("search", {"query": q})
        for q in state["queries"]
    ]

graph.add_conditional_edges("dispatch", fan_out)
```

###### ✅ 总结建议

| 你想要的行为 | 推荐写法 | 
| -- | -- |
| 简单跳转 | 返回节点名字符串 | 
| 跳转 + 数据 | 返回  | 
| 并发跳转多个节点 | 返回  | 
| 使用语义标签判断 | 返回标签 +  | 
| 限制跳转目标 | 使用  | 


### add_edge 是什么？

add_edge 是 LangGraph 中用于添加**普通的、无条件的跳转边**的方法。

它表示：**从一个节点执行完后，始终跳转到另一个指定节点**，不需要任何判断逻辑。

###### ✅ 函数签名

```python
graph.add_edge(
    source: str,
    target: str
)
```

###### ✅ 参数说明

| 参数 | 类型 | 说明 | 
| -- | -- | -- |
| source | str | 起始节点名称 | 
| target | str | 目标节点名称（始终跳转到这里） | 


###### ✅ 用法示例

```python
graph.add_node("step_1", step_1_fn)
graph.add_node("step_2", step_2_fn)

graph.add_edge("step_1", "step_2")
```

这表示：

- 执行完 step_1 后，**始终跳转到 ****step_2**；

- 不需要判断条件；

- 适合用于线性流程或流程中固定的部分。

## ✅ add_edge vs add_conditional_edges

| 特性 | add_edge | add_conditional_edges | 
| -- | -- | -- |
| 是否有条件 | ❌ 无条件 | ✅ 有条件 | 
| 跳转目标 | 固定 | 动态 | 
| 是否支持并发跳转 | ❌ 否 | ✅ 是（返回多个  | 
| 是否支持传递数据 | ❌ 否（除非节点内部用  | ✅ 是（通过  | 
| 适用场景 | 固定流程、线性步骤 | 分支判断、动态路由、并发任务 | 


## ✅ 示例：结合使用

```python
graph.add_node("start", start_fn)
graph.add_node("check", check_fn)
graph.add_node("process", process_fn)
graph.add_node("done", done_fn)

graph.add_edge("start", "check")  # 固定跳转
graph.add_conditional_edges("check", should_continue, {
    "yes": "process",
    "no": "done"
})
```

## ✅ 总结建议

| 你想要的行为 | 推荐方法 | 
| -- | -- |
| 固定跳转 | add_edge | 
| 条件跳转 | add_conditional_edges | 
| 跳转 + 数据传递 | add_conditional_edges | 
| 并发跳转多个节点 | add_conditional_edges | 

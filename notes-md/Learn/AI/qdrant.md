[https://github.com/qdrant/qdrant](https://github.com/qdrant/qdrant)

10.35.45.98:6333/dashboard

/home/aiserver/github/qdrant/data

docker run -d  -p 6333:6333 -p 6334:6334     -v $(pwd)/qdrant_storage:/qdrant/storage:z     qdrant/qdrant

[https://qdrant.tech/documentation/](https://qdrant.tech/documentation/)

在 qdeant 中，distance 参数用于指定向量之间的距离度量方法。这在创建向量集合时非常重要，因为它决定了如何计算向量之间的相似性或距离。在你的示例代码中：

```
qd_client.create_collection(
    collection_name=collection_name,
    vectors_config=VectorParams(size=768, distance=Distance.DOT),
)

```

distance=Distance.DOT 表示使用点积（Dot Product）作为向量之间的距离度量方法。以下是一些常见的距离度量方法及其用途：

1. 点积（Dot Product）:

	- 点积用于衡量两个向量之间的相似性。点积值越大，向量越相似。

	- 适用于需要衡量向量方向相似性的场景。

1. 欧氏距离（Euclidean Distance）:

	- 计算两个向量之间的直线距离。

	- 适用于需要衡量向量之间的实际距离的场景。

1. 余弦相似度（Cosine Similarity）:

	- 衡量两个向量之间的角度相似性，而不考虑它们的大小。

	- 适用于文本相似性和推荐系统等场景。

1. 曼哈顿距离（Manhattan Distance）:

	- 计算两个向量在各个维度上的绝对差值之和。

	- 适用于需要衡量向量在各个维度上的差异的场景。

在你的示例中，使用点积作为距离度量方法可能是因为你希望衡量向量之间的相似性，而不是实际的距离。如果你有特定的应用场景或需求，可以根据需要选择合适的距离度量方法。
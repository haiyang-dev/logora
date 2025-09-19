[https://github.com/langgenius/dify/blob/main/README_CN.md](https://github.com/langgenius/dify/blob/main/README_CN.md)

[https://github.com/langgenius/dify](https://github.com/langgenius/dify)

[https://docs.dify.ai/v/zh-hans/guides/model-configuration/customizable-model](https://docs.dify.ai/v/zh-hans/guides/model-configuration/customizable-model)

```
cd docker
cp .env.example .env
docker compose down
docker compose up -d

修改EXPOSE_NGINX_PORT 和NGINX_PORT， WEAVIATE_ENDPOINT在.env

root@aiserver-ProLiant-DL380-Gen10-Plus:/home/aiserver/github/dify# grep 8081 docker/docker-compose.yaml -n
80:  WEAVIATE_ENDPOINT: ${WEAVIATE_ENDPOINT:-http://weaviate:8081}
397:      - 8081:8081

root@aiserver-ProLiant-DL380-Gen10-Plus:/home/aiserver/github/dify# grep 8082 docker/docker-compose.yaml -n
354:      NGINX_PORT: ${NGINX_PORT:-8082}
371:      - "${EXPOSE_NGINX_PORT:-8082}:${NGINX_PORT:-8082}"


同时参考这个脚本
#!/bin/bash

yq eval '.services.weaviate.ports += ["8081:8081"]' -i docker/docker-compose.yaml
yq eval '.services.qdrant.ports += ["6333:6333"]' -i docker/docker-compose.yaml
yq eval '.services.chroma.ports += ["8000:8000"]' -i docker/docker-compose.yaml
yq eval '.services["milvus-standalone"].ports += ["19530:19530"]' -i docker/docker-compose.yaml
yq eval '.services.pgvector.ports += ["5433:5432"]' -i docker/docker-compose.yaml
yq eval '.services["pgvecto-rs"].ports += ["5431:5432"]' -i docker/docker-compose.yaml
yq eval '.services["elasticsearch"].ports += ["9200:9200"]' -i docker/docker-compose.yaml

echo "Ports exposed for sandbox, weaviate, qdrant, chroma, milvus, pgvector, pgvecto-rs, elasticsearch"
```

[haiyang.wang@lseg.com](http://haiyang.wang@lseg.com)

[haiyang.wang](http://haiyang.wang@lseg.com)

haiyang.wang1234

[http://10.35.45.98:8082/signin](http://10.35.45.98:8082/signin)

修改
[https://paddlepaddle.github.io/PaddleX/latest/pipeline_deploy/serving.html#22](https://paddlepaddle.github.io/PaddleX/latest/pipeline_deploy/serving.html#22)

docker pull ccr-2vdh3abv-pub.cnc.bj.baidubce.com/paddlex/hps:paddlex3.0.3-gpu

```shell
docker run \
    -it \
    -e PADDLEX_HPS_DEVICE_TYPE=gpu \
    -v "$(pwd)":/app \
    -w /app \
    --rm \
    --gpus all \
    --init \
    --network host \
    --shm-size 8g \
    ccr-2vdh3abv-pub.cnc.bj.baidubce.com/paddlex/hps:paddlex3.0.3-gpu \
    /bin/bash server.sh
```

```shell
docker run \
    -it \
    -e PADDLEX_HPS_DEVICE_TYPE=gpu \
    -e HTTP_PROXY=webproxy.hkg.corp.services:80 \
    -e HTTPS_PROXY=webproxy.hkg.corp.services:80 \
    -v "$(pwd)":/app \
    -v $(pwd)/official_models:/root/.paddlex/official_models \
    -w /app \
    --rm \
    --gpus all \
    --init \
    --shm-size 8g \
    --network host \
    ccr-2vdh3abv-pub.cnc.bj.baidubce.com/paddlex/hps:paddlex3.0.3-gpu \
    /bin/bash server.sh
```
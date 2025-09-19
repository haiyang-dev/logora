install

```
conda create -n vllm python=3.12 -y
conda activate vllm
```

nvidia runtime

[https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)

如果nvidia-smi报版本不一致要先解决不一致的问题，通常重启会解决

```bash
docker run --runtime nvidia --gpus all \
    -v ~/.cache/huggingface:/root/.cache/huggingface \
    --env "HUGGING_FACE_HUB_TOKEN=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" \
    --env "http_proxy=http://10.23.29.131:8080" \
    --env "https_proxy=http://10.23.29.131:8080" \
    -p 9876:8000 \
    --ipc=host \
    vllm/vllm-openai:latest \
    --model THUDM/GLM-Z1-Rumination-32B-0414
```

```bash
export CUDA_VISIBLE_DEVICES=0,1,2,3
vllm serve THUDM/GLM-Z1-Rumination-32B-0414 --tensor-parallel-size 4 --gpu-memory-utilization 0.8 --port 9876  # 跑不起来


vllm serve OpenGVLab/InternVL3-14B --dtype auto --tensor-parallel-size 4 --gpu-memory-utilization 0.8 --port 9876 --host 0.0.0.0 --api-key token-abc123
```
[https://registry.ollama.ai/download/linux](https://registry.ollama.ai/download/linux)

如果ollama连不上网络

c266eyqddtl03:/data/haiyang/llm # ollama pull nomic-embed-text

pulling manifest

Error: pull model manifest: Get "[https://registry.ollama.ai/v2/library/nomic-embed-text/manifests/latest](https://registry.ollama.ai/v2/library/nomic-embed-text/manifests/latest)": dial tcp 34.120.132.20:443: i/o timeout

可以修改服务

```
c266eyqddtl03:/data/haiyang/llm # cat /etc/systemd/system/ollama.service
[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=ollama
Group=ollama
Restart=always
RestartSec=3
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/opt/puppetlabs/bin"
Environment="HTTP_PROXY=http://10.23.29.131:8080"
Environment="HTTPS_PROXY=http://10.23.29.131:8080"
Environment="HTTP_PROXY=http://webproxy.hkg.corp.services:80"
Environment="HTTPS_PROXY=http://webproxy.hkg.corp.services:80"
Environment="OLLAMA_HOST=http://0.0.0.0:11434"
Environment="OLLAMA_LOAD_TIMEOUT=10m"
Environment="OLLAMA_MAX_LOADED_MODELS=4"
Environment="OLLAMA_NUM_PARALLEL=4"


[Install]
WantedBy=default.target
```

sudo systemctl daemon-reload

sudo systemctl restart ollama

export OLLAMA_NUM_PARALLEL=8

export OLLAMA_FLASH_ATTENTION=1

[Service]

Environment=OLLAMA_NUM_PARALLEL=8  #并发度

Environment=VOLLAMA_FLASH_ATTENTION=1

下完模型要记得把服务恢复

```
c266eyqddtl03:~ # cat /etc/systemd/system/ollama.service
[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=ollama
Group=ollama
Restart=always
RestartSec=3
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/opt/puppetlabs/bin"
Environment="OLLAMA_HOST=http://0.0.0.0:11434"  #从ip访问到服务


[Install]
WantedBy=default.target

```

ollama pull nomic-embed-text

ollama在加载qwen模型时，默认的num_ctx 是2048， 所以基本都需要改一下， 解决方案如下[https://github.com/ollama/ollama/blob/main/docs/modelfile.md](https://github.com/ollama/ollama/blob/main/docs/modelfile.md)

```
(base) aiserver@aiserver-ProLiant-DL380-Gen10-Plus:~/github/LightRAG$ cat qwen2.5_14b.modelfile 
FROM qwen2.5:14b
PARAMETER num_ctx 32768

ollama create qwen2.5:14bl -f qwen2.5_14b.modelfile
ollama create qwen2.5:72bl -f qwen2.5_72b.modelfile
ollama create qwen2.5:32bl -f qwen2.5_32b.modelfile
ollama create qwen2.5:7bl -f qwen2.5_7b.modelfile
```

ollama multi instances

vim /etc/systemd/system/ollama@.service

```bash
[Unit]
Description=Ollama Service Instance %i
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=ollama
Group=ollama
Restart=always
RestartSec=3
Environment="PATH=/home/aiserver/miniconda3/bin:/home/aiserver/miniconda3/condabin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/home/aiserver/miniconda3/bin:/usr/local/cuda/bin"
Environment="OLLAMA_HOST=http://0.0.0.0:%i"
Environment="OLLAMA_LOAD_TIMEOUT=10m"
Environment="OLLAMA_MAX_LOADED_MODELS=4"
Environment="OLLAMA_NUM_PARALLEL=4"

[Install]
WantedBy=default.target

```

start_ollama_instances.sh

```bash
#!/bin/bash

start_port=11434
num_instances=50

for ((i=0; i<num_instances; i++)); do
    port=$((start_port + i))
    systemctl start ollama@$port
    systemctl enable ollama@$port
done
```

stop_ollama_instances.sh

```bash
#!/bin/bash

start_port=11434
num_instances=50

for ((i=0; i<num_instances; i++)); do
    port=$((start_port + i))
    systemctl stop ollama@$port
    systemctl disable ollama@$port
done
```

sudo systemctl stop ollama@11434

sudo systemctl disable ollama@11434

systemctl list-units --type=service | grep ollama@

modelfile

[https://github.com/ollama/ollama/blob/main/docs/modelfile.md](https://github.com/ollama/ollama/blob/main/docs/modelfile.md)

```
nohup ollama run gemma3:27b-it-fp16 < /dev/null &
```
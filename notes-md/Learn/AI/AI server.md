10.35.45.98

aiserver / [Lseg@2024](mailto:Lseg@2024)

**vnc: aiserver**:5901  12345678

/home/aiserver/start_vnc.sh

**CUDA 11.8 兼容性好一点**

10.35.45.98 aiserver / Lseg@2024  Vnc: 1234567890  

network configuration: 10.35.45.98 / 255.255.255.0

Gateway:  10.35.45.3

DNS:  10.184.4.71,10.184.4.72

[https://www.nvidia.com/en-us/drivers/](https://www.nvidia.com/en-us/drivers/)

[https://documentation.ubuntu.com/server/how-to/graphics/install-nvidia-drivers/](https://documentation.ubuntu.com/server/how-to/graphics/install-nvidia-drivers/)

[https://developer.nvidia.com/cuda-toolkit-archive](https://developer.nvidia.com/cuda-toolkit-archive)

A-Series | NVIDIA A10 | Linux 64-bit Ubuntu 20.04

535 driver

```
cat /proc/driver/nvidia/version
sudo apt-get remove --purge '^nvidia-.*'
sudo apt autoremove
sudo apt update
sudo ubuntu-drivers install --gpgpu nvidia:535-server
sudo apt install nvidia-utils-535-server
```

570 driver

```python
sudo ubuntu-drivers install --gpgpu nvidia:570-server
sudo apt install nvidia-utils-570-server
```

cuda 12.2

```
apt-cache madison cuda
先单独安驱动，然后再安cuda
https://developer.nvidia.com/cuda-12-2-2-download-archive?target_os=Linux&target_arch=x86_64&Distribhf_ution=Ubuntu&target_version=20.04&target_type=runfile_local

nvcc --version

使用源安装
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-12-2

设置链接和环境变量
ls /usr/local/cuda-12.2/bin/nvcc
ls -l /usr/local/cuda
ln -s /usr/local/cuda-12.2 /usr/local/cuda

echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc

```

cuda 12.8

```python
先单独安驱动，然后再安cuda
https://developer.nvidia.com/cuda-12-8-1-download-archive?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=20.04&target_type=runfile_local
vi ~/.bashrc
export PATH=/usr/local/cuda-12.8/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda-12.8/lib64:$LD_LIBRARY_PATH
source ~/.bashrc

To uninstall the CUDA Toolkit, run cuda-uninstaller in /usr/local/cuda-12.8/bin

可选
sudo update-alternatives --install /usr/local/cuda cuda /usr/local/cuda-12.8 128

```

**如何更新dns设置**

当重启以后,需要更新dns设置才行 

sudo vim /etc/resolvconf/resolv.conf.d/head 

添加两行:

nameserver 10.184.4.71

nameserver 10.184.4.72

保存关闭

 

然后运行:

sudo resolvconf --enable-updates

sudo resolvconf -u

 

检测:

dig [google.com](http://google.com)

如果显示一堆ip那就对了

**ollama install/upgrade**

/home/aiserver/ollama

curl -fsSL [https://ollama.com/install.sh](https://ollama.com/install.sh) | sh

curl -fsSL [https://ollama.com/install.sh](https://ollama.com/install.sh) | OLLAMA_VERSION=0.3.9 sh

export https_**proxy**=[http://web](http://web)**proxy**.hkg.corp.services:80

export http_**proxy**=[http://web](http://web)**proxy**.hkg.corp.services:80

**测试用curl**

curl --location '[http://aiserver/chat/completions'](http://aiserver/chat/completions%27) \

--header 'Content-Type: application/json' \

--header 'Authorization: Bearer sk-vLMGrD2xrOR7CV0DPyNgHQ' \

--data ' {

                    "model": "phi",

                    "messages": [

                        {

                        "role": "user",

                        "content": "Tell me who are you and what you can do for me?"

                        }

                    ]

                    }'

**embiddings:**

curl --location '[http://aiserver/api/embeddings'](http://aiserver/api/embeddings%27) \

--header 'Content-Type: application/json' \

--data '{

    "model":"mistral",

    "prompt":"This is a prompt"

}'

**request process**

![](images/WEBRESOURCE643868f957822e194a78dc932c213817image.png)

![](images/WEBRESOURCE04e0ea0ff1bb831f4d438ddc1c1e65cdimage.png)

**生成key的curl**

curl --location '[http://aiserver:4000/key/generate'](http://aiserver:8000/key/generate%27) \

--header 'Authorization: Bearer **sk-ba6ZvuYXscXN2LWvE4YuDbArnkjCHlSg**' \

--header 'Content-Type: application/json' \

--data '{

  "duration": "999d",

  "metadata": {"user": "yuzhu.pan"},

  "team_id": "yuzhu.pan"

}'

server {

          listen 80;

          server_name _;

          # ollama embeddings api

          location /api/ {

            proxy_pass 

          }

          # litellm-proxy chat api

          location /chat/ {

             proxy_pass 

          }

        }

**litellm 配置** [https://docs.litellm.ai/docs/proxy/quick_start](https://docs.litellm.ai/docs/proxy/quick_start)

模型配置config在/home/apiserver/litellm-proxy-server/api-server.yml

先

unset http_proxy

unset https_proxy

启动脚本是start_litellm_server.sh, 暂时用litellm --config ./api-server.yaml

**nginx 配置  root 权限**

nginx ui: [http://10.35.45.98:9090/](http://10.35.45.98:9090/)   aiserver Lseg@2024

/etc/nginx

systemctl status nginx

systemctl reload nginx

systemctl restart nginx

```
如果你想让一个程序在后台运行，你可以按照以下步骤操作：
首先，使用conda activate命令激活你需要的环境。例如，如果你需要激活py311环境，你可以使用以下命令：
conda activate py311

然后，使用nohup命令启动你的程序，并且在命令后面加上&。例如，如果你想运行litellm这个程序，你可以使用以下命令：
nohup litellm &

这个命令会让litellm这个程序在后台运行，即使你关闭了命令行窗口，这个程序也会继续运行。
最后，你可以使用conda deactivate命令退出你当前的conda环境。这个命令不会影响到你在后台运行的程序。
请注意，nohup命令会把你的程序的输出重定向到一个名为nohup.out的文件中。如果你想把输出重定向到其他文件，你可以在nohup命令后面加上> 文件名。例如：
nohup litellm > my_output.txt &

这个命令会把litellm程序的输出重定向到my_output.txt这个文件中。
conda env list
conda create --name myenv python=3.7
```
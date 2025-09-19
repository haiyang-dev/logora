curl --location '[http://10.25.145.31:11434/api/embeddings](http://10.25.145.31:11434/api/embeddings)' 

--header 'Content-Type: application/json' 

--data '{

"model":"nomic-embed-text",

"prompt":"This is a prompt"

}'

```
nvidia-smi 查看显存, 如果失败考虑重启机器
nvcc --version 查看cuda版本

(base) aiserver@aiserver-ProLiant-DL380-Gen10-Plus:~$ nvidia-smi
Wed Oct  9 10:36:49 2024       
+---------------------------------------------------------------------------------------+
| NVIDIA-SMI 535.183.01             Driver Version: 535.183.01   CUDA Version: 12.2     |
|-----------------------------------------+----------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |         Memory-Usage | GPU-Util  Compute M. |
|                                         |                      |               MIG M. |
|=========================================+======================+======================|
|   0  NVIDIA A10                     Off | 00000000:2B:00.0 Off |                    0 |
|  0%   36C    P8              15W / 150W |     16MiB / 23028MiB |      0%      Default |
|                                         |                      |                  N/A |
+-----------------------------------------+----------------------+----------------------+
|   1  NVIDIA A10                     Off | 00000000:84:00.0 Off |                    0 |
|  0%   35C    P8              16W / 150W |     16MiB / 23028MiB |      0%      Default |
|                                         |                      |                  N/A |
+-----------------------------------------+----------------------+----------------------+
|   2  NVIDIA A10                     Off | 00000000:A2:00.0 Off |                    0 |
|  0%   35C    P8              15W / 150W |     16MiB / 23028MiB |      0%      Default |
|                                         |                      |                  N/A |
+-----------------------------------------+----------------------+----------------------+
|   3  NVIDIA A10                     Off | 00000000:C0:00.0 Off |                    0 |
|  0%   34C    P8              16W / 150W |     16MiB / 23028MiB |      0%      Default |
|                                         |                      |                  N/A |
+-----------------------------------------+----------------------+----------------------+
                                                                                         
+---------------------------------------------------------------------------------------+
| Processes:                                                                            |
|  GPU   GI   CI        PID   Type   Process name                            GPU Memory |
|        ID   ID                                                             Usage      |
|=======================================================================================|
|    0   N/A  N/A      2532      G   /usr/lib/xorg/Xorg                            4MiB |
|    1   N/A  N/A      2532      G   /usr/lib/xorg/Xorg                            4MiB |
|    2   N/A  N/A      2532      G   /usr/lib/xorg/Xorg                            4MiB |
|    3   N/A  N/A      2532      G   /usr/lib/xorg/Xorg                            4MiB |
+---------------------------------------------------------------------------------------+

(base) aiserver@aiserver-ProLiant-DL380-Gen10-Plus:~$ nvcc --version
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2022 NVIDIA Corporation
Built on Wed_Sep_21_10:33:58_PDT_2022
Cuda compilation tools, release 11.8, V11.8.89
Build cuda_11.8.r11.8/compiler.31833905_0

```
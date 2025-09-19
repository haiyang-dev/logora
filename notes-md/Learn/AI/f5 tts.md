[https://github.com/SWivid/F5-TTS](https://github.com/SWivid/F5-TTS)

```
# Create a python 3.10 conda env (you could also use virtualenv)
conda create -n f5-tts python=3.10
conda activate f5-tts

# Install pytorch with your CUDA version, e.g.
pip install torch==2.3.0+cu118 torchaudio==2.3.0+cu118 --extra-index-url https://download.pytorch.org/whl/cu118

git clone https://github.com/SWivid/F5-TTS.git
cd F5-TTS
# git submodule update --init --recursive  # (optional, if need bigvgan)
pip install -e .

# Launch a Gradio app (web interface)
f5-tts_infer-gradio

# Specify the port/host
f5-tts_infer-gradio --port 7860 --host 0.0.0.0

# Launch a share link
f5-tts_infer-gradio --share


# Quick start with Gradio web interface
f5-tts_finetune-gradio --port 7861 --host 0.0.0.0
```

![](images/WEBRESOURCEedee1e784e149a2ccb19e31179972681image.png)

临时模型会产生在， 如果不想产生这么多模型，直接将save per updates 设置成9999

(base) aiserver@aiserver-ProLiant-DL380-Gen10-Plus:~/github/F5-TTS/ckpts/qitongwei01$ ls -l

total 69801728

-rw-rw-r-- 1 aiserver aiserver 5394464910 11? 12 23:52 model_10.pt

-rw-rw-r-- 1 aiserver aiserver 5394464910 11? 12 23:53 model_11.pt

-rw-rw-r-- 1 aiserver aiserver 1348830026 11? 12 23:44 model_1200000.pt

-rw-rw-r-- 1 aiserver aiserver 5394464910 11? 12 23:53 model_12.pt

-rw-rw-r-- 1 aiserver aiserver 5394462767 11? 12 23:50 model_1.pt

-rw-rw-r-- 1 aiserver aiserver 5394462767 11? 12 23:50 model_2.pt

-rw-rw-r-- 1 aiserver aiserver 5394462767 11? 12 23:50 model_3.pt

-rw-rw-r-- 1 aiserver aiserver 5394462767 11? 12 23:50 model_4.pt

-rw-rw-r-- 1 aiserver aiserver 5394462767 11? 12 23:51 model_5.pt

-rw-rw-r-- 1 aiserver aiserver 5394462767 11? 12 23:51 model_6.pt

-rw-rw-r-- 1 aiserver aiserver 5394462767 11? 12 23:51 model_7.pt

-rw-rw-r-- 1 aiserver aiserver 5394462767 11? 12 23:52 model_8.pt

-rw-rw-r-- 1 aiserver aiserver 5394462767 11? 12 23:52 model_9.pt

-rw-rw-r-- 1 aiserver aiserver 5394468556 11? 12 23:53 model_last.pt

drwxrwxr-x 2 aiserver aiserver       4096 11? 12 23:53 samples

-rw-rw-r-- 1 aiserver aiserver        469 11? 12 23:50 setting.json

Notes: 似乎reference很重要， 不同的reference对应不同的语气？感觉可以考虑在生成一句话时， 查找对应的reference, 然后选合适的reference和期待的文字一起生成。
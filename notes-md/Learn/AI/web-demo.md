conda create -n web_demo python=3.10

[https://github.com/QwenLM/Qwen1.5/blob/main/examples/demo/web_demo.py](https://github.com/QwenLM/Qwen1.5/blob/main/examples/demo/web_demo.py)

conda activate web_demo

conda deactivate web_demo

10.35.45.98:8090

requirements.txt

```
gradio<3.42
mdtex2html
torch>=1.13.1
transformers>=4.37.2
accelerate>=0.27.2
transformers_stream_generator==0.0.4
```

arguments

```
parser.add_argument("-c", "--checkpoint-path", type=str, default=DEFAULT_CKPT_PATH,                    help="Checkpoint name or path, default to %(default)r")
parser.add_argument("--cpu-only", action="store_true", default=False, help="Run demo with CPU only")

parser.add_argument("--share", action="store_true", default=False,                    help="Create a publicly shareable link for the interface.")
parser.add_argument("--inbrowser", action="store_true", default=False,                    help="Automatically launch the interface in a new tab on the default browser.")
parser.add_argument("--server-port", type=int, default=8090,                    help="Demo server port.")
parser.add_argument("--server-name", type=str, default="0.0.0.0",                    help="Demo server name.")
```

code: 

/home/aiserver/web-demo/web-demo-tmx.py

unset http_proxy

unset https_proxy

python web-demo-tmx.py -c /home/aiserver/llm_models/Qwen1.5-7B-Chat-SRT
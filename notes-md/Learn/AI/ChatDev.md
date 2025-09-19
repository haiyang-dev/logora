[https://github.com/OpenBMB/ChatDev](https://github.com/OpenBMB/ChatDev)

```
conda create -n ChatDev_conda_env python=3.9 -y
conda activate ChatDev_conda_env

cd ChatDev
pip3 install -r requirements.txt

export OPENAI_API_KEY="sk-87-jkSfpDpI7sOmo_9vmBQ"
export BASE_URL="http://10.35.45.98"
python3 run.py --task "write a python3 script to show the process of the popsort" --name "popsort"

python3 visualizer/app.py --port 8091
```

10.35.45.98:8091

网页只是做replay,真正的运行在run那步
[https://inference.readthedocs.io/zh-cn/latest/getting_started/using_xinference.html](https://inference.readthedocs.io/zh-cn/latest/getting_started/using_xinference.html)

docker run -d -p 9998:9998 --name xinference xprobe/xinference:latest

```
conda create -n xinference python=3.11
conda activate xinference
pip install "xinference[all]"
xinference-local --host 0.0.0.0 --port 9997
http://10.35.45.98:9997/ui/
```
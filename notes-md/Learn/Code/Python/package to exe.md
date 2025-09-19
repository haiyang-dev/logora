pip install pyinstaller

pyinstaller -F -w demo.py

| 参数 | 含义 | 
| -- | -- |
| -F | 打包成一个单独的  | 
| -w | 不显示控制台窗口（适用于 GUI 程序，如 Tkinter、PyQt 等） | 
| demo.py | 你要打包的 Python 脚本文件名 | 

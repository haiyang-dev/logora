如果在miniconda中连接postgresql

install lib:

sudo apt-get update

sudo apt-get install libpq-dev libffi-dev unzip

解决ImportError: /lib/x86_64-linux-gnu/libp11-kit.so.0: undefined symbol: ffi_type_pointer, version LIBFFI_BASE_7.0， 估计是因为conda的问题，真实环境不会这样

ln -sf /usr/lib/x86_64-linux-gnu/libffi.so.7 /home/azureuser/miniconda3/envs/ai_assist/lib/libffi.so.7

是否需要执行export LD_LIBRARY_PATH=/home/azureuser/miniconda3/envs/ai_assist/lib:$LD_LIBRARY_PATH 待定

如果端口5432不通， 那要考虑设置防火墙

ubuntu ufw allow 5432/tcp

redhat 

```
systemctl status firewalld
firewall-cmd --permanent --add-port=5432/tcp
firewall-cmd --reload
```
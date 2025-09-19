$ docker login registry.redhat.io
Username: 
Password: 
Login Succeeded!



Red Hat Subscriber Account:

Username: U8015827

Passwd XuanXuan2011

Red Hat Account Number: 694279

$ docker pull registry.redhat.io/rhel6

set proxy

打开 Docker 服务文件，例如 `/lib/systemd/system/docker.service` 或 `/etc/systemd/system/docker.service.d/http-proxy.conf`，并添加以下内容：



[Service]


Environment="HTTP_PROXY=http://proxy.example.com:80/" "HTTPS_PROXY=https://proxy.example.com:443/" "NO_PROXY=localhost,127.0.0.1"




在这里，您需要将 `http://proxy.example.com:80/` 和 `https://proxy.example.com:443/` 替换为您的代理服务器的 URL 和端口。



如果需要使用身份验证，请在 URL 和端口之间添加您的代理用户名和密码，例如：


Environment="HTTP_PROXY=http://username:password@proxy.example.com:80/" "HTTPS_PROXY=https://username:password@proxy.example.com:443/"



重新加载 Docker 服务文件：


 sudo systemctl daemon-reload



 重新启动 Docker 服务：



sudo systemctl restart docker



https://access.redhat.com/solutions/4581551



docker login --username="U8015827" --password="XuanXuan2011" registry.redhat.io



docker login --username="-s.ts.auto" --password="TSAut0mat10n" bams-aws.refinitiv.com:5001



 ---> [Warning] IPv4 forwarding is disabled. Networking will not work.

need restart docker service

systemctl restart docker



bams-aws.refinitiv.com:5001/timeseries/docker-remote/



设置proxy

/etc/sysconfig/docker

![](images/5868895F5F6E4499A14A104309D5B0C7Z.jpeg)

查找config

systemctl status docker

打开service

cat /usr/lib/systemd/system/docker.service

查看配置文件

或者/etc/systemd/system/docker.service.d/http-proxy.conf





/root/.docker/config.json


{


 "proxies":


 {


   "default":


   {


     "httpProxy": "http://10.23.29.130:8080",


     "httpsProxy": "http://10.23.29.130:8080"


   }


 }


}





mkdir -p /etc/systemd/system/docker.service.d (prefered)

vim http-proxy.conf


[Service]


Environment="HTTP_PROXY=http://webproxy.int.westgroup.com:80/"


Environment="HTTPS_PROXY=http://webproxy.int.westgroup.com:80/"





/etc/docker/daemon.json


{


"registry-mirrors": ["https://docker.mirrors.ustc.edu.cn/","https://hub-mirror.c.163.com","https://registry.docker-cn.com"],


"dns": ["8.8.8.8", "8.8.4.4"]


}



Environment="HTTP_PROXY=http://10.23.29.130:8080/" "HTTPS_PROXY=http://10.23.29.130:8080/"








rror response from daemon: Get "https://registry-1.docker.io/v2/": net/http: request canceled while waiting for connection (Client.Timeout exceeded while awaiting headers)


systemctl daemon-reload


systemctl restart docker



windows上如果遇到这种问题

 > [backend-builder 7/7] RUN ./build.sh:
0.371 /bin/sh: ./build.sh: /bin/bash^M: bad interpreter: No such file or directory

那需要把脚本的换行转成LF
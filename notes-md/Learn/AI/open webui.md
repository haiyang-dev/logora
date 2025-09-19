```
docker run -d -p 3001:8080 -e OLLAMA_BASE_URL=http://10.35.45.98 -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

[http://10.35.45.98:8080/](http://10.35.45.98:8080/)

```
# AI server
docker run -d --network=host -v open-webui:/app/backend/data -e OLLAMA_BASE_URL=http://127.0.0.1:11434 --name open-webui-250422 --restart always ghcr.io/open-webui/open-webui:main 

#升级：
docker pull ghcr.io/open-webui/open-webui:main
docker stop open-webui
更改--name open-webui 然后执行docker run命令

```

```
c266eyqddtl03:/data # docker volume ls
DRIVER    VOLUME NAME
local     open-webui
c266eyqddtl03:/data # docker volume inspect open-webui
[
    {
        "CreatedAt": "2024-03-13T03:21:27Z",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/data/docker/volumes/open-webui/_data",
        "Name": "open-webui",
        "Options": null,
        "Scope": "local"
    }
]
c266eyqddtl03:/data # cd /data/docker/volumes/open-webui/_data
c266eyqddtl03:/data/docker/volumes/open-webui/_data # ls -l
total 124
drwxr-xr-x 5 root root     51 Mar 13 03:21 cache
-rw-r--r-- 1 root root   1234 Mar 11 02:29 config.json
drwxr-xr-x 2 root root      6 Mar 13 03:21 docs
drwxr-xr-x 2 root root     25 Mar 13 03:21 litellm
-rw-r--r-- 1 root root     43 Mar 11 02:29 readme.txt
drwxr-xr-x 2 root root      6 Mar 13 03:21 uploads
drwxr-xr-x 2 root root     28 Mar 13 03:21 vector_db
-rw-r--r-- 1 root root 118784 Mar 13 04:35 webui.db
c266eyqddtl03:/data/docker/volumes/open-webui/_data # 

```
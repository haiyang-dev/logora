service docker start    启动服务

docker build -t haiyang/myubuntu:18.04 .  build image

docker run -i -t 80990faedb17 /bin/bash execute model

docker ps -qa



https://docs.docker.com/engine/reference/commandline/image_build/



Unbuntu 安装Docker https://docs.docker.com/install/linux/docker-ce/ubuntu/、





退出容器: exit 或者 Ctrl+P+Q



### 1. start container

Docker start + image_name

docker start ubuntu

create container and start

docker run ubuntu:16.04 /bin/echo 'hello world!'

create container and run a bash

docker run -it ubuntu:16.04 /bin/bash

       NOTE:-i open the stand input

    -t deliver a pseudo-tty(分配一个伪终端)

exit 

exit from a bash

NOTE: If create a bash container, If exit, the container will be terminated

For a app, if it run out, the container also will be terminated.

you can use the command "docker container wait CONTAINER [CONTAINEr...]" to wait to container exit and print output.



2.run in background

docker run -d ubuntu:16.04 /bin/sh -c "while true; do echo hello world; sleep 10; done"

you can use "docker logs + container_id" to check the container logs and output.

if you want to get in a container which is running in background, please use these commands:

docker exec -it container_id /bin/bash

It will be open a new bash session.



3.pasue a container

docker pause container_id

4.stop a container

docker stop container_id

docker prune container_id

docker kill container

5.docker restart a container

docker restart/start docker_id

6.delete a container

docker rm -fv container_id

NOTE: -f force to delete a container

     -v remove the container's mount data disk

6.docker container export and import

docker export -o target_file container_id

docker imort file_name -test/ubuntu:16.04

7.view the container

docker container inspect container_id

list process:

docker top container_id

view status:

docker stats -a

NOTE: -a all information

8.OTHERS

docker cp /data container_id:/path

docker container port container_id





mount a data path

docker run  -d -P --name web --mount type=bind,source=/webapp,destination=/opt/webapp traning/webapp python app.py

docker run -d -P --name web -v /webapp:/optwebapp traning/webapp python app.py

NOTE:  type options: bind volume tmpfs

source:local data

destination: container path



multi container share data

first, you need create a data container

docker -it -v /data --name dbdata ubuntu:16.04

then:

docker run -it --volumes-from dbdata --name db1 ubuntu:16.04

docker run -it --volumes-from dbdata --name db2 ubuntu:16.04





将一个tar包load成一个image：docker load < my.tar 或者



                                                            docker load -i my.tar



将image save成tar包： docker save logmanager:1.0 > logmanager.tar       或者



                                        docker save 1312423bf3ee -o /root/dockerfile/my.tar

以主机 指定用户运行

docker run -d -p 5901:5901 -p 6901:6901 --user $(id -u):$(id -g)



docker cp





```javascript
docker system prune -af
```



```javascript
docker run -it --user $(id -u):$(id -g) -v /data/gitlab-runner/builds/21877203/0/ts/ts_normalization_engine/:/data/ts_normalization_engine/ bams-aws.refinitiv.com:5001/timeseries/normalizationlibrary/rhet-6-5-12-nl:latest /bin/bash
```



```javascript


```



```javascript
docker run -it -v /data/haiyang/code/pricingsnapshot_cacheserver:/data/pricingsnapshot_cacheserver/ bams-aws.refinitiv.com:5001/timeseries/quantum-framework/quantum-framework-v3.2.9.0:R2021-14-1 /bin/bash
```

docker run -d -p 8000:8000 -v /data:/data python:3.10.10 /data/start.sh

docker exec -it /bin/bash

```javascript
docker ps
docker commit containerid tag
```



```javascript
sudo docker run -it --entrypoint /bin/bash [docker_image]
```



```javascript
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

```



```javascript
kubectl rollout restart sts snapshot-web
```


Dockerfile

https://www.cnblogs.com/lsgxeva/p/8746644.html

https://www.cnblogs.com/wade-luffy/p/6543926.html



demo:

#Ubuntu 18.04 with gcc# 

From ubuntu:18.04

MAINTAINER Haiyang.Wang@Refinitiv.com

WORKDIR /data

RUN  mkdir /home/haiyang

COPY . /home/haiyang



如果From使用私有仓库

可以先把image缓存到本地

可以用docker login

可以用concourse的get



redhat 公有仓库

```javascript
docker pull registry.access.redhat.com/rhel7
```



私有仓库

```javascript
$ docker login registry.redhat.io
Username: {REGISTRY-SERVICE-ACCOUNT-USERNAME}
Password: {REGISTRY-SERVICE-ACCOUNT-PASSWORD}
Login Succeeded!

$ docker pull registry.redhat.io/rhel7
```


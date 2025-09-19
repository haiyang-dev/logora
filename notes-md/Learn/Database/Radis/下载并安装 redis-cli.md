### 下载并安装 redis-cli

Amazon Linux 2

```
amazon-linux-extras install epel -y
yum install gcc jemalloc-devel openssl-devel tcl tcl-devel make -y
wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable
make BUILD_TLS=yes # if not encryped just ingored
```

connect to redis

```
src/redis-cli -h a206160-redis-cluster-dev-use1.vcwl8s.clustercfg.use1.cache.amazonaws.com -p 6379
src/redis-cli -h a206160-redis-cluster-qa-use1.vcwl8s.clustercfg.use1.cache.amazonaws.com -p 6379
src/redis-cli -h a206160-redis-cluster-preprod-use1.vcwl8s.clustercfg.use1.cache.amazonaws.com -p 6379
```

windows:

```
redis-server.exe redis.windows.conf
```
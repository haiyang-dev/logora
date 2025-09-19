6001

```
port 6001
#bind 0.0.0.0
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
appendonly yes

requirepass aaa
```

docker run --name redis-r1 -p 6001:6001 -p 16001:16001 -v C:\Users\U6079496\Desktop\Code\tools\redis-cluster\6001\:/usr/local/etc/redis -d --restart=always  redis:latest redis-server /usr/local/etc/redis/redis.conf

docker run --name redis-r2 -p 6002:6002 -p 16002:16002 -v C:\Users\U6079496\Desktop\Code\tools\redis-cluster\6002\:/usr/local/etc/redis -d --restart=always  redis:latest redis-server /usr/local/etc/redis/redis.conf

docker run --name redis-r3 -p 6003:6003 -p 16003:16003 -v C:\Users\U6079496\Desktop\Code\tools\redis-cluster\6003\:/usr/local/etc/redis -d --restart=always  redis:latest redis-server /usr/local/etc/redis/redis.conf

ipconfig

docker exec -it redis-r1 bash

redis-cli --cluster create 10.35.24.92:6001 10.35.24.92:6002 10.35.24.92:6003 -a aaa

redis-cli -c -h 127.0.0.1 -p 6001 -a "aaa"
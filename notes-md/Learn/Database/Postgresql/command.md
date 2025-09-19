查看数据库

```bash
docker exec -it ffb10f28ea9b /bin/bash
打开psql
psql -U postgres
打开psql并选择DB
psql -U username -d dbname
\list # list database
CREATE DATABASE testing; # 创建数据库
\c my_new_database_nam; # 切换数据库
\conninfo # 查看当前数据库连接信息
\q  # 这将退出 psql
CREATE EXTENSION IF NOT EXISTS vector; # 启用vector扩展， 注意官方docker image不支持

root@a205568-research-assist-b:~# docker exec -it d7267417a41c bash
root@d7267417a41c:/# su - postgres
postgres@d7267417a41c:~$ psql
psql (16.3 (Debian 16.3-1.pgdg120+1))
Type "help" for help.

postgres=# CREATE DATABASE ai_assistant;
CREATE DATABASE
postgres=# CREATE USER rag WITH ENCRYPTED PASSWORD 'rag';
CREATE ROLE
postgres=# GRANT ALL PRIVILEGES ON DATABASE ai_assistant TO rag;
GRANT
postgres=# ALTER USER rag WITH SUPERUSER;
ALTER ROLE
postgres=# \l
                                                        List of databases
     Name     |  Owner   | Encoding | Locale Provider |  Collate   |   Ctype    | ICU Locale | ICU Rules |   Access privileges   
--------------+----------+----------+-----------------+------------+------------+------------+-----------+-----------------------
 ai_assistant | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | =Tc/postgres         +
              |          |          |                 |            |            |            |           | postgres=CTc/postgres+
              |          |          |                 |            |            |            |           | rag=CTc/postgres
 lseg         | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | 
 postgres     | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | 
 template0    | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | =c/postgres          +
              |          |          |                 |            |            |            |           | postgres=CTc/postgres
 template1    | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | =c/postgres          +
              |          |          |                 |            |            |            |           | postgres=CTc/postgres
(5 rows)

postgres=# \du
                             List of roles
 Role name |                         Attributes                         
-----------+------------------------------------------------------------
 postgres  | Superuser, Create role, Create DB, Replication, Bypass RLS
 rag       | 
```
binary 文件

[https://www.enterprisedb.com/download-postgresql-binaries](https://www.enterprisedb.com/download-postgresql-binaries) 

ui使用pgadmin

postgresql：

docker run --name some-postgres -p 5432:5432 -e POSTGRES_PASSWORD=test123 -d --restart always postgres:16.3

带有vector的pg

docker run --name pgvector -p 5432:5432 -e POSTGRES_PASSWORD=test123 -d --restart always pgvector/pgvector:pg16

[https://python.langchain.com/docs/integrations/vectorstores/pgvector/](https://python.langchain.com/docs/integrations/vectorstores/pgvector/)
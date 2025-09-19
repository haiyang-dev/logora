User: azureuser

Password: Welcome12345

1.postgresql：

  a.start postgresql server

    sudo docker run --name pgvector -p 5432:5432 -e POSTGRES_PASSWORD=test123 -d --restart always pgvector/pgvector:pg16 

  b.create database

    CREATE DATABASE lseg;

  c.enable vector extension

    CREATE EXTENSION IF NOT EXISTS vector;

 

 

2.python:

  mkdir -p ~/miniconda3

  wget [https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh](https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh) -O ~/miniconda3/miniconda.sh

  bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3

  rm -rf ~/miniconda3/miniconda.sh

 

  ~/miniconda3/bin/conda init bash

  ~/miniconda3/bin/conda init zsh

 

  source ~/.bashrc or source ~/.zshrc

 

  conda create -n ai_assist python=3.10

  conda activate ai_assist

  pip3 install -r requirements.py

 

  To be fix:

  要考虑langchain-core 和langchain-community, langchain-openai版本冲突， psycopg2， psycopg， psycopg2-binary和psycopg-binary也可能版本冲突

  conda deactivate ai_assist

 

 

3.install lib:

  sudo apt-get update

  sudo apt-get install libpq-dev libffi-dev unzip

  fix the ImportError: /lib/x86_64-linux-gnu/libp11-kit.so.0: undefined symbol: ffi_type_pointer, version LIBFFI_BASE_7.0 issue,  估计是因为conda的问题，真实环境不会这样

  ln -sf /usr/lib/x86_64-linux-gnu/libffi.so.7 /home/azureuser/miniconda3/envs/ai_assist/lib/libffi.so.7 

  TBD:

  export LD_LIBRARY_PATH=/home/azureuser/miniconda3/envs/ai_assist/lib:$LD_LIBRARY_PATH 待定

 

 

4. run

  a. download reports：

    nohup python3 download_reports.py --type all --from_date "2024-05-17T00:00:00Z" --to_date "2024-06-17T00:00:00Z" > output.log 2>&1 &

    nohup python3 download_reports.py --type all --from_date "2024-05-17T00:00:00Z" --to_date "2024-05-22T00:00:00Z" > output.log 2>&1 &

    nohup python3 download_reports.py --type all --from_date "2024-05-17T00:00:00Z" --to_date "2024-05-18T00:00:00Z" > output.log 2>&1 &

 

  b.embedding

    nohup python3 gpt_dev.py --doc_type research --report_path "./data/research/2024-06-24LLM_research_report.json" > output.log 2>&1 &

    nohup python3 gpt_dev.py --doc_type news --report_path "./data/news/2024-06-24LLM_news_report.json" > output.log 2>&1 &

  c. UI

    nohup streamlit run app.py > output.log 2>&1 &    #[http://10.159.213.5:8501/](http://10.159.213.5:8501/)

```
OPENAI_API_KEY=OPENAI_API_KEY
# LSEG
RDP_USERNAME='Jayden.zhang2.rdp@lseg.com'
RESEARCH_PASSWORD='2023Jayden?'
CLIENT_ID='a81277a0d63b46c7a4f27aebe48fd0c68cbd0268'
RSEARCH_UUID='GEDTC-744928'
NEWS_URL='archive.news.refinitiv.com'
NEWS_MACHINE_ID='GE-A-00263623-3-9414'
NEWS_PASSWORD='Welcomewelcomewelcomewelcome123$'
RDP_VERSION='/v1'
base_URL='https://api.refinitiv.com'
category_URL='/auth/oauth2'
endpoint_URL='/token'
CLIENT_SECRET=''
TOKEN_FILE='token.txt'
SCOPE='trapi'
#Azure openai
#OPENAI_API_BASE="https://azureopenai-access.openai.azure.com/"
AZURE_OPENAI_API_KEY="a4830d70f3624f6380177aca4f93f7ca"
#OPENAI_API_TYPE="Standard"
#OPENAI_API_VERSION="2024-05-13"
```
lightrag_api_ollama_compatible_demo.py

```python
from fastapi import FastAPI, HTTPException, File, UploadFile, Form, BackgroundTasks
from pydantic import BaseModel
import os
from lightrag import LightRAG, QueryParam
from lightrag.llm import ollama_model_if_cache, ollama_embedding
from lightrag.utils import EmbeddingFunc
import numpy as np
from typing import Optional
import asyncio
import nest_asyncio

# Apply nest_asyncio to solve event loop issues
nest_asyncio.apply()

DEFAULT_RAG_DIR = "index_default"
app = FastAPI(title="LightRAG API", description="API for RAG operations")

# Configure working directory
WORKING_DIR = os.environ.get("RAG_DIR", f"{DEFAULT_RAG_DIR}")
print(f"WORKING_DIR: {WORKING_DIR}")
LLM_MODEL = os.environ.get("LLM_MODEL", "qwen2.5:14bl")
print(f"LLM_MODEL: {LLM_MODEL}")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "nomic-embed-text")
print(f"EMBEDDING_MODEL: {EMBEDDING_MODEL}")
EMBEDDING_MAX_TOKEN_SIZE = int(os.environ.get("EMBEDDING_MAX_TOKEN_SIZE", 8192))
print(f"EMBEDDING_MAX_TOKEN_SIZE: {EMBEDDING_MAX_TOKEN_SIZE}")

if not os.path.exists(WORKING_DIR):
    os.mkdir(WORKING_DIR)

rag_instances = {}


# LLM model function
async def llm_model_func(
    prompt, system_prompt=None, history_messages=[], **kwargs
) -> str:
    if system_prompt is not None:
        print(f"system prompt: {system_prompt}")
    if len(history_messages) > 0:
        print(f"history messages: {history_messages}")
    return await ollama_model_if_cache(
        LLM_MODEL,
        prompt,
        system_prompt=system_prompt,
        history_messages=history_messages,
        **kwargs,
    )


# Embedding function
async def embedding_func(texts: list[str]) -> np.ndarray:
    return await ollama_embedding(
        texts,
        embed_model="nomic-embed-text",
        # host="http://10.35.45.98:11434"
    )


async def get_embedding_dim():
    test_text = ["This is a test sentence."]
    embedding = await embedding_func(test_text)

    # 如果 embedding 是列表，转换为 NumPy 数组
    if isinstance(embedding, list):
        embedding = np.array(embedding)

    embedding_dim = embedding.shape[1]
    return embedding_dim


# Initialize RAG instance
async def init_rag(workdir: str = ""):
    workdir = "{}/{}".format(WORKING_DIR, workdir)
    if not os.path.exists(workdir):
        os.makedirs(workdir)
    rag = LightRAG(
        working_dir=workdir,
        llm_model_func=llm_model_func,
        llm_model_max_async=2,
        llm_model_max_token_size=32768,
        llm_model_kwargs={"host": "http://127.0.0.1:11434", "timeout": 600},
        embedding_func=EmbeddingFunc(
            embedding_dim=await get_embedding_dim(),
            max_token_size=EMBEDDING_MAX_TOKEN_SIZE,
            func=embedding_func,
        )
    )
    return rag


async def get_rag_instance(workdir: str = ""):
    if workdir not in rag_instances:
        rag_instances[workdir] = await init_rag(workdir)
    return rag_instances[workdir]


# Data models
class QueryRequest(BaseModel):
    query: str
    mode: str = "hybrid"
    kb: str = ""
    only_need_context: bool = False


class InsertRequest(BaseModel):
    text: str
    kb: str = ""


class Response(BaseModel):
    status: str
    data: Optional[str] = None
    message: Optional[str] = None


# API routes
@app.post("/query", response_model=Response)
async def query_endpoint(request: QueryRequest):
    try:
        print(f"Received query request with parameters: {request.model_dump()}")
        rag = await get_rag_instance(workdir=request.kb)
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: rag.query(
                request.query,
                param=QueryParam(
                    mode=request.mode, only_need_context=request.only_need_context
                ),
            ),
        )
        return Response(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/insert", response_model=Response)
async def insert_endpoint(request: InsertRequest):
    try:
        print(f"Received insert request with parameters: {request.model_dump()}")
        rag = await init_rag(workdir=request.kb)
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: rag.insert(request.text))
        return Response(status="success", message=f"Text inserted to {request.kb} successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def process_file(file_content: bytes, kb: str):
    try:
        try:
            content = file_content.decode("utf-8")
        except UnicodeDecodeError:
            content = file_content.decode("gbk")
        rag = await init_rag(workdir=kb)
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: rag.insert(content))
        print(f"processing file: {kb} success")
    except Exception as e:
        print(f"Error processing file {kb} : {e}")


@app.post("/insert_file_a", response_model=Response)
async def insert_file(file: UploadFile = File(...), kb: str = Form(...), background_tasks: BackgroundTasks = BackgroundTasks()):
    try:
        print(f"Received insert_file_a request with parameters: {kb}")
        file_content = await file.read()
        background_tasks.add_task(process_file, file_content, kb)
        return Response(
            status="success",
            message=f"File content from {file.filename} inserted to {kb} background process successfully",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/insert_file", response_model=Response)
async def insert_file(file: UploadFile = File(...), kb: str = Form(...)):
    try:
        print(f"Received insert_file request with parameters: {kb}")
        file_content = await file.read()
        # Read file content
        try:
            content = file_content.decode("utf-8")
        except UnicodeDecodeError:
            # If UTF-8 decoding fails, try other encodings
            content = file_content.decode("gbk")
        # Insert file content
        rag = await init_rag(workdir=kb)
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: rag.insert(content))
        return Response(
            status="success",
            message=f"File content from {file.filename} inserted to {kb} successfully",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8020, timeout_keep_alive=7200)

# Usage example
# To run the server, use the following command in your terminal:
# python lightrag_api_openai_compatible_demo.py

# Example requests:
# 1. Query:
# curl -X POST "http://127.0.0.1:8020/query" -H "Content-Type: application/json" -d '{"query": "your query here", "mode": "hybrid"}'

# 2. Insert text:
# curl -X POST "http://127.0.0.1:8020/insert" -H "Content-Type: application/json" -d '{"text": "your text here"}'

# 3. Insert file:
# curl -X POST "http://127.0.0.1:8020/insert_file" -H "Content-Type: application/json" -d '{"file_path": "path/to/your/file.txt"}'

# 4. Health check:
# curl -X GET "http://127.0.0.1:8020/health"

```

lightrag_ollama_compatible_demo.py

```python
import os
import asyncio
from lightrag import LightRAG, QueryParam
from lightrag.llm import ollama_model_complete, ollama_embedding
from lightrag.utils import EmbeddingFunc
import numpy as np

WORKING_DIR = "./dickens"

if not os.path.exists(WORKING_DIR):
    os.mkdir(WORKING_DIR)


async def embedding_func(texts: list[str]) -> np.ndarray:
    return await ollama_embedding(
        texts,
        embed_model="nomic-embed-text",
        # host="http://10.35.45.98:11434"
    )


async def get_embedding_dim():
    test_text = ["This is a test sentence."]
    embedding = await embedding_func(test_text)

    # 如果 embedding 是列表，转换为 NumPy 数组
    if isinstance(embedding, list):
        embedding = np.array(embedding)

    embedding_dim = embedding.shape[1]
    return embedding_dim


async def main():
    try:
        embedding_dimension = await get_embedding_dim()
        print(f"Detected embedding dimension: {embedding_dimension}")

        rag = LightRAG(
            working_dir=WORKING_DIR,
            llm_model_func=ollama_model_complete,
            llm_model_name='qwen2.5:14b',  # Your model name
            llm_model_max_async=4,
            llm_model_max_token_size=32768,
            embedding_func=EmbeddingFunc(
                embedding_dim=embedding_dimension,
                max_token_size=8192,
                func=embedding_func,
            ),
        )

        with open("./book.txt", "r", encoding="utf-8") as f:
            await rag.ainsert(f.read())

        # Perform naive search
        print(
            await rag.aquery(
                "What are the top themes in this story?", param=QueryParam(mode="naive")
            )
        )

        # Perform local search
        print(
            await rag.aquery(
                "What are the top themes in this story?", param=QueryParam(mode="local")
            )
        )

        # Perform global search
        print(
            await rag.aquery(
                "What are the top themes in this story?",
                param=QueryParam(mode="global"),
            )
        )

        # Perform hybrid search
        print(
            await rag.aquery(
                "What are the top themes in this story?",
                param=QueryParam(mode="hybrid"),
            )
        )
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    asyncio.run(main())

```

lightrag_client.py

```python
import os

import requests

# # 1. Query


def query(query_str, kb="", query_mode="hybrid"):
    query_url = "http://10.35.45.98:8020/query"
    query_payload = {
        "query": query_str,
        "mode": query_mode,
        "kb": kb
    }
    query_headers = {
        "Content-Type": "application/json"
    }
    query_response = requests.post(query_url, json=query_payload, headers=query_headers)
    print(query_response.json()['data'].replace('\\n', '\n'))


# 2. Insert text
def insert_test(text, kb=""):
    insert_text_url = "http://10.35.45.98:8020/insert"
    insert_text_payload = {
        "text": text,
        "kb": kb
    }
    insert_text_headers = {
        "Content-Type": "application/json"
    }
    insert_text_response = requests.post(insert_text_url, json=insert_text_payload, headers=insert_text_headers)
    print(insert_text_response.json())


# 3. Insert file
def insert_file_a(file_path, kb=""):
    insert_file_url = "http://10.35.45.98:8020/insert_file_a"
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {'kb': kb}
        insert_file_response = requests.post(insert_file_url, files=files, data=data)
    print(insert_file_response.json())


def insert_file(file_path, kb=""):
    insert_file_url = "http://10.35.45.98:8020/insert_file"
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {'kb': kb}
        insert_file_response = requests.post(insert_file_url, files=files, data=data)
    print(insert_file_response.json())


# 4. Health check
def health_check():
    health_check_url = "http://10.35.45.98:8020/health"
    health_check_response = requests.get(health_check_url)
    print(health_check_response.json())


def find_files(directory, extensions):
    file_list = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(extensions):
                file_list.append(os.path.join(root, file))
    return file_list


if __name__ == "__main__":
    '''
        1. **Naive 模式**：
           - **特点**：这是最基础的查询模式，直接从文本中检索信息，不考虑上下文或关系。
           - **适用场景**：适用于简单、直接的问题，例如查找某个特定事实或数据。
        
        2. **Local 模式**：
           - **特点**：专注于特定实体及其关系的精确信息检索。它会考虑查询中的上下文和相关性，以提供更准确的答案。
           - **适用场景**：适用于需要详细信息的查询，例如查询某个特定人物的详细背景信息或某个事件的具体细节。
        
        3. **Global 模式**：
           - **特点**：涵盖更广泛的主题和概念，能够从更大的信息范围内检索相关内容。
           - **适用场景**：适用于需要综合信息的查询，例如对某个复杂主题的全面了解或对多个相关概念的综合分析。
        
        4. **Hybrid 模式**：
           - **特点**：结合 Local 和 Global 模式的优点，既能提供详细信息，又能涵盖广泛的主题。它能够灵活调整检索策略，以满足不同类型的查询需求。
           - **适用场景**：适用于需要既详细又全面的信息的查询，例如对某个主题的深入研究，同时需要了解相关背景和广泛的关联信息。
    '''
    # query("your query here", kb="your knowledge base here", query_mode="hybrid")
    # insert_test("your text here", kb="your knowledge base here")
    # insert_file("SampleDoc_Tuned.txt", kb="SampleDoc_Tuned_72b")
    # insert_file("SampleDoc_Tuned.txt", kb="SampleDoc_Tuned_14b")
    # insert_file("sdyxz.txt", kb="sdyxz_14b")
    # insert_file("sdxl.txt", kb="sdxl_14b")
    # "local", "global", "hybrid", "naive"
    # query("what is Elektron Real Time", kb="SampleDoc_Tuned", query_mode="local")
    # query("what is Elektron Real Time", kb="SampleDoc_Tuned_72b", query_mode="global")
    # query("what is AAA", kb="SampleDoc_Tuned_72b", query_mode="local")
    # query("what is the difference between CAFE and CASE", kb="SampleDoc_Tuned_72b", query_mode="global")
    # query("what is the difference between CAFE and CASE", kb="SampleDoc_Tuned_14b", query_mode="global")
    # query("小龙女多大年纪", kb="sdxl_14b", query_mode="local")
    # query("what is Elektron Real Time", kb="SampleDoc_Tuned", query_mode="naive")
    # health_check()
    # files_ls = find_files(r'C:\Users\U6079496\Desktop\code\dx1\query_engine\ets-qe\apps\qe', ('.cpp', '.h'))
    # print(len(files_ls))
    # for i in files_ls:
    #     insert_file(i)
    # insert_file_a(file_path=r"data/24鞍钢集K5：鞍钢集团有限公司2024年面向专业投资者公开发行科技创新公司债券（第三期）募集说明书.PDF.md", kb="24_angang_3")
    insert_file_a(file_path=r"data/24兴城YK06：成都兴城投资集团有限公司2024年面向专业投资者公开发行科技创新可续期公司债券（第三期）票面利率公告.PDF.md", kb="24_xingcheng_3")
    # insert_file_a(file_path=r"data\meta-llm-opt.pdf.md", kb="meta_llm_opt")
    # query("please summarize the LLM Compiler: Specializing Code Llama for compiler optimization session", kb="meta_llm_opt", query_mode="global")
    # query("请给出股东的名字", kb="24_angang_3", query_mode="global")

```

lightrag_ollama_demo.py

```python
import os
import logging
from lightrag import LightRAG, QueryParam
from lightrag.llm import ollama_model_complete, ollama_embedding
from lightrag.utils import EmbeddingFunc

WORKING_DIR = "./dickens"

logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)

if not os.path.exists(WORKING_DIR):
    os.mkdir(WORKING_DIR)

rag = LightRAG(
    working_dir=WORKING_DIR,
    llm_model_func=ollama_model_complete,
    llm_model_name="qwen2.5:32b",
    llm_model_max_async=4,
    llm_model_max_token_size=32768,
    llm_model_kwargs={"host": "http://10.35.45.98:11434", "options": {"num_ctx": 32768}},
    embedding_func=EmbeddingFunc(
        embedding_dim=768,
        max_token_size=8192,
        func=lambda texts: ollama_embedding(
            texts, embed_model="nomic-embed-text", host="http://10.35.45.98:11434"
        ),
    ),
)

with open("./book.txt", "r", encoding="utf-8") as f:
    rag.insert(f.read())

# Perform naive search
print(
    rag.query("What are the top themes in this story?", param=QueryParam(mode="naive"))
)

# Perform local search
print(
    rag.query("What are the top themes in this story?", param=QueryParam(mode="local"))
)

# Perform global search
print(
    rag.query("What are the top themes in this story?", param=QueryParam(mode="global"))
)

# Perform hybrid search
print(
    rag.query("What are the top themes in this story?", param=QueryParam(mode="hybrid"))
)

```

lightrag-demo_1.py

```python
import os

from lightrag.llm import ollama_model_complete, ollama_embedding
from lightrag.utils import EmbeddingFunc
from lightrag import LightRAG, QueryParam
import logging


logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)

WORKING_DIR = "./lightrag"


if not os.path.exists(WORKING_DIR):
    os.mkdir(WORKING_DIR)

# Initialize LightRAG with Ollama model
rag = LightRAG(
    working_dir=WORKING_DIR,
    llm_model_func=ollama_model_complete,  # Use Ollama model for text generation
    llm_model_name='qwen2.5:32b', # Your model name
    llm_model_max_async=4,
    llm_model_max_token_size=32768,
    llm_model_kwargs={"host": "http://10.35.45.98:11434", "options": {"num_ctx": 32768}},
    # Use Ollama embedding function
    embedding_func=EmbeddingFunc(
        embedding_dim=768,
        max_token_size=8192,
        func=lambda texts: ollama_embedding(
            texts,
            embed_model="nomic-embed-text",
            host="http://10.35.45.98:11434"
        )
    ),
)

with open("./book.txt") as f:
    rag.insert(f.read())

# Perform naive search
print(rag.query("What are the top themes in this story?", param=QueryParam(mode="naive")))

# Perform local search
print(rag.query("What are the top themes in this story?", param=QueryParam(mode="local")))

# Perform global search
print(rag.query("What are the top themes in this story?", param=QueryParam(mode="global")))

# Perform hybrid search
print(rag.query("What are the top themes in this story?", param=QueryParam(mode="hybrid")))
```

graph_visual_with_html.py

```python
import networkx as nx
from pyvis.network import Network
import random

# Load the GraphML file
G = nx.read_graphml("./qe_app.graphml")

# Create a Pyvis network
net = Network(height="100vh", notebook=True)

# Convert NetworkX graph to Pyvis network
net.from_nx(G)

# Add colors to nodes
for node in net.nodes:
    node["color"] = "#{:06x}".format(random.randint(0, 0xFFFFFF))

# Save and display the network
net.show("qe_app.html")

```
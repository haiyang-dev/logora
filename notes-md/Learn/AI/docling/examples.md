docling-server-tesserocr.py

```python
import os

from fastapi import FastAPI, HTTPException, File, UploadFile, Form, BackgroundTasks
import asyncio
from pydantic import BaseModel
import nest_asyncio
from typing import Optional
import json
import logging
import time
from pathlib import Path

from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.models.tesseract_ocr_model import TesseractOcrOptions

_log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
WORKING_DIR = "data"
if not os.path.exists(WORKING_DIR):
    os.mkdir(WORKING_DIR)

# Apply nest_asyncio to solve event loop issues
nest_asyncio.apply()
app = FastAPI(title="Docling API", description="API for Docling operations")


def convert_pdf(input_doc_path: str, convert_format: str):
    # Docling Parse with EasyOCR
    # ----------------------
    pipeline_options = PdfPipelineOptions()
    pipeline_options.do_ocr = True
    pipeline_options.do_table_structure = True
    pipeline_options.table_structure_options.do_cell_matching = True
    pipeline_options.ocr_options = TesseractOcrOptions()

    doc_converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
        }
    )
    input_doc_path = Path(input_doc_path)
    start_time = time.time()
    conv_result = doc_converter.convert(input_doc_path)
    end_time = time.time() - start_time

    _log.info(f"Document {input_doc_path} converted in {end_time:.2f} seconds.")

    # return results
    if convert_format == "mk":
        return conv_result.document.export_to_markdown()
    elif convert_format == "json":
        return json.dumps(conv_result.document.export_to_dict())
    elif convert_format == "text":
        return conv_result.document.export_to_text()
    elif convert_format == "doctags":
        return conv_result.document.export_to_document_tokens()
    else:
        _log.info(f"Unsupported convert format: {convert_format}")
        return "Unsupported format"


class Response(BaseModel):
    status: str
    data: Optional[str] = None
    message: Optional[str] = None


@app.post("/convert", response_model=Response)
async def insert_endpoint(file: UploadFile = File(...), fmt: str = Form("mk")):
    try:
        print(f"Received convert request with parameters: {fmt}")
        input_doc_path = f"{WORKING_DIR}/{file.filename}"
        with open(input_doc_path, "wb") as f:
            f.write(file.file.read())
        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(None, lambda: convert_pdf(input_doc_path, fmt))
        return Response(status="success", message=f"document convert to {fmt} successfully", data=res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8098, timeout_keep_alive=7200)
```

docling-server.py

```python
import os
import sys

import aiofiles
from fastapi import FastAPI, HTTPException, File, UploadFile, Form, BackgroundTasks
import asyncio
from pydantic import BaseModel
import nest_asyncio
from typing import Optional
import json
import logging
import time
from pathlib import Path
from typing import List

from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions, TableFormerMode, EasyOcrOptions
from docling.document_converter import DocumentConverter, PdfFormatOption


_log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
WORKING_DIR = "data"
if not os.path.exists(WORKING_DIR):
    os.mkdir(WORKING_DIR)

# Apply nest_asyncio to solve event loop issues
nest_asyncio.apply()
app = FastAPI(title="Docling API", description="API for Docling operations")


def convert_pdf(input_doc_path: str, convert_format: str, force_full_page_ocr: bool, ocr_lang: list):
    # Docling Parse with EasyOCR
    # ----------------------
    pipeline_options = PdfPipelineOptions()
    pipeline_options.do_ocr = True
    pipeline_options.do_table_structure = True
    pipeline_options.table_structure_options.do_cell_matching = True
    pipeline_options.table_structure_options.mode = TableFormerMode.ACCURATE
    ocr_options = EasyOcrOptions(force_full_page_ocr=force_full_page_ocr, lang=ocr_lang)
    pipeline_options.ocr_options = ocr_options

    doc_converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
        }
    )
    input_doc_path = Path(input_doc_path)
    start_time = time.time()
    conv_result = doc_converter.convert(source=input_doc_path)
    end_time = time.time() - start_time

    _log.info(f"Document {input_doc_path} converted in {end_time:.2f} seconds.")

    # return results
    if convert_format == "mk":
        return conv_result.document.export_to_markdown()
    elif convert_format == "json":
        return json.dumps(conv_result.document.export_to_dict())
    elif convert_format == "text":
        return conv_result.document.export_to_text()
    elif convert_format == "doctags":
        return conv_result.document.export_to_document_tokens()
    else:
        _log.info(f"Unsupported convert format: {convert_format}")
        return "Unsupported format"


class Response(BaseModel):
    status: str
    data: Optional[str] = None
    message: Optional[str] = None


@app.post("/convert", response_model=Response)
async def insert_endpoint(file: UploadFile = File(...),
                          fmt: str = Form("mk"),
                          force_ocr: bool = Form(False),
                          ocr_lang: List[str] = Form(["fr", "de", "es", "en"])):
    try:
        filename = os.path.basename(file.filename)
        print(f"Received convert request with parameters: convert to {fmt}, {filename}, force_ocr: {force_ocr}, "
              f"ocr_lang: {ocr_lang}")
        input_doc_path = f"{WORKING_DIR}/{filename}"
        async with aiofiles.open(input_doc_path, "wb") as f:
            content = await file.read()
            await f.write(content)
        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(None, lambda: convert_pdf(input_doc_path, fmt, force_ocr, ocr_lang))
        return Response(status="success", message=f"document convert to {fmt} successfully", data=res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8099, timeout_keep_alive=7200)
```

docling_client.py

```python
import os
import requests
import pypdfium2 as pdfium
from io import StringIO

WORKING_DIR = "data"
if not os.path.exists(WORKING_DIR):
    os.mkdir(WORKING_DIR)


def extract_first_n_pages(pdf_path, num_page, output_path):
    pdf = pdfium.PdfDocument(pdf_path)
    total_pages = len(pdf)
    new_pdf = pdfium.PdfDocument.new()
    new_pdf.import_pages(pdf, list(range(min(num_page, total_pages))))
    new_pdf.save(output_path)


def convert_pdf(file_path, fmt="mk", force_ocr=False):
    insert_file_url = "http://10.35.45.98:8099/convert"
    filename = os.path.basename(file_path)
    with open(file_path, 'rb') as f:
        files = {'file': (filename, f, 'application/pdf')}
        data = {
            'fmt': fmt,
            'force_ocr': force_ocr,
            'ocr_lang': ["ch_sim", "en"]
        }
        insert_file_response = requests.post(insert_file_url, files=files, data=data)
    print(insert_file_response.json())
    with open(f"data/{filename}.md", "w", encoding="utf-8") as fp:
        fp.write(insert_file_response.json()['data'])
    return insert_file_response.json()


def convert_pdf_tess(file_path, fmt="mk"):
    insert_file_url = "http://10.35.45.98:8098/convert"
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {'fmt': fmt}
        insert_file_response = requests.post(insert_file_url, files=files, data=data)
    print(insert_file_response.json())
    with open(f"data/{file_path}_tess.md", "w", encoding="utf-8") as fp:
        fp.write(insert_file_response.json()['data'])


# 4. Health check
def health_check():
    health_check_url = "http://10.35.45.98:8099/health"
    health_check_response = requests.get(health_check_url)
    print(health_check_response.json())


if __name__ == "__main__":
    # health_check()
    file_path = "raw_data/raw_data/24兴城YK06：成都兴城投资集团有限公司2024年面向专业投资者公开发行科技创新可续期公司债券（第三期）票面利率公告.PDF"
    # convert_pdf(file_path="raw_data/24兴城YK06：成都兴城投资集团有限公司2024年面向专业投资者公开发行科技创新可续期公司债券（第三期）票面利率公告.PDF", max_num_pages=2)
    # extract_first_n_pages(pdf_path="raw_data/24鞍钢集K5：鞍钢集团有限公司2024年面向专业投资者公开发行科技创新公司债券（第三期）募集说明书.PDF",
    #                       num_page=10,
    #                       output_path="data/24鞍钢集K5：鞍钢集团有限公司2024年面向专业投资者公开发行科技创新公司债券（第三期）募集说明书-10.PDF")

    convert_pdf(file_path=file_path, force_ocr=False)

```
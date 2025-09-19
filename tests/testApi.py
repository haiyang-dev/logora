import requests
import json

# 测试导出功能
url = "http://localhost:3001/api/notes/test/python-test.md"
data = {
    "content": [
        {
            "id": "1",
            "type": "heading",
            "props": {"level": 1},
            "content": [{"type": "text", "text": "Python测试", "styles": {}}],
            "children": []
        },
        {
            "id": "2",
            "type": "paragraph",
            "props": {
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
            },
            "content": [{"type": "text", "text": "这是一个Python测试", "styles": {}}],
            "children": []
        }
    ]
}

response = requests.post(url, json=data)
print("Status Code:", response.status_code)
print("Response:", response.json())
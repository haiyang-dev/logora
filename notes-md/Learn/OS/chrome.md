pac

```
# direct
function FindProxyForURL(url, host) { return "DIRECT"; }

# global
function FindProxyForURL(url, host) {
  // Global: all via proxy, fallback direct
  return "PROXY 19.29.39.44:80; DIRECT";
}

# proxy
function FindProxyForURL(url, host) {
  // 1) 如果是 note.youdao.com 域名，走 HTTP 代理
  if (dnsDomainIs(host, "note.youdao.com")) {
    return "PROXY 10.23.29.130:8080";
  }

  // 2) 其他全部直连
  return "DIRECT";
}
```

pac-server, 使用的是proxy.pac

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
轻量 PAC HTTP 服务：
- 每次请求从磁盘读取 proxy.pac（默认当前工作目录），实时生效
- 正确的 Content-Type / Cache-Control / ETag / Last-Modified
- 可自定义主机、端口、文件路径
"""
# import argparse
import hashlib
import http.server
import os
import socketserver
import time
from email.utils import formatdate

def sha256_etag(data: bytes) -> str:
    return '"' + hashlib.sha256(data).hexdigest() + '"'

class PACHandler(http.server.BaseHTTPRequestHandler):
    server_version = "PacServer/1.0"

    def _send(self, code: int, body: bytes, headers: dict):
        self.send_response(code)
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()
        if body:
            self.wfile.write(body)

    def do_GET(self):
        # 只响应 /proxy.pac（其余返回 404）
        if not self.path.startswith("/proxy.pac"):
            self._send(404, b"not found", {"Content-Type": "text/plain; charset=utf-8"})
            return

        pac_path = self.server.pac_path
        try:
            with open(pac_path, "rb") as f:
                content = f.read()
            stat = os.stat(pac_path)
            lm_http = formatdate(stat.st_mtime, usegmt=True)
            etag = sha256_etag(content)

            # 条件缓存处理
            inm = self.headers.get("If-None-Match")
            ims = self.headers.get("If-Modified-Since")

            headers = {
                "Content-Type": "application/x-ns-proxy-autoconfig",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                "ETag": etag,
                "Last-Modified": lm_http,
            }

            if inm == etag or ims == lm_http:
                self._send(304, b"", headers)
            else:
                self._send(200, content, headers)

        except FileNotFoundError:
            self._send(404, b"proxy.pac not found in current directory",
                       {"Content-Type": "text/plain; charset=utf-8"})
        except Exception as e:
            msg = f"internal server error: {e}".encode("utf-8", "ignore")
            self._send(500, msg, {"Content-Type": "text/plain; charset=utf-8"})

def main():
    # ap = argparse.ArgumentParser(description="Simple PAC HTTP server (auto-reload proxy.pac)")
    # ap.add_argument("--host", default="127.0.0.1", help="bind host (default: 127.0.0.1)")
    # ap.add_argument("--port", type=int, default=17890, help="bind port (default: 17890)")
    # ap.add_argument("--path", default="proxy.pac", help="PAC file path (default: ./proxy.pac)")
    # args = ap.parse_args()

    server_host = "127.0.0.1"
    server_port = 17890
    pac_path = "proxy.pac"

    Handler = PACHandler
    def server_factory(server_address, RequestHandlerClass):
        httpd = socketserver.TCPServer(server_address, RequestHandlerClass)
        # 挂在 server 对象上，handler 里可访问
        httpd.pac_path = os.path.abspath(pac_path)
        return httpd

    with server_factory((server_host, server_port), Handler) as httpd:
        pac_abs = os.path.abspath(pac_path)
        print(f"[PAC] Serving {pac_abs}")
        print(f"[PAC] URL:   http://{server_host}:{server_port}/proxy.pac")
        print(f"[PAC] Time:  {time.strftime('%Y-%m-%d %H:%M:%S')}")
        httpd.serve_forever()

if __name__ == "__main__":
    main()

```

chrome浏览器需要设置启动参数， 设的是target, 不是start in

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --no-first-run ^
  --user-data-dir="C:\Users\hwang4\AppData\Local\Chrome-PAC" ^
  --proxy-pac-url="http://127.0.0.1:17890/proxy.pac"
```
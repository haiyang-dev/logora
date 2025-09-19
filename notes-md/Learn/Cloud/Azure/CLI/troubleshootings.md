```
az login时报错
HTTPSConnectionPool(host='login.microsoftonline.com', port=443): Max retries exceeded with url: /organizations/oauth2/v2.0/token (Caused by SSLError(SSLCertVerificationError(1, '[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:1006)')))
Certificate verification failed. This typically happens when using Azure CLI behind a proxy that intercepts traffic with a self-signed certificate. Please add this certificate to the trusted CA bundle. More info: 
```

去下载zscaler的自签名证书

[https://lsegroup.sharepoint.com/sites/SecurityPlatformSupport/SitePages/Zscaler-FAQ.aspx?OR=Teams-HL&CT=1686203649775#ssl-cert-pinning-issues-with-developer-tools.which](https://lsegroup.sharepoint.com/sites/SecurityPlatformSupport/SitePages/Zscaler-FAQ.aspx?OR=Teams-HL&CT=1686203649775#ssl-cert-pinning-issues-with-developer-tools.which)

然后copy证书里面的内容更新到

C:\Program Files\Microsoft SDKs\Azure\CLI2\Lib\site-packages\certifi\cacert.pem

```
1安装企业根证书
如果你的组织已将一个或多个根证书添加到其信任存储中，你需要在运行 Azure CLI 的计算机上也执行同样的操作。这通常涉及将 .crt 或 .cer 文件导入 Windows 信任存储。
运行 certmgr.msc 打开“证书”管理控制台。
在“受信任的根证书颁发机构” > “证书”下，右击并选择“所有任务” > “导入”，然后按照向导操作将企业根 CA 证书添加进来。

2使用自签名/中间证书
如果你需要将 Azure CLI 配置为信任一个特定的自签名或中间证书，可以将其添加到 Python 的 SSL 可信存储中。Azure CLI 使用 Python 的 requests 库来处理 HTTPS 连接，并依赖于 certifi 包作为默认的 CA 存储。
你可以通过以下步骤更新可信证书列表：
将自签名/中间证书导出为 .pem 格式文件。
在安装 Python 的目录下找到 certifi 模块位置，通常是在 <Python_Install_Dir>\Lib\site-packages\certifi> 目录中。
复制 cacert.pem 文件，并使用文本编辑器打开它。将你的证书内容追加到文件末尾（确保格式正确）。
将更新后的 cacert.pem 替换原有的文件。

3配置环境变量
对于临时解决方案，你可以通过设置环境变量来禁用 SSL 证书验证或指定自定义 CA 存储路径。但这不推荐在生产环境中使用，因为它会降低 HTTPS 连接的安全性。
set REQUESTS_CA_BUNDLE=&lt;path-to-your-cacert.pem>

或者完全禁用 SSL 验证（强烈不建议）：
set AZURE_CLI_SSL_NO_VERIFY=true

4配置代理服务器
如果你的网络环境需要通过特定的代理服务器访问互联网，确保在运行 az login 前设置正确的代理信息。
set HTTPS_PROXY=&lt;proxy-host>:&lt;proxy-port>
set HTTP_PROXY=&lt;proxy-host>:&lt;proxy-port>

或者使用 --proxy <http(s)://user:password@host:port> 参数登录 Azure CLI。
```
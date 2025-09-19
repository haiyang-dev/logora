Proxy is needed before running terraform commands for Beijing Environment



set http_proxy=webproxy.int.westgroup.com:80



set https_proxy=webproxy.int.westgroup.com:80



使用 graph 命令生成可视化的图表

其实 graph 命令只能生成相关图表的数据(dot 格式的数据)，我们通过 dot 命令来生成可视化的图表，先通过下面的命令安装 dot 程序：https://graphviz.gitlab.io/_pages/Download/Download_windows.html

设置环境变量

$ sudo apt install graphviz

然后生成一个图表：

$ terraform graph | dot -Tsvg > graph.svg

terraform graph -type=plan | dot -Tsvg > graph1.svg

terraform graph -type=plan -draw-cycles | dot -Tsvg > graph1.svg



if ctrl+c

terraform force-unlock 0a600c7d-b448-2011-4451-fa120a5c0aed



terraform refresh



terraform output snapshot_web_service_info



```javascript

```



terraform state list

terraform state rm kubernetes_service.snapshot-web-service

kubernetes_service.cassandra-headless

kubernetes_service.snapshot-cache-headless

kubernetes_service.snapshot-web-service



```javascript
git config --global url."https://x-oauth-basic:sdp-zFrQ1E4kp7Fh-MYp1Yed@gitlab.dx1.lseg.com/250065/pricingsnapshot-terraform-configuration.git".insteadOf "https://gitlab.dx1.lseg.com/250065/pricingsnapshot-terraform-configuration.git"
git config --global url."https://x-oauth-basic:sdp-e5VEgc1eLeSQYTV9GK4E@gitlab.dx1.lseg.com/app/206160/common/ts_terraform_modules.git".insteadOf "https://gitlab.dx1.lseg.com/app/206160/common/ts_terraform_modules.git"
git config --global url."https://x-oauth-basic:Vbpdpi2-3U-8FcSypyVP@git.sami.int.thomsonreuters.com/ts/ts_terraform_modules.git".insteadOf "https://git.sami.int.thomsonreuters.com/ts/ts_terraform_modules.git"
```



```javascript
/data/tools/terraform_1.3.7 init -backend-config=backend.config
/data/tools/terraform_1.3.7 plan -var-file=terraform.tfvars
/data/tools/terraform_1.3.7 apply -var-file=terraform.tfvars -auto-approve
/data/tools/terraform_1.3.7 destroy -var-file=terraform.tfvars -auto-approve
/data/tools/terraform_1.2.4 apply -var-file=terraform.tfvars -var release_version=${releaseVersion} -auto-approve  
```


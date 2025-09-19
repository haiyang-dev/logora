login  https://concourse.sdp.refinitiv.com/



export http_proxy=webproxy.int.westgroup.com:80

export https_proxy=webproxy.int.westgroup.com:80



export http_proxy=webproxy.lon.corp.services:80

export https_proxy=webproxy.lon.corp.services:80





set http_proxy=webproxy.int.westgroup.com:80

set https_proxy=webproxy.int.westgroup.com:80



set http_proxy=webproxy.lon.corp.services:80

set https_proxy=webproxy.lon.corp.services:80



set http_proxy=10.23.32.130:80

set https_proxy=10.23.32.130:80



export http_proxy=10.23.32.130:80

export https_proxy=10.23.32.130:80



不能用china vpn

```javascript
fly --target 250065 login --team-name 250065 --concourse-url https://concourse.sdp.refinitiv.com
```

Your terminal will ask you to visit a location in your browser. When you go to this location, the required access token will automatically be supplied back to your terminal login process

```javascript
fly targets
```



提交pipeline

```javascript
fly -t 250065 set-pipeline -p hello-world -c ./hello-world.yaml
# -t --target 指明要操作的target
# -c --config 指明pipeline的配置文件
# -p --pipeline 指明pipeline的名字
```



提交后处于暂停，执行这个恢复到pending

```javascript
fly -t 250065 unpause-pipeline -p hello-world
```



```javascript
Create a pipeline:
fly -t 250065 set-pipeline -c pipeline.yml -p *enter_pipeline_name*
Now unpause the pipeline:
fly -t 250065 unpause-pipeline -p *enter_pipeline_name*
Fly cli will generate an url to SDP Concourse so you can view the pipeline in GUI. You can now trigger a build using the plus sign in the top right corner or using fly cli:
fly -t 250065 trigger-job -j *enter_pipeline_name*/*job-name*
You can also view the running job using:
fly -t 250065 watch -j *enter_pipeline_name*/*job-name*
Or combine two to trigger and watch the job:
fly -t 250065 trigger-job -j *enter_pipeline_name*/*job-name* -w
To destroy a pipeline use:
fly -t 250065 destroy-pipeline -p snapshot-newman-image-build
```

static vars 

```javascript
-v or --var NAME=VALUE sets the string VALUE as the value for the var NAME.
-y or --yaml-var NAME=VALUE parses VALUE as YAML and sets it as the value for the var NAME.
-l or --load-vars-from FILE loads FILE, a YAML document containing mapping var names to values, and sets them all.
```

interactive

```javascript
fly -t 250065 intercept -j pricingsnapshot-build-pipeline/pricingsnapshot-cacheserver-build
fly -t 250065 intercept -j nonprod-build-pipeline/webserver-build
fly -t 250065 intercept -j nonprod-build-pipeline/webserver-sonarqube-scan
fly -t 250065 intercept -j nonprod-build-pipeline/cacheserver-sonarqube-scan
fly -t 250065 intercept -j nonprod-build-pipeline/web-statemonitor-build
fly -t 250065 intercept -j nonprod-deployment-pipeline/qa-use1-image-push
fly -t 250065 intercept -j nonprod-build-pipeline/event-dictionary-upload
fly -t 250065 intercept -j nonprod-set-pipelines/set-pipelines
fly -t 250065 intercept -j prod-destroy-infrastructure-pipeline/prod-use1-infrastructure-destroy
fly -t 250065 intercept -j prod-deployment-pipeline/prod-use1-infrastructure-deploy
fly -t 250065 intercept -j nonprod-destroy-infrastructure-pipeline/ppe-use1-infrastructure-destroy
```

      they may have expired if your build hasn't recently finished







vault

login

```javascript
export VAULT_ADDR=https://vault.sdp.refinitiv.com
export VAULT_TOKEN=s.8var7BdUg72ANHzNVLHZNCyd
vault login
vault login -method=oidc -address=https://vault.sdp.refinitiv.com
vault login -method=token -address=https://vault.sdp.refinitiv.com
s.8var7BdUg72ANHzNVLHZNCyd
```



```javascript
vault kv list -address=https://vault.sdp.refinitiv.com concourse/250065/kv
vault list -address=https://vault.sdp.refinitiv.com
```


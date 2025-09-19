use docker image

1. add docker config variables:  only used by getDockerImage 

haiyang.wang 

-s.ts.auto:TSAut0mat10n

echo -n "-s.ts.auto:TSAut0mat10n" | base64



LXMudHMuYXV0bzpUU0F1dDBtYXQxMG4=



{

    "auths": {

        "bams-aws.refinitiv.com:5001": {

            "auth": "LXMudHMuYXV0bzpUU0F1dDBtYXQxMG4="

        }

    }

}

```javascript
DOCKER_AUTH_CONFIG
{
    "auths": {
        "bams-aws.refinitiv.com": {
            "auth": "LXMudHMuYXV0bzpUU0F1dDBtYXQxMG4="
        }
    }
}
```

2. use image





AWS credentials

1. create the virables on Setting -> CI CD -> Variables [AWS_ACCESS_KEY_ID, AWS_CREDS,AWS_SESSION_TOKEN,AWS_SECRET_ACCESS_KEY]

2. get the access token on Setting->AccessToken, maintainer's role with api

2. use the below code, note: AWS_CREDS will be not update every times

```javascript
variables:
  ASSERT_ID: 250065 # note the id usage
  AWS_ACCOUNT_ID: "aws_account_id"
  DEPLOY_ENV: "dev"
  PRIVATE_TOKEN: "sdp-pxrh965vVq-5XQS68GQD" # maintainer's token


stages:          # List of stages for jobs, and their order of execution
  - fetch-creds
  - build
  - test
  - deploy

fetch-aws-credentials:
  stage: fetch-creds
  image: vault:1.8.2 # vault binary is required for vault calls
  rules:
    - if: '$DEPLOY_ENV == "dev" || $DEPLOY_ENV == "qa" || $DEPLOY_ENV == "ppe" || $DEPLOY_ENV == "nonprod"'
      variables: # Override AWS_ACCOUNT_ID defined
        AWS_ACCOUNT_ID: "205358287074"
    - if: '$DEPLOY_ENV == "prod"'
      variables:
        AWS_ACCOUNT_ID: "259431915815"

  script:
    ### install curl
    - apk add --update python3 curl jq py3-pip
    - pip3 install --upgrade pip
    - pip3 install --no-cache-dir awscli
    - rm -rf /var/cache/apk/*
    ### fetch the credentials from vault
    - export VAULT_TOKEN="$(vault write -field=token auth/jwt/login role=${ASSERT_ID}-aws jwt=$CI_JOB_JWT)" # login into vault
    - vault list gitlab/$ASSERT_ID/aws/roles # list available aws roles
    - export AWS_CREDS="$(vault read -format=json gitlab/${ASSERT_ID}/aws/creds/${AWS_ACCOUNT_ID}-a${ASSERT_ID}-developer)"
    - export AWS_ACCESS_KEY_ID="$(echo ${AWS_CREDS} | jq -r '.data.access_key')"
    - export AWS_SESSION_TOKEN="$(echo ${AWS_CREDS} | jq -r '.data.security_token')"
    - export AWS_SECRET_ACCESS_KEY="$(echo ${AWS_CREDS} | jq -r '.data.secret_key')"
    - aws sts get-caller-identity
    ### use the API to modify the value of the variables
    - 'curl --silent --output /dev/null --request PUT --header "PRIVATE-TOKEN: $PRIVATE_TOKEN" "https://gitlab.sdp.refinitiv.com/api/v4/projects/${CI_PROJECT_ID}/variables/AWS_CREDS" --form "value=${AWS_CREDS}" '
    - 'curl --silent --output /dev/null --request PUT --header "PRIVATE-TOKEN: $PRIVATE_TOKEN" "https://gitlab.sdp.refinitiv.com/api/v4/projects/${CI_PROJECT_ID}/variables/AWS_ACCESS_KEY_ID" --form "masked=true" --form "value=${AWS_ACCESS_KEY_ID}" '
    - 'curl --silent --output /dev/null --request PUT --header "PRIVATE-TOKEN: $PRIVATE_TOKEN" "https://gitlab.sdp.refinitiv.com/api/v4/projects/${CI_PROJECT_ID}/variables/AWS_SESSION_TOKEN" --form "masked=true" --form "value=${AWS_SESSION_TOKEN}" '
    - 'curl --silent --output /dev/null --request PUT --header "PRIVATE-TOKEN: $PRIVATE_TOKEN" "https://gitlab.sdp.refinitiv.com/api/v4/projects/${CI_PROJECT_ID}/variables/AWS_SECRET_ACCESS_KEY" --form "masked=true" --form "value=${AWS_SECRET_ACCESS_KEY}" '
    - env
    
deploy:
  stage: build
  image: vault:1.8.2
  script:
    ## the variables can accessed from any job, i.e.: echo $AWS_ACCESS_KEY_ID.
    ## since they are environment variables, you can run aws cli directly
    - apk add --update python3 curl jq py3-pip
    - pip3 install --upgrade pip
    - pip3 install --no-cache-dir awscli
    - rm -rf /var/cache/apk/*
    - echo "$AWS_ACCESS_KEY_ID"
    - echo "$AWS_CREDS"
    - echo "$AWS_SESSION_TOKEN"
    - echo "$AWS_SECRET_ACCESS_KEY"
    - aws s3 ls
```



Build&Push image

before_script:
  - echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin



Build code

1. Use the BAMS docker image, so need to add the docker configs.

go to the git repository, click settings/ci_cd, expand the Variables, add the DOCKER_AUTH_CONFIG, more details https://gitlab.sdp.refinitiv.com/help/ci/docker/using_docker_images.md#access-an-image-from-a-private-container-registry

DOCKER_AUTH_CONFIG

|   |
| - |
| {<br>    "auths": {<br>        "bams-aws.refinitiv.com:5001": {<br>            "auth": "LXMudHMuYXV0bzpUU0F1dDBtYXQxMG4="<br>        }<br>    }<br>} |


1. Edit the .gitlab-ci.yml

gitlab-ci-build-code

|   |
| - |
| stages:          \# List of stages for jobs, and their order of execution<br>  - build<br> <br>build:<br>  stage: build<br>  image: bams-aws.refinitiv.com:5001/timeseries/quantum-framework/quantum-framework-v3.2.9.0:R2021-3-3 \# use the BAMS image<br>  script:<br>    - pwd<br>    - ls -l<br>    - chmod +x build.sh<br>    - ./build.sh<br>    - ls -l<br>  artifacts: \# upload the packaged code for veracode scan and build docker imgage<br>    expire\_in: 1 week<br>    paths:<br>      - build.zip<br>      - veracode-scan.zip |


Sonarqube Scan

1. gitlab-ci.yml

gitlab-ci-sonarqube-scan

|   |
| - |
| variables:<br>  \# sonarqube scan<br>  SONAR\_LOGINTOKEN: "\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*"<br>  SONAR\_PROJECTKEY: "a250065-pricingsnapshot-cache"<br>  SONAR\_PROJECTNAME: "a250065-pricingsnapshot-cache"<br> <br>stages:          \# List of stages for jobs, and their order of execution<br>  - test<br> <br>sonarqube-scan:<br>  stage: test<br>  image: bams-aws.refinitiv.com:5001/timeseries/quantum-framework/quantum-framework-v3.2.9.0:R2021-14-1 \# use the BAMS image<br>  when: manual<br>  script:<br>    - pwd<br>    - ls -l<br>    - chmod +x sonarqube-scan.sh<br>    - yum install -y curl<br>    - ./sonarqube-scan.sh |


1. sonarqube-scan.sh

sonarqube-scan.sh

|   |
| - |
| \#!/usr/bin/env sh<br>ls -l<br>env<br>pwd<br>whoami<br>echo "\#\#\#\#\# building for SonarQube scan... \#\#\#\#\#"<br>cd ./SnapshotCacheServer<br> <br>echo "\#\#\#\#\# Downloading sonar build-wrapper-linux-x86.zip ... \#\#\#\#\#"<br>curl -O https://sonarqube.refinitiv.com/static/cpp/build-wrapper-linux-x86.zip<br>if (( $? == 0 )); then<br>    echo "\#\#\#\#\# sonar build wrapper download Success \#\#\#\#\#"<br>    unzip build-wrapper-linux-x86.zip<br>    chmod 755 build-wrapper-linux-x86/\* -R<br>    echo "\#\#\#\#\# sonar build wrapper extraction Success \#\#\#\#\#"<br>fi<br>if (( $? != 0 )); then<br>    echo "\#\#\#\#\# sonar build wrapper download/extraction failed \#\#\#\#\#"<br>    exit 1<br>fi<br> <br>echo "\#\#\#\#\# Downloading sonar sonar-scanner-cli-4.6.2.2472-linux.zip ... \#\#\#\#\#"<br>curl -O https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.6.2.2472-linux.zip<br>if (( $? == 0 )); then<br>    echo "\#\#\#\#\# sonar scanner download Success \#\#\#\#\#"<br>    unzip sonar-scanner-cli-4.6.2.2472-linux.zip<br>    chmod 755 sonar-scanner-4.6.2.2472-linux/\* -R<br>    echo "\#\#\#\#\# sonar scanner extraction Success \#\#\#\#\#"<br>fi<br>if (( $? != 0 )); then<br>    echo "\#\#\#\#\# sonar scanner download/extraction failed \#\#\#\#\#"<br>    exit 1<br>fi<br> <br>mkdir sonar\_build\_wrapper\_output -p<br>rm sonar\_build\_wrapper\_output/\* -Rf<br> <br>autoreconf -if<br>./configure --enable-coverage --enable-unittest<br>build-wrapper-linux-x86/build-wrapper-linux-x86-64 --out-dir sonar\_build\_wrapper\_output make clean<br>build-wrapper-linux-x86/build-wrapper-linux-x86-64 --out-dir sonar\_build\_wrapper\_output make check<br>if [ $? -ne 0 ]; then<br>    echo "\#\#\#\#\# ERROR: Failed to make clean/make check \#\#\#\#\#"<br>    exit 1<br>fi<br> <br>cd ..<br>pip3 install gcovr<br>gcovr -r . --sonarqube test\_coverage.xml<br>sed -i 's/.libs\\///g' test\_coverage.xml<br> <br>\#tag\_name=$(git describe --exact-match --tags $(git log -n1 --pretty='%h'))<br>tag\_name="latest"<br>echo "Sonarqube scan version = ${tag\_name}"<br> <br>./SnapshotCacheServer/sonar-scanner-4.6.2.2472-linux/bin/sonar-scanner -Dsonar.sources=./SnapshotCacheServer/Components,./SnapshotCacheServer/Includes,./SnapshotCacheServer/Interfaces \\-Dsonar.cfamily.build-wrapper-output=./SnapshotCacheServer/sonar\_build\_wrapper\_output -Dsonar.cfamily.cache.enabled=true -Dsonar.cfamily.cache.path=./SnapshotCacheServer/sonar\_cache -Dsonar.cfamily.threads=8 -Dsonar.login=${SONAR\_LOGINTOKEN} -Dsonar.projectKey=${SONAR\_PROJECTKEY} -Dsonar.projectName=${SONAR\_PROJECTNAME} -Dsonar.branch.name=${CI\_COMMIT\_REF\_NAME} -Dsonar.projectVersion=${tag\_name}  -Dsonar.coverageReportPaths=test\_coverage.xml -Dsonar.host.url=https://sonarqube.refinitiv.com<br> <br>if (( $? != 0 )); then<br>    echo "\#\#\#\#\# The sonar scan app failed! \#\#\#\#\#"<br>    exit 1<br>fi<br>echo "\#\#\#\#\# building end \#\#\#\#\#"<br> <br>echo "\#\#\# Running curl command to verify the project status... \#\#\#"<br>echo ${SONAR\_LOGINTOKEN} &gt; pass.txt<br>curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET "https://sonarqube.refinitiv.com/api/qualitygates/project\_status?projectKey=${SONAR\_PROJECTKEY}&amp;branch=DX1-test" -u $(cat pass.txt):  | grep "\\"projectStatus\\":{\\"status\\":\\"OK\\""<br>if (( $? != 0 )); then<br>    echo "The sonar scan does not pass, for details please refer to https://sonarqube.refinitiv.com/dashboard?id=${SONAR\_PROJECTKEY}"<br>fi<br>echo "\#\#\# Running Curl command success \#\#\#" |


Veracode Scan

1. gitlab-ci.yml

gitlab-ci-veracode-scan

|   |
| - |
| variables:<br>  \# veracode scan<br>  VERACODE\_APP\_PROFILE: "Pricingsnapshot-Cache"<br>  VERACODE\_SANDBOX: "Pricingsnapshot-cache"<br>  VERACODE\_TIMEOUT: "1440"<br>  VERACODE\_KEY: "\*\*\*\*\*\*\*\*\*\*\*"<br>  VERACODE\_ID: "\*\*\*\*\*\*\*\*\*\*\*"<br> <br>stages:          \# List of stages for jobs, and their order of execution<br>  - test<br> <br>veracode-scan:<br>  stage: test<br>  image: bams-aws.refinitiv.com:5001/timeseries/docker-remote/ubuntu:20.04 \# use the BAMS image<br>  when: manual<br>  dependencies:<br>    - build \# get the [build] job's output -- veracode-scan.zip<br>  script:<br>    - pwd<br>    - ls -l<br>    - chmod +x veracode-scan.sh<br>    - ./veracode-scan.sh |


1. veracode-scan.sh

veracode-scan.sh

|   |
| - |
| \#!/usr/bin/env sh<br>ls -l<br>env<br>pwd<br>whoami<br> <br>apt-get update<br>java -version<br> <br>echo [\*\*\*\*\*\*\* installing zip unzip jq \*\*\*\*\*\*\*]<br>apt-get install -q -y zip jq curl<br> <br>echo [\*\*\*\*\*\*\* installing java \*\*\*\*\*\*\*]<br>apt-get install -q -y openjdk-8-jre-headless<br> <br>echo [\*\*\*\*\*\*\* fetching API Wrapper \*\*\*\*\*\*\*]<br>echo curl -sS "https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/20.3.6.1/vosp-api-wrappers-java-20.3.6.1.jar" &gt; veracode-wrapper.jar<br>curl -sS "https://search.maven.org/solrsearch/select?q=g:%22com.veracode.vosp.api.wrappers%22&amp;rows=20&amp;wt=json" | jq -r '.["response"]["docs"][0].latestVersion' &gt; wrapper-version<br>VERACODE\_WRAPPER\_VERSION=$(cat wrapper-version); curl -sS "https://repo1.maven.org/maven2/com/veracode/vosp/api/wrappers/vosp-api-wrappers-java/${VERACODE\_WRAPPER\_VERSION}/vosp-api-wrappers-java-${VERACODE\_WRAPPER\_VERSION}.jar" &gt; veracode-wrapper.jar<br>java -jar veracode-wrapper.jar -wrapperversion<br>ls<br>find .<br>NOW=$(date +"%d-%m-%y,%H:%M")<br>echo $NOW<br>SCAN=$"SDP sandbox scan ${NOW}"<br>echo SCAN = $SCAN<br>env<br> <br>mkdir packaged-code<br>cp veracode.zip ./packaged-code<br>ls -l packaged-code<br> <br>echo [\*\*\*\*\*\*\* Upload and Scan \*\*\*\*\*\*\*]<br>java -jar veracode-wrapper.jar -action uploadandscan \\<br>-vid $VERACODE\_ID -vkey $VERACODE\_KEY \\<br>-createprofile false -scantimeout $VERACODE\_TIMEOUT \\<br>-appname $VERACODE\_APP\_PROFILE \\<br>-version "$SCAN" -filepath packaged-code -logfilepath scan.txt<br>result=$?<br> <br>echo [\*\*\*\*\*\*\* scan result $result \*\*\*\*\*\*\*]<br>ls<br>buildid=$(grep "analysis id" scan.txt | cut -d ' ' -f 11 | cut -c 2-9)<br>echo $buildid<br> <br>echo [\*\*\*\*\*\*\*  Summary Report \*\*\*\*\*\*\*]<br>java -jar veracode-wrapper.jar -action summaryreport \\<br>-vid $VERACODE\_ID -vkey $VERACODE\_KEY \\<br>-buildid $buildid -format pdf -outputfilepath summary.pdf<br> <br>echo [\*\*\*\*\*\*\* Detailed Report \*\*\*\*\*\*\*]<br>java -jar veracode-wrapper.jar -action detailedreport \\<br>-vid $VERACODE\_ID -vkey $VERACODE\_KEY \\<br>-buildid $buildid -format pdf -outputfilepath detailedreport.pdf<br>mv summary.pdf scan-results/summary.pdf<br>mv detailedreport.pdf scan-results/detailedreport.pdf<br>ls -l scan-results<br>exit $result |


Build docker image

gitlab-ci-build-docker-image

|   |
| - |
| variables:<br>  \# docker config for k8s runner<br>  DOCKER\_HOST: tcp://localhost:2375<br>  DOCKER\_TLS\_CERTDIR: ''<br>  \# push image to Bams<br>  BAMS\_REGISTRY: "bams-aws.refinitiv.com:5001"<br>  CACHESERVER\_IMAGE: "bams-aws.refinitiv.com:5001/timeseries/pricingsnapshot/pricingsnapshot-cache"<br> <br>stages:          \# List of stages for jobs, and their order of execution<br>  - build-image<br> <br>image-build:<br>  \# Use the official docker image.<br>  image: docker:20.10.12<br>  stage: build-image<br>  dependencies:<br>    - build \# get the [build] job's output -- build.zip<br>  services:<br>    - docker:20.10.12-dind<br>  before\_script:<br>    - sleep 10s \# wait for docker demon process start up<br>    - docker login --username="-s.ts.auto" --password="TSAut0mat10n" bams-aws.refinitiv.com:5001<br>  \# Default branch leaves tag empty (= dx1test tag)<br>  \# All other branches are tagged with the escaped branch name (commit ref slug)<br>  script:<br>    - |<br>      if [[ "$CI\_COMMIT\_BRANCH" == "$CI\_DEFAULT\_BRANCH" ]]; then<br>        tag="dx1test"<br>        echo "Running on default branch '$CI\_DEFAULT\_BRANCH': tag = 'dx1test'"<br>      else<br>        tag=":$CI\_COMMIT\_REF\_SLUG"<br>        echo "Running on branch '$CI\_COMMIT\_BRANCH': tag = $tag"<br>      fi<br>    - unzip build.zip<br>    - cd ./build<br>    - ls -l<br>    - docker build --pull -f Dockerfile.cacheserver -t "$CACHESERVER\_IMAGE:$IMAGE\_TAG" .<br>    - docker push "$CACHESERVER\_IMAGE:$IMAGE\_TAG" |


Twistlock Scan

1. gitlab-ci.yml

gitlab-ci-twistlock-scan

|   |
| - |
| variables:<br>  \# twistlock scan<br>  TWISTLOCK\_ID: "\*\*\*\*\*\*\*\*\*\*\*\*\*"<br>  TWISTLOCK\_PASS: "\*\*\*\*\*\*\*\*\*\*\*\*\*"<br>  \# docker config for k8s runner<br>  DOCKER\_HOST: tcp://localhost:2375<br>  DOCKER\_TLS\_CERTDIR: ''<br>  \# push image to Bams<br>  BAMS\_REGISTRY: "bams-aws.refinitiv.com:5001"<br>  CACHESERVER\_IMAGE: "bams-aws.refinitiv.com:5001/timeseries/pricingsnapshot/pricingsnapshot-cache"<br>  IMAGE\_TAG: "dx1test"<br> <br>stages:          \# List of stages for jobs, and their order of execution<br>  - scan-image<br> <br>twistlock-scan:<br>  image: docker:latest<br>  stage: scan-image<br>  services:<br>    - docker:20.10.12-dind<br>  when: manual<br>  script:<br>    - chmod +x twistlock-scan.sh<br>    - ./twistlock-scan.sh |


1. twistlock-scan.sh

twistlock-scan.sh

|   |
| - |
| \#!/usr/bin/env sh<br>ls -l<br>env<br>pwd<br>whoami<br>apk --no-progress -q add curl<br>\# Download twistcli binary<br>\# twistlock credentials are retrieved from vault<br>\# Vault var\_sources must be configured in the pipeline. See https://docs.sdp.refinitiv.com/user-guide/vault/<br>curl -k -u $TWISTLOCK\_ID:$TWISTLOCK\_PASS --output twistcli https://twistlock.sdp.refinitiv.com/api/v1/util/twistcli<br>chmod a+x twistcli<br> <br>\# Tag the image with given REPOSITORY and TAG<br>docker pull "$CACHESERVER\_IMAGE:$IMAGE\_TAG"<br> <br>\#Check for com.refinitiv.asset-insight-id label<br>\#See https://docs.sdp.refinitiv.com/user-guide/twistlock/\#asset-insight-id-requirement<br>\#if [ -z $(docker history  ${IMAGE\_ID} --no-trunc | grep "LABEL com.refinitiv.asset-insight-id") ]; then<br>\#  echo "Docker label com.refinitiv.asset-insight-id is missing"<br>\#  exit 1<br>\#fi<br> <br>if [ -z $(docker inspect --format '{{ index .Config.Labels "com.refinitiv.asset-insight-id"}}' "$CACHESERVER\_IMAGE:$IMAGE\_TAG") ]; then<br>  echo "Docker label com.refinitiv.asset-insight-id is missing"<br>  exit 1<br>fi<br> <br>\#Invoke twistcli scan<br>./twistcli images scan --address=https://twistlock.sdp.refinitiv.com -u $TWISTLOCK\_ID -p $TWISTLOCK\_PASS "$CACHESERVER\_IMAGE:$IMAGE\_TAG" |


Fetch AWS credentials

Note

The AWS credentials align with your Assert ID, which means if you want to use the AWS credentials, you must specify the unique Assert ID when onboarding.

You can get the AWS credentials on the root and sub projects.



1. Add below variables to the settings/ci_cd Variables, the Values are NA

| Key | Value |
| - | - |
| AWS\_CREDS | NA |
| AWS\_ACCESS\_KEY\_ID | NA |
| AWS\_SECRET\_ACCESS\_KEY | NA |
| AWS\_SESSION\_TOKEN | NA |


1. Generate the access token on Setting->AccessToken, maintainer's role with API access

1. gitlab-ci.yml

gitlab-ci-aws-credentials

|   |
| - |
| variables:<br>  ASSERT\_ID: 250065<br>  AWS\_ACCOUNT\_ID: "aws\_account\_id"<br>  DEPLOY\_ENV: "dev"<br>  IMAGE\_TAG: "dx1test"<br>  \# update configuration variables<br>  PRIVATE\_TOKEN: "sdp-xYd9fdHFHn\_jCFT499TF" \# maintainer's token<br>  \# push image to Bams<br>  BAMS\_REGISTRY: "bams-aws.refinitiv.com:5001"<br>  CACHESERVER\_IMAGE: "bams-aws.refinitiv.com:5001/timeseries/pricingsnapshot/pricingsnapshot-cache"<br>  \# push image to ECR<br>  AWS\_DEFAULT\_REGION: "us-east-1"<br>  AWS\_ECR\_REGISTRY: "205358287074.dkr.ecr.us-east-1.amazonaws.com"<br>  CACHESERVER\_DEV\_ECR: "205358287074.dkr.ecr.us-east-1.amazonaws.com/a250065-use1-dev-pricingsnapshot-cache-server"<br>  CACHESERVER\_QA\_ECR: "205358287074.dkr.ecr.us-east-1.amazonaws.com/a250065-use1-qa-pricingsnapshot-cache-server"<br>  CACHESERVER\_PPE\_ECR: "205358287074.dkr.ecr.us-east-1.amazonaws.com/a250065-use1-ppe-pricingsnapshot-cache-server"<br>  \# docker config for k8s runner<br>  DOCKER\_HOST: tcp://localhost:2375<br>  DOCKER\_TLS\_CERTDIR: ''<br> <br>stages:          \# List of stages for jobs, and their order of execution<br>  - fetch-creds<br> <br>fetch-aws-credentials:<br>  stage: fetch-creds<br>  image: vault:1.8.2 \# vault binary is required for vault calls<br>  rules:<br>    - if: '$DEPLOY\_ENV == "dev" || $DEPLOY\_ENV == "qa" || $DEPLOY\_ENV == "ppe" || $DEPLOY\_ENV == "nonprod" '<br>      variables: \# Override AWS\_ACCOUNT\_ID defined<br>        AWS\_ACCOUNT\_ID: "205358287074"<br>    - if: '$DEPLOY\_ENV == "prod" '<br>      variables:<br>        AWS\_ACCOUNT\_ID: "259431915815"<br>  script:<br>    \#\#\# install curl<br>    - apk add --update python3 curl jq py3-pip<br>    - pip3 install --upgrade pip<br>    - pip3 install --no-cache-dir awscli<br>    - rm -rf /var/cache/apk/\*<br>    \#\#\# fetch the credentials from vault<br>    - export VAULT\_TOKEN="$(vault write -field=token auth/jwt/login role=${ASSERT\_ID}-aws jwt=$CI\_JOB\_JWT)" \# login into vault<br>    - vault list gitlab/$ASSERT\_ID/aws/roles \# list available aws roles<br>    - export AWS\_CREDS="$(vault read -format=json gitlab/${ASSERT\_ID}/aws/creds/${AWS\_ACCOUNT\_ID}-a${ASSERT\_ID}-developer)"<br>    - export AWS\_ACCESS\_KEY\_ID="$(echo ${AWS\_CREDS} | jq -r '.data.access\_key')"<br>    - export AWS\_SESSION\_TOKEN="$(echo ${AWS\_CREDS} | jq -r '.data.security\_token')"<br>    - export AWS\_SECRET\_ACCESS\_KEY="$(echo ${AWS\_CREDS} | jq -r '.data.secret\_key')"<br>    - aws sts get-caller-identity<br>    \#\#\# use the API to modify the value of the variables<br>    - 'curl --silent --output /dev/null --request PUT --header "PRIVATE-TOKEN: $PRIVATE\_TOKEN" "https://gitlab.sdp.refinitiv.com/api/v4/projects/${CI\_PROJECT\_ID}/variables/AWS\_CREDS" --form "value=${AWS\_CREDS}" '<br>    - 'curl --silent --output /dev/null --request PUT --header "PRIVATE-TOKEN: $PRIVATE\_TOKEN" "https://gitlab.sdp.refinitiv.com/api/v4/projects/${CI\_PROJECT\_ID}/variables/AWS\_ACCESS\_KEY\_ID" --form "masked=true" --form "value=${AWS\_ACCESS\_KEY\_ID}" '<br>    - 'curl --silent --output /dev/null --request PUT --header "PRIVATE-TOKEN: $PRIVATE\_TOKEN" "https://gitlab.sdp.refinitiv.com/api/v4/projects/${CI\_PROJECT\_ID}/variables/AWS\_SESSION\_TOKEN" --form "masked=true" --form "value=${AWS\_SESSION\_TOKEN}" '<br>    - 'curl --silent --output /dev/null --request PUT --header "PRIVATE-TOKEN: $PRIVATE\_TOKEN" "https://gitlab.sdp.refinitiv.com/api/v4/projects/${CI\_PROJECT\_ID}/variables/AWS\_SECRET\_ACCESS\_KEY" --form "masked=true" --form "value=${AWS\_SECRET\_ACCESS\_KEY}" '<br>\#    - env |


Push Image to ECR

1. need fetch-aws-credentials job first

1. gitlab-ci.yml

gitlab-ci-push-image-ecr

|   |
| - |
| variables:<br>  IMAGE\_TAG: "dx1test"<br>  \# push image to Bams<br>  BAMS\_REGISTRY: "bams-aws.refinitiv.com:5001"<br>  CACHESERVER\_IMAGE: "bams-aws.refinitiv.com:5001/timeseries/pricingsnapshot/pricingsnapshot-cache"<br>  \# push image to ECR<br>  AWS\_DEFAULT\_REGION: "us-east-1"<br>  AWS\_ECR\_REGISTRY: "205358287074.dkr.ecr.us-east-1.amazonaws.com"<br>  CACHESERVER\_DEV\_ECR: "205358287074.dkr.ecr.us-east-1.amazonaws.com/a250065-use1-dev-pricingsnapshot-cache-server"<br>  CACHESERVER\_QA\_ECR: "205358287074.dkr.ecr.us-east-1.amazonaws.com/a250065-use1-qa-pricingsnapshot-cache-server"<br>  CACHESERVER\_PPE\_ECR: "205358287074.dkr.ecr.us-east-1.amazonaws.com/a250065-use1-ppe-pricingsnapshot-cache-server"<br>  \# docker config for k8s runner<br>  DOCKER\_HOST: tcp://localhost:2375<br>  DOCKER\_TLS\_CERTDIR: ''<br> <br>stages:          \# List of stages for jobs, and their order of execution<br>  - push-image<br> <br>image-push:<br>  stage: push-image<br>  image:<br>    name: amazon/aws-cli:2.4.23<br>    entrypoint: [ "" ]<br>  services:<br>    - docker:20.10.12-dind<br>  before\_script:<br>    - sleep 10s<br>    - amazon-linux-extras install docker<br>    - aws --version<br>    - docker --version<br>    - docker login --username="-s.ts.auto" --password="TSAut0mat10n" bams-aws.refinitiv.com:5001<br>  script:<br>    - docker pull $CACHESERVER\_IMAGE:$IMAGE\_TAG<br>    - aws ecr get-login-password | docker login --username AWS --password-stdin $AWS\_ECR\_REGISTRY<br>    - docker tag $CACHESERVER\_IMAGE:$IMAGE\_TAG $CACHESERVER\_DEV\_ECR:$IMAGE\_TAG<br>    - docker push $CACHESERVER\_DEV\_ECR:$IMAGE\_TAG<br>    - docker tag $CACHESERVER\_IMAGE:$IMAGE\_TAG $CACHESERVER\_QA\_ECR:$IMAGE\_TAG<br>    - docker push $CACHESERVER\_QA\_ECR:$IMAGE\_TAG<br>    - docker tag $CACHESERVER\_IMAGE:$IMAGE\_TAG $CACHESERVER\_PPE\_ECR:$IMAGE\_TAG<br>    - docker push $CACHESERVER\_PPE\_ECR:$IMAGE\_TAG |




pipeline name TBA

https://gitlab.com/gitlab-org/gitlab/-/issues/27133
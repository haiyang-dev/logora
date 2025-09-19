https://github.com/lxyoutlook/concourse-pipeline-samples/blob/master/pipelines/docker/pks-kubectl-image/pipeline.yml

```javascript
var_sources:
  # ((auth-token)) is supplied by Refinitiv Concourse service
  - name: vault
    type: vault
    config:
      url: https://vault.sdp.refinitiv.com
      client_token: ((auth-token))

  # gitlab private token
  - name: vault-vars
    type: dummy
    config:
      vars:
        sami-git-privatetoken: ((vault:250065/kv/gitlab.gitlab_private_token))
        sami-git-privatekey: ((vault:250065/kv/gitlab.gitlab_private_key))

  # this is used to allow the pipeline to access vault
  # also used in the aws resource where it provides temporary AWS credentials
  - name: aws-sts
    type: dummy
    config:
      vars:
        preprod: ((vault:aws/sts/205358287074-a250065-developer))
        prod: ((vault:aws/sts/811138165248-a250065-developer))

  # bams
  - name: bams
    type: dummy
    config:
      vars:
        username: -s.ts.auto
        password: TSAut0mat10n

resources:
  # pricingsnapshot bams repository
  - name: pricingsnapshot-test-newman-bams
    type: docker-image
    icon: docker
    source:
      repository: bams-aws.refinitiv.com:5001/timeseries/pricingsnapshot/pricingsnapshot-test-newman
      tag: latest
      username: ((bams:username))
      password: ((bams:password))


  - name: pricingsnapshot-use1-dev-newman-ecr
    type: docker-image
    icon: docker
    source:
      repository: 205358287074.dkr.ecr.us-east-1.amazonaws.com/a250065-newman-snapshot-dev-main-use1
      tag: haiyang-test
      aws_access_key_id: ((aws-sts:preprod.access_key))
      aws_secret_access_key: ((aws-sts:preprod.secret_key))
      aws_session_token: ((aws-sts:preprod.security_token))
      aws_region: us-east-1

jobs:
  - name: push-image-from-bams-to-ecr
    plan:
      - get: pricingsnapshot-test-newman-bams
        params:
          save: true
      - put: pricingsnapshot-use1-dev-newman-ecr
        params:
          load: pricingsnapshot-test-newman-bams

```


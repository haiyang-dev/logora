https://docs.aws.amazon.com/cli/latest/reference/

https://awscli.amazonaws.com/v2/documentation/api/latest/reference/index.html#cli-aws



history version: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-version.html



```javascript
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```



```javascript
#copy s3
aws s3 cp ./aws_sdk_2020-09-23-12.log s3://a205143-use1-dev-ingest-sourcedata/logs/aws-logs/aws_sdk_2020-09-23-12.log
aws s3 cp s3://source-bucket/folder/ s3://destination-bucket/folder/ --recursive
aws s3 sync s3://source-bucket/folder/ s3://destination-bucket/folder/

```



```javascript
#list s3
aws s3 ls s3://a205143-terraform-state/use1/Development/applications/component-stack.states

aws s3 ls s3://a205143-terraform-state/use1/Development/applications/a205143-tick-storee-normalizer-metadata-loader.tfstate
```



```javascript
aws s3api head-object --bucket a205143-terraform-state --key use1/Development/applications/component-stack.states || not_exist=true
```





```javascript
#elb
aws elbv2 add-listener-certificates --listener-arn arn:aws:elasticloadbalancing:us-east-1:205358287074:listener/net/add325f70f0e84673a917d6e16f7dbec/b6b366c6f7f76c0d/36a793013abfb94a --certificates CertificateArn=arn:aws:acm:us-east-1:205358287074:certificate/198d52a9-46f6-4a82-884c-11f618065f23

aws elbv2 remove-listener-certificates --listener-arn arn:aws:elasticloadbalancing:us-west-2:123456789012:listener/app/my-load-balancer/50dc6c495c0c9188/f2f7dc8efc522ab2 --certificates CertificateArn=arn:aws:acm:us-west-2:123456789012:certificate/5cc54884-f4a3-4072-80be-05b9ba72f705

aws elbv2 modify-listener --listener-arn arn:aws:elasticloadbalancing:us-east-1:205358287074:listener/net/a240808f230b3479b88fba7b4ffe4283/59a4b58e5392e4da/32ee1e14fff08194 --certificates CertificateArn=arn:aws:acm:us-east-1:205358287074:certificate/9bccb1e3-42fc-4db9-a82f-e9a78bf59205
aws acm delete-certificate --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012
# enable access log
aws elbv2 modify-load-balancer-attributes --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:205358287074:loadbalancer/net/a004160cd36ff4a72a93c35a7fb6b433/2539017f465fc7d3 --attributes Key=access_logs.s3.enabled,Value=true Key=access_logs.s3.bucket,Value=a250065-nlb-log Key=access_logs.s3.prefix,Value=nlb
```



```javascript
#ecr
aws ecr get-login-password --region us-east-1
docker login --username AWS --password ${password} 205358287074.dkr.ecr.us-east-1.amazonaws.com
#examples
docker tag ${IMAGENAME}:${tagname} ${REPOECR}/${IMAGEECR}:${tagname}
    ${IMAGENAME}: bams-aws.refinitiv.com:5001/timeseries/pricingsnapshot/pricingsnapshot-cache
    ${REPOECR}: 205358287074.dkr.ecr.us-east-1.amazonaws.com
    ${IMAGEECR}: a250065-use1-qa-pricingsnapshot-cache-server
docker push ${REPOECR}/${IMAGEECR}:${tagname}
```



```javascript
#push image to Snapshot Prod use1
aws ssm start-session --target i-08687385f82ae2246

terraform destroy -target 

aws ecr get-login-password --region us-east-1
docker login --username AWS --password eyJwYXlsb2FkIjoiU1EyY21FUWZmNkNOTU94SGxodCt4T1QrdmRsU2pzVVlWSjhDNWhqWmRxRm40UXM3RnR2R3ZvUE8rU0JpbmMwOWthM2dsY3MrSlN4S3ZWZmFQd1hMSloxOEkrNDNSeWhhS2tyOXJIcnBBOXl3KzVWMGIxSWRmTk9sbWFZUFFIUlVRNER0SC80KzFZRmw1WGEzTEdsMVpibS9CN25oU29wUWozMTE0WG5JK0VSNzBxcWJybUtvbWtLNUkrZnUxQ1A3RDc0Y0w5dUs5K0hsQldMR1JNZHFZUzlkV3BSK1RvZytoS3o3bXBjUDk3Tkptc3BDR1NkcnArZEFGeCtEYzVqMmU1bmdnYktEbW1kZGtnaXVkcjhoQlMzWERIS0s1Wm1nUGR0b1VBd056TzFsTWRiTkdIRzMxMi9zVC9iVUxxZzNMdEhxMHZXS1JGbWloSy9rODlyMmh0Zll4bXVSeitCeEptN3FJWVhtSlZqTU9LbHloaHI1SStRbXNLbzQ4YlB4dFR1NGt0ZCtJTlhodHg4U09GSk8zZG1CZEM0QXRqZGdVc25BZ21MWFlTWHZjT3M3bzA1bStjTnFzZmhhZWxaZUN2WG12K2VxMUh5NkJMTmMyekEweTQ5YmVJVThpbUpZNVpyVVd0SjAvcGRmZyszYVpaNzBSWFRLK1RwVThSZjRPbkY4KzlGSzlrM3V6T3ZCeG9aK25zdXZoRGMzbWhtbExNYnpLQlN0Z2doWDhYYmpIODV5RUpnKzRXUzR1enlxYnVNS1JOYUZ1Rnc1UkZ2Ukc0Z0NVZGEzVkRFV0ZSMjR3ZGk3d3dURDEwK002aUJ3em1VN1pieDBRZHhJMWRXeVVkTE5sWVpmdlRaMTcrL2czZjl6Z01HNVM2Yk4vOUJnaXBFa0RtNTRORkpGWnUyelBuaCtuT29KTDcvYnZLaEJDanRLVTR6Mi9ORFVNVmFQVFIwOE1SNnArb1J5eEo0elMrdGtsQVdFaDV5ajUrUG9qTFlERFFtOUNCR1F3R1RBYTZPazFlRjFQdWw2MjNrS0dnN1JudVptdWhONG5jc0hCbTBkdGJwOG4yM2M2Vk1UajBYb2pMcDZTWW1iOFI2SmY5NnNueGwrLzc3MXJvT0hhR1FlWEN4aVh2bm1zL09Ea2VpdjliTkh4ZmZ6T0xuWEc4QXdCa1RRSXJpb3lTU3Jydlp0aHNkVWR3aEF2RUlYeUxUU2FSVmptZ3BSYjlpeHZ1UWVWRWg0MkhjNnZrU1pUUlAyUitFd0ZYcW9uTUxwaW5hNWhaUk9DMFd1TlB4bWVVRk9UMnpoMEJ0YmFsUC94bFBoVHZ2K0xtNDk1K1Z3amwzR0pzMmNMbDhWL0Q0aSt6Y0FIUzUxTk4zMzUxcW5rdkNsRmNVTk1kNTF1d2t5TWhvQytaMUdLSTBmaUJQWUZMWGVEeldaNDkxakFnL1hoa3BGcFFka0Urd0ZGRndPT1lmQU8wMG9WZlh1d1RBcFNYRHROL0JlS21FQ3pYVkNBcmZNNGpHY0c5bWpHaEZRNDBVSURNZnFzWVJ5alQraDZBSmh2akVoMUNQUTRKUlJ0cHF6VUVEcDFsQ3cvckZUSUwrWHpWWFhZcFVYR1Z1TWdrOXAvaXBvdm93S0pkdWdOTzFvKy96OSthQWh3LytoeHd1T0ZZNk9oRlpSTlVhTi9DU3FxREttWC80TzM4bW1ZVjU0eU1LV1p5UFhqUnZyRG80Nk8xaTVVV25sbldDSzEzWVhEZlZxTzdVZE1meHJDVTZCT0k3ZTBsZGdZYWF3d0hIVU1PWHM3SlNZUHkzTm5UNGhDYWtLdEhuYlZWNGtsOFd5VUtvSFJnbnZPdTZsVjBmbkVNdW1mT0VydElrek13PT0iLCJkYXRha2V5IjoiQVFFQkFIaHdtMFlhSVNKZVJ0Sm01bjFHNnVxZWVrWHVvWFhQZTVVRmNlOVJxOC8xNHdBQUFINHdmQVlKS29aSWh2Y05BUWNHb0c4d2JRSUJBREJvQmdrcWhraUc5dzBCQndFd0hnWUpZSVpJQVdVREJBRXVNQkVFREw3NUMvZ2N2ZFBUVHM1aE1BSUJFSUE3bDR6YXUrekxJWERTMCs5aDV6NjlEdGhaOXBYZjFuaE5kazUxdlJIbnRGSEk0WThLYVo5RTRVS2tjSk1aTDFubDVyaGtPdDZ2aFpQWE0vST0iLCJ2ZXJzaW9uIjoiMiIsInR5cGUiOiJEQVRBX0tFWSIsImV4cGlyYXRpb24iOjE2NDAyNjU1ODh9 259431915815.dkr.ecr.us-east-1.amazonaws.com

docker pull bams-aws.refinitiv.com:5001/timeseries/pricingsnapshot/pricingsnapshot-cache:R2021-25-18
docker tag bams-aws.refinitiv.com:5001/timeseries/pricingsnapshot/pricingsnapshot-cache:R2021-25-18   259431915815.dkr.ecr.us-east-1.amazonaws.com/a250065-use1-prod-pricingsnapshot-cache-server:R2021-25-18
docker push 259431915815.dkr.ecr.us-east-1.amazonaws.com/a250065-use1-prod-pricingsnapshot-cache-server:R2021-25-18

docker pull bams-aws.refinitiv.com:5001/timeseries/pricingsnapshot/pricingsnapshot-cache-scaler:R2021-25-10
docker tag bams-aws.refinitiv.com:5001/timeseries/pricingsnapshot/pricingsnapshot-cache-scaler:R2021-25-10 259431915815.dkr.ecr.us-east-1.amazonaws.com/a250065-use1-prod-pricingsnapshot-cache-scaler:R2021-25-10
docker push 259431915815.dkr.ecr.us-east-1.amazonaws.com/a250065-use1-prod-pricingsnapshot-cache-scaler:R2021-25-10

docker pull bams-aws.refinitiv.com:5001/timeseries/pricingsnapshot/pricingsnapshot-web:R2021-26-3
docker tag bams-aws.refinitiv.com:5001/timeseries/pricingsnapshot/pricingsnapshot-web:R2021-26-3 259431915815.dkr.ecr.us-east-1.amazonaws.com/a250065-use1-prod-pricingsnapshot-web-server:R2021-26-3
docker push 259431915815.dkr.ecr.us-east-1.amazonaws.com/a250065-use1-prod-pricingsnapshot-web-server:R2021-26-3


```



```javascript
#export json
aws apigateway get-export --parameters extensions='apigateway' --rest-api-id r3tbqziid6 --stage-name dev --export-type oas30 latestswagger2.json
```





```javascript
#connect ec2
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_64bit/session-manager-plugin.rpm" -o "session-manager-plugin.rpm"
sudo yum install -y session-manager-plugin.rpm
aws ssm start-session --target id-of-an-instance-you-have-permissions-to-access
sudo yum erase session-manager-plugin -y
```



```javascript
#auto scaling group
aws autoscaling update-auto-scaling-group --auto-scaling-group-name
--min-size 0 --max-size 0 --desired-capacity 0

aws autoscaling update-auto-scaling-group --auto-scaling-group-name a250065-pricingsnapshot-qa-use1-cassandra-group-a20210126100250964500000023 --min-size 0 --max-size 0 --desired-capacity 0
aws autoscaling update-auto-scaling-group --auto-scaling-group-name a250065-pricingsnapshot-qa-use1-cassandra-group-b20210126100250961300000020 --min-size 0 --max-size 0 --desired-capacity 0
aws autoscaling update-auto-scaling-group --auto-scaling-group-name a250065-pricingsnapshot-qa-use1-web-group2021012610025096110000001f --min-size 0 --max-size 0 --desired-capacity 0
aws autoscaling update-auto-scaling-group --auto-scaling-group-name a250065-pricingsnapshot-qa-use1-cache-group-b20210126100250968600000024 --min-size 0 --max-size 0 --desired-capacity 0
aws autoscaling update-auto-scaling-group --auto-scaling-group-name a250065-pricingsnapshot-qa-use1-cassandra-group-c20210126100250964000000022 --min-size 0 --max-size 0 --desired-capacity 0
aws autoscaling update-auto-scaling-group --auto-scaling-group-name a250065-pricingsnapshot-qa-use1-cache-group-a-blue20210126100250962100000021 --min-size 0 --max-size 0 --desired-capacity 0
```



```javascript
check ec2 instance type offerings
aws ec2 describe-instance-type-offerings --location-type availability-zone-id  --filters Name=instance-type,Values=c5a.16xlarge --region us-east-1 --output table
aws ec2 describe-instance-type-offerings --location-type availability-zone-id  --filters Name=instance-type,Values=m5a.8xlarge --region us-east-1 --output table
aws ec2 describe-instance-type-offerings --location-type availability-zone-id  --filters Name=instance-type,Values=m5.8xlarge --region us-east-1 --output table
aws ec2 describe-instance-type-offerings --location-type availability-zone-id  --filters Name=instance-type,Values=m5a.4xlarge --region us-east-1 --output table
```

nlb target attributes 

```javascript
aws elbv2 modify-target-group-attributes --target-group-arn arn:aws:elasticloadbalancing:us-east-1:205358287074:targetgroup/k8s-ingressn-ingressn-f404c56bde/4236c023d530b448 --attributes Key=proxy_protocol_v2.enabled,Value=true
aws elbv2 modify-target-group-attributes --target-group-arn arn:aws:elasticloadbalancing:us-east-1:205358287074:targetgroup/k8s-ingressn-ingressn-2e93659510/b5d91174e2af182a --attributes Key=deregistration_delay.connection_termination.enabled,Value=true
```

cloudwatch alarm to ok

```javascript
aws cloudwatch set-alarm-state --alarm-name "a250065-dr-system-health-check-alarm-pricingsnapshot-dev-use1" --state-value OK --state-reason "testing purposes"
```

check CSI

```javascript
#check avaliable CSI driver for this cluster
aws eks describe-addon-versions --addon-name aws-ebs-csi-driver --region us-east-1
#check ebs csi installed or not
aws eks describe-addon --cluster-name a206160-tscc-is-qa-main-use1 --addon-name aws-ebs-csi-driver --query "addon.addonVersion" --output text
# get OIDC token
aws eks describe-cluster --name a206160-tscc-is-dev-main-use1 --query "cluster.identity.oidc.issuer" --output text | cut -d '/' -f 5
```

获取 eks token

```javascript
aws eks get-token --cluster-name a250065-pricingsnapshot-dev-use1 --region us-east-1 --output text --query 'status.token'

aws eks describe-cluster --name a250065-pricingsnapshot-dev-use1
```



```javascript
aws lambda delete-event-source-mapping --uuid f91decac-9ec0-4e45-a15d-7675fa2d417c --region us-east-2
```

secrets manager force delete

```javascript
aws secretsmanager delete-secret --secret-id 'a206160-rto-tscc-is-qa-apse1' --force-delete-without-recovery --region ap-southeast-1
```


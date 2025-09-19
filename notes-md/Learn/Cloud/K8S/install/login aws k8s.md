# pull docker image from bams

docker pull bams-aws.refinitiv.com:5001/timeseries/normalizer/normalizer_init 

docker pull bams-aws.refinitiv.com:5001/timeseries/normalizer/normalizer

 

 



# tag docker image

docker tag bams-aws.refinitiv.com:5001/timeseries/normalizer/normalizer_init 205358287074.dkr.ecr.us-east-1.amazonaws.com/a205143-normalizer-init-config-normalizer-dev-main-use1

 

docker tag bams-aws.refinitiv.com:5001/timeseries/normalizer/normalizer 205358287074.dkr.ecr.us-east-1.amazonaws.com/a205143-normalizer-normalizer-dev-main-use1

 

 

# login aws

cloud-tool-fr --region us-east-1 -vvv  login --role human-role/a205143-Developer --account-id 205358287074 --username 'MGMT/m6079496' --password 'password'

 

 

# login docker

aws ecr get-login --no-include-email --region us-east-1 --profile edp-tick-sdlc-preprod



new version need below

 aws ecr get-login-password --region us-east-1 --profile edp-tick-sdlc-preprod



# 上一步命令会输出类似这样的东西， 全复制下来粘贴到terminal里执行一下

docker login -u AWS -p eyJwYXlsb2FkIjoieG9VMm9taFFDY08vOVdTMEczMlV5TXZCRTluaTVVZjBXQVFITlRBODFyMzY4OEpjKzNSZXUrUUF4eUV4Yi9lb3lWWjR0QTBmMUZ4K01UUnRZTUZRQ000cklOaVV0NmU3NmJpT1JRdCtVNkNWUFpyUEJWazlQY3ZVYk9HY1c3WG9STFRtbXRiQ0JtNG9ZL3ljVVhTWDFwMEpVT3VKaWp3VjRvRzZNK2RJeU5BeUxGOUs3UTZEUWgyVFJJcGdNaFpuTDVhR3Y2aU4zUUY2TlBXcGozbU00RHQyZ2tKb0JGa2dUdTVyMlZuQkUzaTFPeGx5RFZ3QmRaNTNhUzZYU2k5bHBTbmpWZ3NjMGpMR2hSbkhYcVpvRVAxdzEvK1hmTno1OGloQnpaUk1NQmQ5TWhjSHUzZkpOOGZSN0tJWk1EVDcxVkQ4L2dWcWRaZ291a1UreHAybDUzeTRxYkwxYmpyTWRpQXhoRHVvOUcrYVNIR1JzRGF6MjRZTFZ2UTVKRWRjVnZuMTV4UXk3VkQreGxxYnVRMXhXZ2NLdkV2WlFoTlVhVlpVdVhxZFF5bXNUVVdzTzM0clpxaEhSbjNmay81UHEyNnJQaGVaQ0M0M3FHcmlZOEtCaGlNM2EwOEhYNE1YaGdMT0s2WmxNZlhpRDhLMWJ1MSsrTzZMZFd5alUzRUlONlo3MDRuUDRZbE00QnlTV1hXcSs5bjQySGFlT0JxVFRMaUR6UVloSlJZaGx1cXVRRTRmcUh5cDIyWXRKQ3ZtUXhNaXZQdEp3NElNNnJVMEhtTHV0Y2hGbUhzUUlZdTZOSjRDZnUxZzBVTHkrOXl2a2dZaDI4clQ3dTFUWUs3eDdock1rbExaaE8wMk55M2VGUlJtWlJrT1hOeUgyYlBKbTY4aVVzVFo2TVlWR0NwZGdES202OERQMmZkWWEreGYrRkR2RnJUbGkvZjB2RlhzdU5GMFVFTGJTQ1dLZnhtY0ZmYkk3VGRTUnZuMFVHTDhqdXpjREVEZzEzbjhJcjNkMmVpUUFidFIyV05xQjRtczlTVGhUNVJQUG5kQ0R1NEs1TXBDeUNlUlBVS3dKWk1uazhYMjZHb2ZKT25qcFo4eWVHcmFPeWhVYmJ3dW56TFFpQVUxQ3liR0krWFhhRGsrRG5OaHllNDFZcWtQWTJRWnlZU211UG9YdWN4ZCtWWDF2RVhGa0tGWkNDeDBIM2doZy9xVWpqUGpSaHh6K2lzMFdrT09CNmI2aDF1U1B4dDFIb21OZlRXVjBOaVVaL2RBVXNDQnhBUWFYSlJwcktFd005NXdBdmxmVnFINTJUZG1uS1cxdXVvZVhpY3ZxakQ1K0NwUnZRWXN6S3Q1b1pXUkhCNEVXMC9kTk1qSmVLNDBKWk5PbGZsQm5vSTRDOFQ0cHVMSGNXaHNmWHVpVUgxdmdCTVFhYkhPeWpWQ2h1TEh0a0NyVXByRTBFT1Y0T2lFTWZjUC9XRldEZDgzdTJlbE41MERpYldnYk9PeHMveVFDUUpUbUJZaWtRWHp0ZWNuRGpzMzBNeUNNUFJzeDJmSlYySG9IWElEcHNyQkVSVmVUM0xvWjdqbHJkbWhxVUZRdlNySWNHdkl2RkljNlJ2eHpKMi9QS3dvT0xPUjBGMTVsZW9OWU5aSzR6a3luTVRBdnJnc1RFUll2b3A4a2RYNFNpMFYvSkVQVUQwK0hWWS90R0lRYUFIMGhqa3dJM1lHN1Jab21wNHZKOER0OURSM1cwYWNCU2RVUFQ4Z3B2VXJLR2NLK1F2K25rM3NseGlkNFh6RmFmMmtBTUlZOXdKRDZwb1F5R3hJZzhrRFJPbU9MK3F6Qk93OGtlSyt4RlZOVmdlM2FoSmlVUVRSSUwwUXpKOStLcDkrV1R1akJyTEcycFNxenROZDIyLzVlbzBEVldXekt2L3dHQnpZeHVoWnQzK045T2xsYUZNVEZ4YzZGNXlOOFJCUEl0SGpWN2tnbkRDVnU1M3ZqUkRROHBnQUtCMHBlT3Rtdm9jekpNUlJXQ0U9IiwiZGF0YWtleSI6IkFRRUJBSGh3bTBZYUlTSmVSdEptNW4xRzZ1cWVla1h1b1hYUGU1VUZjZTlScTgvMTR3QUFBSDR3ZkFZSktvWklodmNOQVFjR29HOHdiUUlCQURCb0Jna3Foa2lHOXcwQkJ3RXdIZ1lKWUlaSUFXVURCQUV1TUJFRURBWERtZzdsWDM1dUxEL2hiQUlCRUlBN1lTY0xaZEtISklTLzJPWGNuMjlEUjF1Wkp6ZmFVS2t2SkVDc3k0dEZ1ZDlUak00citSOTRhN2tuNmlGY0htUXhYbkhpWmlMLzQxUDJzZkE9IiwidmVyc2lvbiI6IjIiLCJ0eXBlIjoiREFUQV9LRVkiLCJleHBpcmF0aW9uIjoxNTk4MDIzMzUwfQ== https://205358287074.dkr.ecr.us-east-1.amazonaws.com

 

 



# push docker image to ecr 

docker push 205358287074.dkr.ecr.us-east-1.amazonaws.com/a205143-normalizer-init-config-normalizer-dev-main-use1

docker push 205358287074.dkr.ecr.us-east-1.amazonaws.com/a205143-normalizer-normalizer-dev-main-use1

 

 Control the AWS EKS Cluster

The way of control EKS is similar with above, 

The only difference is 

1. You need to install aws-iam-authenticator firstly refer to https://docs.aws.amazon.com/zh_cn/eks/latest/userguide/install-aws-iam-authenticator.html. I listed the command list as follows for quick installing.

|   |
| - |
| \# Step 1: Open a administrator PowerShell, run following code to install choco<br>Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))<br>\# Step 2: install aws-iam-authenticator<br>choco install -y aws-iam-authenticator<br>\# Step 3: Verify<br>aws-iam-authenticator help |


2. You need to make sure the cloudtool installed and run command similar to follows to get the permission to visit the AWS.

|   |
| - |
| cloud-tool-fr --profile "default" login --username "MGMT\\M6034830" --password "CScfPCcj7JjfNo4c" |


3. Config the config file refer to https://docs.aws.amazon.com/zh_cn/eks/latest/userguide/create-kubeconfig.html

|   |
| - |
| C:\\tmp\\K8S\\EKS&gt;aws eks get-token --cluster-name jason-eks-test<br>{"kind": "ExecCredential", "apiVersion": "client.authentication.k8s.io/v1alpha1", "spec": {}, "status": {"expirationTimestamp": "2020-07-20T07:25:50Z", "token": "k8s-aws-v1.aHR0cHM6Ly9zdHMuYW1hem9uYXdzLmNvbS8\_QWN0aW9uPUdldENhbGxlcklkZW50aXR5JlZlcnNpb249MjAxMS0wNi0xNSZYLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFTSUFTN1VDT1pEUkFBUFlPVVBRJTJGMjAyMDA3MjAlMkZ1cy1lYXN0LTElMkZzdHMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDIwMDcyMFQwNzExNTBaJlgtQW16LUV4cGlyZXM9NjAmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JTNCeC1rOHMtYXdzLWlkJlgtQW16LVNlY3VyaXR5LVRva2VuPUZ3b0daWEl2WVhkekVJSCUyRiUyRiUyRiUyRiUyRiUyRiUyRiUyRiUyRiUyRndFYUREJTJGcnVCZDRsOGtGWXBESzd5TG1BY2dxVjNsdXJ2cU1oYkZmWk1pNlV1YUdFY2E5YjNSeHF5TVdYVGMzeE1FWjVLclBsc0FZJTJGUWZaR0QxejVPSXVNQUZlJTJCVDZHSjhNU1poTHFybmcxOUpwcVI5SU95ZFBTYlM4bCUyRjFEUW5waWpMZkpmWHI3S0twZ3hTMCUyRmFUZlFQRmZYZWElMkI2R3RSZ25xalUlMkJMNHAlMkJHbUNhakVoVyUyRklTUUpLdVZxa3dRJTJGakdyVURkM2xSVjhON00xaExzRmJqVTY0RVlGUGRBeiUyQjZrJTJGNzRHUENIRzRObEFBeThEV05MN2NJMzdhUWl5VExZOEN1aG5TOXBoNG1VWU0zb3kwc3owZElVYiUyQnMxNjVGZDNTRHZNTmZBaSUyQjVTSXNmRUNhSFdXZzFQV2UyZ0lhem41S01RVkIxb3NXS095RDFmZ0ZNakpLbTQlMkZQY3VVS20wMWU4JTJGVEJ0UTBoQ3lxY29mM0lsaDdncEJVN29KYkFDdGt5OVRZMjRTRjdZJTJGbzFmRjhYZllVbm93JTNEJTNEJlgtQW16LVNpZ25hdHVyZT1kZTQ2NWE3MjNlZjhkOTI5OGJjOTZkYjRjMmM5NzNlNzVlYTA4OTRhYWQxNjg4OWQyM2MwYTUxNzllZmI3Mjll"}} |


4. Make sure using your AWS CLI version larger than 1.16.244, you can just upgrade your aws cli version by running pip install or pip upgrade



# 连接到eks,参考https://confluence.refinitiv.com/display/TSDEV/2020.07.13+-+Differentiate+Environment+in+K8S+Cluster里的“Control the AWS EKS Cluster”，具体可以咨询Jason

 

aws eks --region ‘region-code’ update-kubeconfig --name ‘cluster_name’

aws eks --region ‘us-east-1’ update-kubeconfig --name ‘a205143-normalizer-dev-use1’



https://docs.aws.amazon.com/zh_cn/eks/latest/userguide/create-kubeconfig.html



# 然后到cloudwatch里看metric就行了
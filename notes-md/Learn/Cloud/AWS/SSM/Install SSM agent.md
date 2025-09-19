https://docs.aws.amazon.com/zh_cn/systems-manager/latest/userguide/sysman-manual-agent-install.html



policy: AmazonSSMManagedInstanceCore

Install cmd:

sudo yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm



status check:

sudo status amazon-ssm-agent

sudo start amazon-ssm-agent
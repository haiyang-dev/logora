 https://docs.aws.amazon.com/zh_cn/AmazonCloudWatch/latest/monitoring/installing-cloudwatch-agent-commandline.html

Policy: 

CloudWatchAgentServerPolicy  CloudWatchAgentAdminPolicy 





配置文件路径    /opt/aws/amazon-cloudwatch-agent/doc



建议 /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json



启动服务

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:configuration-file-path -s



追加

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a append-config -m ec2 -c file:/tmp/app.json -s



sudo status amazon-cloudwatch-agent

sudo start amazon-cloudwatch-agent

sudo stop amazon-cloudwatch-agent



cwagentconfig.json

https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html


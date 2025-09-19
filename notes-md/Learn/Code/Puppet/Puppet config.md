path 

/etc/puppetlabs/puppet/puppet.config



https://refinitiv.sharepoint.com/teams/DeploymentandAutomation/SitePages/Puppet-agent-bootstrap.aspx



windows

C:\ProgramData\PuppetLabs\puppet\etc



改master

打开config, 修改server, 

删除ssl文件夹



Linux

vim  /etc/puppetlabs/puppet/puppet.conf

# change the puppet master in the puppet.conf and wq

cp /var/lib/puppet/ssl /var/lib/puppet/your_bakup_folder

rm -rf /var/lib/puppet/ssl



ssl 在git 

ets_tools\deployment\



windows

C:\ProgramData\PuppetLabs\puppet
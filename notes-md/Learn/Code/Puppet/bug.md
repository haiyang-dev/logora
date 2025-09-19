Error: Missing required MD5 file - http://file.emea.nonprod.puppet.int.thomsonreuters.com/artifactory/default.generic.global/timeseries/ets/intraday/collection/Ingestor/ingestor_1.0.3.2966.rpm.md5

Error: Could not set 'present' on ensure: undefined method `slice' for false:FalseClass at /platform/components/compass_deployment_automation/cda_agent/1_6_3/modules/cda/manifests/addpkg.pp:217

Error: Could not set 'present' on ensure: undefined method `slice' for false:FalseClass at /platform/components/compass_deployment_automation/cda_agent/1_6_3/modules/cda/manifests/addpkg.pp:217

Wrapped exception:

undefined method `slice' for false:FalseClass





用sudo 运行puppet agent -t







Notice: /File[/var/lib/puppet/lib/puppetdb/lexer.rex]: Dependency File[/var/lib/puppet/lib] has failures: true


Warning: /File[/var/lib/puppet/lib/puppetdb/lexer.rex]: Skipping because of failed dependencies


Notice: /File[/var/lib/puppet/lib/puppetdb/parser.rb]: Dependency File[/var/lib/puppet/lib] has failures: true


Warning: /File[/var/lib/puppet/lib/puppetdb/parser.rb]: Skipping because of failed dependencies


Notice: /File[/var/lib/puppet/lib/puppetdb/util.rb]: Dependency File[/var/lib/puppet/lib] has failures: true


Warning: /File[/var/lib/puppet/lib/puppetdb/util.rb]: Skipping because of failed dependencies


Info: Loading facts


Error: Could not retrieve catalog from remote server: Find /puppet/v3/catalog/c359mmhdcin01.int.thomsonreuters.com?environment=ets_ingt_3_5_4&facts_format=p... resulted in 404 with the message: {"message":"Not Found: Could not find environment 'ets_ingt_3_5_4'","issue_kind":"RUNTIME_ERROR"}


Warning: Not using cache on failed catalog


Error: Could not retrieve catalog; skipping run




解决方案 goto /etc/puppetlabs/puppet # vim puppet.conf， 删除掉版本行environment = ets_ingt_3_5_4， 原因是太老了上面已经没有这个版本



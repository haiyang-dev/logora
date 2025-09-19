1. download exe

https://releases.hashicorp.com/terraform/0.12.16/

2.set system environment Variables

1. o to Control Panel -> System -> System settings -> Environment Variables.

1. Scroll down in system variables until you find PATH.

1. Click edit and change accordingly.

1. BE SURE to include a semicolon at the end of the previous as that is the delimiter, i.e. c:\path;c:\path2

1. Launch a new console for the settings to take effect.

3.run terraform -version





https://learn.hashicorp.com/tutorials/terraform/install-cli



```javascript
#!/bin/bash

terraform_version=$1
terraform_tmp_dir=/tmp/terraform/tscc_is/${terraform_version}

terraform_url=https://releases.hashicorp.com/terraform/${terraform_version}/terraform_${terraform_version}_linux_amd64.zip

if [[ ! -f "${terraform_tmp_dir}/terraform" ]]; then
  curl -O ${terraform_url}
  mkdir -p ${terraform_tmp_dir}
  unzip terraform_${terraform_version}_linux_amd64.zip -d ${terraform_tmp_dir}
fi

cp ${terraform_tmp_dir}/terraform ./
chmod +x ./terraform
```


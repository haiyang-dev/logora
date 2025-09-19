```shell
#!/bin/bash

# 源区域和账户信息
src_region="us-east-1"
src_account="205358287074.dkr.ecr.us-east-1.amazonaws.com"

# 目标区域和账户信息
declare -A dst_regions_accounts=( ["eu-west-1"]="205358287074.dkr.ecr.eu-west-1.amazonaws.com" ["ap-southeast-1"]="205358287074.dkr.ecr.ap-southeast-1.amazonaws.com" )

# 区域后缀映射
declare -A region_suffixes=( ["eu-west-1"]="euw1" ["ap-southeast-1"]="apse1" )

# 镜像列表
declare -a images=( "a206160-auxiliary-tscc-is-dev-use1:dx1_test08" "a206160-ecr-tscc-is-dev-use1:dx1_test06" "a206160-inspector-tscc-is-dev-use1:R2024-06-03" "a206160-cloudwatch-agent-tscc-is-dev-use1:1.247354.0b251981" )

# 登录到源ECR
aws ecr get-login-password --region $src_region | docker login --username AWS --password-stdin $src_account

# 遍历每个目标区域
for dst_region in "${!dst_regions_accounts[@]}"; do
  dst_account=${dst_regions_accounts[$dst_region]}
  region_suffix=${region_suffixes[$dst_region]}

  # 登录到目标ECR
  aws ecr get-login-password --region $dst_region | docker login --username AWS --password-stdin $dst_account

  # 遍历每个镜像
  for image in "${images[@]}"; do
    src_image="$src_account/$image"

    # 根据目标区域修改镜像名称
    dst_image="${image//-use1/-$region_suffix}"

    dst_image="$dst_account/$dst_image"

    # 拉取源镜像
    docker pull $src_image

    # 标记镜像
    docker tag $src_image $dst_image

    # 推送镜像到目标ECR
    docker push $dst_image
  done
done

```

```shell
#!/bin/bash

# 源区域和账户信息
src_region="us-east-1"
src_account="205358287074.dkr.ecr.us-east-1.amazonaws.com"

# 目标区域和账户信息
declare -A dst_regions_accounts=( ["us-east-1"]="205358287074.dkr.ecr.us-east-1.amazonaws.com" ["eu-west-1"]="205358287074.dkr.ecr.eu-west-1.amazonaws.com" ["ap-southeast-1"]="205358287074.dkr.ecr.ap-southeast-1.amazonaws.com" )

# 镜像列表
declare -a images=( "a206160-auxiliary-tscc-is-dev-use1:dx1_test08" "a206160-ecr-tscc-is-dev-use1:dx1_test06" "a206160-inspector-tscc-is-dev-use1:R2024-06-03" "a206160-cloudwatch-agent-tscc-is-dev-use1:1.247354.0b251981" )

# 登录到源ECR
aws ecr get-login-password --region $src_region | docker login --username AWS --password-stdin $src_account

# 遍历每个目标区域
for dst_region in "${!dst_regions_accounts[@]}"; do
  dst_account=${dst_regions_accounts[$dst_region]}
  echo $dst_account

  # 登录到目标ECR
  aws ecr get-login-password --region $dst_region | docker login --username AWS --password-stdin $dst_account

  # 遍历每个镜像
  for image in "${images[@]}"; do
    echo $image
    src_image="$src_account/$image"
    
	dst_image_qa=""
	dst_image_dev=""
	dst_image_dev_full=""
	dst_image_qa_full=""
	
    # 根据目标区域修改镜像名称
    if [[ $dst_region == "us-east-1" ]]; then
      dst_image_qa="${image//-dev-use1/-qa-use1}"
    elif [[ $dst_region == "eu-west-1" ]]; then
      dst_image_dev="${image//-dev-use1/-dev-euw1}"
      dst_image_qa="${image//-dev-use1/-qa-euw1}"
    elif [[ $dst_region == "ap-southeast-1" ]]; then
      dst_image_dev="${image//-dev-use1/-dev-apse1}"
      dst_image_qa="${image//-dev-use1/-qa-apse1}"
    fi

    # 拉取源镜像
    docker pull $src_image

    # 如果存在dev镜像，标记并推送dev镜像
    if [[ -n $dst_image_dev ]]; then
      dst_image_dev_full="$dst_account/$dst_image_dev"
      docker tag $src_image $dst_image_dev_full
      docker push $dst_image_dev_full
    fi

    # 如果存在QA镜像，标记并推送QA镜像
    if [[ -n $dst_image_qa ]]; then
      dst_image_qa_full="$dst_account/$dst_image_qa"
      docker tag $src_image $dst_image_qa_full
      docker push $dst_image_qa_full
    fi
  done
done

```
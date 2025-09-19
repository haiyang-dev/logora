https://github.com/kubernetes/kubernetes/issues/65500

Anyone struggling with this issue in EKS especially with statefulsets, EBS and Pending state,

a) Find the volumeid associated with PVC, then execute

b) aws ec2 detach-volume --volume-id vol-1234567890abcdef0 --force

c) The statefulset will now recover from Pending state
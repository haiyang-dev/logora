module "s3_bucket" {

  source = "terraform-aws-modules/s3-bucket/aws"

  version = "2.0.0"

谨慎使用官方module， 如果使用，记得加version
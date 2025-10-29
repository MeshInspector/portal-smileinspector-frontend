provider "aws" {
  region = var.aws_region
}

provider "aws" {
  alias  = "certificate_region"
  region = var.certificate_region
}

module "s3" {
  source = "../../modules/s3"

  environment          = "prod"
  bucket_name          = var.bucket_name
  cloudfront_oai_arn   = module.cloudfront.oai_arn
  create_bucket_policy = true
  tags                 = var.tags
}

module "cloudfront" {
  source = "../../modules/cloudfront"

  environment                    = "prod"
  domain_name                    = var.domain_name
  bucket_name                    = var.bucket_name
  s3_bucket_regional_domain_name = module.s3.frontend_bucket_regional_domain_name
  acm_certificate_arn            = var.certificate_arn
  distribution_comment           = var.distribution_comment
  tags                           = var.tags
}

module "route53" {
  source = "../../modules/route53"

  domain_name               = var.domain_name
  hosted_zone_id            = var.hosted_zone_id
  domain_validation_options = []
  cloudfront_domain_name    = module.cloudfront.domain_name
  cloudfront_hosted_zone_id = module.cloudfront.hosted_zone_id
  tags                      = var.tags
}

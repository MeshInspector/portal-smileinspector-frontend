provider "aws" {
  region = var.aws_region
  alias  = "global"
}

provider "aws" {
  alias  = "certificate_region"
  region = var.certificate_region
}

# Reference to auth-infrastructure remote state
data "terraform_remote_state" "auth" {
  backend = "s3"
  config = {
    bucket = "adalisk-terraform-state-prod"
    key    = "cloud-team/prod/auth-infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}

# Reference to cms-auth-infrastructure remote state
data "terraform_remote_state" "cms_auth" {
  backend = "s3"
  config = {
    bucket = "adalisk-terraform-state-prod"
    key    = "cloud-team/prod/cms-auth-infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}

module "s3" {
  source = "../../modules/s3"

  environment = "prod"
  bucket_name = var.bucket_name
  cloudfront_oai_arn = module.cloudfront.oai_arn
  create_bucket_policy = true
  tags = var.tags
}

module "cloudfront" {
  source = "../../modules/cloudfront"

  environment                  = "prod"
  domain_name                  = var.domain_name
  bucket_name                  = var.bucket_name
  s3_bucket_regional_domain_name = module.s3.frontend_bucket_regional_domain_name
  acm_certificate_arn          = var.certificate_arn

  auth_s3_bucket_name          = var.auth_bucket_name
  auth_s3_website_endpoint     = var.auth_s3_website_endpoint

  # Lambda@Edge function ARNs
  auth_uri_formatter_lambda_arn    = data.terraform_remote_state.auth.outputs.lambda_function_version_arns.auth-uri-formatter
  signout_handler_lambda_arn       = data.terraform_remote_state.auth.outputs.lambda_function_version_arns.sign-out
  parse_auth_handler_lambda_arn    = data.terraform_remote_state.auth.outputs.lambda_function_version_arns.parse-auth
  refresh_auth_handler_lambda_arn  = data.terraform_remote_state.auth.outputs.lambda_function_version_arns.refresh-auth
  check_auth_handler_lambda_arn    = data.terraform_remote_state.cms_auth.outputs.lambda_function_version_arns.check-auth
  http_headers_handler_lambda_arn  = data.terraform_remote_state.auth.outputs.lambda_function_version_arns.http-headers

  tags                         = var.tags
  distribution_comment         = var.distribution_comment
}

module "route53" {
  source = "../../modules/route53"

  domain_name                = var.domain_name
  hosted_zone_id             = var.hosted_zone_id
  domain_validation_options  = []
  cloudfront_domain_name     = module.cloudfront.domain_name
  cloudfront_hosted_zone_id  = module.cloudfront.hosted_zone_id
  tags                       = var.tags
}

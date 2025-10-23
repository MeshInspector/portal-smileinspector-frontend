variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket for static website hosting"
  type        = string
  default     = "cms-smileinspector-prod-frontend"
}

variable "domain_name" {
  description = "Domain name for the frontend (e.g., cms.smileinspector.io)"
  type        = string
  default     = "cms.smileinspector.io"
}

variable "hosted_zone_id" {
  description = "ID of the Route53 hosted zone"
  type        = string
  default     = "Z05016998N4BRDWUZN3X"
}

variable "certificate_region" {
  description = "AWS region for the ACM certificate"
  type        = string
  default     = "us-east-1"
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate"
  type        = string
  default     = "arn:aws:acm:us-east-1:662635244517:certificate/f07e9a65-f5de-4a7c-b069-823151fc7ce5"
}

variable "certificate_domain" {
  description = "Domain pattern for the ACM certificate"
  type        = string
  default     = "*.smileinspector.io"
}

variable "auth_bucket_name" {
  description = "Name of the S3 bucket for authentication SPA"
  type        = string
  default     = "auth.smileinspector.io"
}

variable "auth_s3_website_endpoint" {
  description = "S3 website endpoint for authentication SPA"
  type        = string
  default     = "auth.smileinspector.io.s3-website-us-east-1.amazonaws.com"
}

# Lambda@Edge function ARNs
variable "auth_uri_formatter_lambda_arn" {
  description = "ARN of the Lambda@Edge function for formatting auth URIs"
  type        = string
  default     = ""
}

variable "signout_handler_lambda_arn" {
  description = "ARN of the Lambda@Edge function for handling sign out"
  type        = string
  default     = ""
}

variable "parse_auth_handler_lambda_arn" {
  description = "ARN of the Lambda@Edge function for parsing authentication"
  type        = string
  default     = ""
}

variable "refresh_auth_handler_lambda_arn" {
  description = "ARN of the Lambda@Edge function for refreshing authentication"
  type        = string
  default     = ""
}

variable "check_auth_handler_lambda_arn" {
  description = "ARN of the Lambda@Edge function for checking authentication"
  type        = string
  default     = ""
}

variable "http_headers_handler_lambda_arn" {
  description = "ARN of the Lambda@Edge function for handling HTTP headers"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    Environment = "prod"
    Team        = "cloud-team"
    ManagedBy   = "Terraform"
    Service     = "cms-service"
    Category    = "cms"
    Project     = "SmileInspector"
  }
}

variable "distribution_comment" {
  description = "Comment/description for the CloudFront distribution"
  type        = string
  default     = "CMS Prod App"
}

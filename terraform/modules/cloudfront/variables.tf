variable "environment" {
  description = "Environment (dev or prod)"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the frontend (e.g., cms.dev.smileinspector.io)"
  type        = string
}

variable "bucket_name" {
  description = "Name of the S3 bucket for static website hosting"
  type        = string
}

variable "s3_bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "auth_s3_website_endpoint" {
  description = "S3 website endpoint for authentication SPA (e.g., auth.dev.smileinspector.io.s3-website-us-east-1.amazonaws.com)"
  type        = string
  default     = ""
}

variable "auth_s3_bucket_name" {
  description = "Name of the S3 bucket for authentication SPA"
  type        = string
  default     = ""
}

# Lambda@Edge function ARNs

variable "auth_uri_formatter_lambda_arn" {
  description = "ARN of the Lambda@Edge function for formatting Auth URI Formatter"
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

variable "use_existing_cache_policy" {
  description = "Whether to use an existing cache policy instead of creating a new one"
  type        = bool
  default     = false
}

variable "distribution_comment" {
  description = "Comment/description for the CloudFront distribution"
  type        = string
  default     = ""
}

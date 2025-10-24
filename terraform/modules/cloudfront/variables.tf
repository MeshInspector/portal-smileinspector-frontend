variable "environment" {
  description = "Environment (dev, qa or prod)"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the frontend (e.g., portal.dev.smileinspector.io)"
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

variable "distribution_comment" {
  description = "Comment/description for the CloudFront distribution"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

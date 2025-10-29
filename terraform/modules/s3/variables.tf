variable "environment" {
  description = "Environment (dev or prod)"
  type        = string
}

variable "bucket_name" {
  description = "Name of the S3 bucket for static website hosting"
  type        = string
}

variable "cloudfront_oai_arn" {
  description = "ARN of the CloudFront Origin Access Identity"
  type        = string
  default     = ""
}

variable "create_bucket_policy" {
  description = "Whether to create the S3 bucket policy"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

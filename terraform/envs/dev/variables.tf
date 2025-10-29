variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket for static website hosting"
  type        = string
  default     = "smileinspector-portal-dev-frontend"
}

variable "domain_name" {
  description = "Domain name for the frontend (e.g., portal.dev.smileinspector.io)"
  type        = string
  default     = "portal.dev.smileinspector.io"
}

variable "hosted_zone_id" {
  description = "ID of the Route53 hosted zone"
  type        = string
  default     = "Z01154961WFT5F923KEXU"
}

variable "certificate_region" {
  description = "AWS region for the ACM certificate"
  type        = string
  default     = "us-east-1"
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate"
  type        = string
  default     = "arn:aws:acm:us-east-1:259351611210:certificate/0020a8b5-c422-4364-9374-679fd3283cd4"
}

variable "distribution_comment" {
  description = "Comment/description for the CloudFront distribution"
  type        = string
  default     = "SmileInspector Portal Dev App"
}

variable "tags" {
  description = "Tags to apply to resources"
  type = map(string)
  default = {
    Environment = "dev"
    Team        = "cloud-team"
    ManagedBy   = "Terraform"
    Service     = "smileinspector-portal-service"
    Category    = "smileinspector-portal"
    Project     = "SmileInspector"
  }
}

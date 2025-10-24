variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket for static website hosting"
  type        = string
  default     = "smileinspector-portal-qa-frontend"
}

variable "domain_name" {
  description = "Domain name for the frontend (e.g., portal.qa.smileinspector.io)"
  type        = string
  default     = "portal.qa.smileinspector.io"
}

variable "hosted_zone_id" {
  description = "ID of the Route53 hosted zone"
  type        = string
  default     = "Z06934723QI3AZ1JZOLZ6"
}

variable "certificate_region" {
  description = "AWS region for the ACM certificate"
  type        = string
  default     = "us-east-1"
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate"
  type        = string
  default     = "arn:aws:acm:us-east-1:832132158254:certificate/68e9ddab-3753-47c1-a9e0-572acbd08aec"
}

variable "distribution_comment" {
  description = "Comment/description for the CloudFront distribution"
  type        = string
  default     = "SmileInspector Portal QA App"
}

variable "tags" {
  description = "Tags to apply to resources"
  type = map(string)
  default = {
    Environment = "qa"
    Team        = "cloud-team"
    ManagedBy   = "Terraform"
    Service     = "smileinspector-portal-service"
    Category    = "smileinspector-portal"
    Project     = "SmileInspector"
  }
}

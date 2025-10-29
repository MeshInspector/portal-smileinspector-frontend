variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket for static website hosting"
  type        = string
  default     = "smileinspector-portal-prod-frontend"
}

variable "domain_name" {
  description = "Domain name for the frontend (e.g., portal.smileinspector.io)"
  type        = string
  default     = "portal.smileinspector.io"
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

variable "distribution_comment" {
  description = "Comment/description for the CloudFront distribution"
  type        = string
  default     = "SmileInspector Portal Prod App"
}

variable "tags" {
  description = "Tags to apply to resources"
  type = map(string)
  default = {
    Environment = "prod"
    Team        = "cloud-team"
    ManagedBy   = "Terraform"
    Service     = "smileinspector-portal-service"
    Category    = "smileinspector-portal"
    Project     = "SmileInspector"
  }
}

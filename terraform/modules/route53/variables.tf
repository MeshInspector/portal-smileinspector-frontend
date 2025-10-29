variable "domain_name" {
  description = "Domain name for the frontend (e.g., portal.dev.smileinspector.io)"
  type        = string
}

variable "hosted_zone_id" {
  description = "ID of the Route53 hosted zone"
  type        = string
}

variable "domain_validation_options" {
  description = "Domain validation options from ACM certificate"
  type        = list(object({
    domain_name           = string
    resource_record_name  = string
    resource_record_value = string
    resource_record_type  = string
  }))
}

variable "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  type        = string
}

variable "cloudfront_hosted_zone_id" {
  description = "Hosted zone ID of the CloudFront distribution"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

output "frontend_url" {
  value = "https://${var.domain_name}"
}

output "s3_bucket_id" {
  description = "ID of the S3 bucket"
  value       = module.s3.frontend_bucket_id
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = module.cloudfront.domain_name
}

output "acm_certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = var.certificate_arn
}

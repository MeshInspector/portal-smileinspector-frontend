output "frontend_bucket_id" {
  description = "ID of the frontend S3 bucket"
  value       = local.bucket_id
}

output "frontend_bucket_arn" {
  description = "ARN of the frontend S3 bucket"
  value       = local.bucket_arn
}

output "frontend_bucket_website_endpoint" {
  description = "Website endpoint of the frontend S3 bucket"
  value       = local.website_endpoint
}

output "frontend_bucket_regional_domain_name" {
  description = "Regional domain name of the frontend S3 bucket"
  value       = local.bucket_regional_domain_name
}


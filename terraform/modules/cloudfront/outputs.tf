output "distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.id
}

output "domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "hosted_zone_id" {
  description = "Hosted zone ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.hosted_zone_id
}

output "oai_arn" {
  description = "ARN of the CloudFront Origin Access Identity"
  value       = aws_cloudfront_origin_access_identity.frontend.iam_arn
}

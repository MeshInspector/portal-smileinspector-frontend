output "cert_validation_fqdns" {
  description = "FQDNs of the DNS validation records"
  value       = [for record in aws_route53_record.cert_validation : record.fqdn]
}

output "frontend_dns_name" {
  description = "DNS name of the frontend"
  value       = aws_route53_record.frontend.name
}
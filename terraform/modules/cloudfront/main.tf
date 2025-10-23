resource "aws_cloudfront_origin_access_identity" "frontend" {
  comment = "OAI for ${var.domain_name}"
}

resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = var.s3_bucket_regional_domain_name
    origin_id   = "S3-${var.bucket_name}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }

  origin {
    domain_name = var.auth_s3_website_endpoint
    origin_id   = "AUTH-S3-${var.auth_s3_bucket_name}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
      origin_read_timeout    = 60
      origin_keepalive_timeout = 60
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  aliases             = [var.domain_name]
  comment             = var.distribution_comment != "" ? var.distribution_comment : "CloudFront distribution for ${var.domain_name} (${var.environment})"

  ordered_cache_behavior {
    path_pattern     = "/login*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "AUTH-S3-${var.auth_s3_bucket_name}"
    compress         = true

    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    lambda_function_association {
      event_type   = "origin-request"
      lambda_arn   = var.auth_uri_formatter_lambda_arn
      include_body = false
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/sign-*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "AUTH-S3-${var.auth_s3_bucket_name}"
    compress         = true

    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    lambda_function_association {
      event_type   = "origin-request"
      lambda_arn   = var.auth_uri_formatter_lambda_arn
      include_body = false
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/confirm*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "AUTH-S3-${var.auth_s3_bucket_name}"
    compress         = true

    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    lambda_function_association {
      event_type   = "origin-request"
      lambda_arn   = var.auth_uri_formatter_lambda_arn
      include_body = false
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/forgot-password*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "AUTH-S3-${var.auth_s3_bucket_name}"
    compress         = true

    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    lambda_function_association {
      event_type   = "origin-request"
      lambda_arn   = var.auth_uri_formatter_lambda_arn
      include_body = false
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/assets/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "AUTH-S3-${var.auth_s3_bucket_name}"
    compress         = true

    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
  }

  ordered_cache_behavior {
    path_pattern     = "/callback"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "AUTH-S3-${var.auth_s3_bucket_name}"
    compress         = true

    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    lambda_function_association {
      event_type   = "origin-request"
      lambda_arn   = var.auth_uri_formatter_lambda_arn
      include_body = false
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/signout"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${var.bucket_name}"
    compress         = true

    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = var.signout_handler_lambda_arn
      include_body = false
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/parseauth"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${var.bucket_name}"
    compress         = true

    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = var.parse_auth_handler_lambda_arn
      include_body = false
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/refreshauth"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${var.bucket_name}"
    compress         = true

    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = var.refresh_auth_handler_lambda_arn
      include_body = false
    }
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${var.bucket_name}"
    compress         = true

    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = var.check_auth_handler_lambda_arn
      include_body = false
    }

    lambda_function_association {
      event_type   = "origin-response"
      lambda_arn   = var.http_headers_handler_lambda_arn
      include_body = false
    }
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = merge(
    {
      Name        = "${var.domain_name}-distribution"
      Environment = var.environment
    },
    var.tags
  )
}
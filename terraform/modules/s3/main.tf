resource "aws_s3_bucket" "frontend" {
  bucket = var.bucket_name

  tags = merge(
    {
      Name        = var.bucket_name
      Environment = var.environment
    },
    var.tags
  )
}

locals {
  bucket_id = aws_s3_bucket.frontend.id
  bucket_arn = aws_s3_bucket.frontend.arn
  bucket_regional_domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
}

resource "aws_s3_bucket_ownership_controls" "frontend" {
  bucket = local.bucket_id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = local.bucket_id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_acl" "frontend" {
  depends_on = [
    aws_s3_bucket_ownership_controls.frontend,
    aws_s3_bucket_public_access_block.frontend,
  ]

  bucket = local.bucket_id
  acl    = "private"
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = local.bucket_id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

locals {
  website_endpoint = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

data "aws_region" "current" {}

resource "aws_s3_bucket_policy" "frontend" {
  count  = var.create_bucket_policy ? 1 : 0
  bucket = local.bucket_id

  policy = jsonencode(
    {
      "Version": "2008-10-17",
      "Id": "PolicyForCloudFrontPrivateContent",
      "Statement": [
        {
          "Sid": "AllowCloudFrontServicePrincipal",
          "Effect": "Allow",
          "Principal": {
            "Service": "cloudfront.amazonaws.com"
          },
          "Action": "s3:GetObject",
          Resource  = "${local.bucket_arn}/*"
        },
        {
          Sid       = "AllowCloudFrontOAI",
          Effect    = "Allow",
          Principal = {
            AWS = var.cloudfront_oai_arn
          },
          Action    = "s3:GetObject",
          Resource  = "${local.bucket_arn}/*"
        }
      ]
    }
  )
}

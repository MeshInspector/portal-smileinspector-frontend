terraform {
  backend "s3" {
    bucket         = "adalisk-terraform-state-prod"
    key            = "cloud-team/prod/cms-frontend/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock"
    encrypt        = true
  }
}
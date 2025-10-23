terraform {
  backend "s3" {
    bucket         = "adalisk-terraform-state-dev"
    key            = "cloud-team/dev/cms-frontend/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock"
    encrypt        = true
  }
}
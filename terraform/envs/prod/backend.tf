terraform {
  backend "s3" {
    bucket         = "adalisk-terraform-state-prod"
    key            = "cloud-team/prod/smileinspector-portal-frontend/terraform.tfstate"
    region         = "us-east-1"
    use_lockfile   = true
    encrypt        = true
  }
}

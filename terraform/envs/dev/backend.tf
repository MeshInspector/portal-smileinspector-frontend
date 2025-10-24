terraform {
  backend "s3" {
    bucket         = "adalisk-terraform-state-dev"
    key            = "cloud-team/dev/smileinspector-portal-frontend/terraform.tfstate"
    region         = "us-east-1"
    use_lockfile   = true
    encrypt        = true
  }
}

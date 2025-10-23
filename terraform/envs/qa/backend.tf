terraform {
  backend "s3" {
    bucket         = "adalisk-terraform-state-qa"
    key            = "cloud-team/qa/cms-frontend/terraform.tfstate"
    region         = "us-east-1"
    use_lockfile   = true
    encrypt        = true
  }
}
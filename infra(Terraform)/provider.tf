
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "TODO-App"
      Environment = "Development"
      ManagedBy   = "Terraform"
    }
  }
}

data "aws_caller_identity" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}

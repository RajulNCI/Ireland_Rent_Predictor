# ============================================================
# Ireland Rent Predictor — Terraform Infrastructure
# ============================================================
# Creates:
#   - S3 bucket for model artefacts
#   - S3 bucket for frontend static hosting
#   - CloudFront distribution for frontend CDN
#   - DynamoDB table for prediction logs
#   - Elastic Beanstalk app + environment for Flask backend
#   - IAM roles and policies
# ============================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ──────────────────────────────────────────────
# RANDOM SUFFIX (makes bucket names unique)
# ──────────────────────────────────────────────
resource "random_id" "suffix" {
  byte_length = 4
}

locals {
  suffix = random_id.suffix.hex
  tags = {
    Project     = "IrelandRentPredictor"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

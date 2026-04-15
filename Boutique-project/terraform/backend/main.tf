###############################################################
# Bootstrap: Remote State Backend
# Run ONCE before any other Terraform:
#   cd terraform/backend && terraform init && terraform apply
#
# Creates:
#   - S3 bucket for state files (versioned + encrypted)
#   - DynamoDB table for state locking
###############################################################

terraform {
  required_version = ">= 1.7"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }
  # Bootstrap uses LOCAL state — this is intentional
  # Once created, all other environments use this S3 backend
}

provider "aws" {
  region = var.aws_region
}

###############################################################
# S3 Bucket — Terraform state
###############################################################
resource "aws_s3_bucket" "state" {
  bucket        = var.state_bucket_name
  force_destroy = false   # safety: never auto-delete state

  tags = {
    Name      = var.state_bucket_name
    ManagedBy = "terraform"
    Purpose   = "terraform-state"
  }
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket                  = aws_s3_bucket.state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    id     = "expire-old-versions"
    status = "Enabled"
    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

###############################################################
# DynamoDB Table — State locking
###############################################################
resource "aws_dynamodb_table" "locks" {
  name         = var.lock_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name      = var.lock_table_name
    ManagedBy = "terraform"
    Purpose   = "terraform-state-lock"
  }
}

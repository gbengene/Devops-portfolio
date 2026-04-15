###############################################################
# Environment: PROD
# - NAT gateway per AZ (HA)
# - On-demand instances for app nodes (reliability over cost)
# - Private API endpoint (hardened)
# - Manual apply only — requires GitHub approval gate
###############################################################

terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket         = "boutique-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "boutique-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_ca_certificate)
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
    }
  }
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_ca_certificate)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

###############################################################
# Locals
###############################################################
locals {
  env          = "prod"
  cluster_name = "${var.project_name}-${local.env}"

  common_tags = {
    Project     = var.project_name
    Environment = local.env
    ManagedBy   = "terraform"
    Repo        = "boutique-project"
  }
}

###############################################################
# VPC
###############################################################
module "vpc" {
  source = "../../modules/vpc"

  name               = local.cluster_name
  cluster_name       = local.cluster_name
  vpc_cidr           = var.vpc_cidr
  nat_gateway_per_az = true    # HA: one NAT per AZ
  tags               = local.common_tags
}

###############################################################
# EKS
###############################################################
module "eks" {
  source = "../../modules/eks"

  cluster_name       = local.cluster_name
  kubernetes_version = var.kubernetes_version
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids

  # Prod: restrict API access to your CI runner CIDRs + VPN
  public_access       = true
  public_access_cidrs = var.api_allowed_cidrs

  # System nodes: larger on-demand, multi-AZ
  system_node_instance_types = ["t3.large"]
  system_node_desired        = 2
  system_node_min            = 2
  system_node_max            = 4

  # App nodes: on-demand for reliability, autoscaled
  app_node_instance_types = ["t3.large", "t3.xlarge"]
  app_node_capacity_type  = "ON_DEMAND"
  app_node_desired        = 3
  app_node_min            = 3
  app_node_max            = 10

  tags = local.common_tags
}

###############################################################
# Addons
###############################################################
module "addons" {
  source = "../../modules/addons"

  cluster_name            = module.eks.cluster_name
  vpc_id                  = module.vpc.vpc_id
  aws_region              = var.aws_region
  oidc_provider_arn       = module.eks.oidc_provider_arn
  oidc_provider_url       = replace(module.eks.oidc_provider_url, "https://", "")
  grafana_admin_password  = var.grafana_admin_password
  prometheus_storage_size = "50Gi"
  domain_name             = var.domain_name
  tags                    = local.common_tags
}

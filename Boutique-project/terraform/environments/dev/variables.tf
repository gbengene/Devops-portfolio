variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "boutique"
}

variable "kubernetes_version" {
  type    = string
  default = "1.31"
}

variable "vpc_cidr" {
  type    = string
  default = "10.10.0.0/16"
}

variable "domain_name" {
  description = "Base domain for ingress (e.g. dev.boutique.example.com). Leave empty to skip ingress."
  type        = string
  default     = ""
}

variable "grafana_admin_password" {
  type      = string
  sensitive = true
}

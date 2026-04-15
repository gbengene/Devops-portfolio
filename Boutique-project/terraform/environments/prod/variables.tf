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
  default = "10.20.0.0/16"
}

variable "domain_name" {
  description = "Base domain for ingress (e.g. boutique.example.com)"
  type        = string
}

variable "api_allowed_cidrs" {
  description = "CIDRs allowed to reach EKS public API. Should include GitHub Actions runner IPs + your VPN."
  type        = list(string)
  default     = ["0.0.0.0/0"]   # tighten after initial setup
}

variable "grafana_admin_password" {
  type      = string
  sensitive = true
}

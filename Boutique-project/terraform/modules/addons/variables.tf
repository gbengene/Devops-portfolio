variable "cluster_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "oidc_provider_arn" {
  type = string
}

variable "oidc_provider_url" {
  description = "OIDC URL without https:// prefix"
  type        = string
}

variable "domain_name" {
  description = "Base domain for Grafana/ArgoCD ingress (e.g. dev.boutique.example.com)"
  type        = string
  default     = ""
}

variable "grafana_admin_password" {
  description = "Grafana admin password — stored in GitHub secret, passed via TF_VAR"
  type        = string
  sensitive   = true
}

variable "prometheus_storage_size" {
  description = "PVC size for Prometheus. Larger in prod."
  type        = string
  default     = "20Gi"
}

variable "tags" {
  type    = map(string)
  default = {}
}

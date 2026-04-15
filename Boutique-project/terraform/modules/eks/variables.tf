variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.31"
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "public_access" {
  description = "Enable public API endpoint. Set false in prod for hardened access."
  type        = bool
  default     = true
}

variable "public_access_cidrs" {
  description = "CIDRs allowed to reach the public API endpoint. Restrict in prod."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# ── System node group ──────────────────────────────────────
variable "system_node_instance_types" {
  type    = list(string)
  default = ["t3.medium"]
}

variable "system_node_desired" {
  type    = number
  default = 2
}

variable "system_node_min" {
  type    = number
  default = 1
}

variable "system_node_max" {
  type    = number
  default = 3
}

# ── App node group ─────────────────────────────────────────
variable "app_node_instance_types" {
  type    = list(string)
  default = ["t3.medium", "t3.large", "t3a.medium"]
}

variable "app_node_capacity_type" {
  description = "SPOT for dev (cheap), ON_DEMAND for prod (reliable)"
  type        = string
  default     = "SPOT"
}

variable "app_node_desired" {
  type    = number
  default = 2
}

variable "app_node_min" {
  type    = number
  default = 1
}

variable "app_node_max" {
  type    = number
  default = 5
}

variable "tags" {
  type    = map(string)
  default = {}
}

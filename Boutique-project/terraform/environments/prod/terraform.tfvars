# Prod environment — safe to commit (no secrets)
# Secrets (grafana_admin_password) are injected via GitHub Actions secrets

aws_region         = "us-east-1"
project_name       = "boutique"
kubernetes_version = "1.31"
vpc_cidr           = "10.20.0.0/16"
domain_name        = "boutique.example.com"   # replace with your domain
api_allowed_cidrs  = ["0.0.0.0/0"]            # tighten to VPN CIDR after setup

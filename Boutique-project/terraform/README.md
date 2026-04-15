# Terraform — Phase 2 (AWS EKS)

This directory is intentionally empty during Phase 1 (local development).

Phase 2 will contain:

```
terraform/
├── main.tf              ← root module: calls EKS, VPC, monitoring modules
├── variables.tf
├── outputs.tf
├── terraform.tfvars     ← gitignored — contains your AWS account ID, region
└── modules/
    ├── vpc/             ← VPC, subnets, NAT gateway, IGW
    ├── eks/             ← EKS cluster, node groups (on-demand + spot)
    └── addons/          ← AWS Load Balancer Controller, EBS CSI, Cluster Autoscaler
```

## When to use this

Only proceed to Phase 2 after:
- [ ] Online Boutique is fully running locally
- [ ] ArgoCD is managing all three environments (dev/staging/prod)
- [ ] Grafana SLO dashboard is showing live data
- [ ] At least one chaos experiment has been recorded (make chaos-kill-frontend)
- [ ] Remediation webhook is handling alerts automatically

## Cost reminder

The EKS cluster costs ~$0.10/hour just for the control plane.
Run `terraform destroy` immediately after your 2-hour demo session.
Total estimated spend: $10–20 for the full demo lifecycle.

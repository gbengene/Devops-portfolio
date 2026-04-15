# SRE Platform — Online Boutique + GitOps + Observability

> A production-grade Kubernetes platform built around Google's Online Boutique
> microservices demo. Demonstrates GitOps delivery, SLO-based observability,
> burn-rate alerting, and automated incident remediation.

---

## Architecture

```
GitHub (this repo)
     │
     │  ArgoCD watches for changes
     ▼
Kubernetes Cluster (kind locally / EKS on AWS)
     ├── boutique-dev        ← Online Boutique (11 services + load generator)
     ├── boutique-staging    ← Manual promotion gate
     ├── boutique-prod       ← Manual-only, weekend sync lock
     ├── argocd              ← GitOps controller
     └── monitoring
           ├── Prometheus    ← Metrics + SLO alert rules
           ├── Grafana       ← SLO dashboard + error budget panels
           ├── Alertmanager  ← Routes alerts → remediation webhook
           └── Webhook       ← Auto-remediates crash loops + degraded deployments
```

---

## What This Demonstrates

| Capability | Evidence |
|---|---|
| **GitOps** | ArgoCD manages dev/staging/prod with different sync policies |
| **SLO Engineering** | Grafana shows 99.9% availability SLO + error budget burn rate |
| **Burn-rate alerting** | Multi-window alerts (Google SRE Book, Ch.5) fire before budget is exhausted |
| **Auto-remediation** | Alertmanager → Python webhook → delete crash-looping pod → MTTR visible |
| **Chaos Engineering** | `make chaos-kill-frontend` → watch self-healing in Grafana |
| **Multi-env promotion** | dev (auto) → staging (manual) → prod (manual + sync window) |
| **IaC** | Terraform provisions EKS in Phase 2 (see terraform/) |
| **ADRs** | Architecture decisions documented in docs/adr/ |

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Docker Desktop | 4.x+ | https://www.docker.com/products/docker-desktop |
| kind | 0.23+ | `choco install kind` or https://kind.sigs.k8s.io |
| kubectl | 1.29+ | `choco install kubernetes-cli` |
| Helm | 3.14+ | `choco install kubernetes-helm` |
| ArgoCD CLI | 2.11+ | https://argo-cd.readthedocs.io/en/stable/cli_installation/ |
| Python 3.11+ | 3.11+ | https://www.python.org/downloads/ |
| git | any | https://git-scm.com |

Run `make check` to verify all prerequisites are installed.

---

## Quick Start (Local)

```bash
# 1. Clone this repo
git clone https://github.com/youruser/boutique-project
cd boutique-project

# 2. Check prerequisites
make check

# 3. Full setup (cluster + ArgoCD + monitoring + boutique)
#    Runtime: ~12 minutes on first run (pulls container images)
make up

# 4. Get port-forward commands
make ports

# 5. Open the interfaces
#    Online Boutique:  http://localhost:8888
#    ArgoCD UI:        https://localhost:8080
#    Grafana:          http://localhost:3000  (admin / sre-boutique-2026)
#    Prometheus:       http://localhost:9090
#    Alertmanager:     http://localhost:9093
```

---

## Demo Script (for interviews / recordings)

### Scene 1 — GitOps in action (2 min)
1. Open ArgoCD UI — show boutique-dev synced and healthy
2. Open the Boutique frontend — show the live shop
3. Show ArgoCD sync graph — 11 services, all green

### Scene 2 — SLO dashboard (2 min)
1. Open Grafana → "SRE Boutique — SLO Dashboard"
2. Show current availability (should be ~100%)
3. Show error budget remaining panel
4. Show burn rate graph — flat at near-zero

### Scene 3 — Chaos experiment (3 min)
```bash
# Kill the frontend pod — watch it self-heal
make chaos-kill-frontend
```
1. Watch Grafana — availability dips, then recovers
2. Show ArgoCD selfHeal restoring the pod
3. Measure MTTR in Grafana (time from alert to resolution)

### Scene 4 — SLO breach + auto-remediation (3 min)
```bash
# Scale checkoutservice to 0 — triggers SLO alert
make chaos-scale-zero
```
1. Watch Alertmanager — BoutiqueDeploymentDegraded fires
2. Watch remediation webhook logs — auto-scales back
3. Watch Grafana — error budget recovers
```bash
# Verify recovery
make status
```

### Scene 5 — Promotion (2 min)
```bash
# Promote dev → staging
make promote-staging
```
1. Show ArgoCD deploying boutique-staging
2. Explain the prod sync window (weekends blocked)

---

## Chaos Commands

```bash
make chaos-kill-frontend    # Kill frontend pod — tests k8s self-healing
make chaos-kill-cart        # Kill cart pods — triggers SLO alert
make chaos-scale-zero       # Scale checkout to 0 — tests auto-remediation
make chaos-recover          # Restore everything after chaos
```

---

## Phase 2 — AWS EKS

See [terraform/README.md](terraform/README.md) for the AWS deployment plan.

Estimated cost: **$10–20 total** for a 2-hour live demo session.

---

## Architecture Decision Records

- [ADR 001 — GitOps Tool: ArgoCD over Flux](docs/adr/001-gitops-tool-choice.md)
- [ADR 002 — SLO Definition: 99.9% Availability](docs/adr/002-slo-definition.md)
- [ADR 003 — Local Cluster: kind over minikube](docs/adr/003-local-cluster-strategy.md)

---

## Project Structure

```
boutique-project/
├── bootstrap/              ← Sequential setup scripts (run in order)
├── cluster/                ← kind cluster config
├── gitops/
│   ├── applications/       ← ArgoCD Application manifests (dev/staging/prod)
│   └── argocd/             ← ArgoCD Project + RBAC
├── monitoring/
│   ├── rules/              ← PrometheusRule — SLO alerts
│   ├── alertmanager/       ← Alertmanager routing config
│   └── grafana-dashboard-cm.yaml
├── remediation/            ← Auto-remediation Flask webhook
├── docs/adr/               ← Architecture Decision Records
├── terraform/              ← Phase 2: EKS provisioning (empty in Phase 1)
├── Makefile                ← All commands — run 'make help'
└── README.md
```

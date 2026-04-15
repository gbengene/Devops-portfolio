# ADR 003 — Local Cluster: kind over minikube/Docker Desktop Kubernetes

**Date:** 2026-04-13
**Status:** Accepted
**Author:** John Gbemiga

---

## Context

Local development requires a Kubernetes cluster that closely mirrors the AWS EKS environment without incurring cloud costs during development.

## Decision

We use **kind** (Kubernetes in Docker) with a 3-node configuration (1 control-plane + 2 workers).

## Evaluation

| Tool | Multi-node | Mirrors EKS | Resource use | Windows support | Notes |
|---|---|---|---|---|---|
| **kind** | Yes | High | Low | Yes (Docker Desktop) | Used in CI, CNCF-maintained |
| minikube | Single (default) | Medium | Medium | Yes | Older, more options but heavier |
| Docker Desktop K8s | Single | Low | Low | Yes | Hidden config, hard to reset |
| k3s | Yes | Medium | Lowest | WSL2 only | Great for ARM/edge, less EKS-like |

## Why kind Specifically

1. **Multi-node:** The 3-node config lets us schedule monitoring on a separate worker from the app, matching the node group separation we use in EKS (system vs app nodes).
2. **CI parity:** The GitHub Actions CI pipeline uses kind — same tool locally and in CI eliminates "works on my machine" issues.
3. **Reproducibility:** `kind create cluster --config kind-config.yaml` creates an identical cluster every time. minikube state can drift.
4. **Reset speed:** `kind delete cluster && kind create cluster` takes 2 minutes. Fast iteration during development.

## Limitations

- kind does not support LoadBalancer services natively (we use Nginx Ingress instead)
- kind does not support cloud-provider integrations (EBS CSI, ALB Ingress) — these are tested on EKS only
- Spot instances and multi-AZ concepts cannot be tested locally — EKS-only

## Phase 2 Transition

When moving to AWS EKS:
- Replace `kind-config.yaml` with Terraform EKS module
- Replace Nginx Ingress with AWS Load Balancer Controller
- Replace local storage with EBS CSI driver
- ArgoCD application manifests remain unchanged — only the `destination.server` value changes

## Consequences

- All developers must have Docker Desktop installed and running
- kind cluster name is `boutique-local` — do not use `default` to avoid conflicts
- Windows users must use WSL2 or Git Bash to run the bootstrap shell scripts

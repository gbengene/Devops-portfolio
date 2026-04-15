# ADR 001 — GitOps Tool: ArgoCD over Flux

**Date:** 2026-04-13
**Status:** Accepted
**Author:** John Gbemiga

---

## Context

The platform needs a GitOps controller to sync Kubernetes manifests from Git to the cluster. The two dominant options in 2026 are **ArgoCD** and **Flux v2**.

## Decision

We use **ArgoCD**.

## Evaluation

| Criterion | ArgoCD | Flux v2 |
|---|---|---|
| UI | Full web UI — shows sync status, diff, rollback | CLI-only (Flux UI is a separate install) |
| Multi-env promotion model | Native App of Apps + sync waves | Requires custom scripting or Flagger |
| RBAC granularity | Project-scoped RBAC, per-app access | Git repo-based RBAC |
| Manual promotion gate | Sync policy: `automated: false` on prod | Requires webhook or CI gate |
| CNCF graduation | Graduated | Graduated |
| Team learning curve | Moderate (UI helps) | Higher for new engineers |

## Why This Matters for This Project

This platform is a **portfolio project with live demos**. ArgoCD's visual sync graph makes it immediately legible to a hiring manager watching a screen recording — they can see the Git state, the cluster state, and the diff in one view. Flux requires more context to interpret.

In a production team environment with >3 engineers, Flux's GitOps-first model (no server-side state) may be preferable. The decision would change for that context.

## Consequences

- ArgoCD server runs in the cluster (additional ~200MB memory overhead)
- All environment promotions happen via ArgoCD sync policies, not CI
- ArgoCD RBAC must be maintained separately from Kubernetes RBAC

#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# 04-boutique.sh
# Deploys Online Boutique to the dev namespace via ArgoCD.
# The load generator starts automatically — within 60 seconds
# you will see live traffic in Grafana.
# Runtime: ~4 minutes
# ─────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "========================================="
echo "  Step 1 — Deploying Online Boutique (dev)"
echo "  via ArgoCD GitOps"
echo "========================================="

kubectl apply -f "$ROOT_DIR/gitops/applications/dev/boutique-app.yaml"

echo ""
echo "Waiting for ArgoCD to sync Online Boutique..."
echo "(This pulls ~11 container images — may take 3-5 minutes on first run)"
echo ""

# Poll until all pods in boutique-dev are Running
TIMEOUT=360
ELAPSED=0
while true; do
  RUNNING=$(kubectl get pods -n boutique-dev --no-headers 2>/dev/null \
    | grep -c "Running" || true)
  TOTAL=$(kubectl get pods -n boutique-dev --no-headers 2>/dev/null \
    | wc -l | tr -d ' ' || echo 0)

  echo "  Pods running: ${RUNNING}/${TOTAL}"

  if [ "$TOTAL" -gt 0 ] && [ "$RUNNING" -eq "$TOTAL" ]; then
    break
  fi

  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "Timeout waiting for pods. Check: kubectl get pods -n boutique-dev"
    exit 1
  fi

  sleep 15
  ELAPSED=$((ELAPSED + 15))
done

echo ""
echo "========================================="
echo "  Step 2 — Verifying services"
echo "========================================="

kubectl get pods -n boutique-dev
echo ""
kubectl get svc -n boutique-dev

echo ""
echo "========================================="
echo "  Online Boutique Access"
echo "========================================="
echo ""
echo "  Option A — Port-forward (simplest):"
echo "  kubectl port-forward svc/frontend -n boutique-dev 8888:80"
echo "  URL: http://localhost:8888"
echo ""
echo "  Option B — Via Nginx Ingress (if configured):"
echo "  URL: http://boutique.local"
echo "  (Add '127.0.0.1 boutique.local' to your /etc/hosts)"
echo ""
echo -e "\033[0;32mOnline Boutique is live.\033[0m"
echo ""
echo "The load generator is running in the background."
echo "Open Grafana → SRE Boutique SLO dashboard to see live traffic."
echo ""
echo "========================================="
echo "  Full Stack Summary"
echo "========================================="
echo ""
echo "  Component       | Access command"
echo "  ────────────────|──────────────────────────────────────────"
echo "  Online Boutique | kubectl port-forward svc/frontend -n boutique-dev 8888:80"
echo "  ArgoCD          | kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "  Grafana         | kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3000:80"
echo "  Prometheus      | kubectl port-forward svc/kube-prometheus-stack-prometheus -n monitoring 9090:9090"
echo "  Alertmanager    | kubectl port-forward svc/kube-prometheus-stack-alertmanager -n monitoring 9093:9093"
echo ""

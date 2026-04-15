#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# 03-monitoring.sh
# Deploys kube-prometheus-stack (Prometheus + Grafana + Alertmanager)
# via ArgoCD so the deployment is GitOps-managed from day one.
# Runtime: ~5 minutes
# ─────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "========================================="
echo "  Step 1 — Deploying monitoring stack"
echo "  via ArgoCD Application"
echo "========================================="

kubectl apply -f "$ROOT_DIR/gitops/applications/monitoring-app.yaml"

echo "Waiting for Prometheus CRDs to register (this can take 3-5 minutes)..."
for i in $(seq 1 60); do
  if kubectl get crd prometheusrules.monitoring.coreos.com &>/dev/null; then
    echo "  PrometheusRule CRD is ready."
    break
  fi
  echo "  Waiting... ($i/60)"
  sleep 10
done

if ! kubectl get crd prometheusrules.monitoring.coreos.com &>/dev/null; then
  echo "ERROR: PrometheusRule CRD never registered. Check ArgoCD sync status:"
  echo "  kubectl get apps -n argocd"
  exit 1
fi

echo ""
echo "========================================="
echo "  Step 1b — Fix kube-state-metrics label"
echo "  (ArgoCD overwrites app.kubernetes.io/instance;"
echo "   patch the service so Prometheus can find it)"
echo "========================================="

# ArgoCD injects its app name as app.kubernetes.io/instance, overwriting
# the Helm release label that the kube-state-metrics ServiceMonitor expects.
# Fix ArgoCD to use a different tracking key, then relabel the service.
kubectl patch configmap argocd-cm -n argocd \
  --patch '{"data":{"application.instanceLabelKey":"argocd.argoproj.io/app-name"}}' 2>/dev/null || true

kubectl rollout restart statefulset argocd-application-controller -n argocd
kubectl rollout status statefulset argocd-application-controller -n argocd --timeout=120s

echo "Waiting for kube-state-metrics service to appear..."
for i in $(seq 1 30); do
  if kubectl get svc -n monitoring kube-prometheus-stack-kube-state-metrics &>/dev/null; then
    kubectl label svc -n monitoring kube-prometheus-stack-kube-state-metrics \
      "app.kubernetes.io/instance=kube-prometheus-stack" --overwrite
    echo "  kube-state-metrics label fixed."
    break
  fi
  echo "  Waiting... ($i/30)"
  sleep 10
done

echo ""
echo "========================================="
echo "  Step 2 — Applying SLO alert rules"
echo "========================================="

kubectl apply -f "$ROOT_DIR/monitoring/rules/boutique-slo.yaml"

echo ""
echo "========================================="
echo "  Step 3 — Importing Grafana dashboards"
echo "========================================="

kubectl apply -f "$ROOT_DIR/monitoring/grafana-dashboard-cm.yaml" 2>/dev/null || true

echo ""
echo "========================================="
echo "  Monitoring Access"
echo "========================================="
echo ""
echo "  Grafana:"
echo "  kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3000:80"
echo "  URL:      http://localhost:3000"
echo "  Username: admin"
echo "  Password: sre-boutique-2026"
echo ""
echo "  Prometheus:"
echo "  kubectl port-forward svc/kube-prometheus-stack-prometheus -n monitoring 9090:9090"
echo "  URL:      http://localhost:9090"
echo ""
echo "  Alertmanager:"
echo "  kubectl port-forward svc/kube-prometheus-stack-alertmanager -n monitoring 9093:9093"
echo "  URL:      http://localhost:9093"
echo ""
echo -e "\033[0;32mMonitoring stack deployed.\033[0m"
echo "Next step: ./bootstrap/04-boutique.sh"

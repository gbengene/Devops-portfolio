#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# 02-argocd.sh
# Installs ArgoCD into the cluster and prints login credentials.
# Runtime: ~3 minutes
# ─────────────────────────────────────────────────────────────
set -euo pipefail

ARGOCD_VERSION="v2.11.3"   # pin version for reproducibility
ARGOCD_NS="argocd"

echo ""
echo "========================================="
echo "  Step 1 — Installing ArgoCD ${ARGOCD_VERSION}"
echo "========================================="

kubectl apply -n "$ARGOCD_NS" \
  -f "https://raw.githubusercontent.com/argoproj/argo-cd/${ARGOCD_VERSION}/manifests/install.yaml"

echo "Waiting for ArgoCD server to be ready (this takes ~2 minutes)..."
kubectl wait --namespace "$ARGOCD_NS" \
  --for=condition=available deployment/argocd-server \
  --timeout=300s

echo ""
echo "========================================="
echo "  Step 2 — Patching ArgoCD server service"
echo "  (NodePort so it's reachable from host)"
echo "========================================="

kubectl patch svc argocd-server -n "$ARGOCD_NS" \
  -p '{"spec": {"type": "NodePort"}}'

echo ""
echo "========================================="
echo "  Step 3 — Adding Helm repos to ArgoCD"
echo "========================================="

# kube-prometheus-stack
kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: helm-repos
  namespace: $ARGOCD_NS
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
stringData:
  type: helm
  name: prometheus-community
  url: https://prometheus-community.github.io/helm-charts
EOF

echo ""
echo "========================================="
echo "  ArgoCD Login Credentials"
echo "========================================="

ARGOCD_PASSWORD=$(kubectl -n "$ARGOCD_NS" get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d)

echo ""
echo "  Username: admin"
echo "  Password: ${ARGOCD_PASSWORD}"
echo ""
echo "  Access ArgoCD UI via port-forward:"
echo "  kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "  Then open: https://localhost:8080"
echo ""
echo "  (Accept the self-signed certificate warning in your browser)"
echo ""
echo -e "\033[0;32mArgoCD ready.\033[0m"
echo "Next step: ./bootstrap/03-monitoring.sh"

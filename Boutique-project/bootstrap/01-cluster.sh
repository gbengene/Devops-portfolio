#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# 01-cluster.sh
# Creates the local kind cluster and installs Nginx Ingress.
# Runtime: ~3 minutes
# ─────────────────────────────────────────────────────────────
set -euo pipefail

CLUSTER_NAME="boutique-local"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "========================================="
echo "  Step 1 — Creating kind cluster"
echo "========================================="

# Destroy existing cluster if it exists
if kind get clusters 2>/dev/null | grep -q "^${CLUSTER_NAME}$"; then
  echo "Cluster '${CLUSTER_NAME}' already exists. Deleting and recreating..."
  kind delete cluster --name "$CLUSTER_NAME"
fi

kind create cluster \
  --name "$CLUSTER_NAME" \
  --config "$ROOT_DIR/cluster/kind-config.yaml" \
  --wait 120s

echo ""
echo "========================================="
echo "  Step 2 — Installing Nginx Ingress"
echo "========================================="

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

echo "Waiting for Nginx Ingress to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

echo ""
echo "========================================="
echo "  Step 3 — Creating namespaces"
echo "========================================="

for ns in argocd monitoring boutique-dev boutique-staging; do
  kubectl create namespace "$ns" --dry-run=client -o yaml | kubectl apply -f -
  echo "  namespace/$ns ready"
done

echo ""
echo -e "\033[0;32mCluster is ready.\033[0m"
echo "Context: $(kubectl config current-context)"
echo ""
echo "Next step: ./bootstrap/02-argocd.sh"

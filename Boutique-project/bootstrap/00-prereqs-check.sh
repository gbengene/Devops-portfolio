#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# 00-prereqs-check.sh
# Verifies every tool is installed before you start.
# Run this first — if everything is green, proceed to 01-cluster.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; FAILED=1; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

FAILED=0

echo ""
echo "========================================"
echo "  Boutique SRE Platform — Prereq Check"
echo "========================================"
echo ""

# Docker
if docker info &>/dev/null; then
  pass "Docker is running ($(docker --version | cut -d' ' -f3 | tr -d ','))"
else
  fail "Docker is not running. Start Docker Desktop and retry."
fi

# kind
if command -v kind &>/dev/null; then
  pass "kind $(kind version | awk '{print $2}')"
else
  fail "kind not found. Install: https://kind.sigs.k8s.io/docs/user/quick-start/#installation"
fi

# kubectl
if command -v kubectl &>/dev/null; then
  pass "kubectl $(kubectl version --client -o json 2>/dev/null | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d[\"clientVersion\"][\"gitVersion\"])' 2>/dev/null || kubectl version --client --short 2>/dev/null | head -1)"
else
  fail "kubectl not found. Install: https://kubernetes.io/docs/tasks/tools/"
fi

# Helm
if command -v helm &>/dev/null; then
  pass "Helm $(helm version --short)"
else
  fail "Helm not found. Install: https://helm.sh/docs/intro/install/"
fi

# ArgoCD CLI
if command -v argocd &>/dev/null; then
  pass "ArgoCD CLI $(argocd version --client --short 2>/dev/null | head -1)"
else
  warn "ArgoCD CLI not found — optional for local dev (you can use the web UI). Install: https://argo-cd.readthedocs.io/en/stable/cli_installation/"
fi

# Python 3 (for remediation webhook)
if command -v python3 &>/dev/null; then
  pass "Python $(python3 --version)"
else
  warn "Python 3 not found — needed only for the remediation webhook (Phase 3)."
fi

# git
if command -v git &>/dev/null; then
  pass "git $(git --version | awk '{print $3}')"
else
  fail "git not found."
fi

echo ""
if [ "$FAILED" -eq 1 ]; then
  echo -e "${RED}Some prerequisites are missing. Fix the [FAIL] items above before continuing.${NC}"
  exit 1
else
  echo -e "${GREEN}All required prerequisites are satisfied. Run: ./bootstrap/01-cluster.sh${NC}"
fi
echo ""

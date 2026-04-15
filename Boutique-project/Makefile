# ─────────────────────────────────────────────────────────────
# Boutique SRE Platform — Makefile
# All commands assume you are in the repo root.
# Run "make help" to see all available targets.
# ─────────────────────────────────────────────────────────────

.DEFAULT_GOAL := help
CLUSTER_NAME  := boutique-local
ARGOCD_NS     := argocd
MONITORING_NS := monitoring
BOUTIQUE_NS   := boutique-dev

# ── Setup ─────────────────────────────────────────────────────
.PHONY: check
check:  ## Check all prerequisites
	@bash bootstrap/00-prereqs-check.sh

.PHONY: up
up: check  ## Full local setup: cluster + ArgoCD + monitoring + boutique
	@bash bootstrap/01-cluster.sh
	@bash bootstrap/02-argocd.sh
	@bash bootstrap/03-monitoring.sh
	@bash bootstrap/04-boutique.sh
	@echo ""
	@echo "Stack is live. Run 'make ports' to start all port-forwards."

.PHONY: down
down:  ## Destroy the local kind cluster
	@echo "Deleting cluster $(CLUSTER_NAME)..."
	kind delete cluster --name $(CLUSTER_NAME)

# ── Port-forwards (run in background tabs) ────────────────────
.PHONY: ports
ports:  ## Print port-forward commands for all services
	@echo ""
	@echo "Run each in a separate terminal tab:"
	@echo ""
	@echo "  # Online Boutique (shop)"
	@echo "  kubectl port-forward svc/frontend -n $(BOUTIQUE_NS) 8888:80"
	@echo ""
	@echo "  # ArgoCD UI"
	@echo "  kubectl port-forward svc/argocd-server -n $(ARGOCD_NS) 8080:443"
	@echo ""
	@echo "  # Grafana (admin / sre-boutique-2026)"
	@echo "  kubectl port-forward svc/kube-prometheus-stack-grafana -n $(MONITORING_NS) 3001:80"
	@echo ""
	@echo "  # Prometheus"
	@echo "  kubectl port-forward svc/kube-prometheus-stack-prometheus -n $(MONITORING_NS) 9090:9090"
	@echo ""
	@echo "  # Alertmanager"
	@echo "  kubectl port-forward svc/kube-prometheus-stack-alertmanager -n $(MONITORING_NS) 9093:9093"

# ── ArgoCD ────────────────────────────────────────────────────
.PHONY: argocd-password
argocd-password:  ## Print the initial ArgoCD admin password
	@kubectl -n $(ARGOCD_NS) get secret argocd-initial-admin-secret \
		-o jsonpath="{.data.password}" | base64 -d
	@echo ""

.PHONY: argocd-apply
argocd-apply:  ## Apply all ArgoCD applications
	kubectl apply -f gitops/applications/monitoring-app.yaml
	kubectl apply -f gitops/applications/dev/boutique-app.yaml
	kubectl apply -f gitops/argocd/argocd-project.yaml

# ── Monitoring ────────────────────────────────────────────────
.PHONY: apply-rules
apply-rules:  ## Apply Prometheus SLO alert rules
	kubectl apply -f monitoring/rules/boutique-slo.yaml

.PHONY: apply-dashboard
apply-dashboard:  ## Import Grafana SLO dashboard
	kubectl apply -f monitoring/grafana-dashboard-cm.yaml

# ── Chaos experiments ─────────────────────────────────────────
.PHONY: chaos-kill-frontend
chaos-kill-frontend:  ## Kill the frontend pod (tests self-healing)
	@echo "Killing frontend pod — watch Grafana for MTTR..."
	kubectl delete pod -n $(BOUTIQUE_NS) -l app=frontend
	@echo "Pod deleted. ArgoCD selfHeal will restore it."
	@echo "Watch: kubectl get pods -n $(BOUTIQUE_NS) -w"

.PHONY: chaos-kill-cart
chaos-kill-cart:  ## Kill all cart service pods (triggers SLO alert)
	@echo "Killing all cartservice pods — should trigger BoutiqueDeploymentDegraded..."
	kubectl delete pod -n $(BOUTIQUE_NS) -l app=cartservice
	@echo "Watch Alertmanager: http://localhost:9093"
	@echo "Watch Grafana: http://localhost:3000"

.PHONY: chaos-scale-zero
chaos-scale-zero:  ## Scale checkoutservice to 0 (kills SLO — use for demo)
	@echo "Scaling checkoutservice to 0 — SLO breach incoming..."
	kubectl scale deployment checkoutservice -n $(BOUTIQUE_NS) --replicas=0
	@echo "Run 'make chaos-recover' to restore."

.PHONY: chaos-recover
chaos-recover:  ## Restore all deployments after chaos
	@echo "Recovering all boutique-dev deployments..."
	kubectl scale deployment checkoutservice -n $(BOUTIQUE_NS) --replicas=1
	kubectl scale deployment cartservice     -n $(BOUTIQUE_NS) --replicas=1
	kubectl scale deployment frontend        -n $(BOUTIQUE_NS) --replicas=1
	@echo "Recovery complete. Watch Grafana for MTTR."

# ── GitOps promotion ──────────────────────────────────────────
.PHONY: promote-staging
promote-staging:  ## Promote boutique from dev → staging (manual gate)
	@echo "Deploying boutique-staging via ArgoCD..."
	kubectl apply -f gitops/applications/staging/boutique-app.yaml
	argocd app sync boutique-staging --grpc-web 2>/dev/null || \
		echo "ArgoCD CLI not found — sync via UI at https://localhost:8080"

# ── Status ────────────────────────────────────────────────────
.PHONY: status
status:  ## Show pod status across all boutique namespaces
	@echo "=== boutique-dev ==="
	@kubectl get pods -n boutique-dev 2>/dev/null || echo "namespace not found"
	@echo ""
	@echo "=== monitoring ==="
	@kubectl get pods -n monitoring 2>/dev/null || echo "namespace not found"
	@echo ""
	@echo "=== argocd ==="
	@kubectl get pods -n argocd 2>/dev/null || echo "namespace not found"

# ── Terraform — Backend ──────────────────────────────────────
.PHONY: tf-backend
tf-backend:  ## Bootstrap S3 + DynamoDB state backend (run once)
	@echo "Bootstrapping Terraform state backend..."
	cd terraform/backend && terraform init && terraform apply -auto-approve

# ── Terraform — Dev ───────────────────────────────────────────
.PHONY: tf-dev-init
tf-dev-init:  ## terraform init for dev environment
	cd terraform/environments/dev && terraform init

.PHONY: tf-dev-plan
tf-dev-plan:  ## terraform plan for dev environment
	cd terraform/environments/dev && terraform plan \
		-var="grafana_admin_password=$(GRAFANA_PASSWORD)"

.PHONY: tf-dev-apply
tf-dev-apply:  ## terraform apply for dev environment
	cd terraform/environments/dev && terraform apply \
		-var="grafana_admin_password=$(GRAFANA_PASSWORD)" \
		-auto-approve

.PHONY: tf-dev-destroy
tf-dev-destroy:  ## terraform destroy for dev environment (destructive!)
	@read -p "Destroy DEV cluster? This is irreversible. Type yes: " confirm; \
	[ "$$confirm" = "yes" ] || (echo "Aborted." && exit 1)
	cd terraform/environments/dev && terraform destroy \
		-var="grafana_admin_password=$(GRAFANA_PASSWORD)" \
		-auto-approve

.PHONY: tf-dev-kubeconfig
tf-dev-kubeconfig:  ## Update kubeconfig for dev EKS cluster
	@cd terraform/environments/dev && \
		aws eks update-kubeconfig \
		--name $$(terraform output -raw cluster_name) \
		--region us-east-1

# ── Terraform — Prod ──────────────────────────────────────────
.PHONY: tf-prod-init
tf-prod-init:  ## terraform init for prod environment
	cd terraform/environments/prod && terraform init

.PHONY: tf-prod-plan
tf-prod-plan:  ## terraform plan for prod environment (no apply)
	cd terraform/environments/prod && terraform plan \
		-var="grafana_admin_password=$(GRAFANA_PASSWORD)"

.PHONY: tf-prod-kubeconfig
tf-prod-kubeconfig:  ## Update kubeconfig for prod EKS cluster
	@cd terraform/environments/prod && \
		aws eks update-kubeconfig \
		--name $$(terraform output -raw cluster_name) \
		--region us-east-1

# NOTE: tf-prod-apply and tf-prod-destroy are intentionally absent.
# Prod changes MUST go through GitHub Actions with approval gate.
# Run: gh workflow run terraform-prod.yml

.PHONY: help
help:  ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*##"}; {printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2}'
	@echo ""

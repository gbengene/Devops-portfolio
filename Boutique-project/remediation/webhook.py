"""
Auto-Remediation Webhook
========================
Flask server that receives Alertmanager webhook payloads and
automatically remediates known failure patterns.

Runs inside the cluster as a Deployment in the monitoring namespace.
Alertmanager routes critical alerts here via HTTP POST.

Remediation actions:
  - BoutiquePodCrashLooping    → delete the crash-looping pod (k8s restarts it fresh)
  - BoutiqueDeploymentDegraded → scale deployment to desired replicas
  - Generic critical alert     → log + annotate for human follow-up

Every action is logged with timestamp, alert name, and outcome.
MTTR is measurable in Grafana by comparing alert firing time to resolution time.
"""

import logging
import os
import time
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from kubernetes import client, config

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%SZ",
)
log = logging.getLogger("remediation-webhook")

# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__)

# ── Kubernetes client ─────────────────────────────────────────────────────────
try:
    config.load_incluster_config()          # running inside the cluster
    log.info("Loaded in-cluster kubeconfig")
except config.ConfigException:
    config.load_kube_config()               # local development fallback
    log.info("Loaded local kubeconfig")

core_v1   = client.CoreV1Api()
apps_v1   = client.AppsV1Api()

# ── Config ────────────────────────────────────────────────────────────────────
TARGET_NAMESPACE = os.getenv("TARGET_NAMESPACE", "boutique-dev")
DRY_RUN          = os.getenv("DRY_RUN", "false").lower() == "true"

if DRY_RUN:
    log.warning("DRY_RUN=true — remediation actions will be logged but NOT executed")


# ── Remediation handlers ──────────────────────────────────────────────────────

def remediate_crash_looping_pod(alert: dict) -> str:
    """Delete the crash-looping pod so Kubernetes restarts it fresh."""
    pod_name  = alert.get("labels", {}).get("pod", "")
    namespace = alert.get("labels", {}).get("namespace", TARGET_NAMESPACE)

    if not pod_name:
        return "no pod name in alert labels — skipping"

    log.info(f"[CrashLoop] Deleting pod {namespace}/{pod_name}")

    if not DRY_RUN:
        try:
            core_v1.delete_namespaced_pod(
                name=pod_name,
                namespace=namespace,
                body=client.V1DeleteOptions(grace_period_seconds=0),
            )
            return f"deleted pod {namespace}/{pod_name} — Kubernetes will restart it"
        except client.ApiException as e:
            if e.status == 404:
                return f"pod {pod_name} already gone — likely self-healed"
            raise
    return f"DRY_RUN: would delete pod {namespace}/{pod_name}"


def remediate_degraded_deployment(alert: dict) -> str:
    """Scale the deployment to its desired replica count."""
    deployment = alert.get("labels", {}).get("deployment", "")
    namespace  = alert.get("labels", {}).get("namespace", TARGET_NAMESPACE)

    if not deployment:
        return "no deployment name in alert labels — skipping"

    log.info(f"[Degraded] Checking deployment {namespace}/{deployment}")

    if not DRY_RUN:
        try:
            dep = apps_v1.read_namespaced_deployment(
                name=deployment, namespace=namespace
            )
            desired = dep.spec.replicas or 1
            log.info(f"[Degraded] Patching {deployment} to {desired} replicas")

            apps_v1.patch_namespaced_deployment(
                name=deployment,
                namespace=namespace,
                body={"spec": {"replicas": desired}},
            )
            return f"patched {namespace}/{deployment} → {desired} replicas"
        except client.ApiException as e:
            if e.status == 404:
                return f"deployment {deployment} not found"
            raise
    return f"DRY_RUN: would patch {namespace}/{deployment}"


# ── Alert router ──────────────────────────────────────────────────────────────

HANDLERS = {
    "BoutiquePodCrashLooping":    remediate_crash_looping_pod,
    "BoutiqueDeploymentDegraded": remediate_degraded_deployment,
}


def process_alert(alert: dict) -> dict:
    name     = alert.get("labels", {}).get("alertname", "unknown")
    status   = alert.get("status", "firing")
    severity = alert.get("labels", {}).get("severity", "unknown")

    log.info(f"Processing alert: {name} | status={status} | severity={severity}")

    # Skip resolved alerts (no action needed — just log)
    if status == "resolved":
        log.info(f"Alert {name} resolved — no remediation needed")
        return {"alert": name, "status": "resolved", "action": "none"}

    handler = HANDLERS.get(name)
    if handler:
        result = handler(alert)
        log.info(f"[{name}] Remediation result: {result}")
        return {"alert": name, "status": "firing", "action": result}

    log.warning(f"[{name}] No handler registered — alert logged for human review")
    return {"alert": name, "status": "firing", "action": "no handler — manual review required"}


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/healthz", methods=["GET"])
def healthz():
    return jsonify({"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()})


@app.route("/alert", methods=["POST"])
def receive_alert():
    payload = request.get_json(force=True, silent=True)
    if not payload:
        return jsonify({"error": "invalid JSON payload"}), 400

    alerts  = payload.get("alerts", [])
    results = []

    for alert in alerts:
        start = time.time()
        try:
            result = process_alert(alert)
            result["duration_ms"] = round((time.time() - start) * 1000)
            results.append(result)
        except Exception as e:
            log.error(f"Remediation failed: {e}", exc_info=True)
            results.append({
                "alert": alert.get("labels", {}).get("alertname", "unknown"),
                "error": str(e),
            })

    return jsonify({"processed": len(results), "results": results}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5001"))
    log.info(f"Remediation webhook listening on :{port}")
    log.info(f"Target namespace: {TARGET_NAMESPACE}")
    log.info(f"Dry run mode: {DRY_RUN}")
    app.run(host="0.0.0.0", port=port)

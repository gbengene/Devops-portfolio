# ADR 002 — SLO Definition: 99.9% Availability, p95 < 500ms

**Date:** 2026-04-13
**Status:** Accepted
**Author:** John Gbemiga

---

## Context

The platform needs defined SLOs to make reliability engineering decisions concrete. Without SLOs, "monitoring" is just dashboards — with SLOs, every alert has a business justification.

## Decision

**Availability SLO:** 99.9% of HTTP requests return a non-5xx response, measured over a 30-day rolling window.

**Latency SLO:** 95% of requests complete in under 500ms, measured over 5-minute windows.

## Error Budget Math

```
Allowed downtime (30 days):
  30 days × 24 hrs × 60 min × 0.001 = 43.2 minutes/month

Error budget (by request count):
  If 10 RPS average → 26,280,000 requests/month
  0.1% error budget → 26,280 allowed failures/month
```

## Why 99.9% and Not 99.99%?

99.99% ("four nines") leaves only **4.3 minutes** of error budget per month. For an e-commerce reference platform with:
- No SLA-backed dependencies
- A load generator (not real users)
- A local kind cluster without redundancy

99.99% would be exhausted by a single deployment restart. The SLO must be achievable — an unobtainable SLO teaches nothing.

In a real production environment, the right SLO is negotiated between engineering and business based on customer impact data, not chosen to look impressive.

## Burn Rate Alert Thresholds

Based on Google's SRE Workbook, Chapter 5 (Multi-Window, Multi-Burn-Rate Alerts):

| Alert | Burn Rate | Window | Budget Consumed | Action |
|---|---|---|---|---|
| Fast burn (critical) | 14x | 5m / 1h | 1hr budget in 5 min | Page immediately |
| Slow burn (warning) | 6x | 30m / 6h | 1hr budget in 10 min | Page during business hours |
| Budget warning | 1x | 6h | On-pace to exhaust | No page — monitor |

## Consequences

- Alertmanager rules use multi-window burn rate, not raw error rate thresholds
- Grafana dashboard shows error budget remaining as the primary reliability metric
- Engineers have a shared definition of "the system is degraded" that maps to business impact

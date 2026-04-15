# ReliabilityHub

ReliabilityHub is a service health monitoring and alerting platform for tracking latency, availability, and error rates in real time.
The stack is designed to support high-throughput telemetry pipelines (1M+ metrics/day) with proactive incident routing.

## Core Service

- Node.js + Express monitoring service
- Prometheus metrics endpoint (`/metrics`)
- Sliding window anomaly detection on health signals
- Local observability stack with Prometheus, Grafana, and Alertmanager

## Quick Start

```bash
npm install
npm run start
```

By default the service starts at `http://localhost:3000`.

## Monitoring Stack (Docker Compose)

```bash
docker compose up --build
```

Services:

- App: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- Alertmanager: `http://localhost:9093`
- Alert Router: `http://localhost:3100`
- Grafana: `http://localhost:3001` (admin/admin)

Preconfigured assets:

- Prometheus scrape config and alert rules in `prometheus/`
- Alertmanager routing in `alertmanager/alertmanager.yml`
- Grafana datasource and dashboard provisioning in `grafana/provisioning/`

## Automated Alert Routing

Alert flow:

1. Prometheus evaluates latency, availability, error-rate, and anomaly rules.
2. Alertmanager forwards alert groups to the ReliabilityHub alert router (`/alerts`).
3. Alert router publishes alerts to:
- Slack incoming webhook (severity-based channel mapping)
- AWS CloudWatch custom metrics (`AlertCount`, `DetectionLatencySeconds`)

Configure integration values with `.env` (see `.env.example`).

## Kubernetes + AWS

- Kubernetes manifests are available under `k8s/` (app, Prometheus, Alertmanager, Grafana, HPA).
- AWS deployment/automation scripts are available under `scripts/aws/`.
- Full deployment runbook: `docs/deployment-aws.md`

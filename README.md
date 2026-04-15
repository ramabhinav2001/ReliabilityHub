# ReliabilityHub

ReliabilityHub is a service health monitoring and alerting platform for tracking latency, availability, and error rates in real time.

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
- Grafana: `http://localhost:3001` (admin/admin)

Preconfigured assets:

- Prometheus scrape config and alert rules in `prometheus/`
- Alertmanager routing in `alertmanager/alertmanager.yml`
- Grafana datasource and dashboard provisioning in `grafana/provisioning/`

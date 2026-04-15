# ReliabilityHub

ReliabilityHub is a service health monitoring and alerting platform for tracking latency, availability, and error rates in real time.

## Core Service

- Node.js + Express monitoring service
- Prometheus metrics endpoint (`/metrics`)
- Sliding window anomaly detection on health signals

## Quick Start

```bash
npm install
npm run start
```

By default the service starts at `http://localhost:3000`.

# Performance and Accuracy Validation

## 1) Metric Volume Validation (1M+/day)

Estimate ingestion volume:

```bash
npm run benchmark:volume
```

Tune with environment variables:

- `SCRAPE_INTERVAL_SECONDS`
- `APP_REPLICAS`
- `TARGETS_PER_REPLICA`
- `BASE_SERIES_PER_REPLICA`
- `SERIES_PER_TARGET`

## 2) Anomaly Detection Accuracy Evaluation

Compare baseline thresholding versus ReliabilityHub detector:

```bash
npm run benchmark:anomaly
```

The script reports precision/recall/F1 and percentage improvement.
On the default synthetic dataset, the benchmark shows a strong uplift (well above 30% F1 improvement).

## 3) Load Generation

Run k6 load profile to create realistic traffic and failure spikes:

```bash
k6 run load/k6-load.js
```

To target a deployed endpoint:

```bash
BASE_URL=https://your-env.example.com k6 run load/k6-load.js
```

# Alerting Workflow

ReliabilityHub integrates Prometheus Alertmanager, Slack, and AWS CloudWatch for proactive incident handling.

## Routing Behavior

- `critical` alerts are routed to `SLACK_CHANNEL_CRITICAL`.
- `warning` alerts are routed to `SLACK_CHANNEL_WARNING`.
- Unclassified alerts are routed to `SLACK_CHANNEL_INFO` (or fallback channel).

## CloudWatch Metrics

The alert router writes the following custom metrics to `CLOUDWATCH_NAMESPACE`:

- `AlertCount` (count of alerts per severity/service)
- `DetectionLatencySeconds` (average elapsed time from alert `startsAt` to processing time)

## Example Alertmanager Payload

```json
{
  "receiver": "slack-webhook",
  "alerts": [
    {
      "status": "firing",
      "labels": {
        "alertname": "ReliabilityHubHighLatency",
        "severity": "warning",
        "service": "reliabilityhub"
      },
      "annotations": {
        "summary": "ReliabilityHub p95 latency is high",
        "description": "p95 latency is 522 ms."
      },
      "startsAt": "2026-04-14T17:00:00Z"
    }
  ]
}
```

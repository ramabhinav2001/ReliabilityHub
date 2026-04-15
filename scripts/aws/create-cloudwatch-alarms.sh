#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${1:-ReliabilityHub/Alerts}"
REGION="${2:-us-east-1}"
TOPIC_ARN="${3:-}"

if [[ -z "${TOPIC_ARN}" ]]; then
  echo "Usage: $0 <namespace> <region> <sns-topic-arn>"
  exit 1
fi

aws cloudwatch put-metric-alarm \
  --region "${REGION}" \
  --alarm-name "ReliabilityHub-High-Critical-Alert-Count" \
  --alarm-description "Critical alert volume exceeded threshold" \
  --namespace "${NAMESPACE}" \
  --metric-name "AlertCount" \
  --dimensions Name=severity,Value=critical \
  --statistic Sum \
  --period 60 \
  --evaluation-periods 2 \
  --threshold 3 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions "${TOPIC_ARN}"

aws cloudwatch put-metric-alarm \
  --region "${REGION}" \
  --alarm-name "ReliabilityHub-Detection-Latency-Degraded" \
  --alarm-description "Average detection latency is above expected range" \
  --namespace "${NAMESPACE}" \
  --metric-name "DetectionLatencySeconds" \
  --statistic Average \
  --period 60 \
  --evaluation-periods 3 \
  --threshold 90 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions "${TOPIC_ARN}"

echo "CloudWatch alarms created for namespace ${NAMESPACE}."

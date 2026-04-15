#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <docker-image-tag>"
  echo "Example: $0 ramabhinav2001/reliabilityhub:v1.0.0"
  exit 1
fi

IMAGE_TAG="$1"

echo "Updating Kubernetes image references to ${IMAGE_TAG}"
sed -i.bak "s|ramabhinav2001/reliabilityhub:latest|${IMAGE_TAG}|g" k8s/reliabilityhub-deployment.yaml k8s/alert-router-deployment.yaml
rm -f k8s/*.bak

echo "Applying manifests"
kubectl apply -k k8s/

echo "Waiting for rollouts"
kubectl -n reliabilityhub rollout status deployment/reliabilityhub-app
kubectl -n reliabilityhub rollout status deployment/reliabilityhub-alert-router
kubectl -n reliabilityhub rollout status deployment/reliabilityhub-prometheus
kubectl -n reliabilityhub rollout status deployment/reliabilityhub-alertmanager
kubectl -n reliabilityhub rollout status deployment/reliabilityhub-grafana

echo "EKS deployment completed."

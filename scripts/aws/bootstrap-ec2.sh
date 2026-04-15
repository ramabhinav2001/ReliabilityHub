#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-plugin awscli
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

mkdir -p /opt/reliabilityhub
cd /opt/reliabilityhub

cat > .env <<EOF
AWS_REGION=${AWS_REGION:-us-east-1}
CLOUDWATCH_NAMESPACE=${CLOUDWATCH_NAMESPACE:-ReliabilityHub/Alerts}
SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL:-}
SLACK_CHANNEL_CRITICAL=${SLACK_CHANNEL_CRITICAL:-#reliability-critical}
SLACK_CHANNEL_WARNING=${SLACK_CHANNEL_WARNING:-#reliability-warning}
EOF

if [[ -f docker-compose.yml ]]; then
  sudo docker compose pull || true
  sudo docker compose up -d --build
fi

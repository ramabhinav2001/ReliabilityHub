# AWS Deployment Guide

This project supports both EC2 + Docker Compose and EKS + Kubernetes deployment.

## Option 1: EC2 (Docker Compose)

1. Provision an Ubuntu EC2 instance with security group access:
- `3000` (app)
- `3001` (Grafana)
- `9090` (Prometheus)
- `9093` (Alertmanager)
- `3100` (Alert Router, optional)
2. Copy project files to `/opt/reliabilityhub`.
3. Run bootstrap:

```bash
chmod +x scripts/aws/bootstrap-ec2.sh
AWS_REGION=us-east-1 SLACK_WEBHOOK_URL=... ./scripts/aws/bootstrap-ec2.sh
```

4. Deploy updates:

```bash
chmod +x scripts/aws/deploy-ec2.sh
./scripts/aws/deploy-ec2.sh <ec2-public-hostname>
```

## Option 2: EKS (Kubernetes)

1. Build and push image:

```bash
docker build -t ramabhinav2001/reliabilityhub:v1.0.0 .
docker push ramabhinav2001/reliabilityhub:v1.0.0
```

2. Create Kubernetes secret from template:

```bash
kubectl apply -f k8s/secret.example.yaml
```

3. Apply manifests:

```bash
chmod +x scripts/aws/deploy-eks.sh
./scripts/aws/deploy-eks.sh ramabhinav2001/reliabilityhub:v1.0.0
```

## CloudWatch Alarm Bootstrapping

Use this script after alert metrics start flowing:

```bash
chmod +x scripts/aws/create-cloudwatch-alarms.sh
./scripts/aws/create-cloudwatch-alarms.sh ReliabilityHub/Alerts us-east-1 arn:aws:sns:us-east-1:123456789012:reliabilityhub-alerts
```

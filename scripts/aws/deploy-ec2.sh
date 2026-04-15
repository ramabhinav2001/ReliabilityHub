#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <ec2-host> [ec2-user]"
  exit 1
fi

HOST="$1"
USER_NAME="${2:-ubuntu}"
DEST="${USER_NAME}@${HOST}:/opt/reliabilityhub"

echo "Syncing project files to ${DEST}"
rsync -avz \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude ".env" \
  ./ "${DEST}"

echo "Starting stack on remote host"
ssh "${USER_NAME}@${HOST}" "cd /opt/reliabilityhub && sudo docker compose up -d --build"

echo "Deployment completed."

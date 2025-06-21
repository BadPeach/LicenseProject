#!/bin/bash

LOG_NAME=$1
DURATION=$2  # seconds

echo "🔍 Starting docker stats for $DURATION seconds..."

sudo timeout "$DURATION" docker stats --no-stream=false \
  --no-trunc \
  --format "{{.Name}},{{.CPUPerc}},{{.MemUsage}},{{.NetIO}},{{.BlockIO}}" \
  | sed 's/\x1b\[[0-9;]*[a-zA-Z]//g' > "/tmp/$LOG_NAME"

echo "✅ Cleaned Docker stats saved to /tmp/$LOG_NAME"
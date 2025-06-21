#!/bin/bash

# === CONFIGURATION ===
REMOTE_USER=ec2-user                    # or ubuntu, depending on your AMI
REMOTE_HOST=18.195.147.62              # your AWS instance IP
KEY_PATH=VerilogServerKey.pem
REMOTE_SCRIPT=remote_monitor_docker.sh
MONITOR_DURATION=25                    # seconds (e.g. k6 duration + buffer)
ENDPOINT=$1                            # analyzeCircuit | uploadAndAnalyze
VUS=$2                                 # e.g., 25
DURATION=$3                            # e.g., 20s
LOG_NAME="dockerstats_aws_${ENDPOINT}_${VUS}vus_${DURATION}.log"
SCRIPT_NAME=""

# === Resolve test script ===
if [[ "$ENDPOINT" == "analyzeCircuit" ]]; then
  SCRIPT_NAME="scripts/test_analyzeCircuit.js"
elif [[ "$ENDPOINT" == "processVerilogFile" ]]; then
  SCRIPT_NAME="scripts/test_processVerilogFile.js"
else
  echo "❌ Unknown endpoint: $ENDPOINT"
  exit 1
fi

mkdir -p results

# === Upload monitoring script to remote ===
echo "📤 Uploading monitor script to $REMOTE_HOST..."
scp -i "$KEY_PATH" "$REMOTE_SCRIPT" "$REMOTE_USER@$REMOTE_HOST:/tmp/$REMOTE_SCRIPT"

# === Start docker stats in background on remote ===
echo "📡 Starting docker stats on remote host (parallel)..."
ssh -i "$KEY_PATH" "$REMOTE_USER@$REMOTE_HOST" <<EOF
chmod +x /tmp/$REMOTE_SCRIPT
nohup /tmp/$REMOTE_SCRIPT "$LOG_NAME" "$MONITOR_DURATION" > /dev/null 2>&1 &
exit
EOF

# === Run K6 test and time it ===
echo "🚀 Running K6 test ($ENDPOINT with $VUS VUs for $DURATION)..."
TARGET_HOST="http://$REMOTE_HOST"
JSON_OUT="results/results_aws_${ENDPOINT}_${VUS}vus_${DURATION}.json"

START_TIME=$(date +%s)
TARGET_HOST="$TARGET_HOST" k6 run --vus "$VUS" --duration "$DURATION" "$SCRIPT_NAME" --out json="$JSON_OUT"
END_TIME=$(date +%s)

K6_DURATION=$((END_TIME - START_TIME))
REMAINING=$((MONITOR_DURATION - K6_DURATION))

if [ "$REMAINING" -gt 0 ]; then
  echo "⏳ Waiting remaining $REMAINING seconds for docker stats to flush..."
  sleep "$REMAINING"
else
  echo "⚠️  k6 ran longer than MONITOR_DURATION, skipping extra sleep."
fi

# === Download the docker stats log ===
echo "📥 Retrieving docker stats log..."
scp -i "$KEY_PATH" "$REMOTE_USER@$REMOTE_HOST:/tmp/$LOG_NAME" "results/$LOG_NAME"

# === Clean up remote log file ===
echo "🧹 Deleting remote docker stats log..."
ssh -i "$KEY_PATH" "$REMOTE_USER@$REMOTE_HOST" "rm -f /tmp/$LOG_NAME"

echo "✅ Done! Results:"
echo "- JSON: results/results_aws_${ENDPOINT}_${VUS}vus_${DURATION}.json"
echo "- Docker stats: results/$LOG_NAME"

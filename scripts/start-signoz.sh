#!/usr/bin/env bash
set -euo pipefail

WORKDIR=$(pwd)

echo "Using local SigNoz compose stack..."
cd "$WORKDIR"

# stop old containers from any prior attempts
docker compose -f docker-compose.signoz.yml down --remove-orphans || true

# run stack from local compose to avoid /tmp mounting issues
docker compose -f docker-compose.signoz.yml up -d

echo "SigNoz stack started (or attempts to)."

echo "SigNoz UI: http://localhost:3301"
echo "OTLP gRPC: localhost:4317"
echo "OTLP HTTP: localhost:4318"

echo "Set frontend env and run:
  export NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
  export NEXT_PUBLIC_OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=http://localhost:4318/v1/logs
  export NEXT_PUBLIC_OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:4318/v1/metrics
  export NEXT_PUBLIC_SIGNOZ_URL=http://localhost:3301
  npm run dev"


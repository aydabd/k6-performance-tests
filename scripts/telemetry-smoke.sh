#!/usr/bin/env bash
set -Eeuo pipefail

RUN_ID="${TEST_RUN_ID:-telemetry-smoke-$(date -u +%Y%m%dT%H%M%SZ)}"
LOG_DIR="${TELEMETRY_LOG_DIR:-test-logs/$RUN_ID}"
INFLUX_URL="${INFLUXDB_URL:-http://localhost:8086}"
INFLUX_ORG="${INFLUXDB_ORG:-k6testorg}"
INFLUX_BUCKET="${INFLUXDB_BUCKET:-simple-k6-tests}"
INFLUX_TOKEN="${INFLUXDB_TOKEN:-}"
GRAFANA_URL="${GRAFANA_URL:-http://localhost:3000}"

mkdir -p "$LOG_DIR"

collect_diagnostics() {
    docker compose ps >"$LOG_DIR/compose-ps.log" 2>&1 || true
    docker compose logs --no-color otel-collector otel-collector-ready influxdb grafana >"$LOG_DIR/service-logs.log" 2>&1 || true
}

trap collect_diagnostics ERR

if [ -z "$INFLUX_TOKEN" ]; then
    echo "INFLUXDB_TOKEN is required" >&2
    exit 2
fi

export INFLUXDB_ORG="$INFLUX_ORG"
export INFLUXDB_BUCKET="$INFLUX_BUCKET"
export INFLUXDB_TOKEN="$INFLUX_TOKEN"
export TEST_RUN_ID="$RUN_ID"
docker compose up -d --wait influxdb grafana-tempo otel-collector otel-collector-ready grafana >"$LOG_DIR/compose-up.log" 2>&1
docker compose build k6-template-influxdb-base >"$LOG_DIR/image-build.log" 2>&1
docker compose build simple-k6-test-template >>"$LOG_DIR/image-build.log" 2>&1
docker compose run --rm simple-k6-test-template >"$LOG_DIR/k6.log" 2>&1
sleep "${TELEMETRY_QUERY_DELAY:-6}"

cat >"$LOG_DIR/query.flux" <<EOF
from(bucket: "${INFLUX_BUCKET}")
  |> range(start: -15m)
  |> filter(fn: (r) => r.testRunId == "${RUN_ID}")
EOF

curl --fail --silent --show-error \
    --request POST "${INFLUX_URL}/api/v2/query?org=${INFLUX_ORG}" \
    --header "Authorization: Token ${INFLUX_TOKEN}" \
    --header 'Content-Type: application/vnd.flux' \
    --header 'Accept: application/csv' \
    --data-binary @"$LOG_DIR/query.flux" >"$LOG_DIR/query.csv"

grep -Fq -- "$RUN_ID" "$LOG_DIR/query.csv"
grep -Fq -- ',http_req_duration,' "$LOG_DIR/query.csv"
grep -Fq -- ',iterations,' "$LOG_DIR/query.csv"
grep -Fq -- ',checks.total,' "$LOG_DIR/query.csv"
curl --fail --silent --show-error "${GRAFANA_URL}/api/health" >"$LOG_DIR/grafana-health.json"
echo "Telemetry smoke passed for TEST_RUN_ID=$RUN_ID; artifacts: $LOG_DIR"

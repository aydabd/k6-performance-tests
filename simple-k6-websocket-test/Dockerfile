# syntax=docker/dockerfile:1
FROM k6-template-influxdb-base:2.2.0

ARG WORK_DIR=/performance-k6
ENV API_SERVER=websocket-echo \
    PERFORMANCE_K6_OPTION_CONFIG_PATH=${WORK_DIR}/k6-config-options/default-test-config.json \
    TEST_RUN_ID=default \
    K6_TAGS=testRunId:default \
    K6_OTEL_EXPORTER_PROTOCOL=grpc \
    K6_OTEL_GRPC_EXPORTER_ENDPOINT=otel-collector:4317 \
    K6_OTEL_GRPC_EXPORTER_INSECURE=true

WORKDIR ${WORK_DIR}
COPY --chown=k6:k6 simple-k6-websocket-test ${WORK_DIR}/simple-k6-websocket-test
ENTRYPOINT ["k6"]
CMD ["run", "--out", "opentelemetry", "--config", "/performance-k6/k6-config-options/default-test-config.json", "/performance-k6/simple-k6-websocket-test/websocket-test.js"]

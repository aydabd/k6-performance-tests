# syntax=docker/dockerfile:1
FROM k6-template-influxdb-base:2.2.0

ARG WORK_DIR=/performance-k6
ENV API_SERVER=dogapi.dog \
    BUSINESS_FLOW_NAME=default-flow \
    PERFORMANCE_K6_OPTION_CONFIG_PATH=${WORK_DIR}/k6-config-options/scenario-lifecycle-config.json \
    TEST_RUN_ID=default \
    K6_TAGS=testRunId:default \
    K6_OTEL_EXPORTER_PROTOCOL=grpc \
    K6_OTEL_GRPC_EXPORTER_ENDPOINT=otel-collector:4317 \
    K6_OTEL_GRPC_EXPORTER_INSECURE=true

WORKDIR ${WORK_DIR}
COPY --chown=k6:k6 business-flow-template ${WORK_DIR}/business-flow-template
ENTRYPOINT ["k6"]
CMD ["run", "--out", "opentelemetry", "--config", "/performance-k6/k6-config-options/scenario-lifecycle-config.json", "/performance-k6/business-flow-template/business-flow-test.js"]

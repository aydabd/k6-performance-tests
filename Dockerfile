# syntax=docker/dockerfile:1
FROM grafana/k6:2.2.0

ARG WORK_DIR=/performance-k6
ARG K6_CONFIG_DIR=/performance-k6/k6-config-options
ARG K6_LOG_DIR=/performance-k6/test-logs

USER root
RUN mkdir -p "${WORK_DIR}" "${K6_LOG_DIR}" && chown -R k6:k6 "${WORK_DIR}"

WORKDIR ${WORK_DIR}
COPY --chown=k6:k6 src ${WORK_DIR}/src
COPY --chown=k6:k6 k6-config-options ${K6_CONFIG_DIR}

ENV K6_OTEL_EXPORTER_PROTOCOL=grpc \
    K6_OTEL_GRPC_EXPORTER_ENDPOINT=otel-collector:4317 \
    K6_OTEL_GRPC_EXPORTER_INSECURE=true \
    K6_TAGS=testRunId:default \
    TEST_RUN_ID=default \
    K6_LOG_OUTPUT=file=/performance-k6/test-logs/k6.log \
    K6_LOG_FORMAT=json \
    K6_NO_USAGE_REPORT=true

USER k6
VOLUME ${K6_LOG_DIR}
ENTRYPOINT ["k6"]

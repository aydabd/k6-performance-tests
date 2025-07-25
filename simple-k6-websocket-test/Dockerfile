# syntax=docker/dockerfile:1
##############################################################################################
# Title: Dockerfile for websocket test.
# Author: Aydin Abdi <ayd.abd@gmail.com>
# License: MIT
#
# Description: This Dockerfile is used to build the image for the websocket test.
# The image is built on top of the k6-template-influxdb-base image.
# The image is used to run the k6 performance test and export the result to an InfluxDB database.
#
# Usage: The image is built with the following command: (Base image needs to be built first)
#   1. docker build -t k6-template-influxdb-base:latest .
#   2. docker build -t simple-k6-websocket-test:latest -f simple-k6-websocket-test/Dockerfile . \
#                   --build-arg API_SERVER="my-own-server-address" \
#
# The image is run with the following command:
#   - docker run --rm -it \
#                --network=k6_performance_webnet \
#                -v "$(pwd)/test-logs:/performance-k6/test-logs" \
#                -u "$(id -u):$(id -g)" \
#                -e API_SERVER=other.server.address \
#                -e K6_INFLUXDB_TOKEN="token" \
#                simple-k6-websocket-test:latest
# Notice:
#   - The network should be the same as the network that the InfluxDB is running on from compose.yaml.
#   - The volume should be the same as the volume that images export the logs to.
#   - The user should be the same as the local user for the logs to be accessible.
#   - The API_SERVER should be the same as the server that the test will run against.
#   - The K6_INFLUXDB_TOKEN should be the same as the token that the InfluxDB is using.
#
# Note: There is a script that can be used to start the compose.yaml file and build and run the specified image.
################################################################################################################
ARG BASE_IMAGE_NAME="k6-template-influxdb-base"
ARG BASE_IMAGE_VERSION="latest"
FROM $BASE_IMAGE_NAME:$BASE_IMAGE_VERSION

# ARGs for the image name and version
ARG IMAGE_NAME="simple-k6-websocket-test"
ARG IMAGE_VERSION="latest"

# Labels for the image metadata
LABEL image.base.tag="${BASE_IMAGE_NAME}:${BASE_IMAGE_VERSION}" \
      image.name="${IMAGE_NAME}" \
      image.version="${IMAGE_VERSION}" \
      description="This image is used to run the k6 performance test and export the result to an InfluxDB database." \
      image.tag="${IMAGE_NAME}:${IMAGE_VERSION}" \
      image.base.tag="${BASE_IMAGE_NAME}:${BASE_IMAGE_VERSION}"

ARG WORK_DIR="/performance-k6"

# These are the default values for the test configuration
ARG PERFORMANCE_K6_OPTION_CONFIG_FOLDER_NAME="k6-config-options" \
    PERFORMANCE_K6_OPTION_CONFIG_FILE_NAME="default-test-config.json" \
    PERFORMANCE_K6_OPTION_CONFIG_PATH="${WORK_DIR}/${PERFORMANCE_K6_OPTION_CONFIG_FOLDER_NAME}/${PERFORMANCE_K6_OPTION_CONFIG_FILE_NAME}"

# These are the default values for the test folder and file
ARG PERFORMANCE_K6_TEST_FOLDER_NAME="simple-k6-websocket-test" \
    PERFORMANCE_K6_TEST_FILE_PATH="./simple-k6-websocket-test/websocket-test.js"

# These are the default values for the test log folder and file
ARG PERFORMANCE_K6_TEST_LOG_DIR_NAME="test-logs"

# These are the default values for the API service that the test will run against
ARG API_SERVER="websocket-echo"

# These are the same environment variables that are used in the official k6 image
ARG K6_OUT="xk6-influxdb=http://influxdb:8086" \
    K6_CONSOLE_OUTPUT="${WORK_DIR}/${PERFORMANCE_K6_TEST_LOG_DIR_NAME}/${PERFORMANCE_K6_TEST_FOLDER_NAME}_console.log" \
    K6_LOG_OUTPUT="file=${WORK_DIR}/${PERFORMANCE_K6_TEST_LOG_DIR_NAME}/${PERFORMANCE_K6_TEST_FOLDER_NAME}_json.log" \
    K6_LOG_FORMAT="json" \
    K6_LOG_LEVEL="info" \
    K6_HTTP_DEBUG="false" \
    K6_NO_USAGE_REPORT="true" \
    K6_INSECURE_SKIP_TLS_VERIFY="false" \
    K6_DISCARD_RESPONSE_BODIES="true" \
    K6_NO_CONNECTION_REUSE="false"

# These are the same environment variables that are used in the official k6-output-influxdb image
# see: https://grafana.com/docs/k6/latest/results-output/real-time/influxdb/#options
ARG K6_INFLUXDB_ORGANIZATION="k6testorg" \
    K6_INFLUXDB_BUCKET="simple-k6-tests" \
    K6_INFLUXDB_ADDR="http://performance.k6.test/influxdb" \
    K6_INFLUXDB_PUSH_INTERVAL="4s" \
    K6_INFLUXDB_CONCURRENT_WRITES="4" \
    K6_INFLUXDB_TAGS_AS_FIELDS="vu:int,iter:int,url:string,method:string, \
                                status:int,group:string,check:string,error:string,event_time:int" \
    K6_INFLUXDB_INSECURE="false" \
    K6_INFLUXDB_PRECISION="1ns" \
    K6_INFLUXDB_HTTP_PROXY=""

# K6_DEFAULT_CONFIGURATION_FILE is the default configuration file for k6
# This is not available in the official k6 image
# see: https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/#config
ARG K6_DEFAULT_CONFIGURATION_FILE="/home/k6/.config/loadimpact/k6/config.json"

# Set the default environment variables for this test configuration
ENV PERFORMANCE_K6_OPTION_CONFIG_FOLDER_NAME="${PERFORMANCE_K6_OPTION_CONFIG_FOLDER_NAME}" \
    PERFORMANCE_K6_OPTION_CONFIG_PATH="${WORK_DIR}/${PERFORMANCE_K6_OPTION_CONFIG_FOLDER_NAME}/${PERFORMANCE_K6_OPTION_CONFIG_FILE_NAME}"

ENV PERFORMANCE_K6_TEST_FOLDER_NAME="${PERFORMANCE_K6_TEST_FOLDER_NAME}" \
    PERFORMANCE_K6_TEST_FILE_PATH="${PERFORMANCE_K6_TEST_FILE_PATH}"

ENV PERFORMANCE_K6_TEST_LOG_DIR_NAME="${PERFORMANCE_K6_TEST_LOG_DIR_NAME}"

# Set the default environment variables for the API service that the test will run against
# For security reasons, the API_USERNAME and API_PASSWORD should be set as secrets
# see: https://grafana.com/docs/k6/latest/using-k6/environment-variables/
ENV API_SERVER="${API_SERVER}" \
    API_USERNAME="${API_USERNAME}" \
    API_PASSWORD="${API_PASSWORD}"

# Set the default environment variables for the k6 official variables
ENV K6_OUT="${K6_OUT}" \
    K6_CONSOLE_OUTPUT="${K6_CONSOLE_OUTPUT}" \
    K6_LOG_OUTPUT="${K6_LOG_OUTPUT}" \
    K6_LOG_FORMAT="${K6_LOG_FORMAT}" \
    K6_LOG_LEVEL="${K6_LOG_LEVEL}" \
    K6_HTTP_DEBUG="${K6_HTTP_DEBUG}" \
    K6_NO_USAGE_REPORT="${K6_NO_USAGE_REPORT}" \
    K6_INSECURE_SKIP_TLS_VERIFY="${K6_INSECURE_SKIP_TLS_VERIFY}" \
    K6_DISCARD_RESPONSE_BODIES="${K6_DISCARD_RESPONSE_BODIES}" \
    K6_NO_CONNECTION_REUSE="${K6_NO_CONNECTION_REUSE}"

# This is not available in the official k6 image
ENV K6_DEFAULT_CONFIGURATION_FILE="${K6_DEFAULT_CONFIGURATION_FILE}"

# Set the default environment variables for the k6-output-influxdb variables
ENV K6_INFLUXDB_ORGANIZATION="${K6_INFLUXDB_ORGANIZATION}" \
    K6_INFLUXDB_BUCKET="${K6_INFLUXDB_BUCKET}" \
    K6_INFLUXDB_ADDR="${K6_INFLUXDB_ADDR}" \
    K6_INFLUXDB_PUSH_INTERVAL="${K6_INFLUXDB_PUSH_INTERVAL}" \
    K6_INFLUXDB_CONCURRENT_WRITES="${K6_INFLUXDB_CONCURRENT_WRITES}" \
    K6_INFLUXDB_TAGS_AS_FIELDS="${K6_INFLUXDB_TAGS_AS_FIELDS}" \
    K6_INFLUXDB_INSECURE="${K6_INFLUXDB_INSECURE}" \
    K6_INFLUXDB_PRECISION="${K6_INFLUXDB_PRECISION}" \
    K6_INFLUXDB_HTTP_PROXY="${K6_INFLUXDB_HTTP_PROXY}"

################################################################################################################
# TODO: The influxdb token should be set as a secret and should be removed from the Dockerfile
# This token is connecting influxdb datasource for Grafana.
# The same token is used for grafana/datasources/datasource.yaml
ENV K6_INFLUXDB_TOKEN=y3zTEWhDLPfa05-op-gKftVHhbEkmNL98uijqokTMr_JHdlK59PpitKl6QdXNF3YQVrLXdtTdjISNSqWtFwbFw==
################################################################################################################

# WORKDIR is the working directory for the k6 performance test
WORKDIR "${WORK_DIR}"

# Copy the necessary files from the local directory to the container
COPY --chown=k6:k6 ./"${PERFORMANCE_K6_TEST_FOLDER_NAME}" ./"${PERFORMANCE_K6_TEST_FOLDER_NAME}"

# Set the volume for the logs
VOLUME "${WORK_DIR}/${PERFORMANCE_K6_TEST_LOG_DIR_NAME}"

# Marks the port that the container listens on for influxdb
EXPOSE 8086

# Run the test with the k6 command and the necessary options
ENTRYPOINT ["sh", "-c", "k6 run --config ${PERFORMANCE_K6_OPTION_CONFIG_PATH} ${PERFORMANCE_K6_TEST_FILE_PATH}"]

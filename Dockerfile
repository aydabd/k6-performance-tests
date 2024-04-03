# syntax=docker/dockerfile:1
##################################################################################################################
# Title: Dockerfile for Building an Image to Run k6 Performance Tests
# Author: Aydin Abdi
# License: MIT
#
# Description:
# This Dockerfile builds an image for running k6 performance tests.
# It uses grafana/xk6 as its base and copies the necessary source code and resources into the container.
# This setup enables easy and efficient management of test codes and associated static files.
# The source codes and static files are placed in the '/performance-k6' directory within the container.
# This structure facilitates the organization and access to test-related files during execution.
# For each specific test scenario, there is a dedicated test folder. Inside each test folder,
# there is its own Dockerfile responsible for building a unique container for that specific test.
# These Dockerfiles use this image as their starting point. This means that each test container is pre-configured
# with all necessary source codes and resources, ready to execute the test scripts defined for each scenario.
# To enable the configuration of k6 variables and settings for each test scenario, there is a separate directory
# for k6 configurations. This directory is copied into the container during the build phase. This allows for easy
# configuration of k6 variables and settings for each test.
#
# To use this image, see the usage instructions below.
#
# Usage:
# 1. Build the base image with the necessary k6 extension. Example:
#    docker build -t k6-template-influxdb-base:latest . \
#                   --build-arg XK6_VERSION=latest \
#                   --build-arg XK6_EXTENSION_NAME=xk6-output-influxdb \
#                   --build-arg XK6_EXTENSION_VERSION=latest
#
#    This builds a base image with the necessary k6 extension for running k6 performance tests.
#
# 2. For each test scenario, create a Dockerfile in the respective test folder that is based on
#    this image. Specify the unique test script to run as the default command (CMD).
#    Example: my-test-scenario/Dockerfile
#    FROM k6-template-influxdb-base:latest
#    WORKDIR /performance-k6
#    ENV PERFORMANCE_K6_OPTION_CONFIG="/performance-k6/k6-config-options/my-k6-config.json" \
#        PERFROMANCE_K6_TEST_FOLDER="/performance-k6/my-scenario-test" \
#        PERFROMANCE_K6_TEST_FILE="${PERFROMANCE_K6_TEST_FOLDER}/my-test.js"
#        PERFORMANCE_K6_TEST_LOG_DIR="/performance-k6/test-logs" \
#        API_SERVER="my.api.server.address" \
#        K6_LOG_OUTPUT="file=/performance-k6/test-logs/k6-test_$(date +'%Y-%m-%d_%H-%M-%S')" \
#        K6_LOG_FORMAT="json" \
#        K6_CONSOLE_OUTPUT="/performance-k6/test-logs/console_$(date +'%Y-%m-%d_%H-%M-%S')"
#
#    # Copy test code to the container
#    COPY ./my-scenario-test ${PERFROMANCE_K6_TEST_FOLDER}"
#    VOLUME ${PERFORMANCE_K6_TEST_LOG_DIR}
#    CMD ["sh", "-c", \
#         "k6 run --config ${PERFORMANCE_K6_OPTION_CONFIG} ${PERFROMANCE_K6_TEST_FILE}"]
#
#    This Dockerfile builds a container that runs my-scenario-test as the default command when run.
#
#    Note that k6 configurations are in a separate directory that has already been copied to the container via
#    the base image.
#
# 3. Build the test containers with appropriate flags and parameters. Example:
#    docker build -t my-scenario-test:latest -f ./my-scenario-test/Dockerfile .
#
# 4. Run the test containers with appropriate flags and parameters. Example:
#    docker run -it --rm -u "$(id -u):$(id -g)" -v "$(pwd)/test-logs:/performance-k6/test-logs" \
#               -e API_SERVER="my.api.server.address" my-test-scenario:latest
#
#    Note that the -u and -v flags are used to run the container with the user's permissions and to mount a volume
#    to save test logs and results outside the container with the correct permissions.
#
# Note:
# - This Dockerfile builds an image for running k6 performance tests. One can use this image to run k6 test scripts
#   with any configuration and settings. To run k6 with default settings, use this image as it is. To run k6 with
#   custom settings, create a new Dockerfile based on this image and specify the custom settings as environment
#   variables.
# - To run tests with this image, use the docker run command with appropriate flags and parameters.
# Example:
#   docker run -it --rm -u "$(id -u):$(id -g)" -v "$(pwd)/test-logs:/performance-k6/test-logs" \
#           k6-influxdb:latest run --config /performance-k6/k6-config-options/my-k6-config.json \
#           /performance-k6/my-scenario-test/scenario-test.js
# This runs the 'run' command for k6 with custom settings and the test script 'scenario-test.js' from the
# 'my-scenario-test' folder. Test logs and results are saved in the 'test-logs' folder outside the container.
##################################################################################################################

# Set ARGs to define version numbers for xk6
ARG XK6_IMAGE="grafana/xk6"
ARG XK6_VERSION="latest"
ARG ALPINE_VERSION=3.17
# Use the grafana/xk6 as the base image to build k6 with extension
FROM ${XK6_IMAGE}:${XK6_VERSION} as builder

# Set ARGs to allow overriding variables during build phase
ARG K6_VERSION="latest"
ARG SOURCE_URL="github.com/grafana"
ARG XK6_EXTENSION_NAME="xk6-output-influxdb"
ARG XK6_EXTENSION_VERSION="latest"

# Set the working directory to /xk6
WORKDIR /xk6

# Build k6 with extension
RUN xk6 build "${K6_VERSION}" --with "${SOURCE_URL}/${XK6_EXTENSION_NAME}@${XK6_EXTENSION_VERSION}"

# Create a new stage to build the final base image
FROM alpine:${ALPINE_VERSION} as base

# Define ARGs to allow overriding variables during the build phase
ARG IMAGE_NAME="k6-template-influxdb-base" \
    IMAGE_VERSION="latest" \
    BUILD_DATE=""

ARG WORK_DIR="/performance-k6"

# Define ARGs for k6 configuration and test execution
ARG K6_DEFAULT_CONFIGURATION_FILE="/home/k6/.config/loadimpact/k6/config.json" \
    PERFORMANCE_K6_TEST_LOG_DIR="/performance-k6/test-logs" \
    PERFORMANCE_K6_CONFIG_DIR="/performance-k6/k6-config-options" \
    PERFORMANCE_K6_OPTION_CONFIG="/performance-k6/k6-config-options/default-test-config.json"

# Define environment variables for k6 configuration
ENV K6_DEFAULT_CONFIGURATION_FILE="${K6_DEFAULT_CONFIGURATION_FILE}" \
    PERFORMANCE_K6_TEST_LOG_DIR="${PERFORMANCE_K6_TEST_LOG_DIR}" \
    PERFORMANCE_K6_CONFIG_DIR="${PERFORMANCE_K6_CONFIG_DIR}" \
    PERFORMANCE_K6_OPTION_CONFIG="${PERFORMANCE_K6_OPTION_CONFIG}"

# Set metadata with LABEL to name the base image and specify the version number
LABEL image.name="${IMAGE_NAME}" \
      image.version="${IMAGE_VERSION}" \
      image.tag="${IMAGE_NAME}:${IMAGE_VERSION}" \
      description="Docker image for running k6 performance tests" \
      usage.note="Use this image to run k6 performance tests with custom configurations" \
      image.build.date="${BUILD_DATE}" \
      image.build.version="${IMAGE_VERSION}-${BUILD_DATE}"

# Install ca-certificates and create user k6
RUN apk add --no-cache ca-certificates && \
    update-ca-certificates && \
    adduser -D -u 12345 -g 12345 k6 && \
    mkdir -p ${PERFORMANCE_K6_TEST_LOG_DIR} && \
    chown -R k6:k6 ${PERFORMANCE_K6_TEST_LOG_DIR}

# Copy the k6 binary from the builder stage to the base image
COPY --from=builder /xk6/k6 /usr/bin/k6

# Set the user to run k6
USER k6

# Set the working directory to /performance-k6
WORKDIR ${WORK_DIR}

# Copy the source code to the container
COPY --chown=k6:k6 ./src ${WORK_DIR}/src

# Copy the k6 configuration options to the container
COPY --chown=k6:k6 ./k6-config-options ${PERFORMANCE_K6_CONFIG_DIR}

# Copy the default k6 configuration file to the container
COPY --chown=k6:k6 ./k6-config-options/default-test-config.json "${K6_DEFAULT_CONFIGURATION_FILE}"

# Copy the static files to the container
COPY --chown=k6:k6 ./static ${WORK_DIR}/static

# Define a volume to allow test logs and results to be saved outside the container
VOLUME ${PERFORMANCE_K6_TEST_LOG_DIR}

# Document that the container listens on specific ports when running (if applicable)
EXPOSE 8086

# ENTRYPOINT for running k6
ENTRYPOINT ["k6"]

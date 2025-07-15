# Performance Tests via K6

![Release](https://img.shields.io/github/v/release/aydabd/k6-performance-tests)
![Build Status](https://github.com/aydabd/k6-performance-tests/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

This project contains k6 tests for non-functional testing (load testing, stress testing, spike, etc.), packaged and ready to run with Docker. By using Docker, you can easily run your tests without having to install k6 or any other dependencies directly on your machine, apart from Docker itself.

## Installation Requirements

Before you begin, ensure that you have Docker installed on your computer. If you do not already have Docker, you can follow the instructions for your platform:

- [Install Docker for Windows](https://docs.docker.com/docker-for-windows/install/)
- [Install Docker for macOS](https://docs.docker.com/docker-for-mac/install/)
- [Install Docker for Linux](https://docs.docker.com/engine/install/)

For more information about Docker commands, see the [Tips & Tricks](TIPS_TRICKS.md) documentation.

## Building and Running Via ci-deployment Script (Recommended)

Build all docker images and run tests with docker compose.
You don't need to install any additional dependencies, as everything runs inside the Docker container.

To run your k6 tests, please use the ci-deployment script:

```sh
    # Run with all default values (server: dogapi.dog, k6 config: ./k6-config-options/default-test-config.json)
    ./ci-deployment -d simple-k6-test-template
    # Run tests against a different server address and k6 config
    ./ci-deployment -d simple-k6-test-template -k ./k6-config-options/my-config.json -s server-address-to-use
```

For more information about the ci-deployment script, run the script with the `-h` argument:

```sh
    ./ci-deployment -h
```

## Running Tests in Kubernetes

You can also run the integration tests in a local Kubernetes cluster (for example k3s or kind) using the `k8s-deployment` script. Ensure that `kubectl` is configured to communicate with your cluster.

```sh
./k8s-deployment -d simple-k6-test-template
```

To remove the Kubernetes resources after the test has finished:

```sh
./k8s-deployment -c
```

## Viewing Test Results Via Grafana and influxdb

To view test results via Grafana, access their UI at:

- Grafana UI: [grafana](http://localhost:3000)
- Influxdb UI: [influxdb](http://localhost:8086)

or follow [Add url to your host](#add-url-to-your-host), then you can reach the results via:

- Grafana UI: [performance.k6.test/grafana](http://performance.k6.test/grafana)
- Influxdb UI: [performance.k6.test/influxdb](http://performance.k6.test:8086/influxdb)

## Add URL to Your Host

To access Grafana and InfluxDB through an easily accessible URL, such as `performance.k6.test`, directly from your browser, you need to add a mapping between this URL and your localhost's IP address in your computer's `hosts` file. Below are the instructions for how to do this on different operating systems.

### For Windows Users

1. Open Notepad as an administrator. This is important so you can save changes to system files.

2. In Notepad, open the file `C:\Windows\System32\drivers\etc\hosts`.

3. Add the following line to the end of the file:

   ```text
   127.0.0.1       performance.k6.test
   ```

4. Save the file and close Notepad.

### For macOS and Linux Users

1. Open the Terminal.

2. Edit the `hosts` file with a text editor you're comfortable with, such as using `nano` or `vim`. You'll need to use `sudo` to gain write permissions to the file, like so:

   ```sh
   sudo nano /etc/hosts
   ```

   or

   ```sh
   sudo vim /etc/hosts
   ```

3. Add the following line at the end of the file:

   ```text
   127.0.0.1       performance.k6.test
   ```

4. Save the file and close the text editor. In `nano`, do this by pressing `CTRL+O`, `Enter`, and then `CTRL+X` to exit. In `vim`, save and exit by typing `:wq` and then pressing `Enter`.

After adding this line, you should be able to use the URL `http://performance.k6.test` in your browser to access Grafana and InfluxDB started via your `docker-compose.yaml`. Remember to replace `127.0.0.1` with the actual IP address of your Docker host if you are running this in an environment other than directly on your local machine, such as in a virtual machine or on another computer in your network.

## Creating and Using InfluxDB Queries in Grafana

To create a Flux query in InfluxDB and then use it for visualization in Grafana, follow these steps:

### Step 1: Create Your Query in InfluxDB

1. **Open InfluxDB UI**: Navigate to your InfluxDB instance's UI. The URL depends on your installation, but if you're running locally, it's usually `http://localhost:8086`.

2. **Use Data Explorer**: In the InfluxDB UI, go to **Data Explorer**. This tool allows you to build and test queries visually.

3. **Build Your Query**:
   - Select your **bucket** from the dropdown menu.
   - Use the visual tools to select your measurements, fields, and any filters. Data Explorer lets you create a query without directly writing Flux code.
   - Adjust the time range for your query as needed.

4. **Translate to Flux Query**:
   - Once you're satisfied with your query, click on **Script Editor** to view the generated Flux query.
   - Copy this Flux code. This is your query that you will use in Grafana.

### Step 2: Use Your Query in Grafana

1. **Go to Your Grafana Dashboard**: Open Grafana and navigate to the dashboard where you want to add your new visualization.

2. **Add a New Panel**: Click on **+ Add panel**.

3. **Configure Data Source and Query**:
   - In the **Query** section, select your InfluxDB data source from the dropdown menu.
   - Paste your Flux query into the query field.

4. **Customize Your Visualization**:
   - Choose the type of visualization you prefer (e.g., graph, table, etc.).
   - Customize the settings for your visualization as desired.

5. **Save the Panel**: Give your panel a title and click on **Apply** to add it to your dashboard.

### Step 3: Save and Share Your Dashboard

- Once you've added and configured all desired panels, don't forget to **save** your dashboard.
- You can also **share** or **export** your dashboard as a JSON file to easily reuse or share it with others.

## Creating Tests via OpenAPI Docs (Swagger)

```sh
# Download the OpenAPI generator docker image
docker pull openapitools/openapi-generator-cli

# Download the swagger file to your local machine
curl -k https://server-api/swagger.json -o swagger.json

# Run docker to create tests to your local machine folder: k6-test-swagger
docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli generate -i /local/swagger.json -g k6 -o /local/k6-test-swagger/ --skip-validate-spec
```

## Documentation

There is documentation for the source code that is created during the commit process and updated if the source code is updated with the jsdoc style.

Documentation for the source code can be found here:
[Source Code Documentation](docs/CLIENT_API.md)

## Summary

By following these steps, you've used Docker to build an image for your k6 tests and run them isolated from your local environment. This approach ensures that your tests can be run consistently across different environments and simplifies the process of getting started with load testing.

## Continuous Integration

The repository includes a GitHub Actions workflow to lint the code, generate documentation, and run integration tests using the `ci-deployment` script.

## Contributing to the Project

We welcome improvement contributions from everyone! Here are some ways you can contribute to this project:

1. **Report Bugs:** If you find a bug, please feel free to open an issue in our Bitbucket repository with a detailed description of the bug and steps to reproduce it if possible.

2. **Feature Suggestions:** Do you have ideas for new features or improvements? Open an issue and tell us more about your idea!

3. **Submit Pull Requests:** Want to contribute code directly? Fantastic! Follow these steps to submit your contribution:
   - Fork the repository.
   - Create a new branch for your feature or fix.
   - Implement your feature or correction.
   - Run tests and follow the style guide enforced by pre-commit hooks.
   - Submit a pull request against the master branch. Include a description of your changes and link to any relevant issues.

4. **Documentation:** Help improve our documentation, either by correcting errors, adding examples, or writing guides.

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for more detailed information on how you can contribute.

## Planned Improvements

Here is a list of improvements and features we plan to implement in the future. We welcome feedback and contributions that can help us realize these:

- [x] Implement CI/CD to run tests in Kubernetes clusters.

If you are interested in working on any of these points, or if you have other ideas, do not hesitate to open an issue or contact us directly.


# AGENTS Instructions

These guidelines apply to the entire repository and should be followed by any automated agent, bot, or contributor.

## Environment Setup

- Install Node.js dependencies: `npm install`
- Install Python pre-commit: `pip install pre-commit`
- Ensure Docker and Docker Compose are installed and available in the PATH.
- If using environment variables (e.g., `API_SERVER`), set them in your shell or pass them via Docker Compose or script arguments.

## Linting and Documentation

- Run linting and formatting checks before committing:
  - `pre-commit run --all-files -c .githooks.d/.pre-commit-config.yaml`
- Update documentation for any new features, changes, or APIs.

## Integration Testing

- To run integration tests, use the provided deployment script:
  - `./ci-deployment -d simple-k6-test-template`
- The script will build Docker images, start required services, and run tests inside containers.
- You can override the API server with `-s <server>` or by setting the `API_SERVER` environment variable.
- For advanced scenarios, use `docker compose up` to start all services as defined in `compose.yaml`.
- Ensure test logs are written to the correct volume as defined in `compose.yaml`.

## Environment Variables

- Agents should check for required environment variables (e.g., `API_SERVER`) and set defaults if not provided.
- When running in CI/CD, ensure secrets and sensitive variables are injected securely.

## Commit Checklist

- Run linting and formatting checks.
- Update documentation as needed.
- Run integration tests if Docker is available.
- Ensure all environment variables and secrets are handled securely.

## Pull Requests

- Include a summary of changes.
- Note any updates to documentation or tests.
- Reference related issues or tickets if applicable.

## Agent/Bot Best Practices

- Always validate environment and dependencies before running tests.
- Prefer using provided scripts (`ci-deployment`, Docker Compose) for setup and teardown.
- Log environment variable values and test results for traceability.
- Clean up containers, volumes, and networks after tests to avoid resource leaks.

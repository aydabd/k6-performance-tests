# AGENTS Instructions

These guidelines apply to the entire repository and should be followed by any automated agent or contributor.

## Linting and Docs

- Install dependencies with `npm install`.
- Run `npm run eslint` to lint JavaScript.
- Run `npm run markdownlint` to lint markdown files.
- Run `npm run jsdoc2mdClient` to generate API documentation (run after modifying files under `src/`).
- Install pre-commit with pip
- Run `pre-commit run --all-files -c .githooks.d/.pre-commit-config.yaml

## Integration Tests

- Execute `./ci-deployment -d simple-k6-test-template` to run integration tests. This script relies on Docker.

## Commit Checklist

Before committing, run the linting commands above and update documentation. If Docker is available, run the integration tests as well.

## Pull Requests

Include a short summary of changes and note whether docs or tests were updated.

# WP-08: Test Management Integration (Xray / TestRail)

> **Phase**: 4 — soft dependencies on WP-03 (TestCase) and WP-06 (Reporting).

## Goal

Export test results to external test management systems (Atlassian Xray,
TestRail, or other) so that performance test results are traceable alongside
functional test results.

## Requirements

| ID | Requirement |
| --- | --- |
| WP8-R1 | New `src/reporters/xray-reporter.js` formats `handleSummary()` output to Xray JSON |
| WP8-R2 | New `src/reporters/junit-reporter.js` formats output to JUnit XML |
| WP8-R3 | `TestCase` descriptor `id` field maps to Xray test key or TestRail case ID |
| WP8-R4 | Post-run script uploads results to Xray REST API |
| WP8-R5 | Environment variables for Xray/TestRail credentials and project keys |

## Files Changed

- New `src/reporters/xray-reporter.js`
- New `src/reporters/junit-reporter.js`
- New `scripts/upload-xray.sh`
- `src/test-case.js` — add `externalId` field
- `.github/workflows/ci.yml` — optional Xray upload step

## Definition of Done

- [ ] Xray reporter formats JSON matching Xray import schema (unit test)
- [ ] JUnit reporter formats valid XML (unit test)
- [ ] `TestCase.id` maps to Xray test key correctly (unit test)
- [ ] Upload script sends to mock Xray server (integration test)
- [ ] Env vars for Xray/TestRail credentials documented
- [ ] JUnit XML validates against XSD
- [ ] ESLint and markdownlint pass
- [ ] PR merged → delete this plan file

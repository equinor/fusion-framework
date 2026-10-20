---
"@equinor/fusion-framework-cli": minor
---

Add opt-in `ffc app publish --allow-existing-version` recovery for reruns and redeployment of previously published bundles. Only a structured upload HTTP 409 identifying the exact bundle version is recoverable; default publishing and unrelated failures are unchanged.

Recovery reuses the original application key, environment, authentication and tag, completes requested config publication, and reports success only after those steps succeed. Programmatic `uploadApplication` callers can opt in with `allowExistingVersion: true` and receive an `existingVersion: true` marker, but must still tag the returned version themselves.

Supports the CLI prerequisite for [equinor/fusion-core-tasks#2357](https://github.com/equinor/fusion-core-tasks/issues/2357). Action integration requires a CLI release containing this option.

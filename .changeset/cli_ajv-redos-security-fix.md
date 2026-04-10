---
"@equinor/fusion-framework-cli": patch
---

Internal: update bundled ajv (8.17.1 → 8.18.0) in the CLI.

ajv 8.18.0 includes a security fix for CVE-2025-69873 — a ReDoS vulnerability in the `$data` keyword's `pattern` validation. The CLI bundles ajv for portal schema validation, so this patch updates the bundled copy.

No CLI API or behaviour changes for consumers.

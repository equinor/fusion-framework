---
"@equinor/fusion-framework-cli": patch
---

Surface clear, actionable error messages when CLI publish commands fail with 401, 403, or MSAL token errors.

Previously auth failures produced terse, low-level output like `"401 - This is not allowed for your role"` or a generic `"failed to parse response"` with no guidance, and errors were rethrown causing double-logged stack traces. Now each auth-related failure maps to a structured message that:

- Distinguishes **authentication** (401 — missing/expired token) from **authorization** (403 — valid token, insufficient permissions).
- Detects MSAL `SilentTokenAcquisitionError` (including when wrapped as `HttpJsonResponseError`) and surfaces the underlying Azure AD error detail.
- Lists concrete troubleshooting steps (check `FUSION_TOKEN`, run `ffc auth login`, verify `--scope`, confirm app registration).
- Warns when `FUSION_TOKEN` is set so users understand the CLI is using the env token instead of their interactive session.
- Links directly to the CLI auth and publish docs.

This applies to all publish-related CLI commands: `app publish` (check, upload, tag), `portal publish` (upload, tag), `portal config publish`, and `app config publish`. Errors now log and exit cleanly instead of throwing.

Fixes: https://github.com/equinor/fusion-framework/issues/4316

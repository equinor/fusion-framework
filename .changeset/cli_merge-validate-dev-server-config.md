---
"@equinor/fusion-framework-cli": patch
---

Deeply merge dev-server configuration, preserve plugin settings and shared resource identities, and reject invalid values with field-specific diagnostics.

- Nested `spa.templateEnv` overrides, such as a single `msal` field, keep unrelated defaults.
- Custom `spa.templateEnv` keys remain supported; unknown `spa`, `api`, `log`, and route keys are reported as errors.
- A `dev-server.config` that cannot be loaded (invalid JSON, syntax error, or a throwing factory) now stops startup instead of silently running on defaults. Projects without a config file are unaffected.

Fixes #5069 and #5075.

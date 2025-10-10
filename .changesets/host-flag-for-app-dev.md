---
"@equinor/fusion-framework-cli": minor
---

Add `--host` support to the `ffc app dev` command and the `startAppDevServer` API so callers can override the dev server host (for example `0.0.0.0`).

This is a non-breaking enhancement that allows specifying the server host from the CLI or programmatically.

Example:

```bash
ffc app dev --host 0.0.0.0 --port 4000
```

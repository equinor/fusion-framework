---
"@equinor/fusion-framework-cli": patch
---

fix(cli): update portal tag command to use --package option for name@version

- Replaces --name and --version options with a single --package [package@version] option for tagging portals.
- Updates manifest resolution logic to fallback only when --package is not provided.
- Improves error handling and help text for clarity.

This makes the CLI usage more consistent and user-friendly when tagging portal versions.

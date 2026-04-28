---
"@equinor/fusion-framework-cli-plugin-ai-base": minor
---

Add `-d, --debug` option to all AI CLI commands, with automatic activation via the `RUNNER_DEBUG` environment variable.

When GitHub Actions debug logging is enabled (`RUNNER_DEBUG=1`), all `ffc ai` commands now start in debug mode automatically. Debug output includes environment, auth mode, AI service URL, scopes, and token acquisition status.

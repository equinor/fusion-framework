---
"@equinor/fusion-framework-cli": patch
---

Default the `--debug` flag to `true` when the `RUNNER_DEBUG` environment variable is set.

All app, portal, auth, and create commands now automatically enable debug mode in GitHub Actions debug runs without requiring `--debug` in workflow YAML.

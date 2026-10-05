---
"@equinor/fusion-framework-cli": minor
---

With `--mock`, the dev portal served by `ffc app dev` and `ffc app serve` now sends the analytics your app tracks to the local mock server, as the Fusion portal does in production. Run `ffc mock-server` to receive, record, and query them, and check them in Playwright with `createMockAnalytics()`. Without `--mock`, no analytics leave the browser.

Refs: https://github.com/equinor/fusion-core-tasks/issues/2182

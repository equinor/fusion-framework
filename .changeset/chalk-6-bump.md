---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-cli-plugin-copilot": patch
"@equinor/fusion-lint": patch
"@equinor/fusion-log": patch
---

Internal: bump `chalk` from `5.6.2` to `6.0.0`. No API changes affect this repo's usage; chalk 6 raises its own Node.js requirement to `>=22`, already satisfied by this repo's `>=24` engines requirement.

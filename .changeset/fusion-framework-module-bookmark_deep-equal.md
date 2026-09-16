---
"@equinor/fusion-framework-module-bookmark": patch
---

Avoid unnecessary bookmark state updates by comparing bookmark values deeply before replacing reducer state.

Fixes #5135

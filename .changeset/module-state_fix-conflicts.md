---
"@equinor/fusion-framework-module-state": patch
---

Resolve replicated app-state conflicts by preserving the winning revision, removing losing leaves, and tombstoning every live leaf during deletion. Fixes #6093.

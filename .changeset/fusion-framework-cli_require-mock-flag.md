---
"@equinor/fusion-framework-cli": patch
---

Fix `ffc app dev` so local mock service files are used only when service discovery is explicitly
pointed at a mock server with `--mock`.

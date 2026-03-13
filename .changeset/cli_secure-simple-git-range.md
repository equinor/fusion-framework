---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-cli-plugin-ai-index": patch
---

Require `simple-git` 3.32.3 or newer in published package manifests to align installs with the upstream fix for CVE-2026-28292.

This does not change the CLI API. It tightens the minimum allowed dependency version so fresh installs and manifest-based scanners resolve the first safe `simple-git` release.

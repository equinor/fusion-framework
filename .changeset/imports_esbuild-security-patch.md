---
"@equinor/fusion-imports": patch
---

Bump `esbuild` dependency range from `^0.28.0` to `^0.28.1` to pick up an upstream fix for a low-severity dev-server request vulnerability. `esbuild` is used here as a runtime dependency (bundling config files at import time), so consumers installing this package directly need the patched range — not just this monorepo's internal override.

---
"@equinor/fusion-framework-cli": patch
---

Internal: bump `execa` from `9.6.1` to `10.0.0`. Fixed a breaking change where subprocesses returned by `execa()` are no longer `ChildProcess`-augmented — Node.js-specific methods like `.unref()` are now accessed via `subprocess.nodeChildProcess`.

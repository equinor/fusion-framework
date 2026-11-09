---
"@equinor/fusion-framework-cli": patch
---

Internal: bump locked Rollup from 4.65.1 to 4.67.4 for the build and development toolchain.

Internal: remove the redundant `@types/inquirer` dependency and use the declarations bundled with Inquirer; no runtime dependency version or prompt behavior changes.

Internal: update the terminal spinner from Ora 9.4.1 to 10.0.0 for improved frame erasure that preserves program output. The existing Node.js >=22.22.2 requirement is unchanged.

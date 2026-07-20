---
"@equinor/fusion-framework-cli": patch
---

Updated `adm-zip` from `^0.5.x` to `^0.6.0`. This release includes a fix for **CVE-2026-39244** (decompression bomb — crafted archives could exhaust memory via a declared-but-absent huge uncompressed size), a prototype pollution hardening fix, and several bug fixes.

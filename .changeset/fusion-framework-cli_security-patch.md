---
"@equinor/fusion-framework-cli": patch
---

Patched transitive security vulnerabilities in build toolchain dependencies:

- `serialize-javascript` → 7.0.5 (CPU exhaustion DoS)
- `minimatch` → 5.1.8 / 9.0.7 (ReDoS via repeated wildcards)
- `brace-expansion` → 2.0.3 / 5.0.5 (zero-step sequence DoS)

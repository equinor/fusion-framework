---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Update SPA bootstrap telemetry configuration to use proper adapter identifiers.

**Changes:**
- Refactor console adapter setup for cleaner conditional logic
- Update setAdapter calls to include required identifier parameter

**Migration:**
- No breaking changes for SPA consumers - internal implementation update only

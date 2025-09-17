---
"@equinor/fusion-framework-module-services": minor
---

Updated Zod dependency from v3 to v4 with necessary schema adjustments.

- Updated `zod` dependency from `^3.25.76` to `^4.1.8`
- Fixed `z.record()` usage to explicitly specify key type as `z.string()`
- Simplified `schemaSelector` function type parameters to align with Zod v4 API
- Updated response type handling in schema selector utilities

This update ensures compatibility with the latest Zod version while maintaining existing API contracts.

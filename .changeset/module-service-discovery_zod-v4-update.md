---
"@equinor/fusion-framework-module-service-discovery": major
---

feat: migrate to zod v4

Updated source code to migrate from zod v3 to v4. Updated zod dependency from v3.25.76 to v4.1.8 and modified schema definitions in the service discovery module to be compatible with zod v4's stricter type checking and updated API.

Key changes in source code:
- Updated `ApiService` and `ApiServices` schemas for zod v4 compatibility
- Enhanced service object validation with proper type definitions
- Updated service response selector to use zod v4 parsing
- Improved error handling for malformed API responses

Breaking changes: Schema validation behavior may differ due to zod v4's stricter type checking. Error message format has changed from zod v3 to v4 format. Function schema definitions now require explicit typing.

Links:
- [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
- [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)
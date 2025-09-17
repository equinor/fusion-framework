---
"@equinor/fusion-framework-module-app": major
---

feat: migrate to zod v4

Updated source code to migrate from zod v3 to v4. Updated zod dependency from v3.25.76 to v4.1.8 and modified schema definitions in the app module to use explicit key and value types for records and updated error message format from `description` to `message` for zod v4 compatibility.

Key changes in source code:
- Fixed record schema definitions to use explicit key and value types (`z.record(z.string(), z.any())`)
- Updated error message options format (replaced `description` with `message`)
- Enhanced `ApiAppConfigSchema` with proper record type definitions for environment and endpoints
- Updated `ApiApplicationPersonSchema` to use zod v4 error message format

Breaking changes: Record schemas must specify both key and value types explicitly. Error message format has changed from zod v3 to v4 format. Function schema definitions now require explicit typing.

Links:
- [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
- [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)

---
"@equinor/fusion-framework-cli": major
---

feat: migrate to zod v4

Updated source code to migrate from zod v3 to v4. Updated zod dependency from v3.25.76 to v4.1.8 and modified schema definitions in the CLI package to use explicit key and value types for records, updated error message format, and changed ZodError `.errors` property to `.issues` for zod v4 compatibility.

Key changes in source code:
- Fixed record schema definitions to use explicit key and value types (`z.record(z.string(), z.any())`)
- Updated portal manifest schemas to use `message` instead of `description` for error messages
- Simplified error message options format (removed `required_error`, `invalid_type_error` from options object)
- Updated ZodError `.errors` property to `.issues` for zod v4 compatibility
- Enhanced `ApiAppConfigSchema` with proper record type definitions

Breaking changes: Record schemas must specify both key and value types explicitly. Error message format has changed from zod v3 to v4 format. Function schema definitions now require explicit typing.

Links:
- [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
- [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)

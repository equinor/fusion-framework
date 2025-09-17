---
"@equinor/fusion-framework-cli": major
---

feat: migrate to zod v4

Updated the CLI package to be compatible with zod v4, including:

**Dependency Updates**
- Updated zod dependency from v3.25.76 to v4.1.8

**Schema Definition Changes**
- Fixed record schema definitions to use explicit key and value types (`z.record(z.string(), z.any())`)
- Updated portal manifest schemas to use `message` instead of `description` for error messages
- Simplified error message options format (removed `required_error`, `invalid_type_error` from options object)
- Updated app configuration schemas to specify explicit key types for record fields

**Error Handling Updates**
- Updated ZodError `.errors` property to `.issues` for zod v4 compatibility
- Fixed error message formatting in portal manifest validation
- Improved error reporting for invalid portal manifests

**API Schema Improvements**
- Enhanced `ApiAppConfigSchema` with proper record type definitions
- Updated endpoint configuration schemas with explicit key-value typing
- Improved type safety for environment variable handling

**Breaking Changes**
- Schema validation behavior may differ due to zod v4's stricter type checking
- Record schemas must specify both key and value types explicitly
- Error message format has changed from zod v3 to v4 format
- Function schema definitions now require explicit typing

**Migration Notes**
This is a major version update that requires careful testing. All zod usage patterns have been updated for v4 compatibility, including complex generic type inference and error handling.

**Links**
- [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
- [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)

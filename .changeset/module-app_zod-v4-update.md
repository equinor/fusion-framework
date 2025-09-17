---
"@equinor/fusion-framework-module-app": major
---

feat: migrate to zod v4

Updated the app module to be compatible with zod v4, including:

**Dependency Updates**
- Updated zod dependency from v3.25.76 to v4.1.8

**Schema Definition Changes**
- Fixed record schema definitions to use explicit key and value types (`z.record(z.string(), z.any())`)
- Updated error message options format (replaced `description` with `message` for zod v4 compatibility)
- Enhanced `ApiAppConfigSchema` with proper record type definitions for environment and endpoints

**API Configuration Improvements**
- Updated environment variable handling with explicit key-value typing
- Enhanced endpoint configuration schemas with proper record structure
- Improved type safety for API application configuration

**Person Schema Updates**
- Updated `ApiApplicationPersonSchema` to use zod v4 error message format
- Replaced `description` properties with `message` for all field validations
- Maintained all existing validation logic while improving error reporting

**Breaking Changes**
- Schema validation behavior may differ due to zod v4's stricter type checking
- Record schemas must specify both key and value types explicitly
- Error message format has changed from zod v3 to v4 format
- Function schema definitions now require explicit typing

**Migration Notes**
This is a major version update that requires careful testing. All zod usage patterns have been updated for v4 compatibility, including record schemas and error message formatting.

**Links**
- [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
- [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)

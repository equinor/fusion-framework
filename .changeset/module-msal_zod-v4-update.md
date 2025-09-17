---
"@equinor/fusion-framework-module-msal": major
---

feat: migrate to zod v4

Updated the MSAL module to be compatible with zod v4, including:

**Dependency Updates**
- Updated zod dependency from v3.25.76 to v4.1.8

**Configuration Schema Validation**
- Updated authentication configuration schemas for zod v4 compatibility
- Enhanced `AuthClientConfigSchema` with proper type definitions
- Improved `AuthConfigSchema` validation for MSAL module configuration
- Updated version schema transformation to work with zod v4

**Type Safety Improvements**
- Enhanced type inference for authentication configuration objects
- Improved validation of client configuration (clientId, tenantId, redirectUri)
- Better type safety for provider configuration and version handling

**Breaking Changes**
- Schema validation behavior may differ due to zod v4's stricter type checking
- Function schema definitions now require explicit typing
- Error message format has changed from zod v3 to v4 format

**Migration Notes**
This is a major version update that requires careful testing. All zod usage patterns have been updated for v4 compatibility, including configuration validation and type inference.

**Links**
- [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
- [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)
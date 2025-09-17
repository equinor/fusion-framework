---
"@equinor/fusion-framework-module-service-discovery": major
---

feat: migrate to zod v4

Updated the service-discovery module to be compatible with zod v4, including:

**Dependency Updates**
- Updated zod dependency from v3.25.76 to v4.1.8

**API Response Validation**
- Updated `ApiService` schema for zod v4 compatibility
- Enhanced `ApiServices` schema validation for service discovery API responses
- Improved service object validation with proper type definitions
- Updated service response selector to use zod v4 parsing

**Service Discovery Improvements**
- Enhanced validation of service discovery API responses
- Improved type safety for service objects (key, uri, scopes, tags)
- Better error handling for malformed API responses
- Updated data transformation logic for backward compatibility

**Type Safety Enhancements**
- Improved type inference for service discovery responses
- Enhanced validation of service configuration objects
- Better type safety for service resolution and client creation

**Breaking Changes**
- Schema validation behavior may differ due to zod v4's stricter type checking
- Function schema definitions now require explicit typing
- Error message format has changed from zod v3 to v4 format

**Migration Notes**
This is a major version update that requires careful testing. All zod usage patterns have been updated for v4 compatibility, including API response validation and service object parsing.

**Links**
- [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
- [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)
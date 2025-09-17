---
"@equinor/fusion-framework-module-msal": major
---

feat: migrate to zod v4

Updated source code to migrate from zod v3 to v4. Updated zod dependency from v3.25.76 to v4.1.8 and modified authentication configuration schemas in the MSAL module to be compatible with zod v4's stricter type checking and updated API.

Key changes in source code:
- Updated `AuthClientConfigSchema` and `AuthConfigSchema` for zod v4 compatibility
- Enhanced version schema transformation to work with zod v4
- Improved validation of client configuration (clientId, tenantId, redirectUri)
- Better type safety for provider configuration and version handling

Breaking changes: Schema validation behavior may differ due to zod v4's stricter type checking. Error message format has changed from zod v3 to v4 format. Function schema definitions now require explicit typing.

Links:
- [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
- [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)
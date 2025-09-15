---
"@equinor/fusion-framework-module-msal": minor
---

Improved MSAL module version checking to be more permissive for minor and patch versions.

Fixes: #3375

- Refactored version checking logic into dedicated versioning module
- Made version checking more permissive for minor and patch versions
- Only major version incompatibilities will block execution
- Minor version differences now show warnings but allow execution to continue
- Patch version differences are completely ignored
- Added comprehensive test coverage for version resolution
- Improved error messages and warnings for better developer experience
- Maintains backward compatibility with existing configurations

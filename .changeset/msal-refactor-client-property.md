---
"@equinor/fusion-framework-module-msal": minor
---

Refactored AuthProvider to use a cleaner `client` property instead of deprecated `defaultClient`.

- Added `client` property to IAuthProvider interface
- Replaced deprecated `defaultClient` getter with `client` getter
- Updated internal references to use private `#client` field
- Maintained backward compatibility through proxy provider with deprecation warning

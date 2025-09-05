---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-docs": patch
---

Reorganized authentication documentation to improve maintainability and user experience.

- Removed local `libsecret.md` documentation file
- Updated all libsecret references to point to centralized MSAL Node module documentation
- Enhanced authentication guide with cross-references to underlying module documentation
- Improved documentation structure by consolidating authentication docs in the appropriate module packages

**Migration Notes:**
- libsecret installation guide is now available at: https://equinor.github.io/fusion-framework/modules/auth/msal-node/docs/libsecret.html
- All authentication-related documentation is now centralized in the MSAL Node module package

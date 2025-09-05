---
"@equinor/fusion-framework-docs": patch
---

Restructured documentation to create dedicated authentication section with improved navigation and module organization.

- **Added new Authentication section** in sidebar navigation with dedicated auth module pages
- **Created MSAL Browser module page** (`modules/auth/msal/`) with comprehensive documentation
- **Created MSAL Node module page** (`modules/auth/msal-node/`) with detailed setup guides
- **Added libsecret setup guide** (`modules/auth/msal-node/docs/libsecret.md`) for platform-specific credential storage
- **Removed outdated MSAL placeholder** (`modules/msal/`) and replaced with proper authentication structure
- **Enhanced navigation structure** with clear separation between browser and Node.js authentication modules

**Documentation Structure:**
- New `/modules/auth/` section with dedicated authentication module pages
- Platform-specific setup guides for Windows, macOS, and Linux
- Comprehensive module documentation with proper frontmatter and tags
- Improved discoverability of authentication-related documentation

**Migration Notes:**
- Authentication documentation is now organized under `/modules/auth/`
- MSAL Browser docs: `/modules/auth/msal/`
- MSAL Node docs: `/modules/auth/msal-node/`
- libsecret setup: `/modules/auth/msal-node/docs/libsecret.html`

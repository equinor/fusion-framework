---
"@equinor/fusion-framework-cli": minor
---

Enhanced Git repository cloning with user-controlled protocol selection.

- Added interactive prompt for users to choose between HTTPS and SSH protocols
- Intelligent SSH detection based on system configuration
- Removed automatic SSH-to-HTTPS fallback in favor of explicit user choice
- Improved user experience with clear protocol descriptions and defaults

This change gives users full control over their Git authentication method while maintaining compatibility across different development environments.

---
"@equinor/fusion-framework-cli": minor
---

Enhanced Git repository cloning with user-controlled protocol selection.

- Added interactive prompt for users to choose between HTTPS and SSH protocols
- Implemented intelligent SSH detection using both git config and filesystem checks
- Removed automatic SSH-to-HTTPS fallback in favor of explicit user choice
- Improved user experience with clear protocol descriptions and smart defaults
- Refactored SSH detection logic into testable helper functions for better maintainability
- Optimized SSH key detection to stop after finding first match for better performance
- Enhanced cross-platform compatibility with proper Node.js APIs instead of shell commands

This change gives users full control over their Git authentication method while maintaining compatibility across different development environments and improving code quality.

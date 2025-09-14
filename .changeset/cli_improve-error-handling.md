---
"@equinor/fusion-framework-cli": patch
---

Enhanced error handling and user feedback in create app command.

- Added comprehensive error handling for spawn operations in IDE opening and dev server startup
- Fixed misleading success messages by wrapping template copy operations in try-catch blocks
- Improved error logging in repository cleanup operations for better debugging
- Enhanced TSDoc documentation and inline comments across helper functions
- Added proper CLI exit codes for operation failures

These improvements provide better user experience with clear error messages and prevent silent failures that could confuse users.

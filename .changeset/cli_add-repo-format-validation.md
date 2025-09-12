---
"@equinor/fusion-framework-cli": patch
---

Add repository format validation utility.

- Added `assertValidRepoFormat()` function to validate "owner/repo" format
- Provides clear error messages for invalid repository name formats
- Includes regex validation for proper GitHub repository naming conventions
- Enhances CLI input validation for repository-related commands

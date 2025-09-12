---
"@equinor/fusion-framework-cli": minor
---

Add repository cloning utilities with GitHub CLI and git fallback

- Implemented `cloneRepo` function with smart fallback strategy
- Added GitHub CLI support with automatic authentication handling
- Added git fallback with HTTPS and SSH cloning methods
- Enhanced error handling and validation for repository operations
- Organized temporary directory structure for cloned repositories
- Added comprehensive TSDoc documentation for all public APIs

The new utilities provide robust repository cloning capabilities with automatic fallback between GitHub CLI and standard git commands, ensuring reliable cloning regardless of the user's environment setup.

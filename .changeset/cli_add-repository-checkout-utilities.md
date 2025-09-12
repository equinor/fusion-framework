---
"@equinor/fusion-framework-cli": minor
---

Add intelligent repository checkout utilities with GitHub CLI and git fallback

- Implemented `checkoutRepo` function with smart update-or-clone strategy
- Added GitHub CLI support with automatic authentication handling
- Added git fallback with HTTPS and SSH cloning methods
- Enhanced performance with existing repository detection and update logic
- Added `git reset --hard origin/main` for clean repository updates
- Organized temporary directory structure for checked out repositories
- Added comprehensive TSDoc documentation for all public APIs
- Maintained backward compatibility with deprecated `cloneRepo` alias

The new utilities provide intelligent repository checkout capabilities that update existing repositories when possible, falling back to cloning only when necessary. This significantly improves performance for repeated operations while ensuring users always have the latest repository content.

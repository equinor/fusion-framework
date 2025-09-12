---
"@equinor/fusion-framework-cli": minor
---

Add Git CLI utilities for checking availability and configuration.

- Added `gitCliExists()` function to check if Git CLI is installed and optionally configured
- Added `assertGitCliExists()` assertion function for convenient Git CLI validation
- Supports checking only availability or both availability and configuration
- Provides clear error messages with installation and configuration guidance
- Includes comprehensive TypeScript documentation and usage examples

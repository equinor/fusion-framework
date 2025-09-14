---
"@equinor/fusion-framework-cli": patch
---

Add dual command support for improved CLI flexibility.

- Added support for both `ffc create app` and `ffc app create` command patterns
- Refactored create app command to use factory function for reusability
- Updated command registration to properly include create subcommand
- Enhanced command examples and help text to reflect dual command support

This maintains backward compatibility while providing more intuitive command patterns for users.

---
"@equinor/fusion-framework-cli": minor
---

Add dual command support for app creation with improved CLI flexibility.

## Changes

- **Enhanced Command Structure**: Added support for both `ffc app create` and `ffc create app` command patterns
- **Factory Function Pattern**: Refactored create app command to use factory function for reusability
- **Improved Documentation**: Updated command examples and help text to reflect dual command support
- **Command Registration**: Updated app command to properly include create subcommand
- **Template Integration**: Enhanced template selection and repository setup helpers
- **Documentation**: Added comprehensive creating-apps.md guide with examples and best practices

## Breaking Changes

None - this is a backward compatible enhancement.

## Migration

No migration required. Existing `ffc app create` commands continue to work, and new `ffc create app` commands are now available as an alternative.

## Examples

```bash
# Both commands now work identically
ffc app create my-new-app
ffc create app my-new-app

# With options
ffc app create my-app --template react --debug
ffc create app my-app --template react --debug
```

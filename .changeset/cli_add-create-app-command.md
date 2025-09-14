---
"@equinor/fusion-framework-cli": minor
---

Add new `create app` command for generating Fusion applications from templates.

- Added `ffc create app <name>` command with interactive template selection
- Supports both bare and basic application templates from fusion-app-template repository
- Includes template validation and interactive prompts using inquirer
- Added comprehensive template repository system with schema validation
- Implemented modular helper functions for each step of app creation
- Added IDE integration with automatic project opening
- Includes dependency management and dev server startup
- Added new dependencies: `inquirer` and `@types/inquirer` for enhanced CLI experience

The new command provides an intuitive way for developers to bootstrap new Fusion applications using predefined templates from the ecosystem.

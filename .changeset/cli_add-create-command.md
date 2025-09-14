---
"@equinor/fusion-framework-cli": minor
---

Add new `create` command for generating Fusion applications from templates

- Added `fusion create app` command with interactive template selection
- Supports both bare and basic application templates
- Includes template validation and interactive prompts using inquirer
- Added new dependencies: `inquirer` and `@types/inquirer` for enhanced CLI experience
- Integrated create command into main CLI command structure

The new command provides an intuitive way for developers to bootstrap new Fusion applications using predefined templates from the ecosystem.

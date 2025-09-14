---
"@equinor/fusion-framework-cli": minor
---

Add comprehensive create app command for generating Fusion applications from templates.

**New Features**
- Added `ffc create app <name>` command with interactive template selection
- Supports both `ffc create app` and `ffc app create` command patterns for improved flexibility
- Includes template validation and interactive prompts using inquirer
- Added comprehensive template repository system with schema validation
- Implemented modular helper functions for each step of app creation

**Template Support**
- Supports both bare and basic application templates from fusion-app-template repository
- Includes template validation and interactive prompts using inquirer
- Added comprehensive template repository system with schema validation

**Developer Experience**
- Added IDE integration with automatic project opening
- Includes dependency management and dev server startup
- Added comprehensive documentation with examples and best practices
- Updated CLI README with new command documentation
- Added GitHub template integration links for alternative app creation methods

**Error Handling & Reliability**
- Enhanced error handling for spawn operations in IDE opening and dev server startup
- Migrated to execa for automatic process cleanup and better signal handling
- Fixed misleading success messages by wrapping template copy operations in try-catch blocks
- Improved error logging in repository cleanup operations for better debugging
- Added proper CLI exit codes for operation failures
- Enhanced TSDoc documentation and inline comments across helper functions

**Dependencies**
- Added new dependencies: `inquirer`, `@types/inquirer`, and `execa` for enhanced CLI experience
- Migrated process spawning from native child_process to execa for better process management

The new command provides an intuitive way for developers to bootstrap new Fusion applications using predefined templates from the ecosystem while maintaining backward compatibility and providing robust error handling.

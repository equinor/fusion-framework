---
title: "Add CLI command to create apps from templates"
feature_branch: "001-cli-create-app-from-template"
created: "2025-01-27"
status: "Draft"
github_issue: "https://github.com/equinor/fusion-framework/issues/3372"
input: "Add a new CLI command that gets developers up and running with Fusion Framework applications as fast and painlessly as possible using predefined templates from the fusion-app-template repository."
---

# Feature Specification: Add CLI command to create apps from templates

## User Scenarios & Testing

### Primary User Story
As a developer, I want to create a new Fusion Framework application with a single command so that I can start coding immediately without manual setup, configuration, or template cloning.

### Acceptance Scenarios
1. **Given** a developer wants to create a new app, **When** they run `ffc create app my-new-app`, **Then** the system creates a new application directory with all necessary files and dependencies
2. **Given** a developer wants to choose a specific template, **When** they run `ffc create app my-app --template basic`, **Then** the system creates an app using only the specified template
3. **Given** a developer wants to create an app in a specific directory, **When** they run `ffc create app my-app --directory ./projects`, **Then** the system creates the app in the specified directory
4. **Given** a developer wants to start development immediately, **When** they run the create command with auto-install enabled, **Then** the system installs dependencies and starts the development server
5. **Given** a developer wants to open their new app in their IDE, **When** the app creation completes successfully, **Then** the system opens the project in the default IDE

### Edge Cases
- What happens when the target directory already exists?
- How does the system handle network failures when cloning templates?
- What happens when the fusion-app-template repository is unavailable?
- How does the system handle invalid template names?
- What happens when the developer doesn't have git or GitHub CLI installed?
- How does the system handle permission errors when creating directories?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST provide a `ffc create app <app-name>` command that creates new Fusion Framework applications
- **FR-002**: System MUST clone templates from the `equinor/fusion-app-template` repository
- **FR-003**: System MUST support interactive template selection when no template is specified
- **FR-004**: System MUST support `--template` flag to specify a particular template (basic, bare)
- **FR-005**: System MUST support `--directory` flag to specify the target directory for app creation
- **FR-006**: System MUST support `--debug` flag for verbose output during creation
- **FR-007**: System MUST support `--branch` flag to specify git branch to checkout (default: main)
- **FR-008**: System MUST support `--clean` flag to clean repository directory before cloning
- **FR-009**: System MUST ask user whether to install dependencies after creating the application, defaulting to yes
- **FR-010**: System MUST ask user whether to start the development server after dependency installation, defaulting to no
- **FR-011**: System MUST ask user whether to open the created project in the developer's IDE, defaulting to no
- **FR-012**: System MUST ask user whether to clean up temporary files after successful creation, defaulting to no cleanup
- **FR-013**: System MUST validate that the app name is valid and doesn't conflict with existing directories
- **FR-014**: System MUST provide clear error messages when template cloning fails
- **FR-015**: System MUST provide clear error messages when dependency installation fails
- **FR-016**: System MUST support both `npx @equinor/fusion-framework-cli` and local `ffc` command usage
- **FR-017**: System MUST support `--help` flag to display usage information and available options

### Key Entities *(include if feature involves data)*
- **Application Template**: A predefined project structure containing configuration files, source code, and dependencies for a specific type of Fusion Framework application
- **Application Instance**: A created application directory containing all files copied from a template, configured with the specified app name and ready for development
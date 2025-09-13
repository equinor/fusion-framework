# Fusion Framework Constitution

## Core Principles

### I. Focused File Design
**Always create files with a single, clear responsibility and contain only related functionality.**

**Guidelines**:
- **Single Responsibility**: Each file should contain one primary function, class, or component (support functions not exported can be in the same file)
- **Clear Naming**: File names should match the function or component name for easy searching
- **Focused Exports**: Export only the main function/component from each file; keep support functions internal
- **Related Utilities**: Group related utility functions in separate files within the same directory
- **Consistent Structure**: Follow consistent file organization patterns across all packages
- **Easy Navigation**: Make it easy to find specific functionality by file name

**Implementation**:
- Create separate files for each major function or component
- Use file names that exactly match the function/component name (e.g., `user-service.ts` for `userService` function)
- Export the main function/component as default or named export
- Group related files in appropriate directories
- Follow established naming conventions (kebab-case for files)
- Keep files focused and maintainable
- Use index files to re-export multiple functions when needed

### II. Observable Patterns
**Always use reactive programming patterns with observables for internal framework code to handle asynchronous data flows and state management consistently.**

*See also: [State Management](#iii-state-management) for FlowSubject patterns*

**Guidelines**:
- **Reactive Data Flow**: Use observables for all asynchronous operations and data streams
- **Internal Use Only**: Keep observables internal to framework implementation, not exposed in public APIs
- **Error Handling**: Implement proper error handling and recovery patterns in observable chains
- **Memory Management**: Ensure proper subscription cleanup to prevent memory leaks
- **Composition**: Use operators to compose complex data transformations from simple observables
- **Testing**: Make observables easily testable with proper mocking and testing utilities

**Implementation**:
- Use `@equinor/fusion-observable` package for core observable functionality
- Implement consistent error handling patterns across all modules
- Provide clear documentation for observable APIs and operators
- Create testing utilities for observable-based code
- Follow established patterns for subscription management
- Use TypeScript generics for type-safe observable streams

### III. State Management
**Always use FlowSubject for consistent state management patterns across the framework, providing predictable data flow and state updates.**

*See also: [Observable Patterns](#ii-observable-patterns) for reactive programming foundation*

**Guidelines**:
- **Centralized State**: Use FlowSubject as the primary state management solution for framework modules
- **Predictable Updates**: Ensure state changes follow consistent patterns and are traceable
- **Type Safety**: Maintain type safety across all state management operations
- **Immutable Updates**: Use immutable update patterns to prevent unintended state mutations
- **State Composition**: Compose complex state from simpler FlowSubject instances
- **Testing**: Provide clear testing patterns for state management logic

**Implementation**:
- Use FlowSubject for all framework state management needs
- Implement consistent state update patterns across modules
- Provide type-safe state access and update methods
- Create clear documentation for state management patterns
- Ensure state updates are immutable and predictable
- Follow established patterns for state composition and testing

### IV. Consumer-Facing APIs
**Always design clean, intuitive, and well-documented APIs for external consumers and developers using the framework.**

*See also: [Documentation](#v-documentation) for API documentation standards*

**Guidelines**:
- **Simple Interfaces**: Provide simple, easy-to-understand APIs that hide internal complexity
- **Consistent Patterns**: Use consistent naming and patterns across all consumer-facing APIs
- **Clear Documentation**: Provide comprehensive documentation with examples for all public APIs
- **Type Safety**: Ensure all public APIs are fully typed with TypeScript
- **Backward Compatibility**: Maintain backward compatibility when making API changes
- **Error Handling**: Provide clear, actionable error messages and proper error handling

**Implementation**:
- Design APIs that abstract away internal observable and state management complexity
- Prioritize async/await patterns and React hooks/components for consumer APIs
- Avoid exposing observables in public APIs; use Promises and async patterns instead
- Provide React hooks for state management and data fetching
- Use consistent naming conventions across all public interfaces
- Provide TSDoc documentation for all exported functions and classes
- Include usage examples in documentation and README files
- Implement proper error handling with descriptive error messages
- Create cookbooks and examples for common use cases

### V. Documentation
**Always maintain comprehensive, clear, and up-to-date documentation that supports developer productivity and code understanding.**

**Guidelines**:
- **Code Documentation**: Document all public APIs with TSDoc comments for IntelliSense support
- **Inline Comments**: Add explanatory comments for complex logic, algorithms, and business rules
- **README Files**: Provide clear package descriptions, usage examples, and API overview
- **Examples and Cookbooks**: Create practical examples and cookbooks for common use cases

**Implementation**:
- Use TSDoc format for all exported functions, classes, and interfaces
- Include parameter descriptions, return types, and usage examples
- Add inline comments for non-obvious logic and important assumptions
- Maintain README.md files in each package with clear package descriptions and usage examples
- Create cookbooks in `cookbooks/` directory for practical examples
- Document architectural decisions in `docs/` directory for complex, in-depth documentation not suitable for README files
- Keep documentation synchronized with code changes

### VI. Changeset Management
**Always use changesets to manage versioning, changelog generation, and release coordination across the monorepo.**

*See also: [Git Practices](#vii-git-practices) for commit and changeset integration*

**Guidelines**:
- **Consistent Versioning**: Use semantic versioning (patch/minor/major) for all package releases
- **Clear Descriptions**: Write clear, descriptive changeset descriptions that explain the impact
- **Single Package Focus**: Prefer one package per changeset to maintain clear versioning
- **Breaking Changes**: Clearly document breaking changes and migration paths
- **Changelog Generation**: Use changesets to automatically generate changelogs
- **Release Coordination**: Coordinate releases across packages to maintain compatibility

**Implementation**:
- Create changesets in `.changeset/` directory with descriptive filenames
- Use proper YAML frontmatter with package names and version types
- Write detailed descriptions explaining what changed and why
- Include migration instructions for breaking changes
- Use `pnpm changeset` command for generating changesets
- Follow established patterns for changeset naming and content
- Review changesets before merging to ensure accuracy and completeness

### VII. Git Practices
**Always follow consistent Git practices to maintain a clean, linear history and clear change tracking.**

**Guidelines**:
- **Always Rebase**: Use rebase instead of merge to maintain a linear commit history
- **Semantic Commits**: Use conventional commit format for clear, consistent commit messages
- **Changeset Integration**: Create or update changesets before committing changes
- **Clean History**: Keep commit history clean and meaningful
- **Branch Management**: Use feature branches and rebase before merging
- **Commit Granularity**: Make focused, atomic commits that represent single logical changes
- **Fix/Feat then Refactor**: Use green/red light pattern - commit working fixes/features first, then refactor in separate commits

**Implementation**:
- Always use `git rebase` instead of `git merge` when integrating changes
- Follow conventional commit format: `type(scope): description` (e.g., `feat(module-http): add retry logic`)
- Create changesets in `.changeset/` directory before committing related changes
- Use `git rebase -i` to clean up commit history before merging
- Squash related commits into logical units
- Write clear, descriptive commit messages that explain the "why" not just the "what"
- Follow fix/feat then refactor pattern: commit working functionality first, then refactor in separate commits

## Framework Architecture

**Monorepo Structure**: Organized workspace with clear package boundaries and consistent conventions
- **Package Organization**: Group related functionality into logical packages within the monorepo
- **Directory Conventions**: Follow established directory patterns
  - `src/`: Source code directory containing all TypeScript/JavaScript source files
  - `dist/`: Build output directory containing compiled and bundled code
  - `docs/`: Documentation files including README, API docs, and guides
- **Naming Consistency**: Use consistent naming across packages, files, and directories
  - **Classes and Components**: Use PascalCase (e.g., `UserService`, `ButtonComponent`)
  - **Files and Directories**: Use kebab-case (e.g., `user-service.ts`, `button-component.tsx`)
  - **Complex Files**: Suffix with type for specific code types (e.g., `MyProvider.interface.ts`, `MyStore.actions.ts`)
  - **Packages**: Use kebab-case with scope (e.g., `@equinor/fusion-framework-module-http`)
- **Path Resolution**: Resolve package names to directories by removing scope and mapping to structure
  - `@equinor/fusion-framework-module-http` → `packages/modules/http`
  - `@equinor/fusion-framework-react-app` → `packages/react/app`
  - `@equinor/fusion-observable` → `packages/utils/observable`
- **Clear Boundaries**: Maintain clear separation between framework, modules, utilities, and applications

**Package Structure**:
- `packages/framework/`: Core framework functionality
- `packages/modules/`: Framework modules (HTTP, Auth, etc.)
- `packages/react/`: React-specific integrations
- `packages/utils/`: Shared utility packages
- `packages/cli/`: Command-line tools
  - Library source code in `src/lib/`
  - Executable source code in `src/bin/`
  - Command source code in `src/commands/`
- `packages/vite-plugins/`: Vite plugins
- `cookbooks/`: Example applications and templates
- Each package follows `src/index.ts` entry point convention

## Tech Stack

### Core Technologies

**TypeScript**: Primary language for all framework code, providing type safety and enhanced developer experience
- Strict type checking enabled across all packages
- TSDoc comments for comprehensive IntelliSense support
- Modern ES2022+ features with proper type definitions

**pnpm**: Package manager for efficient monorepo management
- Workspace support for managing multiple packages
- Disk-efficient storage through hardlinks
- Strict dependency resolution and security checks

**Vite**: Build tool and development server
- Fast development server with HMR (Hot Module Replacement)
- Optimized production builds with tree-shaking
- Plugin ecosystem for framework-specific functionality
- TypeScript support out of the box

**RxJS**: Reactive programming library for observables, operators, and subjects
- Core reactive programming foundation for the framework
- Observable streams for asynchronous data flows
- Rich operator library for data transformation
- Subject patterns for state management and communication

### React Ecosystem

**React 18+**: Modern React with concurrent features
- Hooks-based architecture for consumer APIs
- Suspense and concurrent rendering support
- Custom hooks for framework integration

**React Router**: Client-side routing
- Nested routing patterns
- Route-based code splitting
- Integration with framework modules

### Development Tools

**Turbo**: Monorepo build system
- Incremental builds and caching
- Parallel task execution
- Dependency-aware task scheduling

**Vitest**: Testing framework
- Unit and integration testing
- TypeScript support out of the box
- Workspace-aware test configuration

**Biome**: Code formatting and linting
- Fast, single-tool solution
- Consistent code style across packages
- TypeScript-aware linting rules

### Build & Deployment

**Fusion Framework CLI**: Command-line interface for framework operations
- Application scaffolding and project generation
- Development server management
- Build and deployment automation
- Framework-specific tooling and utilities

**Rollup**: Library bundling
- Tree-shaking for optimal bundle sizes
- Multiple output formats (ESM, CJS)
- TypeScript compilation integration

### Documentation

**VuePress**: Documentation site
- Static site generation
- Markdown-based content
- Search and navigation features
- **Sync Requirement**: Must be updated when package documentation changes

### Package Management

**Changesets**: Version management
- Semantic versioning across packages
- Automated changelog generation
- Release coordination

**Conventional Commits**: Commit standardization
- Automated version bumping
- Clear change tracking
- Integration with changeset workflow


## Development Workflow

**Prerequisites**: Feature spec (`spec.md`) and plan (`plan.md`) must exist before development starts.

Follow this workflow when developing features or fixes:

1. **Load Plan** - Read existing plan.md and feature spec to understand requirements
2. **Generate Code** - Create files following single responsibility, proper naming, and API patterns
3. **Test & Validate** - Ensure code works and follows all principles
4. **Commit Working Code** - Always commit working functionality before proceeding
5. **Create Changeset** - Document changes for versioning and release (create before final commit)
6. **Merge & Deploy** - Use rebase, validate everything, and integrate changes

**Critical Rules**:
- Never leave working code uncommitted when moving to the next step
- Create changesets before the final commit that includes the changeset
- Use conventional commit format for all commits

## Validation Checklist

### Before Generating Code
- [ ] Check if similar functionality already exists in the codebase
- [ ] Determine correct package directory and file structure

### When Generating Code
- [ ] File follows single responsibility (one main function/component per file)
- [ ] File name matches function/component name (kebab-case for files, PascalCase for classes)
- [ ] Observables used only internally, not in public APIs
- [ ] Public APIs use async/await patterns and React hooks
- [ ] All public functions/classes have TSDoc documentation
- [ ] Imports use monorepo package resolution (`@equinor/fusion-framework-*`)

### Before Committing Code
- [ ] Working code is committed before proceeding to next step
- [ ] Changeset created/updated before committing
- [ ] Commit message follows conventional format (`type(scope): description`)
- [ ] All tests pass

### When Creating Changesets
- [ ] Changeset in `.changeset/` directory with descriptive filename
- [ ] YAML frontmatter includes correct package names and version types
- [ ] Description explains what changed and why
- [ ] Breaking changes include migration instructions

### When Merging/Pushing Code
- [ ] Rebase used instead of merge
- [ ] All validation steps completed
- [ ] Code follows DRY principles and consistent patterns

### Before Creating Pull Request
- [ ] All working code committed with conventional commit format
- [ ] Changeset created, deduped and committed for versioning
- [ ] All tests pass (`pnpm test`)
- [ ] Code builds successfully (`pnpm build`)
- [ ] No linter errors (`pnpm check:error`)
- [ ] Documentation updated (README, TSDoc comments, cookbooks if needed)
- [ ] Breaking changes documented with migration instructions
- [ ] Code meets feature specifications and was executed according to plan
- [ ] Code follows all constitution principles
- [ ] Branch is rebased on latest main
- [ ] Pull request title follows conventional commit format
- [ ] Pull request body uses GitHub template with all sections filled

## Quick Reference

### Common Patterns
- **File Naming**: `kebab-case.ts` for files, `PascalCase` for classes
- **Package Imports**: `@equinor/fusion-framework-*` for monorepo packages
- **Observables**: Internal use only, not in public APIs
- **State Management**: Use FlowSubject for framework state
- **Public APIs**: async/await patterns and React hooks
- **Documentation**: TSDoc comments for all public functions

### Key Commands
- `pnpm install` - Install dependencies
- `pnpm build:packages` - Build all packages
- `git rebase` - Always use rebase, never merge
- `pnpm --filter <package> <command>` - Run command in specific package

### File Structure
```
packages/
├── framework/     # Core framework
├── modules/       # Framework modules
├── react/         # React integrations
├── utils/         # Shared utilities
├── cli/           # CLI tools
└── vite-plugins/  # Vite plugins
```





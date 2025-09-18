# Fusion Framework Constitution

## Core Principles

### I. Focused File Design
**One file = one responsibility. File name matches main function/component.**

- **Single Responsibility**: One main function/component per file (support functions can be internal)
- **Clear Naming**: `user-service.ts` for `userService` function, `ButtonComponent.tsx` for `ButtonComponent` class
- **Focused Exports**: Export only the main function/component, keep helpers internal
- **Consistent Structure**: Follow kebab-case for files, PascalCase for classes

### II. Observable Patterns
**Use observables internally for async data flows. Never expose in public APIs.**

- **Internal Only**: Observables stay inside framework, not in public library functions
- **Reactive Data Flow**: Use `@equinor/fusion-observable` for all async operations
- **Error Handling**: Implement proper error handling and subscription cleanup
- **Type Safety**: Use TypeScript generics for type-safe observable streams

### III. State Management
**Use FlowSubject for all framework state management.**

- **Centralized State**: FlowSubject as primary state management solution
- **Predictable Updates**: Consistent, traceable state change patterns
- **Immutable Updates**: Prevent unintended state mutations
- **Type Safety**: Maintain type safety across all state operations

### IV. Testing Strategy
**Test public library interfaces only. Skip internal implementation details.**

- **Public APIs Only**: Test exported functions, classes, and interfaces consumers use
- **Consumer-Centric**: Verify public functionality works as documented
- **No Unit Tests**: Avoid unit testing unless explicitly requested
- **No Internal Testing**: Don't test private methods or implementation details
- **Test Structure**: Use `src/__tests__/` directories, `.test.ts` files, Vitest

### V. Consumer-Facing Libraries
**Design simple, intuitive APIs that hide internal complexity.**

- **Simple Interfaces**: Easy-to-understand functions that abstract complexity
- **Async/Await**: Use Promises and async patterns, not observables in public APIs
- **React Hooks**: Provide hooks for state management and data fetching
- **Type Safety**: Fully typed with TypeScript
- **Documentation**: TSDoc comments for all public functions

### VI. Documentation
**Maintain clear, up-to-date documentation for developer productivity.**

- **TSDoc Comments**: Document all public APIs for IntelliSense
- **Inline Comments**: Explain complex logic and business rules
- **README Files**: Clear package descriptions and usage examples
- **Examples**: Practical cookbooks and usage examples

### VII. Changeset Management
**Use changesets for versioning and release coordination.**

- **Semantic Versioning**: patch/minor/major for all releases
- **Single Package**: One package per changeset when possible
- **Clear Descriptions**: Explain what changed and why
- **Breaking Changes**: Document migration paths
- **Location**: Create in `.changeset/` directory

### VIII. Git Practices
**Maintain clean, linear history with consistent practices.**

- **Always Rebase**: Use rebase, never merge
- **Conventional Commits**: `type(scope): description` format
- **Changeset Integration**: Create changesets before committing
- **Atomic Commits**: One logical change per commit
- **Fix/Feat then Refactor**: Commit working code first, refactor separately

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
- **TypeScript**: Ensures type safety and provides excellent developer experience with IntelliSense
- **pnpm**: Enables efficient monorepo management with workspace support and disk optimization
- **Vite**: Delivers fast development with HMR and optimized production builds
- **RxJS**: Powers reactive data flows and state management internally

### React Ecosystem
- **React 18+**: Provides modern hooks-based APIs and concurrent rendering for consumers
- **React Router**: Enables client-side routing with automatic code splitting

### Development Tools
- **Turbo**: Accelerates builds through intelligent caching and parallel execution
- **Vitest**: Tests public library interfaces to ensure consumer-facing functionality works
- **Biome**: Maintains consistent code style and catches issues early

### Build & Deployment
- **Fusion Framework CLI**: Simplifies application creation and development workflow
- **Rollup**: Creates optimized library bundles with tree-shaking for consumers

### Documentation & Package Management
- **VuePress**: Generates the online GitHub documentation page that stays in sync with code
- **Changesets**: Manages semantic versioning and automated changelog generation
- **Conventional Commits**: Enables automated versioning and clear change tracking


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
- [ ] Observables used only internally, not in public library functions
- [ ] Public library functions use async/await patterns and React hooks
- [ ] All public functions/classes have TSDoc documentation
- [ ] Imports use monorepo package resolution (`@equinor/fusion-framework-*`)

### Before Committing Code
- [ ] Working code is committed before proceeding to next step
- [ ] Changeset created/updated before committing
- [ ] Commit message follows conventional format (`type(scope): description`)
- [ ] Public library interfaces are tested and working
- [ ] All existing tests pass

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
- [ ] Public library interfaces are tested and working
- [ ] All existing tests pass (`pnpm test`)
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





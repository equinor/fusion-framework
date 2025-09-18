# GitHub Copilot Instructions for Fusion Framework

## Project Context
This is a TypeScript monorepo for the Fusion Framework, a modular application framework for building enterprise applications. The project uses pnpm for package management and follows strict architectural principles.

## Recent Changes (Last 3)
1. **CLI App Creation Command** - Added comprehensive CLI functionality for creating Fusion applications from templates
2. **Helper Functions** - Created reusable helper modules for GitHub integration, IDE opening, and dev server management
3. **Testing Infrastructure** - Added unit tests for all new CLI helper functions

## Technology Stack
- **Language**: TypeScript 5.8+ with strict type checking
- **Package Manager**: pnpm (never npm or yarn)
- **Testing**: Vitest with comprehensive unit and integration tests
- **CLI Framework**: Commander.js with Inquirer.js for prompts
- **Build System**: Rollup with ESM output
- **Code Quality**: Biome for linting and formatting

## Architecture Principles
- **Modular Design**: Every feature as a library with clear interfaces
- **TypeScript-First**: Strict typing with comprehensive TSDoc comments
- **Test-Driven Development**: RED-GREEN-Refactor cycle mandatory
- **Code Reuse**: Always search existing codebase before implementing new functionality
- **Performance**: Optimized for <2s template cloning, <5s total app creation

## CLI Development Patterns

### Command Structure
```typescript
// Use Commander.js for CLI commands
import { createCommand } from 'commander';

export const command = createCommand('app')
  .description('Create a new Fusion application from template')
  .argument('<name>', 'Name of the application to create')
  .option('-t, --template <type>', 'Template type to use')
  .action(async (name: string, options: CommandOptions) => {
    // Implementation
  });
```

### Helper Functions
```typescript
// Create reusable helper functions with proper error handling
export interface HelperOptions {
  directory: string;
  log?: ConsoleLogger;
}

export async function helperFunction(options: HelperOptions): Promise<Result> {
  // Implementation with comprehensive error handling
}
```

### Error Handling
```typescript
// Always provide clear error messages with suggested solutions
try {
  // Operation
} catch (error) {
  logger.error('Clear error message with context');
  logger.debug(error); // Include debug information
  throw new Error('User-friendly error message');
}
```

### Testing Patterns
```typescript
// Mock external dependencies and test error scenarios
import { vi } from 'vitest';

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
  spawn: vi.fn(),
}));

describe('functionName', () => {
  it('should handle error scenarios', async () => {
    // Test implementation
  });
});
```

## Code Quality Standards

### TypeScript
- Use strict type checking
- Provide TSDoc comments for all public APIs
- Prefer interfaces over types for object shapes
- Use proper error types and handling

### Error Handling
- Validate all inputs before processing
- Provide clear, actionable error messages
- Use structured logging with appropriate levels
- Handle edge cases gracefully

### Performance
- Use efficient file operations
- Implement proper caching strategies
- Stream large operations when possible
- Minimize memory usage

### Testing
- Write tests before implementation (TDD)
- Test error scenarios and edge cases
- Use real dependencies in integration tests
- Mock external dependencies in unit tests

## Common Patterns

### File System Operations
```typescript
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Always check existence before operations
if (!existsSync(filePath)) {
  throw new Error(`File not found: ${filePath}`);
}
```

### Process Spawning
```typescript
import { spawn } from 'node:child_process';

// Use detached processes for long-running operations
const child = spawn(command, args, {
  cwd: directory,
  stdio: 'inherit',
  detached: true,
});
child.unref();
```

### Input Validation
```typescript
// Validate inputs with clear error messages
if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
  throw new Error('App name must contain only letters, numbers, hyphens, and underscores');
}
```

## Package Management
- Always use `pnpm` instead of `npm` or `yarn`
- Use workspace dependencies with `workspace:^`
- Follow monorepo package resolution patterns
- Use changesets for version management

## Documentation
- Provide comprehensive TSDoc comments
- Include usage examples in documentation
- Update README files for new features
- Document error scenarios and troubleshooting

## Recent CLI Features
- App creation from templates with interactive prompts
- GitHub repository initialization with GitHub CLI
- IDE opening support (VS Code, Cursor)
- Development server startup with validation
- Comprehensive error handling and user guidance
- Template caching and update mechanisms

## Development Workflow
1. Write tests first (RED phase)
2. Implement functionality (GREEN phase)
3. Refactor and optimize (REFACTOR phase)
4. Update documentation
5. Create changeset for version management

## Commit Messages

Use conventional commits to ensure that commit messages are structured and meaningful.

```md
<type>(<scope>): <description>

[body]

[footer(s)]
```

**Type**:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

**Scope** _[optional]_: 
Optionally, specify the scope of the change. This could be the name of the module, component, or file affected.

**Description**:
Write a short, imperative tense description of the change.

**Body** _[optional]_: 
Provide a more detailed description of the change if necessary.

**Footer** _[optional]_: 
Include any information about Breaking Changes and reference issues that this commit closes.

## Pull Requests

Use the GitHub PR template located at `.github/PULL_REQUEST_TEMPLATE.md`:

```md
## Why
<!-- What kind of change does this PR introduce? -->
<!-- What is the current behavior? -->
<!-- What is the new behavior? -->
<!-- Does this PR introduce a breaking change? -->
<!-- Other information? -->

closes: <!-- [optional] issue number(s) this PR closes -->

### Check off the following:
- [ ] Confirm that I checked changes to branch which I am merging into.
  - _I have validated included files_
  - _My code does not generate new linting warnings_
  - _My PR is not a duplicate, [check existing pr`s](https://github.com/equinor/fusion-framework/pulls)_
- [ ] Confirm that the I have completed the [self-review checklist](https://github.com/equinor/fusion-framework/blob/main/contributing/self-review.md).
- [ ] Confirm that my changes meet our [code of conduct](https://github.com/equinor/fusion-framework/blob/main/CODE_OF_CONDUCT.md).
```

## Changesets

When generating a changeset for this repository, always follow these guidelines:

1. **One Package per Changeset**: Each changeset should ideally affect only one package. If multiple packages are changed, clearly separate their sections.
2. **Use Correct Front Matter**: At the top of the changeset, specify each affected package and the type of version bump (`major`, `minor`, or `patch`) using the format:
   ```
   ---
   "@equinor/package-name": patch
   ---
   ```
   - __Important:__ In this monorepo, always determine the correct package name by reading the `name` field from the relevant `package.json` file of the affected package.
3. **Clear, Concise Summary**: Write a brief, descriptive summary of the change. Focus on what changed and why.
4. **Detailed Explanation**: For each package, provide:
   - What was changed and why.
   - How the change affects consumers.
   - Migration instructions if there are breaking changes.
   - Example code blocks for new features or usage changes.
5. **Semantic Versioning**: Choose the version bump type based on the impact:
   - `major`: Breaking/incompatible changes.
   - `minor`: Backward-compatible new features.
   - `patch`: Backward-compatible bug fixes.
6. **Formatting**:
   - Use Markdown for formatting.
   - Use code blocks for examples.
   - Use bullet points for lists of changes.
7. **No Unrelated Changes**: Do not group unrelated changes in a single changeset.
8. **Location**: Place the changeset in the `.changesets` directory with a unique, human-readable filename.

Refer to `contributing/changeset.md` for more details and best practices.

## Common Gotchas
- Always use `node:` protocol for Node.js built-ins
- Mock external dependencies in tests
- Handle cross-platform compatibility
- Provide fallback options for optional features
- Clean up resources on errors

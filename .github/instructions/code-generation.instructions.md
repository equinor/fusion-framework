---
description: Rules for generating TypeScript code in Fusion Framework
name: Code Generation Rules
applyTo: "**/*.{ts,tsx}"
---

# Code Generation Rules

## TL;DR (for AI agents)

- **Types**: No `any` for new code; explicit return types for all exported functions; prefer `interface` for object shapes.
- **Docs**: Every exported function/class/component must have TSDoc explaining purpose, params, return, and thrown errors.
- **Errors**: Throw clear, contextual error messages; never silently swallow failures.
- **Imports**: Use scoped imports and `node:` protocol for Node built-ins; never use `workspace:` or cross-package relative imports.
- **Comments**: Only comment non-obvious logic, assumptions, and workarounds; keep code self-explanatory otherwise.
- **Tooling**: Use `pnpm` for all commands and `workspace:^` for monorepo dependencies; follow `monorepo-structure.instructions.md` for package layout/imports.

## Core Principles

### Readability First
- Write clear, self-explanatory code over clever optimizations
- If code needs a comment to explain what it does, rewrite it to be clearer
- Prioritize maintainability and clarity

### TypeScript Standards
- Use strict type checking (no `any`, use proper types)
- Prefer interfaces over types for object shapes
- Use explicit return types for public functions
- Always use `node:` protocol for Node.js built-ins (e.g., `node:fs`, `node:path`)

### TSDoc Requirements
**ALL public functions, classes, and components MUST have TSDoc comments.**

```typescript
/**
 * Validates user permissions for a specific resource
 * @param userId - The user's unique identifier
 * @param resource - The resource being accessed
 * @param action - The action being performed ('read', 'write', 'delete')
 * @returns True if user has permission, false otherwise
 * @throws {AuthorizationError} When user authentication fails
 */
export function hasPermission(userId: string, resource: string, action: string): boolean {
  // implementation
}
```

### Code Patterns

#### Function Structure
- Keep functions small and focused (single responsibility)
- Use descriptive names that explain intent
- Prefer pure functions when possible
- Handle errors explicitly with clear messages

#### Error Handling
```typescript
// Always provide clear error messages with context
try {
  // operation
} catch (error) {
  throw new Error(`Failed to ${operation}: ${error.message}`);
}
```

#### File System Operations
```typescript
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// Always check existence before operations
if (!existsSync(filePath)) {
  throw new Error(`File not found: ${filePath}`);
}
```

### Import Patterns
- Always use scoped package names: `@equinor/fusion-framework`
- Use specific named imports when possible
- Import types explicitly: `import type { Config } from '...'`
- Never use relative imports for monorepo packages
- Never use `workspace:` protocol in source code

### React Components
- Use function components (no class components)
- Add TSDoc comments for all component props
- Use proper TypeScript types for props
- Handle loading and error states explicitly

### Testing Requirements
- Test error scenarios and edge cases
- Mock external dependencies in unit tests
- Use Vitest for all tests

### Package Manager
- **ALWAYS use `pnpm`** - never `npm` or `yarn`
- Use `workspace:^` for monorepo dependencies
- Run commands: `pnpm install`, `pnpm build`, `pnpm test`

### Inline Comments
Add comments for:
- Complex business logic that isn't obvious
- Non-obvious algorithmic choices
- Important assumptions or constraints
- Workarounds or temporary solutions

Do NOT add comments for:
- Obvious code that's self-explanatory
- What the code does (code should be self-documenting)
- Redundant information already in TSDoc


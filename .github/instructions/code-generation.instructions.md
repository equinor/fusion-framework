---
description: Rules for generating TypeScript code in Fusion Framework
name: Code Generation Rules
applyTo: "**/*.{ts,tsx}"
---

# Code Generation Rules

## TL;DR (for AI agents)

- **Types**: No `any` for new code; explicit return types for all exported functions; prefer `interface` for object shapes.
- **Docs**: Every declared function/class/component and named arrow function must have TSDoc that captures intent. Treat TSDoc as part of the repository retrieval corpus used for RAG and code generation. Include `@param` for every parameter, `@returns` for non-void functions, `@template` for generics, `@throws` for thrown errors, and `@example` for user-facing APIs.
- **Errors**: Throw clear, contextual error messages; never silently swallow failures.
- **Imports**: Use scoped imports and `node:` protocol for Node built-ins; never use `workspace:` or cross-package relative imports.
- **Comments**: Add inline intent comments for iterator blocks, decision gates, RxJS operator chains, assumptions, and workarounds. Explain why the block exists, not what the syntax does.
- **Tooling**: Use `pnpm` for all commands and `workspace:^` for monorepo dependencies; follow `monorepo-structure.instructions.md` for package layout/imports.

## Core Principles

### Readability First
- Write clear, self-explanatory code over clever optimizations
- Prefer names and structure that communicate intent, but do not omit comments when control-flow or data-flow intent would otherwise be lost
- Prioritize maintainability and clarity

### TypeScript Standards
- Use strict type checking (no `any`, use proper types)
- Prefer interfaces over types for object shapes
- Use explicit return types for public functions
- Always use `node:` protocol for Node.js built-ins (e.g., `node:fs`, `node:path`)

### TSDoc Requirements
**ALL declared functions, named arrow functions, classes, hooks, and components MUST have TSDoc comments.**

TSDoc is not only for maintainers reading source. In this repository it is also indexed for retrieval-augmented generation and code generation workflows. Write it so both humans and semantic search can understand it.

- Lead with a summary that explains intent and caller expectations
- Use the exported symbol name, domain terms, and caller-facing vocabulary that developers are likely to search for
- Add `@param` for every parameter
- Add `@returns` for every non-void function
- Add `@template` for every generic type parameter
- Add `@throws` for meaningful error paths
- Add `@example` for user-facing APIs and non-trivial public APIs
- If an inline callback becomes non-trivial, extract it into a named helper or add a preceding intent comment

### Retrieval-Friendly TSDoc

- Start the summary with what the API does and when to use it
- Prefer concrete nouns over pronouns like `this`, `it`, or `thing`
- Mention the primary resource, concept, or workflow once using the same wording a caller would search for
- Include behavior words such as `create`, `resolve`, `validate`, `fetch`, `stream`, or `transform` when they reflect the real API intent
- Keep examples realistic and small so generated code can reuse the same shape with minimal adaptation
- Document edge cases and error behavior explicitly when they affect caller control flow

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
- Resolve decision logic and data transforms before JSX so markup renders prepared values
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
Add intent comments for:
- Iterator blocks such as `for`, `forEach`, `map`, `filter`, and `reduce`
- Decision gates such as `if`, `switch`, and non-trivial ternaries
- RxJS operator chains and subscriptions
- Important assumptions, constraints, compatibility branches, and workarounds

Do NOT add comments for:
- Obvious code that's self-explanatory
- What the syntax does or what a variable name already says
- Redundant information already in TSDoc


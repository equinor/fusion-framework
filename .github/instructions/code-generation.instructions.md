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

`fusion-lint`'s `require-intent-comment` checks each control-flow node for an immediately preceding comment (`previousNamedSibling?.type === "comment"`). This means:
- **Each iterator/`.pipe()` call in a chain needs its own comment**, not just the first one: `.filter().map()` needs a comment before `.filter(` AND before `.map(`.
- **Each sibling `if` in a row needs its own comment.** A comment before the first of several back-to-back guard clauses does not cover the second/third — their `previousNamedSibling` is the prior `if`, not the comment.
- When an iterator/`.pipe()` call is itself an argument to another call (e.g. `expect(arr.map(...))`), place the comment as the first line inside the outer call's parens — do not break the chain.
- When an iterator/`.pipe()` call is nested two levels deep (e.g. `lastValueFrom(x.pipe(...))`, or inside a ternary branch), hoist the inner expression into its own `const` first, then use the broken-chain comment style (`value\n  // why\n  .pipe(...)`) or place the comment above the new `const`.
- `return arr.map(...)` can never be satisfied by a comment above the `return` — always hoist or break the chain.
- `as unknown as Foo` double-casts require a preceding comment explaining *why* the cast is needed; this is `error` severity, not `warn`.

#### RxJS `.pipe()` comment placement (preferred style)

For `.pipe()` specifically (`require-intent-comment/rxjs`), prefer placing the comment **above the whole enclosing statement** with `receiver.pipe(...)` kept unsplit on one line, rather than splitting the chain to put the comment right before `.pipe(`:

```typescript
// unwrap the query result value
return this.#query.query(args).pipe(map((res) => res.value));
```

This works when the comment sits directly above a `return` statement, a `const`/`let` declaration, or a concise arrow-function body — the rule climbs up to that anchor. It does **not** work when the `.pipe()` call is itself an argument to another call (e.g. `subscriber.add(x.pipe(...))`, `this.#subscription.add(x.pipe(...))`) or is inside a ternary branch — those require the inline chain-split style below.

**Exception — keep the comment close when the receiver is long:** if the receiver expression spans multiple lines before `.pipe(` (e.g. a multi-line `.json$(url, { method, body, headers })` call), do NOT hoist the comment to the top of the statement — it ends up far from the `.pipe()` it explains. Keep the inline chain-split style instead:

```typescript
return this.#client
  .json$<AppSettings>(`/persons/me/apps/${appKey}/settings`, {
    method: 'PUT',
    body: settings,
    headers: { 'Api-Version': '1.0' },
  })
  // update the settings cache with the persisted value
  .pipe(tap((value) => { /* ... */ }));
```

Rule of thumb: comment-above-statement (unsplit) for short/single-line receivers; inline chain-split (comment immediately before `.pipe(`) for long/multi-line receivers, so the comment stays adjacent to what it documents.

### TODO Comments
Bare `// TODO - ...` comments are flagged by `no-todo-without-issue`. Every TODO must reference a tracking GitHub issue: `// TODO(#123): ...`. Never fabricate an issue number — create the issue first if one doesn't exist.

### Filename Conventions
`fusion-lint`'s `filename-convention` and `single-export-per-file` rules expect one value export per file, named to match:
- **Classes and PascalCase-named components** (`class Foo`, `export const Foo = () => ...`): filename must equal the export name exactly, e.g. `HttpResponseError.ts`, `UserCard.tsx`.
- **Hooks** (`useXxx`): filename must equal the hook name exactly, e.g. `useFeatureFlag.ts`.
- **Everything else** (plain functions, consts, enums): filename must be the kebab-case form of the export name, e.g. `capitalizeRequestMethod` → `capitalize-request-method.ts`. A trailing dotted category suffix is allowed, e.g. `sse.operator.ts`, `my-foo.schema.ts` — only the segment before the first dot needs to match.
- Barrels (`index.ts`) are exempt and may have multiple exports.
- If a file needs a second export (e.g. an `Error` subclass alongside the function that throws it), extract it into its own file rather than suppressing the rule.


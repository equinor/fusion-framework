---
description: Rules for generating TypeScript code in Fusion Framework
name: Code Generation Rules
applyTo: "**/*.{ts,tsx}"
---

# Code Generation Rules

## TL;DR (for AI agents)

The global non-negotiables (no `any`, explicit return types, scoped imports, `pnpm`) live in
`.github/copilot-instructions.md`. This file covers what is specific to writing TypeScript here:

- **Docs**: Every declared function, class, component, and named arrow function needs TSDoc that captures intent. TSDoc is indexed for retrieval, so write it for semantic search as well as for humans. Include `@param` for every parameter, `@returns` for non-void functions, `@template` for generics, `@throws` for thrown errors, and `@example` for user-facing APIs.
- **Errors**: Throw clear, contextual error messages; never silently swallow failures.
- **Comments**: Add inline intent comments for iterator blocks, decision gates, RxJS operator chains, assumptions, and workarounds. Explain why the block exists, not what the syntax does.
- **Node built-ins**: Always use the `node:` protocol (`node:fs`, `node:path`).
- **Cross-platform paths**: Normalize paths at filesystem/tooling boundaries, emit module specifiers with `/`, and test path logic with Windows-shaped input.
- **Filenames**: One value export per file, named to match. See below.

## Core Principles

### Readability First
- Write clear, self-explanatory code over clever optimizations
- Prefer names and structure that communicate intent, but do not omit comments when control-flow or data-flow intent would otherwise be lost
- Prefer `interface` over `type` for object shapes

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

#### Cross-Platform Path Handling
- Use `node:path` for filesystem resolution, but do not emit `path.join()` results as import
  specifiers. JavaScript and TypeScript module specifiers must use `/` separators.
- Normalize filesystem paths and tool-provided module IDs to the same separator form before
  comparing them. Vite and similar tools can provide `/`-separated IDs on Windows while
  `process.cwd()` and configured roots still contain `\`.
- Check directory containment at path-segment boundaries; a bare `startsWith(root)` also matches
  sibling paths such as `/workspace/app-copy`.
- When code resolves, compares, transforms, or generates paths, add regression coverage for both
  POSIX and Windows-shaped inputs even if CI runs on only one operating system.

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

`fusion-lint`'s `require-intent-comment` checks each control-flow node for an *immediately
preceding* comment, so placement is structural rather than visual:

- Every iterator or `.pipe()` call in a chain needs its own comment — `.filter().map()` needs two.
- Every sibling `if` in a row needs its own comment.
- `as unknown as Foo` double-casts need a comment explaining *why*. This one is `error` severity.

Two placements are recognised: above the enclosing statement, or inline between the receiver
and the call. Prefer above-the-statement for short receivers, inline when the receiver spans
multiple lines so the comment stays next to what it explains:

```typescript
// unwrap the query result value
return this.#query.query(args).pipe(map((res) => res.value));
```

When a diagnostic resists an obvious fix — nested calls, ternary branches, JSX expression
containers, spread elements — see `contributing/fusion-lint.md` for the placements that
actually anchor.

### TODO Comments
Bare `// TODO - ...` comments are flagged by `no-todo-without-issue`. Every TODO must reference a tracking GitHub issue: `// TODO(#123): ...`. Never fabricate an issue number — create the issue first if one doesn't exist.

### Filename Conventions
`fusion-lint`'s `filename-convention` and `single-export-per-file` rules expect one value export per file, named to match:
- **Classes and PascalCase-named components** (`class Foo`, `export const Foo = () => ...`): filename must equal the export name exactly, e.g. `HttpResponseError.ts`, `UserCard.tsx`.
- **Hooks** (`useXxx`): filename must equal the hook name exactly, e.g. `useFeatureFlag.ts`.
- **Everything else** (plain functions, consts, enums): filename must be the kebab-case form of the export name, e.g. `capitalizeRequestMethod` → `capitalize-request-method.ts`. A trailing dotted category suffix is allowed, e.g. `sse.operator.ts`, `my-foo.schema.ts` — only the segment before the first dot needs to match.
- Barrels (`index.ts`) are exempt and may have multiple exports.
- If a file needs a second export (e.g. an `Error` subclass alongside the function that throws it), extract it into its own file rather than suppressing the rule.

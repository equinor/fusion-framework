---
description: Rules for writing tests in Fusion Framework
name: Testing Rules
applyTo: "**/*.{test,spec}.{ts,tsx}"
---

# Testing Rules

## TL;DR (for AI agents)

- **Framework**: Use Vitest for all tests with `describe/it/expect/vi`.
- **Coverage**: For every new exported function/module/component, add at least one happy-path test and one error/edge-case (including async where relevant).
- **Behavior**: Test observable behavior, not implementation details; focus on inputs/outputs and side effects.
- **Mocking**: Use `vi.mock` / `vi.fn` for external dependencies; prefer real dependencies for integration tests.
- **Location**: Co-locate tests as `*.test.ts(x)` or under `__tests__` next to the code.

## Testing Framework

Vitest, everywhere. Prefer writing the failing test first.

Run a single project rather than the whole workspace:

```bash
npx vitest run --project '<project-name>'
```

`pnpm --filter <pkg> test` fails with "No projects were found" — the workspace defines
projects centrally in `vitest.config.ts`.

## Coverage Expectations

Every new exported function, module, or component needs at least:

- one happy path
- one error or edge case, including async rejection where relevant

Test observable behavior — inputs, outputs, and side effects — not implementation details.

## Test File Organization

Co-locate as `src/feature.test.ts` next to `src/feature.ts`, or under `src/__tests__/`.
Both `.test.ts` and `.spec.ts` are recognised.

## Mocking

- `vi.mock()` for modules, `vi.fn()` for functions.
- Mock external dependencies in unit tests; use real dependencies in integration tests.
- When mocking a framework package, mock only the exports under test:

```typescript
vi.mock('@equinor/fusion-framework', () => ({
  Framework: vi.fn(),
}));
```


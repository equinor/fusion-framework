---
description: Rules for working in cookbook example applications
name: Cookbook Rules
applyTo: "cookbooks/**"
---

# Cookbook Rules

## TL;DR (for AI agents)

- A cookbook is a **teaching artifact**. Optimise for a reader learning one pattern, not for
  reuse or abstraction.
- Every cookbook is a published package — a change needs a changeset against its own name
  (`@equinor/fusion-framework-cookbook-<folder>`).
- Keep the established file layout. Several conventions here are load-bearing and are
  deliberately exempt from lint rules.

## Structure conventions

Every cookbook follows the same shape, and `src/index.ts` imports the configurator by path:

```ts
import configure from './config';
```

- `src/config.ts` — the framework configurator. **Never rename it.** Every cookbook and
  several READMEs reference it by exact name.
- `src/index.ts` — entry point that wires the configurator into the app host.
- `src/App.tsx` — the demonstrated UI.

A cookbook demonstrating routing additionally uses `routes.ts` for the route DSL manifest.
Do not name that file `index.ts` — an `index.ts` and `index.tsx` in the same directory
resolve ambiguously and the bundler picks the wrong one.

## Writing the example

- Show the **framework** API, not a wrapper around it. If a reader has to follow three local
  helpers to find the framework call, the cookbook has failed.
- Handle loading and error states explicitly. A cookbook that ignores them teaches others to
  ignore them.
- Prefer inline, readable code over extracting shared utilities. Duplication between
  cookbooks is intentional — each one must stand alone.
- Keep dependencies minimal. A cookbook exists to isolate one concern.
- The README is indexed for retrieval. State which framework feature is demonstrated and how
  to run it, in prose a search query can match.

## Linting exceptions

`single-export-per-file` is relaxed for React Router v7 route modules, which co-locate
`clientLoader`, `action`, the component, and `ErrorBoundary` by framework convention. That is
expected — do not split them.

Other exempt basenames are listed in `fusion-lint.config.json`. If a rule flags an
established convention, add an `excludePattern` entry rather than restructuring the cookbook
away from the pattern it exists to demonstrate. See `contributing/fusion-lint.md`.

## Before you finish

```bash
pnpm --filter @equinor/fusion-framework-cookbook-<folder> exec tsc -b --force
pnpm exec biome lint cookbooks/<folder>
pnpm exec fusion-lint lint cookbooks/<folder>
```

Then add the changeset. A cookbook change without one blocks the release.

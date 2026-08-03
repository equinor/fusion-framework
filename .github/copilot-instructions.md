# Copilot instructions — Fusion Framework

Full agent guide: [`AGENTS.md`](../AGENTS.md). Repository map: [`CODEMAP.md`](../CODEMAP.md).

This file carries only what must apply to **every** request. Everything else lives in
`.github/instructions/*.md` and attaches automatically through its `applyTo` glob.

## Before you search

Escalation order — stop as soon as you can act:

1. `CODEMAP.md` — package map, task routing, commands
2. Fusion MCP retrieval index (`fusion-framework`, `fusion-docs`, `eds`)
3. Targeted `grep` on a path the code map gave you
4. Workspace-wide semantic search

Never start at step 4. Never repeat a search whose results you already have.

## Non-negotiables

- **`pnpm` only.** Never `npm` or `yarn`.
- **No `any`** in new TypeScript. Explicit return types on exported symbols.
- **Scoped imports** (`@equinor/fusion-framework-*`). Never cross-package relative imports.
  `workspace:^` belongs in `package.json`, never in source.
- **TSDoc** on every exported function, class, and component — it is indexed for retrieval.
- **React function components only**; loading and error states handled explicitly.
- **Vitest**, co-located, covering happy path, error path, and async behavior.
- **Changeset required** for any change to `packages/*` or `cookbooks/*`.
- **Comments explain _why_**, never restate the code.

## Reviewing a pull request

Review **the diff**, not the repository. Rules:
[`code-review.instructions.md`](instructions/code-review.instructions.md).

## Rule precedence

The most specific `applyTo` wins. Do not add new global rules to this file — put them in
the matching instruction file, and update [`AGENTS.md`](../AGENTS.md) if routing changes.


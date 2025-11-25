## AI Agent Guide for Fusion Framework

This document is the **starting point for any AI agent** (Copilot, Cursor, etc.) working in this repository.
It explains how to behave, which rules to follow, and where to find the authoritative instructions.

---

## What you are working with

- **TypeScript monorepo** for the Fusion Framework (enterprise application framework).
- **Strict TypeScript**: no `any` in new code, explicit types, rich TSDoc for all exported APIs.
- **React**: function components only; handle loading and error states explicitly.
- **Tooling**: `pnpm` only, Biome for lint/format, Vitest for tests, Changesets for versioning.
- **Monorepo layout**: multiple `packages/*` libraries plus `cookbooks/` examples and `vue-press/` docs.

Always treat each `packages/*` project as a **library that will be published**.

---

## Instruction hierarchy

When deciding what to do, apply rules in this order:

1. **Most specific `.github/instructions/*.md` whose `applyTo` matches the current file**
2. **Global code rules**:
   - `.github/instructions/code-generation.instructions.md`
   - `.github/instructions/monorepo-structure.instructions.md`
3. **Repository contributing docs** in `contributing/`:
   - `contributing/changeset.md`
   - `contributing/conventional-commits.md`
   - `contributing/self-review.md`
4. **Top-level index**: `.github/copilot-instructions.md`

If rules conflict, **the more specific file wins** (for example, React + Testing rules for `*.test.tsx`).

---

## Key instruction files

- **Global AI index**: `.github/copilot-instructions.md`
- **Code generation**: `.github/instructions/code-generation.instructions.md`
- **Monorepo structure**: `.github/instructions/monorepo-structure.instructions.md`
- **React**: `.github/instructions/react.instructions.md`
- **Testing (Vitest)**: `.github/instructions/testing.instructions.md`
- **Changesets**: `.github/instructions/changesets.instructions.md`
- **Pull requests**: `.github/instructions/pull-requests.instructions.md`
- **Dependabot PRs**: `.github/instructions/dependabot-pr.instructions.md`

Each of these files starts with a **TL;DR aimed at AI agents** – read that first, then the rest if needed.

---

## Default behavior checklist

When you receive a task, default to this behavior:

- **Understand scope**
  - Identify file type and package (`packages/*`, `cookbooks/*`, `vue-press/*`, etc.).
  - Determine which instruction files apply using their `applyTo` globs.

- **Follow strict TypeScript + TSDoc**
  - No `any` for new code; explicit types and return types on exported APIs.
  - Add TSDoc to all exported functions, classes, and React components.

- **Use correct imports and monorepo rules**
  - Use scoped imports like `@equinor/fusion-framework-*`, `@equinor/fusion-observable`, etc.
  - Never use cross-package relative imports or `workspace:` protocols in source code.

- **Respect tooling and commands**
  - Use `pnpm` for all scripts and installs (`pnpm build`, `pnpm test`, etc.).
  - Assume Biome is used for lint and format; keep code style consistent.

- **Write tests**
  - Use Vitest, co-locate tests as `*.test.ts(x)` or under `__tests__`.
  - Cover at least happy path + error/edge cases + async where relevant.

- **Consider changesets and PRs**
  - For any consumer-facing change or docs change, follow the Changeset Rules.
  - For PR bodies and commit messages, follow the Pull Request Rules and conventional commits.

---

## Safety and user-consent rules

- **Never run destructive operations without explicit user approval**, such as:
  - Force pushes, rebases, branch deletions.
  - Large-scale refactors across many packages.
  - Auto-merging PRs, especially Dependabot PRs.
- **Dependabot-specific rules**:
  - Always follow `.github/instructions/dependabot-pr.instructions.md`.
  - Do not post PR comments, push commits, or merge without user confirmation.

When unsure, **stop and ask the user** instead of guessing.

---

## How to be most helpful

- **Be concise but precise**: Prefer clear, short explanations and focused diffs.
- **Use existing patterns**: Match established file structure, naming, and coding style.
- **Document non-obvious logic**: Add inline comments only where they help future maintainers.
- **Keep instructions in sync**: When you change behavior or patterns, update the relevant `.github/instructions/*.md` and add a changeset for docs if needed.

If you are ever uncertain which rule applies, consult `.github/copilot-instructions.md` and the specific instruction file for the area you are working in, then ask the user for clarification. 



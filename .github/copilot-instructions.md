## GitHub Copilot / AI Instructions for Fusion Framework

### Project context

Fusion Framework is a **TypeScript monorepo** for building modular enterprise applications.

- **Language**: Strict TypeScript (no `any` for new code)
- **UI**: React (function components only)
- **Tests**: Vitest
- **Monorepo**: Multiple `packages/*` libraries with shared modules and utils
- **Tooling**: `pnpm` only, Biome for lint/format, Changesets for versioning

Always assume you are working in a **library-style monorepo** where each package is a published artifact.

---

### Instruction hierarchy

When deciding which rules to follow, apply them in this order:

1. **Most specific `.github/instructions/*.md` file whose `applyTo` matches the file you are editing**
2. **Global code rules** from `code-generation.instructions.md` and `monorepo-structure.instructions.md`
3. **Repository contributing docs** in `contributing/` (self-review, conventional commits, etc.)

If instructions ever conflict:

- Prefer the **most specific file-based instruction** (for example, React + Testing rules for `*.test.tsx`).
- Do **not** create new global rules in this file; instead, follow the relevant instruction file.

---

### Instruction files (single source of truth)

Fusion Framework uses file-based AI instructions under `.github/instructions/`. These files are the **single source of truth** for how AI should generate code and handle workflows:

- **Code generation** → `./.github/instructions/code-generation.instructions.md`  
  TypeScript standards, TSDoc, error handling, import patterns, `pnpm` usage.
- **Monorepo structure** → `./.github/instructions/monorepo-structure.instructions.md`  
  Package layout, naming, cross-package imports, `workspace:^` dependencies.
- **Changesets** → `./.github/instructions/changesets.instructions.md`  
  When and how to create changesets, choose bump types, and write consumer-facing summaries.
- **Testing** → `./.github/instructions/testing.instructions.md`  
  Vitest patterns, mocking, coverage expectations, async/error testing.
- **Pull requests** → `./.github/instructions/pull-requests.instructions.md`  
  PR templates, commit conventions, review flow, and pre‑PR checks.
- **React** → `./.github/instructions/react.instructions.md`  
  Component, hook, provider, observable, and styling patterns for React.
- **Dependabot PRs** → `./.github/instructions/dependabot-pr.instructions.md`  
  **⚠️ MANDATORY**: When handling ANY Dependabot PR, you MUST read this entire instruction file first. It contains mandatory steps including posting comments using `gh pr comment -F <file>.md`. Do not skip steps.

Each instruction file declares an `applyTo` glob so tools like Copilot/Cursor can automatically apply the right rules for the files you are editing.

---

### Quick-start workflow for AI agents

When you receive a task, follow this workflow:

1. **Identify file type and location**
   - `*.tsx` or React UI → follow **React Rules** (and **Testing Rules** for `*.test.tsx`).
   - `packages/**` TypeScript code → follow **Monorepo Structure Rules** + **Code Generation Rules**.
   - `.changeset/*.md` → follow **Changeset Rules**.
   - PR / changeset / Dependabot tasks → follow the corresponding instructions file.

2. **Apply core global rules**
   - Use **strict TypeScript** (no `any`), explicit return types, and **TSDoc for all public APIs and components**.
   - Use **scoped imports** like `@equinor/fusion-framework-*`, never relative imports between packages.
   - Use **`pnpm` only** for scripts and dependencies; never `npm` or `yarn`.

3. **Generate or edit code**
   - Prefer **small, focused functions**, descriptive names, and clear error messages.
   - Add **inline comments** only for non-obvious logic, assumptions, or workarounds.
   - For React, use **function components only**, handle **loading and error states explicitly**, and follow patterns in `react.instructions.md`.

4. **Consider changesets and PR impact**
   - If a change affects a published package or documentation, **follow Changeset Rules**.
   - When preparing a PR, follow **Pull Request Rules** and conventional commits.

---

### Core principles (summary)

- **Readability and maintainability first**: Prefer simple, obvious solutions over cleverness; follow `code-generation.instructions.md`.
- **Strict TypeScript + TSDoc**: All exported functions, classes, and components must be well-typed and documented.
- **React function components only**: No class components; handle loading and error states; follow `react.instructions.md`.
- **Tests with Vitest**: Co-locate tests, cover success, error, and async behavior; follow `testing.instructions.md`.
- **Monorepo discipline**: Treat each `packages/*` project as a versioned library; obey naming and import rules in `monorepo-structure.instructions.md`.
- **Tooling compliance**: Use `pnpm`, Biome, Changesets, and the PR template for consumer-facing changes.

When in doubt, **prefer looking up and following the relevant `.github/instructions/*.md` file rather than adding new rules here**.


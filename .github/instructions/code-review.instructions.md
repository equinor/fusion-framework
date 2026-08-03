---
description: Scope and cost rules for automated code review on pull requests
name: Code Review Rules
applyTo: "**"
---

# Code Review Rules

## TL;DR (for AI agents)

- Review **the diff**, not the repository.
- Resolve "where does this live" questions from `CODEMAP.md` before searching.
- One comment per real defect. No praise, no summaries of what the diff already shows.
- If a concern requires reading more than two files outside the diff to confirm, state the
  assumption in the comment instead of exploring.

## Scope

The unit of review is the changed hunk plus its immediate enclosing function, class, or
component. Do not expand scope to:

- unchanged files that merely import the changed symbol
- the full package the change lives in
- test files unless tests are part of the diff or a changed public API has no test coverage
- generated output (`dist/`, `*.tsbuildinfo`, `pnpm-lock.yaml`, `CHANGELOG.md`)

## Context budget

Before opening any file, check whether the question is already answered by:

1. `CODEMAP.md` — package layout, ownership, task routing, commands
2. The PR title, body, and changeset in `.changeset/`
3. The diff itself, including surrounding context lines

Only open additional files when the correctness of a specific finding depends on it, and
name the file you need rather than crawling the tree.

## What to comment on

Comment when the diff introduces one of the following:

- a correctness or logic defect
- a security issue (OWASP Top 10, unsafe input handling, leaked secrets or tokens)
- a breaking change to an exported API without a `major` changeset
- a missing changeset for a change to `packages/*` or `cookbooks/*`
- `any` in new TypeScript code, or a missing return type on an exported symbol
- a cross-package relative import, or `workspace:` protocol used in source code
- a new exported symbol without TSDoc
- a React component that ignores loading or error state
- use of `npm` or `yarn` in scripts or docs

## Repository-specific defects worth catching

These have each broken a release or a downstream package. They are cheap to spot in a diff
and expensive to find later:

- A new workspace dependency in `package.json` without a matching `references` entry in the
  package's `tsconfig.json`. `prepack` builds each package in isolation during publish, so a
  full local build will not reveal the missing reference — but the release will fail.
- A file rename or split under `packages/*` without updating the `exports` or
  `typesVersions` subpaths in that package's `package.json`, which hardcode dist filenames.
- A barrel that replaces `export * from './x'` with `export * as X from './x'`. That removes
  named exports and is a breaking change, not a refactor.
- A file split that rewires importers but leaves the original file in place. Dead files still
  compile and still lint.

## What not to comment on

- formatting and style already enforced by Biome
- naming preferences that match existing package conventions
- restating what the diff does
- speculative refactors, "consider extracting", or architecture opinions unrelated to the change
- nitpicks in `cookbooks/*` that do not affect the demonstrated pattern

## Comment format

- One finding per comment, anchored to the specific line.
- State the problem, the consequence, then the fix — in that order, in at most three sentences.
- Include a concrete code suggestion when the fix is mechanical.
- Prefix non-blocking observations with `nit:` so they can be skipped.

## Dependency pull requests

For Dependabot or Renovate pull requests, do not review the lockfile diff line by line.
Assess: the semver jump, breaking changes in the upstream changelog, and whether a changeset
is required. Follow `.github/instructions/dependabot-pr.instructions.md`.

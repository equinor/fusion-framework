---
description: Rules for workflow-driven repository contributions
name: Workflow Contribution Rules
---

# Workflow Contribution Rules

## TL;DR (for AI agents)

- Use these rules when a workflow, prompt, or automation step can change code, create commits, write changesets, or open or update pull requests.
- Apply the matching repository instruction files for the files being changed.
- Use Conventional Commits.
- Make an explicit changeset decision.
- Run targeted checks first, then `pnpm test && pnpm build && pnpm -w check` unless repository context or maintainer guidance explicitly narrows the required set.
- Use `.github/PULL_REQUEST_TEMPLATE.md` and open pull requests as draft first.

## Source of truth

These files remain authoritative. Workflow documents should point to them instead of rephrasing them independently:

- `.github/instructions/code-generation.instructions.md`
- `.github/instructions/monorepo-structure.instructions.md`
- `.github/instructions/react.instructions.md`
- `.github/instructions/testing.instructions.md`
- `.github/instructions/changesets.instructions.md`
- `.github/instructions/pull-requests.instructions.md`

## Apply the matching repository rules

- `**/*.{ts,tsx}` -> code generation rules
- `packages/**/*.{ts,tsx,json}` -> monorepo structure rules
- `**/*.{tsx,jsx}` -> React rules
- `**/*.{test,spec}.{ts,tsx}` -> testing rules
- `.changeset/**/*.md` -> changeset rules

## Implementation guardrails

- No `any` in new code.
- Add explicit return types for exported APIs.
- Add TSDoc to exported functions, classes, and components.
- Use `node:` built-ins and scoped package imports.
- Never use cross-package relative imports or `workspace:` protocols in source code.
- React changes must use function components and explicit loading and error handling.
- New public behavior should get happy-path and error or edge-case coverage.

## Commit rules

- Use Conventional Commit messages.
- Keep commits focused and traceable to one change or reviewer concern when practical.

## Changeset decision

- Create a changeset for published package changes.
- Create a changeset for consumer-facing `.md` documentation changes.
- Skip changesets for repo-internal markdown such as workflow instructions, prompts, agent definitions, and skill-catalog content that does not ship to consumers.
- Skip changesets for workspace-root CI, tooling, or config-only changes.
- Skip changesets for test-only changes unless public behavior changed.
- When skipped, state why.

## Validation contract

- Run targeted checks first.
- Before PR-ready handoff or re-review, run `pnpm test && pnpm build && pnpm -w check` unless the repository context or maintainer explicitly narrows the required set.
- If the validation set is narrowed, report exactly what ran and what was skipped.

## Pull request contract

- Use `.github/PULL_REQUEST_TEMPLATE.md` and fill every required section.
- Open pull requests as draft first.
- Do not list changed files in the PR body.
- Explain why the change is needed, current behavior, new behavior, impact, review guidance, and related issues.
- Only mark a PR ready for review after required validation passes.

## Review-only workflows

If the workflow is reviewing rather than editing, treat missing changesets, missing required validation, or PR-template gaps as explicit findings instead of silently assuming them away.
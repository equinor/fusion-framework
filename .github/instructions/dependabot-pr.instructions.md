---
description: Rules for handling Dependabot pull requests
name: Dependabot PR Rules
---

# Dependabot PR Rules

## TL;DR (for AI agents)

- Choose the right skill based on intent:
  - **Single PR review** → `.agents/skills/fusion-dependency-review/SKILL.md`
  - **Batch processing / clear backlog** → `.agents/skills/custom-dependency-pr-solver/SKILL.md`
- Do not approve, merge, push, close, or comment on a Dependabot PR without explicit user confirmation (batch-level confirmation counts for the solver skill).
- If the branch needs refreshing, use rebase-only refreshes; never merge the base branch into the PR branch.
- If the PR needs patching, follow `.github/instructions/workflow-contribution.instructions.md`.
- Treat missing changesets, missing validation, or weak PR-template usage as explicit findings.

## Workflow routing

Determine which workflow to use based on the user's intent:

| Intent | Skill | Confirmation model |
|--------|-------|--------------------|
| Review a single dependency PR in detail | `fusion-dependency-review` | Per-PR confirmation before merge |
| Batch-process multiple Dependabot PRs with auto-merge for safe updates | `custom-dependency-pr-solver` | Batch-level confirmation, then auto-merge high-confidence PRs |

If the intent is ambiguous, ask: "Do you want to review a single PR in detail, or batch-process multiple Dependabot PRs?"

## Single-PR workflow (fusion-dependency-review)

1. Identify the target Dependabot PR by URL or PR number.
2. Review it with `.agents/skills/fusion-dependency-review/SKILL.md`.
3. If branch updates are required, rebase onto the latest base branch; do not merge the base branch into the PR branch.
4. If code changes are required, apply `.github/instructions/workflow-contribution.instructions.md` before committing or updating the PR.
5. Before approval or merge, verify required validation status, changeset handling, and PR-body quality.

## Batch workflow (custom-dependency-pr-solver)

1. List all open Dependabot PRs and present to the user for batch confirmation.
2. Process each confirmed PR with `.agents/skills/custom-dependency-pr-solver/SKILL.md`.
3. High-confidence PRs (all validation passes, no breaking changes, no security concerns) are auto-merged via admin squash after posting research and verdict comments.
4. Medium and low-confidence PRs are reported but never auto-merged.

## Safety

- Never auto-merge just because the update is small.
- Never assume CI is green without checking actual status.
- Never suppress reviewer or maintainer concerns for convenience.
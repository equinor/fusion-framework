---
description: Rules for handling Dependabot pull requests
name: Dependabot PR Rules
---

# Dependabot PR Rules

## TL;DR (for AI agents)

- Use `.agents/skills/fusion-dependency-review/SKILL.md` as the default review workflow for Dependabot PRs.
- Do not approve, merge, push, close, or comment on a Dependabot PR without explicit user confirmation.
- If the branch needs refreshing, use rebase-only refreshes; never merge the base branch into the PR branch.
- If the PR needs patching, follow `.github/instructions/workflow-contribution.instructions.md`.
- Treat missing changesets, missing validation, or weak PR-template usage as explicit findings.

## Default workflow

1. Identify the target Dependabot PR by URL or PR number.
2. Review it with `.agents/skills/fusion-dependency-review/SKILL.md`.
3. If branch updates are required, rebase onto the latest base branch; do not merge the base branch into the PR branch.
4. If code changes are required, apply `.github/instructions/workflow-contribution.instructions.md` before committing or updating the PR.
5. Before approval or merge, verify required validation status, changeset handling, and PR-body quality.

## Safety

- Never auto-merge just because the update is small.
- Never assume CI is green without checking actual status.
- Never suppress reviewer or maintainer concerns for convenience.
# Dependency Reviews

How dependency update PRs are reviewed and merged in the Fusion Framework monorepo.

## Overview

Dependency updates arrive primarily through Dependabot PRs. The repository supports two workflows:

| Workflow | Skill | Use case |
|----------|-------|----------|
| Single-PR deep review | `fusion-dependency-review` | Detailed multi-lens analysis of one dependency update |
| Batch processing | `custom-dependency-pr-solver` | Process and auto-merge multiple safe Dependabot PRs |

Both workflows follow the rules in `.github/instructions/dependabot-pr.instructions.md`.

## Review process

1. **Research** — Identify the dependency, version range, upstream changelog, breaking changes, and security advisories.
2. **Existing discussion** — Read all PR comments and review threads before analysis. Prior maintainer decisions take priority.
3. **Lens analysis** — Evaluate security posture, code quality / upstream stability, and repository impact.
4. **Verdict** — Produce a recommendation with confidence level and follow-up items.
5. **Maintainer confirmation** — Never merge without explicit approval.

## Changeset requirements

A changeset is mandatory when the dependency update touches a published package. See the [changeset guide](changeset.md) and the changeset decision section in `.github/instructions/dependabot-pr.instructions.md` for details.

**Quick rules:**

- Published packages (`packages/*/` with `publishConfig`) → changeset required.
- Cookbook packages (`cookbooks/*/`) → changeset required (even for dev dependencies).
- Lockfile-only changes with no manifest edits → changeset not required.
- Dev-dependency-only changes in non-cookbook packages → changeset not required.

**Format for dependency bumps:**

```markdown
---
"@equinor/<package-name>": patch
---

Internal: bump `<dependency>` from `<old>` to `<new>`.
```

## Validation

Run the full suite before recommending merge:

```bash
pnpm test && pnpm build && pnpm -w check
```

`pnpm -w check` runs Biome lint and format checks at the workspace root.

## Branch management

- **Rebase only** — never merge the base branch into a Dependabot PR branch.
- Force-push after rebase: `git push --force-with-lease`.
- Reinstall after rebase: `pnpm install --frozen-lockfile`. If the lockfile drifts, run `pnpm install`, commit the lockfile, and push.
- If rebase conflicts occur, abort and flag the PR for manual intervention.

## Merge strategy

Use **squash merge** with a conventional commit message:

```
chore(deps): bump <package> from <old> to <new>
```

## Confidence levels

| Level | Criteria | Action |
|-------|----------|--------|
| **High** | Patch/minor bump, no breaking changes, no advisories, validation passes, no unresolved comments | Safe to recommend merge |
| **Medium** | Minor bump with new features, recent release (< 48h), broad consumer surface | Review recommended before merge |
| **Low** | Major bump, breaking changes, validation failures, security advisories, rebase conflicts | Hold and flag for maintainer |

## Safety rules

- Never auto-merge just because the update is small.
- Never assume CI is green — always check actual status.
- Never suppress reviewer or maintainer concerns.
- Never create merge commits on Dependabot branches.

---
name: custom-dependency-pr-solver
description: 'Batch-processes Dependabot PRs in Fusion Framework: list, confirm, checkout, rebase, review, changeset, validate, comment, and merge high-confidence updates. USE FOR: process all Dependabot PRs, clear dependency backlog, batch-merge safe dependency updates. DO NOT USE FOR: feature PRs, non-Dependabot PRs, single-PR deep review, or updates needing manual code changes.'
license: MIT
compatibility: Requires authenticated `gh` with merge rights, `pnpm`, and the Fusion Framework monorepo toolchain.
metadata:
  version: "0.1.0"
  status: experimental
  owner: "@equinor/fusion-core"
  tags:
    - github
    - dependabot
    - dependency-updates
    - batch-workflow
    - auto-merge
  mcp:
    suggested:
      - github
---

# Dependency PR Solver

## When To Use

Use for an approved batch pass over open Dependabot PRs where the agent may mutate branches, post comments, create changesets, validate, and merge high-confidence updates.

Trigger phrases:
- "process all Dependabot PRs"
- "clear the dependency backlog"
- "batch-process dependency PRs"
- "batch-merge safe Dependabot updates"

## Hard Gates

- Read `.github/instructions/dependabot-pr.instructions.md` before processing any PR.
- Ask for explicit user confirmation before starting the batch and before expanding scope.
- Process only PRs authored by `app/dependabot` unless the user overrides with a specific PR.
- Rebase onto the PR base branch; never merge the base branch into a Dependabot branch.
- Do not merge major bumps, failing validation, low-confidence updates, or PRs needing manual code changes.
- Always post research and verdict comments before merging.

## Inputs

- Repository owner/name, inferred from workspace when possible.
- PR scope: all open Dependabot PRs or an include/exclude list.
- Mode: normal, `--review-only`, or `--merge-medium` with explicit user approval.

## Workflow

1. List candidates:

```bash
gh pr list --author "app/dependabot" --state open --json number,title,headRefName,baseRefName,mergeable,statusCheckRollup
```

Show a compact table and get confirmation.

2. For each confirmed PR:
   - `git fetch origin <base-branch>`
   - `gh pr checkout <number>`
   - `git rebase origin/<base-branch>`
   - On conflict, abort, mark `needs-manual-intervention`, and continue to the next PR.
   - Push rebased branch with `git push --force-with-lease`.

3. Validate dependency state:
   - Run `pnpm install --frozen-lockfile`.
   - If the lockfile must change, run `pnpm install`, commit the lockfile-only fix, and push.

4. Review:
   - Delegate analysis to `fusion-dependency-review`.
   - Capture upstream changes, security notes, existing discussion, impact, and confidence.
   - Post research with `assets/research-comment-template.md`.

5. Changesets:
   - Follow `.github/instructions/dependabot-pr.instructions.md`.
   - Create, commit, and push only required changesets.

6. Validate:

```bash
pnpm test && pnpm build && pnpm -w check
```

Attempt only trivial fixes. Mark anything else for manual intervention.

7. Decide:
   - High confidence: post verdict from `assets/verdict-comment-template.md`, then `gh pr merge <number> --squash --admin`.
   - Medium confidence: merge only with `--merge-medium` approval; otherwise report.
   - Low confidence or failed validation: post verdict and do not merge.

8. Finish:
   - Return to `main`.
   - Report every PR as merged, skipped, failed, or needs manual intervention.

## Expected Output

| PR | Status | Confidence | Action |
|---|---|---|---|
| `#N` | merged/skipped/failed | high/medium/low | short reason |

Also include posted-comment status, changeset files, validation results, and manual follow-ups.

## Safety

Never merge without validation, comments, and confidence. Never force-push without `--force-with-lease`. Never continue a conflicted Dependabot rebase by guessing.

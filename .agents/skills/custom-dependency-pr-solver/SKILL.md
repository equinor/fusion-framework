---
name: custom-dependency-pr-solver
description: 'Batch-process Dependabot PRs end-to-end: checkout, rebase, review, changeset, validate, and auto-merge high-confidence PRs. USE FOR: process all Dependabot PRs, clear dependency backlog, batch-merge safe Dependabot updates, batch-process dependency PRs. DO NOT USE FOR: single-PR deep review (use fusion-dependency-review), feature PRs, non-Dependabot dependency PRs, or PRs requiring manual code changes.'
license: MIT
compatibility: Requires GitHub CLI (`gh`) authenticated with admin merge rights. Requires pnpm and the Fusion Framework monorepo build toolchain.
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

Batch workflow that processes open Dependabot PRs sequentially. Delegates per-PR research, lens analysis, and verdicts to `fusion-dependency-review`. This skill owns batch orchestration, source-control operations, changeset creation, auto-merge, and reporting.

## When to use

Typical triggers:

- "Process all open Dependabot PRs"
- "Clear the dependency PR backlog"
- "Batch-process dependency PRs"
- "Batch-merge safe Dependabot updates"
- "Solve all dependency PRs"

## When not to use

- Deep single-PR review → use `fusion-dependency-review`
- Feature PRs or application code reviews
- PRs requiring manual code changes beyond changesets
- When you lack admin merge rights

## Required inputs

- **Repository**: owner and name (infer from workspace when possible)
- **Confirmation**: explicit user approval before starting the batch

Optional: PR filter (include/exclude numbers), `--review-only` (skip merge), `--merge-medium` (merge medium-confidence too).

## Delegation

This skill delegates per-PR analysis to `fusion-dependency-review`:

- **Research** — upstream changelog, breaking changes, security, existing discussion
- **Lens analysis** — security, code quality, impact assessments
- **Verdict** — recommendation and confidence scoring

Changeset rules, confidence criteria, rebase strategy, and validation commands follow `.github/instructions/dependabot-pr.instructions.md`.

## Instructions

### Step 1 — List and triage

```bash
gh pr list --author "app/dependabot" --state open --json number,title,headRefName,baseRefName,mergeable,statusCheckRollup
```

Present a summary table and ask the user to confirm which PRs to process or confirm "all".

### Step 2 — Process each PR sequentially

For each confirmed PR, execute Steps 3–7. If a PR fails at any step, log the failure, skip to the next, and include it in the final report.

### Step 3 — Checkout and rebase

Follow the rebase strategy in `.github/instructions/dependabot-pr.instructions.md`:

1. `git fetch origin <base-branch> && gh pr checkout <number>`
2. `git rebase origin/<base-branch>`
3. On conflict: abort, mark `needs-manual-intervention`, skip.
4. `git push --force-with-lease`
5. `pnpm install --frozen-lockfile` (if lockfile drifts: `pnpm install`, commit, push).

### Step 4 — Review via fusion-dependency-review

Run the `fusion-dependency-review` workflow for this PR:

1. Research upstream changes and existing PR discussion.
2. Assess security, code quality, and impact.
3. Post a research comment using `assets/research-comment-template.md`.
4. Produce a confidence score (high / medium / low) using the criteria in `.github/instructions/dependabot-pr.instructions.md`.

Keep research focused — do not deep-dive unless a concern surfaces.

### Step 5 — Create changesets

Follow the changeset decision rules in `.github/instructions/dependabot-pr.instructions.md`. Create, commit, and push changesets for affected published packages.

### Step 6 — Validate

```bash
pnpm test && pnpm build && pnpm -w check
```

On failure: attempt trivial fixes (e.g., `pnpm format`). If non-trivial, mark `needs-manual-intervention`.

### Step 7 — Merge or report

**High confidence:**

1. Post verdict comment using `assets/verdict-comment-template.md`.
2. `gh pr merge <number> --squash --admin`

**Medium or low confidence:**

1. Post verdict comment with findings.
2. Do not merge. Include in final report.

### Step 8 — Final batch report

| PR | Title | Status | Confidence | Action |
|----|-------|--------|------------|--------|
| #N | ... | merged / skipped / failed | high/med/low | merged / needs review / needs intervention |

## Expected output

- Research and verdict comments posted to each processed PR
- Changesets created where required
- High-confidence PRs merged via admin squash
- Final batch summary table
- List of PRs needing manual intervention with reasons

## Safety & constraints

- This skill is mutation-capable. `.github/instructions/dependabot-pr.instructions.md` takes precedence on conflicts.

Never:

- Merge without posting research and verdict comments first
- Merge a PR with failing validation
- Merge major version bumps without explicit user override
- Merge the base branch into a Dependabot PR branch (rebase only)
- Force-push without `--force-with-lease`
- Process PRs without initial user confirmation

Always:

- Return to `main` after batch processing is complete

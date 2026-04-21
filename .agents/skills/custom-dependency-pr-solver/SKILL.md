---
name: custom-dependency-pr-solver
description: 'Batch-process Dependabot PRs end-to-end: checkout, rebase, research, changeset, validate, and auto-merge high-confidence PRs as admin squash. USE FOR: process all Dependabot PRs, clear dependency backlog, batch-merge safe Dependabot updates, batch-process dependency PRs. DO NOT USE FOR: single-PR deep review (use fusion-dependency-review), feature PRs, non-Dependabot dependency PRs, or PRs requiring manual code changes.'
license: MIT
compatibility: Requires GitHub CLI (`gh`) authenticated with admin merge rights. Requires pnpm and the Fusion Framework monorepo build toolchain.
metadata:
  version: "0.0.0"
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

Batch workflow that processes open Dependabot PRs sequentially: checkout, rebase, research, create changesets, validate, and auto-merge high-confidence PRs with admin squash merge.

## When to use

Use this skill when you want to process multiple Dependabot PRs in a single session with automated merge for safe updates.

Typical triggers:

- "Process all open Dependabot PRs"
- "Clear the dependency PR backlog"
- "Batch-process dependency PRs"
- "Batch-merge safe Dependabot updates"
- "Handle all open Dependabot PRs and merge what's safe"
- "Solve all dependency PRs"

## When not to use

Do not use this skill for:

- Deep single-PR review (use `fusion-dependency-review` instead)
- Feature PRs or application code reviews
- Non-Dependabot dependency PRs (Renovate, manual bumps)
- PRs that require manual code changes beyond changesets
- When you lack admin merge rights on the repository

## Required inputs

### Mandatory

- **Repository**: owner and name (infer from current workspace when possible)
- **Confirmation**: explicit user approval before starting the batch

### Optional

- PR filter: specific PR numbers to include or exclude
- Merge strategy override: skip auto-merge entirely (review-only mode)
- Confidence threshold override: merge only `high` (default) or also `medium`

## Instructions

### Step 1 — List and triage open Dependabot PRs

```bash
gh pr list --author "app/dependabot" --state open --json number,title,headRefName,baseRefName,mergeable,statusCheckRollup
```

Present a summary table to the user:

| PR | Title | Base | CI | Mergeable |
|----|-------|------|-----|-----------|

Ask the user to confirm which PRs to process, or confirm "all".

### Step 2 — Process each PR sequentially

For each PR in the confirmed set, execute Steps 3–8 in order. Track progress with todos. If a PR fails at any step, log the failure, skip to the next PR, and include it in the final report.

### Step 3 — Checkout and rebase

1. Fetch the PR branch:
   ```bash
   gh pr checkout <number>
   ```
2. Rebase onto the base branch (usually `main`):
   ```bash
   git rebase origin/<base-branch>
   ```
3. If rebase conflicts occur, abort the rebase, mark the PR as `needs-manual-intervention`, and skip to the next PR.
4. After successful rebase, force-push:
   ```bash
   git push --force-with-lease
   ```
5. Install dependencies after rebase:
   ```bash
   pnpm install --frozen-lockfile
   ```
   If lockfile is out of sync after rebase, run `pnpm install` without `--frozen-lockfile`, commit the lockfile update, and push.

### Step 4 — Research changes

For each dependency updated in the PR:

1. Identify the package(s) and version change from the PR diff and commit message.
2. Research upstream changes: changelog, release notes, breaking changes, security advisories.
3. Check existing PR comments and review threads.
4. Post a research comment to the PR using `assets/research-comment-template.md`.

Use web search or npm registry for changelog and advisory lookups. Keep research focused — do not deep-dive unless a concern is found.

### Step 5 — Create changesets

Determine whether a changeset is needed using `references/changeset-decision.md`.

**Rules:**

- If the dependency is used by a published package, create a changeset.
- If the dependency touches a compilable package (`cli`, `dev-portal`, `dev-server`, or any package with a `build` script and `publishConfig`), a changeset is **mandatory**.
- Use `patch` bump for dependency updates unless the upstream change is a major version bump with breaking changes.
- Use the `Internal:` prefix for the changeset summary.
- One changeset per affected published package.

**Changeset creation:**

```bash
# Create .changeset/<package-name>_bump-<dep-name>.md
```

```markdown
---
"@equinor/<package-name>": patch
---

Internal: bump `<dependency>` from `<old>` to `<new>`.
```

Commit the changeset:
```bash
git add .changeset/
git commit -m "chore: add changeset for <dependency> bump"
git push
```

### Step 6 — Build, test, lint, and format

Run the full validation suite:

```bash
pnpm build && pnpm test && pnpm -w check
```

If any step fails:

1. Capture the error output.
2. Attempt a targeted fix only if trivial (e.g., formatting with `pnpm format`).
3. If the fix is non-trivial, mark the PR as `needs-manual-intervention`.

### Step 7 — Assess merge confidence

Evaluate confidence using `references/confidence-criteria.md`. Score as `high`, `medium`, or `low`.

**High confidence** (auto-merge candidate):

- Patch or minor version bump
- No breaking changes identified
- All validation passes (build + test + lint)
- No unresolved reviewer concerns
- Lockfile-only or minimal manifest changes
- No security advisories on the target version

**Medium confidence** (report, do not auto-merge):

- Minor version bump with new features but no breaking changes
- Validation passes but with warnings
- Upstream release is very recent (< 48 hours)

**Low confidence** (skip, flag for manual review):

- Major version bump
- Breaking changes identified
- Validation failures
- Security concerns
- Unresolved reviewer comments
- Rebase conflicts

### Step 8 — Merge or report

**If high confidence:**

1. Post a verdict comment to the PR using `assets/verdict-comment-template.md`.
2. Squash merge as admin:
   ```bash
   gh pr merge <number> --squash --admin
   ```

**If medium or low confidence:**

1. Post the verdict comment with findings.
2. Do not merge. Include in the final report as "needs manual review".

### Step 9 — Final batch report

After all PRs are processed, present a summary:

| PR | Title | Status | Confidence | Action |
|----|-------|--------|------------|--------|
| #N | ... | merged / skipped / failed | high/med/low | merged / needs review / needs intervention |

Include:

- Total PRs processed
- PRs merged
- PRs skipped (with reasons)
- PRs needing manual intervention (with specific issues)

## Examples

- User: "Process all open Dependabot PRs"
  - Result: list 8 open PRs, user confirms all, process sequentially, merge 5 high-confidence, report 2 medium and 1 low for manual review.

- User: "Solve dependency PRs but don't merge anything"
  - Result: process all PRs in review-only mode, post research and verdict comments, report all results without merging.

- User: "Handle Dependabot PRs #42 and #45"
  - Result: process only the specified PRs, merge if high confidence, report otherwise.

## Expected output

- Research comment posted to each processed PR
- Changesets created and committed where required
- Verdict comment posted to each PR with validation results and confidence
- High-confidence PRs merged via admin squash
- Final batch summary table with per-PR status and actions taken
- List of PRs requiring manual intervention with specific reasons

## Safety & constraints

Never:

- Merge without posting a research comment and verdict comment first
- Merge a PR with failing validation (build, test, or lint)
- Merge a PR with unresolved security concerns
- Merge a PR with major version bumps without explicit user override
- Merge the base branch into a Dependabot PR branch (rebase only)
- Skip changeset creation for compilable packages
- Force-push without `--force-with-lease`
- Process PRs without initial user confirmation of the batch

Always:

- Rebase Dependabot branches onto base; never merge base into the PR branch
- Post research and verdict comments before any merge action
- Create changesets for published package dependency changes
- Run full validation (`pnpm build && pnpm test && pnpm -w check`) before merge
- Report exact validation output in the verdict comment
- Track per-PR status throughout the batch
- Present a final summary after all PRs are processed
- Return to `main` branch after batch processing is complete

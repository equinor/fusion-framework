---
name: dependabot-pr-handler
description: 'Automated workflow for researching, validating, and safely merging Dependabot PRs in the Fusion Framework monorepo. Use when asked to review dependencies, handle or merge Dependabot PRs, validate dependency updates, or investigate build/test/lint impacts from dependency changes.'
compatibility: 'Requires GitHub CLI (gh), pnpm, Biome, Changesets; macOS/Linux; repository access with appropriate permissions.'
allowed-tools: gh pnpm git npx
related-skills: pnpm-dependency-analysis, npm-research
metadata:
   actor_filter: app/dependabot
---

# Dependabot PR Handler Skill

Automated skill for reviewing, validating, and safely merging Dependabot pull requests in the Fusion Framework monorepo.

**Dependencies**: This skill uses:
- `pnpm-dependency-analysis` skill for impact assessment and blast radius calculation
- `npm-research` skill for changelog, security, and breaking changes analysis

## Operating Modes

Default to **Full** mode unless the user explicitly chooses Audit-only or Validate.

- **Audit-only**: Research + build/test/lint locally. Comments optional. No post/push/merge.
- **Validate**: Install + build + test + lint. Prepare comments. All actions gated by consent.
- **Full**: End-to-end with required comments, consent-gated push/merge.

## Templates

| Template | Path | When | Mode | File |
|----------|------|------|------|------|
| **Available PRs List** | `templates/available-prs-list.template.md` | Step 1 | All: If interactive PR selection | Display to user |
| **Research** | `templates/research-comment.template.md` | Step 5 | Full: Required; Other: Optional | `gh-comment-research.md` |
| **Results** | `templates/results-comment.template.md` | Step 13 | Full: Required; Other: Optional | `gh-comment-results.md` |

## Guardrails

- **Never** post comments, push, close, merge, or modify code without explicit user approval
- **Pause** on user unavailability; **stop** on build/test/lint/security failures
- **Maintain** linear history (force-with-lease with consent only)
- **Propose** code changes when needed; never auto-modify source

## Workflow

## Step 1: Select PR

1. **If PR provided by user** (number or URL) → parse and store details (owner, repo, number, branch) → Skip to Step 2
2. **If no PR provided** → 
   - Execute: `gh pr list --author "app/dependabot" --state open --json number,title,createdAt`
   - Parse PR titles to determine semver type:
     - **MAJOR**: Breaking changes, major version bumps (e.g., `5.0.0` from `3.x.x`)
     - **MINOR**: New features, minor version bumps (e.g., `1.2.0` from `1.1.x`)
     - **PATCH**: Bug fixes, patch version bumps (e.g., `1.1.5` from `1.1.4`)
   - Categorize and display using [available-prs-list.template.md](templates/available-prs-list.template.md) with age and semver columns
   - Request user selection by PR number
   - **User MUST explicitly choose PR** — never auto-select

Whenever a user asks to handle a Dependabot PR without providing a specific PR number or URL, run the PR listing flow above immediately before requesting further input.

## Step 2: Create Worktree

1. Ensure worktree directory exists: `mkdir -p ../fusion-framework.worktree`
2. Get PR branch name: `gh pr view <PR_NUMBER> --json headRefName --repo equinor/fusion-framework --jq '.headRefName'`
3. Fetch the branch: `git fetch origin <BRANCH>:<BRANCH>`
4. Create worktree: `git worktree add ../fusion-framework.worktree/pr-<PR_NUMBER> <BRANCH>`
5. `cd ../fusion-framework.worktree/pr-<PR_NUMBER>`

## Step 3: Rebase Branch

1. `git fetch origin main && git rebase origin/main`
2. **If rebase succeeds** → Continue to Step 4
3. **If lock file conflict** (pnpm-lock.yaml):
   - `pnpm install` (regenerate lock file)
   - `git add pnpm-lock.yaml`
   - `git rebase --continue`
   - Continue to Step 4
4. **If version conflict** (package.json dependencies incompatible):
   - Ask to post comment + close PR
   - If yes: post + close → Skip to Step 15
5. **If structural/complex conflicts**:
   - Display details → Ask user → Stop if declined

## Step 4: Research Dependencies

1. Parse PR for dependency updates
2. Check latest available version: `npm view <PACKAGE> versions --json`
3. **If Dependabot version is NOT the latest stable**:
   - Display: Dependabot suggests `X.Y.Z`, but latest stable is `A.B.C`
   - Ask user: "Use Dependabot version or update to latest stable?"
   - If user chooses latest: Update package.json and run `pnpm install`
   - If user chooses Dependabot version: Continue with existing PR changes
4. **Use `pnpm-dependency-analysis` skill** (`.github/skills/pnpm-dependency-analysis/SKILL.md`) to:
   - Identify which workspaces are affected (`pnpm why PACKAGE --recursive --depth=0`)
   - Check resolved versions and detect inconsistencies
   - Determine blast radius (low/medium/high risk based on workspace count)
   - Verify dependency type (dev vs production)
5. **Use `npm-research` skill** (`.github/skills/npm-research/SKILL.md`) to:
   - Research changelog (GitHub releases, CHANGELOG files, npm registry)
   - Check security advisories (npm audit, GitHub advisories, Snyk)
   - Identify breaking changes (semver analysis, PR research when needed)
   - Review related PRs if release notes reference specific changes
   - Analyze peer dependency changes and new dependencies
6. Analyze codebase compatibility
7. Identify if code changes needed (document only; don't modify)

## Step 5: Post Research Comment

(Full: Required; Other: Optional)

1. Format using template → Create `gh-comment-research.md`
2. Show to user → Ask: "Post research comment?"
3. If yes: `gh pr comment <PR> -F gh-comment-research.md` → Clean up

## Step 6: Install Dependencies

`pnpm install --frozen-lockfile` (clean node_modules if lock changed)

## Step 7: Build Project

`pnpm build` → Stop on failure

## Step 8: Run Tests

`pnpm test` → Stop on failure

## Step 9: Run Linting

1. `npx biome format --fix`
2. `git add .`
3. `npx biome check --diagnostic-level=error` → Stop on failure

## Step 10: Generate Changeset

(if `.changeset` exists)

1. Parse PR for package changes
2. Determine if changeset is needed:
   - **Create changeset if**:
     - Dependency affects a compiled/built package (CLI, Dev-Portal, vite-plugins, etc.)
     - Consumers can manually update the package (not just a transitive dependency)
     - DevDependency updates that affect build output or tooling behavior
   - **Skip changeset if**:
     - Changes only affect workspace tooling (root package.json, turbo.json, CI configs)
     - Test-only changes with no impact on package functionality
3. Generate using [changeset rules](../instructions/changesets.instructions.md)
   - Use `patch` bump for devDependency updates
   - Prefix with "Internal:" for non-API changes
   - List affected packages in frontmatter
   - Include brief summary of dependency changes
4. Show to user → Ask: "Create changeset?"
5. If yes: Stage files

## Step 11: Propose Code Changes

(if needed from Step 4)

1. Document required changes + rationale
2. Propose exact modifications → Ask: "Approve modifications?"
3. If yes: Commit with clear message

## Step 12: Rebase & Push Changes

(Always execute)

1. `cd ../fusion-framework.worktree/pr-<PR_NUMBER>`
2. `git fetch origin main` (ensure latest main)
3. `git rebase origin/main` (resolve any conflicts if needed)
4. Show status: `git status --porcelain`
5. Ask: "Push rebased branch?"
6. If yes: `git push origin HEAD --force-with-lease` (to PR branch)

## Step 13: Post Validation Results

(Full: Required; Other: Optional)

1. Format using template → Create `gh-comment-results.md`
2. Show to user → Ask: "Post validation results?"
3. If yes: `gh pr comment <PR> -F gh-comment-results.md` → Clean up

## Step 14: Merge PR

(Full mode only)

1. Show merge details + branch protection status
2. Ask: "Merge PR now?"
3. If yes: `gh pr merge <PR_NUMBER> --squash --admin`

## Step 15: Cleanup

1. `cd <MAIN_REPO_PATH>` (return to main repo)
2. `git worktree remove ../fusion-framework.worktree/pr-<PR_NUMBER>` (or `--force` if dirty)
3. Summarize results

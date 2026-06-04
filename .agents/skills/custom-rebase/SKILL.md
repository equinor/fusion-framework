---
name: custom-rebase
description: "Rebases feature branches onto main in the Fusion Framework monorepo by regenerating pnpm-lock.yaml on conflict, resolving Version Packages commits with --ours, aligning pre.json initialVersions, and generating a post-rebase dependency change report. Use when the user needs to rebase a branch onto main, encounters pnpm-lock.yaml merge conflicts, hits Version Packages commit conflicts during rebase, or asks about git rebase workflows in this monorepo."
---

# Custom Rebase Skill (Fusion Framework)

Rebases feature branches onto the latest `main` branch, handling pnpm-lock.yaml regeneration, Version Packages commit resolution, pre.json alignment, and post-rebase reporting.

## Standard Rebase Workflow

### 1. Prepare for rebase

```bash
# Navigate to your worktree or branch
cd /path/to/worktree

# Ensure you're on the correct branch
git branch

# Fetch latest changes from origin (including main)
git fetch origin
git fetch origin main:refs/remotes/origin/main
```

### 2. Start the rebase

```bash
# Rebase your branch onto the latest main
git rebase origin/main
```

### 3. Handle pnpm-lock.yaml conflicts

**CRITICAL: When `pnpm-lock.yaml` has conflicts during rebase:**

```bash
# Regenerate it from package.json files
pnpm install

# Stage the regenerated lockfile
git add pnpm-lock.yaml

# Continue the rebase
git rebase --continue
```

### 4. Handle "Version Packages" commit conflicts

**When you encounter a "Version Packages (next)" commit with conflicts:**

This happens when your feature branch has pre-release versions (e.g., `2.0.0-next.0`) but main has been updated with newer regular versions.

**Resolution strategy:**
- **package.json**: Use `--ours` (HEAD version from main)
- **CHANGELOG.md**: Use `--ours` (HEAD changelog from main)

```bash
# For all package.json conflicts, keep HEAD version
git checkout --ours "packages/*/package.json"
git add "packages/*/package.json"

# For all CHANGELOG.md conflicts, keep HEAD changelog  
git checkout --ours "packages/*/CHANGELOG.md"
git add "packages/*/CHANGELOG.md"

# Also check other affected files
git checkout --ours "vue-press/package.json" 2>/dev/null || true
git add "vue-press/package.json" 2>/dev/null || true

# Continue the rebase
git rebase --continue
```

**Why?** The main branch has the authoritative versions and changelogs. Your feature branch's pre-release versions will be regenerated when you create a new changeset after rebasing.

### 5. Handle other conflicts

For conflicts in source files (`.ts`, `.tsx`, etc.):

```bash
# Manually resolve conflicts in the files
# Then stage the resolved files
git add path/to/resolved-file.ts

# Continue the rebase
git rebase --continue
```

### 6. Complete the rebase

After all commits are rebased successfully:

```bash
# Verify the branch is clean
git status

# Force push to update the remote branch
git push --force-with-lease origin YOUR_BRANCH_NAME
```

### 7. Align pre.json initial versions (if in pre mode)

If `.changeset/pre.json` exists (pre-release mode), align `initialVersions` to current package versions for packages changed by the rebase:

```bash
# From repo root
node .agents/skills/custom-rebase/scripts/align-pre-initial-versions.cjs
```

What it does:
- Reads `.changeset/pre.json` to get the `tag` (e.g., `next`)
- Updates `initialVersions` when the current package version does NOT end with `-TAG.NUMBER` (e.g., `2.0.0` or `2.1.0`)
- Skips entries where the current version ends with `-TAG.NUMBER` (e.g., `2.0.0-next.0`), preserving ongoing pre state

### 8. Sanity check vs remote

Before pushing, verify local rebase result against the remote branch.

```bash
# Ensure you have latest remote
git fetch origin

# Set a helper var for current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Quick overview of what will change on the remote
git diff --stat origin/$BRANCH...HEAD

# See the file list (useful to spot unintended changes)
git diff --name-only origin/$BRANCH...HEAD | sort

# Review commit differences (left/right) without merges
git log --oneline --left-right --cherry --no-merges origin/$BRANCH...HEAD

# Optional: preview the push without sending any data
git push --force-with-lease --dry-run origin $BRANCH
```

Proceed to push only if the changes match expectations.

### 9. Generate raw data report

Run the data extraction script:

```bash
# From repo root
node .agents/skills/custom-rebase/scripts/generate-rebase-report.cjs --no-fetch
```

This generates `.tmp/skills/custom-rebase/<timestamp>-rebase-report.md` with raw data:
- Ahead/behind counts and diff summary
- Highlights & Anomalies: largest diffs, config changes, dependency summary
- Full commit list (all 57+ commits with hashes and messages)
- Changed packages and top-level folders
- pre.json initialVersions changes (version baseline updates)
- pnpm-lock.yaml churn
- **Detailed Dependency Changes** - Complete breakdown per package:
  - ⚠️ Major version bumps (e.g., `zod: ^3.23.8 → ^4.3.5`)
  - ➕ Added dependencies (e.g., `@azure/search-documents: ^12.2.0`)
  - ➖ Removed dependencies
  - Minor/patch version changes
  - Organized by section: dependencies, devDependencies, peerDependencies

### 10. Generate human-readable summary (automatic)

After the raw report is generated, the AI agent will automatically:

1. Read the latest report from `.tmp/skills/custom-rebase/<timestamp>-rebase-report.md`
2. Analyze the "Detailed Dependency Changes" section
3. Create a human-readable summary with:
   - **Breaking dependency changes** - Each major bump explained (what package, what changed, why it matters, what to test)
   - **New dependencies added** - What was added and its purpose
   - **Version baselines updated** - Which packages bumped and what that means
   - **Risk assessment** - Overall risk level (🟢 LOW, 🟡 MEDIUM, 🔴 HIGH) with reasoning
   - **Pre-push checklist** - Specific tests to run based on detected changes

The summary will be displayed in the chat for review before you push.
- **Next steps**: sanity checks and push confirmation

Open the SUMMARY.md file in your editor to review before pushing.

## Quick Reference

- **Abort**: `git rebase --abort`
- **Skip commit**: `git rebase --skip`
- **Reset to remote**: `git fetch origin && git reset --hard origin/YOUR_BRANCH_NAME`

## Troubleshooting

### Diverged branch

```bash
git fetch origin
git fetch origin main:refs/remotes/origin/main
git reset --hard origin/YOUR_BRANCH_NAME
git rebase origin/main
```

### pnpm install fails during rebase

Check that all `package.json` changes are staged/committed, no syntax errors exist in modified `package.json` files, and you're running from the repository root.

## Related Skills

- `fusion-dependency-review` - Review dependency pull requests that need branch refresh or conflict follow-up

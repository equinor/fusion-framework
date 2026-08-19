---
name: custom-rebase
description: 'Rebases Fusion Framework feature branches onto main and handles monorepo conflict traps. USE FOR: rebase this branch, refresh branch from main, fix pnpm-lock.yaml conflicts, resolve Version Packages conflicts, generate a rebase risk report. DO NOT USE FOR: dependency PR review, branch cleanup unrelated to rebase, or destructive reset without explicit approval.'
---

# Custom Rebase

## When To Use

Use for Fusion Framework branch refreshes where the agent must rebase onto `origin/main`, resolve common monorepo conflicts, and sanity-check the result before force-pushing.

Trigger phrases:
- "rebase this branch onto main"
- "refresh my branch"
- "fix rebase conflicts"
- "handle pnpm-lock.yaml conflicts"
- "generate a rebase report"

## Required Gates

- Confirm the current branch and repository root before starting.
- Stop if the working tree is dirty unless the user explicitly says those changes are expected.
- Use `pnpm` only.
- Never run `git reset --hard`, `git rebase --abort`, `git rebase --skip`, or `git push --force-with-lease` without making the action and target branch explicit.
- Prefer `origin/main` as the rebase target unless the user gives another base.

## Workflow

1. Prepare:

```bash
git status
git branch --show-current
git fetch origin
git fetch origin main:refs/remotes/origin/main
```

2. Rebase:

```bash
git rebase origin/main
```

3. Resolve known conflicts:

| Conflict | Action |
|---|---|
| `pnpm-lock.yaml` | Regenerate with `pnpm install`, then `git add pnpm-lock.yaml` |
| Version Packages `package.json` | Keep main with `git checkout --ours "packages/*/package.json"`, then stage |
| Version Packages `CHANGELOG.md` | Keep main with `git checkout --ours "packages/*/CHANGELOG.md"`, then stage |
| `.changeset/pre/*.md` (Changesets v3 pre mode) | Resolve manually like any other changeset content conflict, preserve both sides' entries when in doubt |
| Source files | Resolve manually, preserve user intent, stage resolved files |

Then continue:

```bash
git rebase --continue
```

4. If `.changeset/pre.json` exists, packages bumped on `main` since `next` diverged won't automatically get a `next`-tagged release. Changesets v3 no longer tracks a baseline in `pre.json.initialVersions` (removed/unused upstream) — instead, create one consolidated changeset covering every package whose version increased on `main` during the rebase, so they pick up a `next` pre-release bump:

```bash
pnpm changeset status --verbose
```

Compare against the rebase diff to find packages whose `package.json` version increased purely from `main`'s own "Version Packages" commits, then add one `.changeset/*.md` file listing all of them (patch bump, "Internal: rebase `next` onto `main`..." message). Do not resurrect the old `align-pre-initial-versions.cjs` baseline script — it edits a `pre.json` field Changesets v3 no longer reads.

Running `pnpm changeset status` (or `changeset version`) also auto-migrates `pre.json` to the v3 layout the first time it's called after upgrading past v3: previously-consumed pre-release changesets move from `.changeset/*.md` into `.changeset/pre/*.md`. This is expected, documented, one-time behavior — commit it as its own step rather than reverting it.

5. Check the local result against the remote branch:

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git fetch origin
git diff --stat origin/$BRANCH...HEAD
git diff --name-only origin/$BRANCH...HEAD | sort
git log --oneline --left-right --cherry --no-merges origin/$BRANCH...HEAD
git push --force-with-lease --dry-run origin $BRANCH
```

6. Generate the raw report when risk or size warrants it:

```bash
node .agents/skills/custom-rebase/scripts/generate-rebase-report.cjs --no-fetch
```

Read the latest `.tmp/skills/custom-rebase/*-rebase-report.md` and summarize only the decision-relevant parts: largest diffs, dependency changes, package scope, `pre.json` changes, lockfile churn, validation to run, and push recommendation.

## Troubleshooting

| Symptom | Response |
|---|---|
| Rebase is going the wrong way | Stop and verify current branch plus `git rebase origin/main` direction |
| `pnpm install` fails | Check repo root, conflicted `package.json` syntax, and unstaged package manifest changes |
| Local branch diverged unexpectedly | Explain the divergence and ask before any reset |
| Conflict repeats commit after commit | Resolve the recurring pattern once, continue, and re-check after completion |

## Expected Output

- Rebased branch or clear blocker
- Conflict decisions made explicit
- Remote comparison before push
- Human-readable risk summary when a report was generated
- Suggested validation commands before the user or agent pushes

## Related Skills

- `fusion-dependency-review` for dependency PR analysis
- `custom-dependency-pr-solver` for Dependabot batch processing

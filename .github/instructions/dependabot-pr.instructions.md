---
description: Rules for handling Dependabot pull requests
name: Dependabot PR Rules
---

# Dependabot PR Rules

## TL;DR (for AI agents)

- Do not approve, merge, push, close, or comment on a Dependabot PR without explicit user confirmation (batch-level confirmation counts for the solver skill).
- If the branch needs refreshing, use rebase-only refreshes; never merge the base branch into the PR branch.
- If the PR needs patching, follow `.github/instructions/workflow-contribution.instructions.md`.
- Treat missing changesets, missing validation, or weak PR-template usage as explicit findings.
- Changesets are mandatory for dependency changes that affect published packages (see changeset decision below).
- Validate with `pnpm test && pnpm build && pnpm -w check` before any merge recommendation.

## Skills

| Intent | Skill |
|--------|-------|
| Review a single dependency PR in detail | `.agents/skills/fusion-dependency-review/SKILL.md` |
| Batch-process multiple Dependabot PRs with auto-merge | `.agents/skills/custom-dependency-pr-solver/SKILL.md` |

## Changeset decision for dependency PRs

A changeset is **mandatory** when the dependency update affects any published package. All packages under `packages/` with `"publishConfig": { "access": "public" }` are published.

### Compilable packages (always require changesets)

These packages produce build artifacts and must always get a changeset for dependency changes:

- `@equinor/fusion-framework-cli` — CLI tool (rollup build, has `bin` executables)
- `@equinor/fusion-framework-dev-portal` — Dev portal app (vite build)
- `@equinor/fusion-framework-dev-server` — Dev server library (tsc build)

### Other published packages

Any package under `packages/` with `publishConfig` requires a changeset when its dependencies change, including all `@equinor/fusion-framework-*` packages.

### Cookbook packages

`cookbooks/*` packages are versioned and published — always create a changeset when their dependencies change, including dev dependencies.

### Identifying affected packages

1. Check which `package.json` files changed in the PR diff.
2. For each changed `package.json`, read the `name` field.
3. If the package has `publishConfig`, it needs a changeset.
4. If only `pnpm-lock.yaml` changed, trace which packages are affected by checking the lockfile diff for workspace package entries.

### When to skip

- Lockfile-only changes with no `package.json` manifest modifications in published packages.
- Changes to `devDependencies` that do not affect the published output of a non-cookbook package.

### Bump type

| Upstream change | Bump type | Summary prefix |
|----------------|-----------|----------------|
| Patch or minor dep update | `patch` | `Internal:` |
| Major dep update (no breaking consumer impact) | `patch` | `Internal:` |
| Major dep update with consumer-facing changes | `minor` or `major` | (describe the impact) |

### Changeset format

```markdown
---
"@equinor/<package-name>": patch
---

Internal: bump `<dependency>` from `<old-version>` to `<new-version>`.
```

## Validation commands

Run the full validation suite before recommending merge:

```bash
pnpm test && pnpm build && pnpm -w check
```

`pnpm -w check` runs Biome lint and format checks at the workspace root.

## Rebase strategy

- Always rebase Dependabot branches; never merge the base branch into the PR branch.
- After rebase, force-push with `git push --force-with-lease`.
- Run `pnpm install --frozen-lockfile` after rebase. If the lockfile is out of sync, run `pnpm install` (without `--frozen-lockfile`), commit the lockfile, and push.
- If rebase conflicts occur, abort the rebase, mark the PR as `needs-manual-intervention`, and report to the maintainer.

## Merge strategy

- Use **squash merge** for dependency PRs.
- Keep the commit message concise: `chore(deps): bump <package> from <old> to <new>`.

## Merge confidence criteria

### High confidence — safe to recommend merge

All of the following must be true:

- Patch or minor version bump (no major)
- No breaking changes identified in upstream changelog
- No security advisories on the target version
- All validation passes (`pnpm test && pnpm build && pnpm -w check`)
- No unresolved reviewer comments on the PR
- Change scope is lockfile-only or minimal manifest change
- Upstream release is at least 48 hours old
- Dependency is not a critical runtime dependency with broad consumer surface

### Medium confidence — review recommended

One or more of the following:

- Minor version bump with new features (but no breaking changes)
- Validation passes with non-blocking warnings
- Upstream release is very recent (< 48 hours)
- Dependency has broad consumer surface but change is backward-compatible
- Changeset was required and created, but the consumer impact scope is unclear

### Low confidence — hold and flag

One or more of the following:

- Major version bump
- Breaking changes identified upstream
- Validation failures (build, test, or lint)
- Security advisory exists on either the current or target version
- Unresolved reviewer comments or maintainer concerns
- Rebase conflicts that could not be resolved automatically
- Dependency is deprecated or has known stability issues

## Safety

- Never auto-merge just because the update is small.
- Never assume CI is green without checking actual status.
- Never suppress reviewer or maintainer concerns for convenience.
- Never create a merge commit by merging the base branch into a Dependabot PR branch.
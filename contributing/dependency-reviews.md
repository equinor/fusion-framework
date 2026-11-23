# Dependency Reviews

How dependency update PRs are reviewed and merged in the Fusion Framework monorepo.

## Overview

Dependabot npm PRs target `main` directly (configured in `.github/dependabot.yml`) and are reviewed interactively by maintainers.
Any remaining legacy PRs targeting `maintenance/dependencies` still run that branch's CI and promote to `main` via a maintainer-reviewed PR (`dependabot-maintenance.yml`).

| Path | How |
|------|-----|
| Interactive | Review each Dependabot PR with the APM-installed `fusion-dependency-review` skill and validate before merging to `main`. |

Reviews follow the repository facts in the [Dependabot instructions](../.github/instructions/dependabot-pr.instructions.md).

## GitHub Actions lockfile

Every workflow is onboarded to [`.github/workflows/actions.lock`](../.github/workflows/actions.lock), which
pins each direct and transitive action to a reviewed commit
([GitHub guide](https://docs.github.com/en/actions/how-tos/secure-your-work/lock-workflow-dependencies)).

- Reference actions by full semver tag (`actions/checkout@v7.0.1`); the lockfile holds the commit. A commit
  SHA with a version comment also works where a test requires it, but never a tag-object SHA.
- Reference this repository's composite actions as `$/.github/actions/<name>` so they run at the workflow's
  commit and the actions they use are locked.
- Use `./` only when a step must run an action from a different, trusted checkout than the commit that
  triggered the run, for example token-holding helpers in `dependabot-maintenance.yml` that check out `main`
  on pushes to `maintenance/dependencies`. `$/` would load them from the pushed branch. Such an action may use
  only `run:` steps unless the same workflow also locks its actions through a `$/` reference.
- After adding a workflow or changing a `uses:` line, run `gh actions-lock --ignore-local-actions`, then
  `gh actions-lock --verify --ignore-local-actions`, and commit the lockfile with the workflow change. Install
  the tool with `gh extension install github/gh-actions-lock`. The
  [Verify actions lockfile](../.github/workflows/actions-lock.yml) check runs the same verification on PRs
  that touch `.github/workflows` or `.github/actions`, plus a strict pass without `--ignore-local-actions`
  for every workflow except `generate-docs.yml`. A new `./` exception that uses other actions must be added
  to that exclusion list.
- Dependabot bumps actions in `.github/workflows` and `.github/actions/*` and regenerates the lockfile in the
  same PR. Review a changed `commit` like any dependency bump; investigate a changed `owner_id` or `repo_id`.
- Never edit the lockfile by hand, and never run `--accept-moved` in automation.
- Calls to reusable workflows in other repositories need a full 40-character commit SHA; that repository owns
  its own lockfile.

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

### React runtime updates

Direct dependencies on `react`, `react-dom`, `@types/react`, and `@types/react-dom`
use `catalog:react`. Their shared versions live in the named `react` catalog in
[`pnpm-workspace.yaml`](../pnpm-workspace.yaml). React and React DOM require
**exactly matching installed runtime versions**, so both runtime entries are
pinned to the same exact version rather than independently resolved ranges.
The type packages have their own version cadence and need not equal the runtime version.
Consumer-facing peer dependency ranges remain unchanged.

Dependabot groups the four catalog dependencies in one update. For manual
updates, change the catalog entries together and regenerate the lockfile with
`pnpm install`; do not introduce per-package runtime versions. pnpm resolves
catalog references to concrete version specifiers when packing published libraries.

Do not suppress browser tests or classify a deterministic version mismatch as a
flaky first render. Existing split Dependabot branches need a maintainer-approved
refresh or replacement; the catalog migration does not repair them retroactively.

### Full validation

The full suite runs in CI on `maintenance/dependencies`, not per Dependabot PR:

```bash
pnpm test && pnpm build && pnpm -w check
```

`pnpm -w check` runs Biome lint and format checks at the workspace root.

## Branch management

- **Rebase only**: never merge the base branch into a Dependabot PR branch.
- Reinstall after rebase: `pnpm install --frozen-lockfile`. If the lockfile drifts, resolve intended dependency
  inputs and regenerate with `pnpm install`; never hand-merge lockfile hunks or invent resolutions.
- Push rebased branches with `git push --force-with-lease`.

## Merge strategy

Use **squash merge** with a conventional commit message:

```
chore(deps): bump <package> from <old> to <new>
```

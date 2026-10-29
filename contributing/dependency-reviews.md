# Dependency Reviews

How dependency update PRs are reviewed and merged in the Fusion Framework monorepo.

## Overview

Dependabot PRs target `maintenance/dependencies`. That branch collects the updates, its CI runs the full
validation suite, and maintainers fix and validate the combined result there before it is promoted to `main`.

| Path | How |
|------|-----|
| Automated | Greenkeeper (when enabled) smell-tests each Dependabot PR, adds its changeset and merges it into `maintenance/dependencies`. It holds a PR only for breaking changes that need a maintainer decision. |
| Interactive | Review one PR with the APM-installed `fusion-dependency-review` skill. |

Both follow the repository facts in the [Dependabot instructions](../.github/instructions/dependabot-pr.instructions.md).
Promotion from `maintenance/dependencies` to `main` stays a maintainer-reviewed PR.

## AI review scheduling

Dependabot AI research uses one repository-wide concurrency slot, shared by
automatic reviews and manually dispatched research, maintenance, and resolution runs.
Only one `research` job can run at a time, including its model calls. Publishing
and branch maintenance remain outside that slot and retain the existing per-PR gates.

The job uses `queue: max` with `cancel-in-progress: false`, so bursts across PRs
wait rather than replacing pending research jobs. GitHub allows up to 100 pending
jobs in the group; additional jobs are canceled when that queue is full.
The existing workflow-level concurrency still coalesces pending runs for the same
PR and operation category.

This limits simultaneous reviews, not tokens per minute. A single review or other
workflows sharing the model quota can still receive a 429 response; serialization
does not replace bounded retry handling or provider quota management.

See [GitHub's concurrency documentation](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
for queue behavior and capacity.

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

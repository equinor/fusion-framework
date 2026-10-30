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

## Greenkeeper dependency maintenance

[Greenkeeper dependency maintenance](../.github/workflows/greenkeeper-maintenance.yml) combines open Dependabot
updates on `greenkeeper/dependencies` with one pull request into `main`, titled
`☘️ Greenkeeper: dependency updates`. See [ADR 0003](../docs/adr/0003-greenkeeper-combined-dependency-updates.md).
Each run:

1. Creates `greenkeeper/dependencies` from `main`, or rebases it onto `main`, and pushes it.
2. For each open Dependabot pull request on `main`: applies the update without its lockfiles, researches only
   a version it has not researched before, migrates when needed, runs light checks, adds or updates the
   changeset, commits with `Dependabot-PR` and `Dependabot-Version` trailers, pushes and updates the pull request.
3. Comments on each Dependabot pull request: included ones link the combined pull request, whose body closes
   them on merge; held ones give the reason and stay open for Dependabot and maintainers.

Nothing merges automatically. Review and merge the combined pull request like any other; a merge commit keeps the
per-update commits. The next run starts a fresh branch after the combined pull request is merged or closed.

### Execution and credentials

The job runs in the protected `docs` environment. The local
[`greenkeeper-maintenance` action](../.github/actions/greenkeeper-maintenance/action.yml) acquires a short-lived
Fusion AI token with Framework's existing identity, clears the Azure session, then runs the Greenkeeper
orchestrator image. The orchestrator starts its own isolated gateway and sandbox containers. The three images are
pinned by digest in the workflow; change them only in a reviewed pull request. The orchestrator image carries
Greenkeeper's task definitions and locked skills, so this repository holds no Greenkeeper task files.

- `github.token`: reads Framework and the Greenkeeper images.
- `APM_FUSION_SKILLS_TOKEN`: reads the private skills.
- `DEPENDABOT_AUTOMATION_TOKEN`: pushes `greenkeeper/dependencies`, opens and updates its pull request and comments
  on Dependabot pull requests. It never enters a sandbox.

### Activation and rollback

Before enabling:

1. Grant `DEPENDABOT_AUTOMATION_TOKEN` Contents write on `greenkeeper/dependencies`, Pull requests write and
   Issues write (for comments). Make sure branch rules allow it to force-push that branch after a rebase.
2. Optionally create the `☘️ Fusion Greenkeep` label; Greenkeeper applies it but never creates it.
3. Run the workflow manually on `main` and review the combined pull request and comments it creates.

Then set the repository variable `GREENKEEPER_MAINTENANCE_ENABLED` to `true`. Pushes to `main` and the weekday
schedule then run Greenkeeper, and the legacy main-push stream sync and the per-PR AI research for pull requests on
`main` stop. To roll back, let an active run finish, unset the variable and close the combined pull request.

Merging this setup points npm Dependabot at `main`. Dependabot closes its pull requests against
`maintenance/dependencies` and opens new ones against `main`. Pull requests that still target the stream keep
their legacy workflows until they drain.

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

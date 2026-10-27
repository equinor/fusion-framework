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

[Greenkeeper maintenance](../.github/workflows/greenkeeper-maintenance.yml) requests one service task,
`dependency`. It preserves Dependabot's discovery, research comments, high-confidence merge gates,
changesets and aggregate promotion. It does not rename the populated `maintenance/dependencies` stream.
The branch name is repository-owned in [`.github/greenkeeper.yml`](../.github/greenkeeper.yml):

```yaml
version: 1
maintenance:
  dependency:
    branch: maintenance/dependencies
tasks: []
```

The service reads this configuration at the confirmed default-branch commit. It inventories open
same-repository Dependabot PRs, checks whether the dependency branch exists and whether it is outdated,
and attempts Git rebase before hiring an agent for actual conflicts. A missing branch is created from
the default branch only when open Dependabot PRs need processing and publication is enabled.
Export-only runs propose creation without writing. Existing branches are checked even without open PRs.
Inventory does not research, retarget or merge PRs; the existing integration pipeline retains those duties.

### Transport and credentials

Framework is public and the Greenkeeper repository is private. A direct cross-repository reusable-workflow
call is therefore unavailable. The workflow instead uses the local
[`greenkeeper-maintenance` action](../.github/actions/greenkeeper-maintenance/action.yml) to dispatch
`maintenance.yml` on trusted `main` in `equinor/fusion-poc-greenkeeper`.
The service contract was introduced by equinor/fusion-poc-greenkeeper#6, merged at
`38520a41ed377ba8d0a9c1c2f6a8d5664b9539db`; dispatch follows the service's current trusted `main`,
not that immutable historical revision. No private source, inference credential or service journal is
copied into this repository.

Reuse `DEPENDABOT_AUTOMATION_TOKEN`; do not fall back to `GITHUB_TOKEN` for this request.
Organization Actions sharing allows access to shared code, not cross-repository workflow dispatch.
The credential's identity must have **Actions write** access to Greenkeeper, in addition to the existing
Framework grants. Presence of the secret does not prove that grant. Verify it through approved repository
administration before activation; no credential value needs to be read or published.

### Activation and rollback

Automatic Greenkeeper requests are disabled until the Framework repository variable
`GREENKEEPER_MAINTENANCE_ENABLED` is exactly `true`. Until then, the existing Dependabot maintenance
workflow continues to own main-push sync. A push while disabled reports that unchanged ownership.

Before enabling:

1. Verify the existing token's Greenkeeper Actions write access.
2. Enroll `{"repository":"equinor/fusion-framework","task":"dependency","validation":"pnpm"}` in the
   service's protected `GREENKEEPER_MAINTENANCE_TARGETS` configuration.
3. Configure and verify the service's reviewed runner/image pins, Fusion identity, APM read credential,
   publishing identity and branch-specific rewrite authorization. Its sandbox must support Framework's
   pnpm version and build/test/lint scripts. Keep the existing branch protections.
4. After this wiring is merged, manually run the Framework workflow on `main` with `export-only: true`.
   Inspect the private service run: accepted dispatch is not successful maintenance or validation.
   Export-only mode creates no branches and publishes no rebased refs, but may use inference for conflicts.
5. After reviewing that result and letting any legacy sync finish, enable the variable.
   Main pushes then request publishing maintenance,
   and the legacy main-push sync job skips, avoiding two automatic rebase owners.

Manual dispatch is available before activation and defaults to export-only. Explicitly choosing
`export-only: false` authorizes publishing maintenance even while automatic handover is disabled.
Do not run manual legacy `sync` concurrently with a service rebase. To roll back, first let any active
service run finish or cancel it deliberately, then unset the variable or set it to `false`.
Main-push sync returns to the legacy workflow. Manual recovery/reset/promotion, maintenance-branch pushes
and deletion recovery remain available throughout.

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

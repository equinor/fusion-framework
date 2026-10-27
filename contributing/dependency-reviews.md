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

[Greenkeeper maintenance](../.github/workflows/greenkeeper-maintenance.yml) runs one shared runner task,
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

The runner reads this configuration at the confirmed default-branch commit. It inventories open
same-repository Dependabot PRs, checks whether the dependency branch exists and whether it is outdated,
and attempts Git rebase before hiring an agent for actual conflicts. A missing branch is created from
the default branch only when open Dependabot PRs need processing and publication is enabled.
Export-only runs propose creation without writing. Existing branches are checked even without open PRs.
Inventory does not research, retarget or merge PRs; the existing integration pipeline retains those duties.

### Execution and credentials

Execution stays in Framework's existing protected `docs` environment. The local
[`greenkeeper-maintenance` action](../.github/actions/greenkeeper-maintenance/action.yml) uses Azure OIDC login
with Framework's existing identity and acquires only a short-lived token for the Fusion AI scope
`0ec6e8f2-d309-4316-90e6-1d05628b5f07/.default`.
It does not install or configure Copilot, resolve a model, or create a provider file.
Azure logout and account cleanup run even on failure, before invoking the shared runner.
Masked step outputs carry the token only within this job; there is no cross-job token output,
dispatch input or token artifact.

Framework is public and the runner repository is private, so a direct private reusable-workflow reference
is unavailable. Check out the reviewed full `GREENKEEPER_RUNNER_REF` into `.greenkeeper` and invoke
`./.greenkeeper/.github/actions/maintenance` through `uses:`. Runner code stays outside the Git target clone.
This is not a dispatch into Greenkeeper. Greenkeeper needs no federated SP, Azure identity or Actions write grant.

Credentials have separate purposes:

- `github.token`: Framework Contents/Pull requests read, plus approved GHCR package reads.
- `APM_FUSION_SKILLS_TOKEN`: the existing read-only private skills credential.
- `GREENKEEPER_SOURCE_TOKEN`: dedicated Contents-read access to private runner source in Greenkeeper;
  used only for checkout with credential persistence disabled.
- `DEPENDABOT_AUTOMATION_TOKEN`: the existing host-only publisher with Contents write on Framework's stream.

The publishing token must never be substituted for the APM credential or passed into the agent.
No token values need to be inspected. Runner journals and bundles stay in the transient runner workspace;
the shared action does not upload them or copy them into public job summaries.

### Activation and rollback

Automatic Greenkeeper execution is disabled until the Framework repository variable
`GREENKEEPER_MAINTENANCE_ENABLED` is exactly `true`. Until then, the existing Dependabot maintenance
workflow continues to own main-push sync. A push while disabled reports that unchanged ownership.

Before enabling:

1. Publish and review the caller-owned runner action, then configure `GREENKEEPER_RUNNER_REF` to its full commit SHA
   in Framework's `docs` environment.
2. Configure matching reviewed `GREENKEEPER_IMAGE` and `GREENKEEPER_GATEWAY_IMAGE` digests in that environment.
   Verify GHCR grants allow Framework's job token to read them.
3. Verify the existing source-read, APM-read and Framework-publishing grants. The sandbox must support Framework's
   pnpm version and build/test/lint scripts. Keep the existing branch protections and existing Fusion identity.
   No central target enrollment or new federation is required.
4. After this wiring is merged, manually run the Framework workflow on `main` with `export-only: true`.
   Inspect the Framework job result; maintenance runs there, not in a second service run.
   Export-only mode creates no branches and publishes no rebased refs, but may use inference for conflicts.
5. After reviewing that result and letting any legacy sync finish, enable the variable.
   Main pushes then run publishing maintenance,
   and the legacy main-push sync job skips, avoiding two automatic rebase owners.

Manual dispatch is available before activation and defaults to export-only. Explicitly choosing
`export-only: false` authorizes publishing maintenance even while automatic handover is disabled.
Do not run manual legacy `sync` concurrently with a runner rebase. To roll back, first let any active
Framework maintenance run finish or cancel it deliberately, then unset the variable or set it to `false`.
Main-push sync returns to the legacy workflow. Manual recovery/reset/promotion, maintenance-branch pushes
and deletion recovery remain available throughout.

### Pre-merge export-only smoke test

The existing [PR workflow](../.github/workflows/pr.yml) has an explicit manual `greenkeeper_smoke` option.
This tests the candidate without merging its maintenance workflow or policy into `main`.
Dispatch `pr.yml` on the reviewed candidate branch, with `head_sha` equal to that branch's exact event commit
and `pr_number` identifying the PR. Supply `greenkeeper_runner_ref`, `greenkeeper_image` and
`greenkeeper_gateway_image` as reviewed immutable pins. The runner revision must include candidate-policy
preview support; the previously merged runner cannot execute this preview yet.

The smoke job uses Framework's existing `docs` identity and obtains only the AI token.
Private runner checkout uses `GREENKEEPER_SOURCE_TOKEN` only in the host checkout step,
with credential persistence disabled. This read operation requires Contents read on Greenkeeper.
The credential is not passed to the maintenance action, runner, agent or APM preparation.
`APM_FUSION_SKILLS_TOKEN` remains the read-only APM credential, and the job token needs access to the
reviewed GHCR images. Missing grants fail explicitly; there is no fallback to a stronger credential.
No `publish-token` is supplied to the smoke runner.

The runner accepts the candidate policy only for manual export-only execution at the exact caller event SHA
without a publishing credential. It still compares and validates against the current default branch,
retaining upstream freshness checks. Missing streams are proposed, never created. Existing outdated streams
can exercise Git rebase, final validation and conflict agents without publishing.
An already-current stream proves authentication and inventory but does not exercise rebase or inference.
Smoke evidence remains in the transient runner workspace; no journals or bundles are uploaded.

This manual test does not enable automatic handover or relax the production default-branch guard.
Normal PR CI can also be dispatched independently without `greenkeeper_smoke`.

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

---
title: Route routine Dependabot updates through a maintenance stream
status: accepted
date: 2026-09-28
decision-makers:
  - Fusion Framework maintainers
scope:
  - dependency-management
  - continuous-integration
---

# Route routine Dependabot updates through a maintenance stream

## Context

Fusion Framework contains more than 80 packages that share a pnpm lockfile. Dependabot opens
routine dependency pull requests independently, but merging any one of them changes the shared
lockfile and can make the remaining pull requests stale.

Each dependency merge to `main` also starts release processing and primes caches keyed by the
lockfile. Processing routine updates individually therefore consumes CI capacity, repeatedly
refreshes otherwise valid Dependabot branches, and requires maintainers to approve many
high-confidence updates.

Classifying updates as production or development dependencies does not solve this problem. A
dependency used for development in one workspace can participate in the build or deployed output
of another workspace.

## Decision

Routine npm version-update pull requests target `maintenance/dependencies` instead of `main`.
The maintenance branch requires validation but does not require human approval.

The existing dependency review automation researches each Dependabot update. It may automatically
maintain and squash-merge a pull request into `maintenance/dependencies` only when all of these
conditions hold:

- Dependabot authored the pull request.
- The reviewed head commit is still current.
- The technical verdict recommends merging.
- Research confidence is high.
- Required changesets are present.
- Required validation succeeds.
- The update does not require manual code or configuration changes.

Major, unresolved conflicting, failing, or lower-confidence updates remain open for maintainer handling.
They do not prevent unrelated high-confidence updates from entering the maintenance stream.

For explicitly enabled Greenkeeper dependency health and PR tasks only, the
[repository conflict policy](../../.github/instructions/dependabot-pr.instructions.md#rebase-strategy)
permits bounded resolution in an isolated local candidate before full validation. It requires enforced scope
and attempt limits, package-manager lockfile regeneration from intended inputs, required release artifacts,
and manual fallback for unsupported, ambiguous, out-of-bounds, or failing results. Publication remains host-only,
with exact-head/base freshness checks and expected-head leases; required CI and reviews still gate squash
auto-merge. This policy exception does not enable Greenkeeper or change the existing write-enabled sync workflow.

Each Dependabot update merged into the maintenance stream dispatches the maintenance workflow's
`promote` operation. It validates the combined stream and creates or updates the promotion pull
request from `maintenance/dependencies` to `main`. A new maintenance commit returns the promotion
to draft and drops auto-merge. Once validation passes for the current head, the promotion is marked
ready and squash auto-merge is enabled for that exact commit. The normal `main` review rules still
apply, including the required approving review and required checks, so GitHub merges the promotion
only after a maintainer approves it.

Promotion pull requests use the title `❤️‍🩹 deps: promote dependency maintenance stream` on both
creation and refresh so maintainers can distinguish the aggregate promotion from individual
Dependabot updates. This title intentionally uses an emoji-first format instead of a Conventional Commit prefix.

After a squash promotion, maintainers reset the maintenance branch to the promoted `main` through
the guarded maintenance workflow. Reset is rejected while pull requests still target the
maintenance branch or while its content differs from `main`.

The maintenance branch is a permanent Dependabot target, not a disposable promotion branch.
The maintenance workflow ensures it exists on pushes to `main` or the maintenance branch, after
its deletion, and before manually dispatched promotion. A missing branch is
recreated from the current `main`. Pushes to `main` automatically rebase an existing maintenance
branch onto the latest `main`; maintainers can also dispatch `sync` to retry. The sync uses an
explicit SHA-pinned force-with-lease so a concurrent dependency merge cannot be overwritten.
Conflicts fail the workflow without changing the remote branch and require manual resolution;
the write-enabled job does not install dependencies, execute hooks, or resolve conflicts automatically.
After a successful sync with changes left to promote, the same run validates the combined stream
and refreshes the promotion, including dispatching its required checks. An empty stream is not
promoted. `ensure` still leaves existing branches unchanged; `ensure`, `sync`, and `reset` all
recover a missing branch.

### Opt-in Greenkeeper main-push maintenance

The repository may hand automatic main-push sync to the Greenkeeper runner by setting
`GREENKEEPER_MAINTENANCE_ENABLED=true`. Its caller selects `task: dependency`; the service reads
`maintenance.dependency.branch` from `.github/greenkeeper.yml` at the confirmed default-branch commit.
The configured branch remains `maintenance/dependencies`; this does not migrate or recreate its history.
Without that flag, the legacy sync behavior above is unchanged.

When enabled, only the legacy main-push management job skips. Existing Dependabot research, merge gates,
changesets, maintenance-branch triggers, manual recovery and aggregate promotion remain unchanged.
The runner executes in Framework's existing protected `docs` environment, inventories open Dependabot PRs
and attempts Git before escalating actual integration-stream conflicts to bounded agents.
Full final validation and an exact-head lease precede a runner rewrite.
This is not permission to resolve individual Dependabot PR conflicts automatically in the write-enabled
Framework job, nor permission to merge to `main`.

Framework uses its existing identity for Azure login and AI-token acquisition only, without installing
or configuring Copilot. Azure session cleanup precedes runner execution. Both production and trial invoke
the published trusted orchestrator image at an immutable digest, without checking out private runner source.
Framework supplies the pinned conflict task/profile separately and mounts same-path scratch for sibling containers.
Only the trusted orchestrator receives the Docker socket; Greenkeeper needs no federated SP
or Actions write grant. `DEPENDABOT_AUTOMATION_TOKEN` remains the host-only Framework publishing credential,
while `github.token` and `APM_FUSION_SKILLS_TOKEN` provide separate read-only access.
Reviewed image/task pins, compatible validation and existing branch-specific rewrite authorization are
activation prerequisites. Missing branches are created only when open Dependabot PRs need processing
and publishing is enabled.
Existing local deletion/manual recovery is retained as a maintainer-controlled fallback.
See [the activation and rollback guide](../../contributing/dependency-reviews.md#activation-and-rollback).

The manually selected PR-workflow smoke job is a narrow pre-merge exception: it may read the policy at the
exact caller event commit on a reviewed candidate branch, but only in export-only mode with no publisher.
It retains current default-branch freshness checks and cannot create or rewrite branches.
The production workflow still runs only from the default branch. The smoke job neither enables automatic
handover nor transfers inference credentials across jobs.

## Branch rules

Repository administrators must configure `maintenance/dependencies` with rules that:

- require the same relevant validation checks used for dependency pull requests;
- do not require human pull request approval;
- require squash merges;
- prevent deletion;
- prevent force pushes except for guarded maintenance sync/reset and the Greenkeeper runner using the existing
  explicitly authorized Framework automation identity after activation;
- permit GitHub Actions to enable auto-merge.

`main` remains the default branch and retains its existing protection and human approval
requirements.

Deletion protection is the primary availability guarantee: asynchronous workflow recovery cannot
guarantee that Dependabot never sees a missing branch. Administrators with an always-on bypass
can still delete the branch, so they must not delete it after promotion. The reset workflow also
needs an explicitly authorized ruleset bypass for its force update, as does the automatic sync;
`contents: write` alone does not bypass pull-request or non-fast-forward rules. Scope that bypass
to the maintenance automation identity and branch, not `main`. Do not remove those protections.

## Automation identity

Pushes and merges made with the built-in `GITHUB_TOKEN` do not start new workflow runs for the
events they cause, and bot pushes to pull request branches create runs that wait for maintainer
approval, which blocks auto-merge. Without a separate identity, merges into the maintenance branch
would not trigger promotion, and each changeset commit would need a manual "Approve and run".

The workflows therefore use the optional repository secret `DEPENDABOT_AUTOMATION_TOKEN` for the
changeset and maintenance-sync pushes, for enabling auto-merge, and for maintaining the promotion pull request. Use a
fine-grained token with `Contents`, `Pull requests`, and `Actions` read and write access, owned by
an account with write access. When the secret is absent, the workflows fall back to
`GITHUB_TOKEN`, and the limitations above apply.

## Security updates

Dependabot treats security updates differently when version updates target a non-default branch.
The rollout must verify that urgent security updates continue to target `main`. Security updates
must not wait for periodic maintenance-stream promotion.

## Consequences

### Positive

- High-confidence routine updates close without repeated human approval.
- Routine dependency merges do not individually trigger `main` release and cache workflows.
- Maintainers review the accumulated result through one promotion pull request.
- Full validation covers interactions between updates already accepted into the stream.
- Risky updates remain individually visible and actionable.

### Negative

- The maintenance branch and its rules require repository-level administration.
- Pull requests still become stale when another update changes the shared lockfile, although this
  churn is isolated to the maintenance stream.
- A failing aggregate promotion may require identifying which accepted update interacts badly
  with another update.
- Squash promotion requires a guarded branch reset before the next maintenance cycle.

## Alternatives considered

### Merge every Dependabot pull request directly to `main`

This preserves the simplest branch model but retains repeated approvals, release processing,
cache priming, and lockfile refreshes.

### Group dependencies by production and development usage

This classification is unreliable in a large workspace because development dependencies can
affect package builds and deployed artifacts.

### Create one broad Dependabot group

This reduces pull request count but creates a large failure domain and does not by itself prevent
every accepted group from triggering `main` workflows.

### Model Dependabot pull requests as a linear `gh stack`

Dependabot pull requests are independent siblings that target the maintenance branch. A linear
stack would make each update depend on the previous bot branch, rewrite bot-owned history, and
couple otherwise independent reviews. The maintenance branch instead acts as an orchestrated
root: after one sibling merges, the refresh workflow rebases the remaining siblings against the
new root. `gh stack` remains suitable for intentionally layered manual changes but does not manage
the routine Dependabot queue.

### Replace Dependabot with a custom update generator

This offers more control but duplicates Dependabot behavior and increases long-term maintenance.

## Operational sequence

1. Initialize `maintenance/dependencies` from the current `main`.
2. Configure the branch rules before Dependabot starts targeting it.
3. Allow high-confidence updates to merge through the automated maintenance sequence.
4. Handle exceptional updates manually when convenient.
5. Each merged update dispatches `promote` to run full validation and update the promotion;
   dispatch it manually to retry.
6. Approve the promotion; auto-merge squashes it into `main` once required checks pass.
7. Close or retarget remaining maintenance pull requests as appropriate.
8. Dispatch `reset` to begin the next cycle from the promoted `main`.

If the branch is unexpectedly deleted, automatic recovery recreates it from `main`. Dispatch
`ensure` for immediate recovery without changing an existing branch. Until the recovery workflow
is deployed to `main`, dispatch `initialize` instead of `reset` to restore a missing branch.

Validate branch-management behavior locally with
`node --test .github/scripts/dependabot-maintenance.test.mjs` and validate workflow wiring with
`actionlint .github/workflows/dependabot-maintenance.yml`.
Pushes to `main` now select `sync` automatically. Dispatch `sync` manually to retry after fixing
conflicts or automation permissions; no force push occurs when `main` is already an ancestor.

## Rollback

Remove `target-branch` from the npm Dependabot configuration to restore routine version updates
against the default branch. Disable maintenance auto-merge before removing or deleting the
maintenance branch. Existing promotion pull requests can be closed without affecting `main`.

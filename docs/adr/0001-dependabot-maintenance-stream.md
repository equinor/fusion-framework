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

Major, conflicting, failing, or lower-confidence updates remain open for maintainer handling.
They do not prevent unrelated high-confidence updates from entering the maintenance stream.

Each Dependabot update merged into the maintenance stream dispatches the maintenance workflow's
`promote` operation. It validates the combined stream and creates or updates the promotion pull
request from `maintenance/dependencies` to `main`. A new maintenance commit returns the promotion
to draft and drops auto-merge. Once validation passes for the current head, the promotion is marked
ready and squash auto-merge is enabled for that exact commit. The normal `main` review rules still
apply, including the required approving review and required checks, so GitHub merges the promotion
only after a maintainer approves it.

After a squash promotion, maintainers reset the maintenance branch to the promoted `main` through
the guarded maintenance workflow. Reset is rejected while pull requests still target the
maintenance branch or while its content differs from `main`.

The maintenance branch is a permanent Dependabot target, not a disposable promotion branch.
The maintenance workflow ensures it exists on pushes to `main` or the maintenance branch, after
its deletion, and before manually dispatched promotion. A missing branch is
recreated from the current `main`; an existing branch is left unchanged unless a maintainer
explicitly requests the guarded reset. Both `ensure` and `reset` recover a missing branch.

## Branch rules

Repository administrators must configure `maintenance/dependencies` with rules that:

- require the same relevant validation checks used for dependency pull requests;
- do not require human pull request approval;
- require squash merges;
- prevent deletion;
- prevent force pushes except for the guarded maintenance reset workflow;
- permit GitHub Actions to enable auto-merge.

`main` remains the default branch and retains its existing protection and human approval
requirements.

Deletion protection is the primary availability guarantee: asynchronous workflow recovery cannot
guarantee that Dependabot never sees a missing branch. Administrators with an always-on bypass
can still delete the branch, so they must not delete it after promotion. The reset workflow also
needs an explicitly authorized ruleset bypass for its force update; `contents: write` alone does
not bypass pull-request or non-fast-forward rules. Do not remove those protections to enable reset.

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

## Rollback

Remove `target-branch` from the npm Dependabot configuration to restore routine version updates
against the default branch. Disable maintenance auto-merge before removing or deleting the
maintenance branch. Existing promotion pull requests can be closed without affecting `main`.

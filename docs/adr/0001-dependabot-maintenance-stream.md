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

Maintainers periodically dispatch the maintenance workflow to validate the combined stream and
create or update a draft promotion pull request from `maintenance/dependencies` to `main`. The
promotion uses the normal `main` review rules and is never automatically merged.

After a squash promotion, maintainers reset the maintenance branch to the promoted `main` through
the guarded maintenance workflow. Reset is rejected while pull requests still target the
maintenance branch or while its content differs from `main`.

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
5. Dispatch `promote` to run full validation and create or update the draft promotion.
6. Review and merge the promotion into `main`.
7. Close or retarget remaining maintenance pull requests as appropriate.
8. Dispatch `reset` to begin the next cycle from the promoted `main`.

## Rollback

Remove `target-branch` from the npm Dependabot configuration to restore routine version updates
against the default branch. Disable maintenance auto-merge before removing or deleting the
maintenance branch. Existing promotion pull requests can be closed without affecting `main`.

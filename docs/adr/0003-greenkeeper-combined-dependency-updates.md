---
title: Combine Dependabot updates with Greenkeeper on one branch and pull request
status: proposed
date: 2026-10-30
decision-makers:
  - Fusion Framework maintainers
scope:
  - dependency-management
  - continuous-integration
---

# Combine Dependabot updates with Greenkeeper on one branch and pull request

## Context

[ADR 0001](0001-dependabot-maintenance-stream.md) routes routine Dependabot updates through
`maintenance/dependencies`, with per-PR research, auto-merge into the stream and a promotion pull request.
That keeps the shared pnpm lockfile manageable, but it needs several workflows, a protected stream branch with
auto-merge, and per-PR research that never validates the updates together.

Greenkeeper ([equinor/fusion-poc-greenkeeper#11](https://github.com/equinor/fusion-poc-greenkeeper/issues/11))
now combines Dependabot updates itself. Dependabot still decides what to update. Greenkeeper applies each open
update in turn on `greenkeeper/dependencies`, researches it only when needed, migrates when needed, runs light
checks, adds or updates the changeset, commits with `Dependabot-PR` and `Dependabot-Version` trailers and pushes.
It opens or updates one pull request into `main` that closes the included Dependabot pull requests on merge.
Updates it cannot take stay with Dependabot, with a comment that gives the reason. Nothing merges automatically.

## Decision

Replace the maintenance stream with Greenkeeper's combined branch once
`GREENKEEPER_MAINTENANCE_ENABLED` is `true`:

- npm Dependabot updates target `main` (no `target-branch`), because Greenkeeper reads Dependabot pull
  requests against the default branch.
- [Greenkeeper dependency maintenance](../../.github/workflows/greenkeeper-maintenance.yml) runs on pushes to
  `main`, on weekday mornings and on manual dispatch, in the protected `docs` environment with Framework's
  existing Fusion AI identity. The three Greenkeeper images are pinned by digest in that workflow.
- `DEPENDABOT_AUTOMATION_TOKEN` is the only write credential. It pushes `greenkeeper/dependencies`, opens and
  updates its pull request and comments on Dependabot pull requests. It never enters a sandbox.
- Once enabled, the legacy main-push stream sync and the per-PR AI research for pull requests on `main` stop.
  Pull requests still targeting `maintenance/dependencies` keep their legacy workflows until they drain.

There is no `.github/greenkeeper.yml`: its presence selects Greenkeeper's configured integration-branch flow.

## Consequences

- Updates are validated on top of each other in one sandbox, and maintainers review one pull request.
- `main` keeps its protection and human approval; Greenkeeper never merges.
- A squash merge of the combined pull request loses the per-update commits; the next run starts a fresh branch.
- A run's AI token is acquired once, so a run longer than its lifetime fails part way. Accepted updates are
  already pushed, and the next run continues from them.
- ADR 0001's stream workflows can be removed once no Dependabot pull requests target `maintenance/dependencies`.

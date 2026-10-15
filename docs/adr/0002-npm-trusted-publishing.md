---
title: Publish npm packages through one trusted-publishing workflow
status: accepted
date: 2026-10-15
decision-makers:
  - Fusion Framework maintainers
scope:
  - release
  - continuous-integration
  - security
---

# Publish npm packages through one trusted-publishing workflow

## Context

Fusion Framework publishes 67 public `@equinor/*` packages. Until this decision, three workflows
published to npm with a long-lived automation token stored as `NPM_AUTH_TOKEN`:

- `ci.yml` published stable releases from `main`;
- `next.yml` published pre-releases from `next`;
- `pre-release.yml` published manually dispatched snapshots.

npm has been retiring long-lived publish credentials. Legacy tokens were removed in
November 2025, and npm has announced that granular tokens which bypass 2FA lose direct-publish
access in January 2027. The recommended replacement is
[trusted publishing](https://docs.npmjs.com/trusted-publishers). A GitHub Actions job exchanges
its OIDC identity for a short-lived publish credential, and npm attaches provenance
automatically.

Each npm package stores its own trust configuration: the repository, the workflow file, and an
optional GitHub environment. Three registry rules shape this decision:

- A package must already exist on npm before trust can be configured for it.
- A new trust configuration expires if it is not used to publish within 2 days, and it cannot be
  edited afterwards. To change it, you delete it and create a new one.
- npm validates the workflow that started the run. With `workflow_call`, that is the calling
  workflow, not the reusable workflow that runs `publish`.

npm now allows up to ten trust configurations per package, so one workflow per channel is
technically possible. But `next` and snapshots publish rarely. Their trust configurations would
keep expiring and would need to be re-created for all 67 packages every time.

## Decision

All npm publishing runs from `.github/workflows/release.yml`, in jobs bound to the GitHub
environment `npm`. Every public package trusts exactly that identity:
`equinor/fusion-framework`, file `release.yml`, environment `npm`, with permission to publish.

- A push to `main` publishes stable releases (`latest`).
- A push to `next` publishes pre-releases when `.changeset/pre.json` exists.
- `workflow_dispatch` publishes a snapshot of every public package under a chosen dist-tag.

The workflow uses the changesets `select-mode`, `version`, and `publish` sub-actions. Only the
publishing jobs receive `id-token: write` and enter the `npm` environment. The environment only
accepts deployments from `main` and `next`, so a branch cannot publish by editing the workflow.

The release workflow no longer configures any npm token. Trust is managed with
`pnpm npm-trust` (`.github/scripts/npm-trusted-publishing.mjs`):

- `bootstrap` configures every published package;
- `add` reserves a brand-new package with a placeholder and then trusts it;
- `verify` proves that a dist-tag was published through trusted publishing;
- `preflight` blocks a release before anything is published when a package is new or lacks
  repository metadata.

Because new configurations expire after 2 days, every bootstrap is followed by a snapshot
dispatch. The snapshot publishes all packages through `release.yml` and validates each
configuration.

## Consequences

### Positive

- No long-lived npm publish credential remains in the repository or in a personal account.
- Every release carries npm provenance and a recorded trusted publisher.
- One trusted identity covers stable, pre-release, and snapshot publishing, so rarely used
  channels cannot drift into expired configurations.
- Publishing is limited to `main` and `next` through the environment's deployment branch policy.

### Negative

- Renaming `release.yml`, renaming the `npm` environment, or moving publishing into another
  workflow breaks publishing for every package until trust is re-bootstrapped.
- Snapshots can only be published from `main` or `next`, not from feature branches.
- A new package needs a maintainer with npm 2FA to run `pnpm npm-trust add` before its first
  release, and that release must happen within 2 days.
- Trusted publishing only works on GitHub-hosted runners.

## Alternatives considered

### Keep separate workflows and trust each one

npm allows multiple trust configurations per package. However, `next.yml` and `pre-release.yml`
rarely publish all packages within 2 days of configuration. Their configurations would expire
and would need to be re-created for every package before each use.

### Rotate granular automation tokens

This does not remove the long-lived credential. Tokens that bypass 2FA are losing
direct-publish access, and every rotation is manual work.

### Stage-only publishing

`npm stage publish` with stage-only trust adds a human 2FA approval for every package version.
Changesets does not integrate with staged publishing yet, and approving dozens of packages per
release is not practical. Revisit this when changesets supports `stage publish`.

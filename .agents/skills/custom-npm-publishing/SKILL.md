---
name: custom-npm-publishing
description: 'Guides npm publishing for Fusion Framework packages through trusted publishing (OIDC) from release.yml. USE FOR: adding a new public package, preparing a first release, reserving a package name on npm, snapshot or pre-release publishing, diagnosing failed or partial npm releases (ENEEDAUTH, 401, 404, provenance), npm trust audit/bootstrap/verify, changing the release workflow. DO NOT USE FOR: writing changesets, Dependabot PRs, VS Code Marketplace publishing, rebasing Version Packages PRs, or application code changes.'
license: MIT
compatibility: Requires pnpm and the Fusion Framework monorepo. Trust commands need npm CLI 11.15+ and a maintainer `npm login` with 2FA.
metadata:
  version: "0.0.0"
  status: experimental
  owner: "@equinor/fusion-core"
  tags:
    - npm
    - release
    - trusted-publishing
    - fusion-framework
---

# Custom npm Publishing

Every public package publishes to npm only from `.github/workflows/release.yml`, in the GitHub
environment `npm`, through npm trusted publishing (OIDC). No npm token exists in CI. The full
runbook is `contributing/npm-publishing.md`; the decision record is
`docs/adr/0002-npm-trusted-publishing.md`. Read the runbook section that matches the request
instead of restating it.

## When to use

- A pull request adds a new public package under `packages/*`. Cookbooks are private and
  never publish to npm.
- Someone asks how to release, snapshot, or pre-release packages.
- A release run failed or published only some packages.
- Someone proposes renaming `release.yml`, renaming the `npm` environment, adding a publish
  step to another workflow, or reintroducing an npm token.

## When not to use

- Writing or reviewing changesets: `.github/instructions/changesets.instructions.md`.
- Dependency update PRs: `fusion-dependency-review`.
- VS Code extension publishing: it ships through the Marketplace job, not npm.
- Conflicts in Version Packages PRs: `custom-rebase`.

## Required inputs

- Package name(s) and path(s), or the failing workflow run URL.
- Whether the user is an `@equinor` npm maintainer who can complete 2FA (needed for trust
  changes and placeholder publishes).

## Instructions

### Adding a new public package

1. Check the manifest. A package is public when it is not `"private": true`. It needs:
   - `"publishConfig": { "access": "public" }`;
   - `"repository": { "type": "git", "url": "git+https://github.com/equinor/fusion-framework.git", "directory": "<path>" }`.
     Provenance is rejected without a matching `repository`.
2. Add the usual package requirements from `.github/instructions/monorepo-structure.instructions.md`
   and a changeset.
3. Run `pnpm npm-trust preflight`. Before the package is reserved, it fails with
   `not on npm yet`; that is expected for a new package.
4. Tell the user that **a maintainer must run `pnpm npm-trust add <name>` before the first
   release PR that contains the package is merged**. Otherwise the release job stops in
   preflight and blocks every other package. The command publishes the placeholder
   `0.0.0-trusted-publishing.0` and trusts `release.yml`. The first real publish must happen
   within 2 days, or the trust configuration expires.
5. After the release, run `pnpm npm-trust verify --package <name>`. The expected status is
   `verified`.

Example:

```text
User: I added packages/modules/foo as @equinor/fusion-framework-module-foo. Anything else for npm?
Agent: Check `repository` and `publishConfig`, add a changeset, and run `pnpm npm-trust preflight`.
       Before the release PR merges, a maintainer runs `pnpm npm-trust add @equinor/fusion-framework-module-foo`,
       and the release must publish within 2 days.
```

### Snapshots and pre-releases

- Snapshot: `gh workflow run release.yml --ref main -f tag=<tag>`. The tag must match
  `^[a-z][a-z0-9-]*$` and must not be `latest` or `next`.
- The `npm` environment only deploys from `main` and `next`. Snapshots from feature branches are
  rejected by design; do not suggest a workaround.
- Pre-releases publish from `next` while `.changeset/pre.json` exists.

### Diagnosing a failed release

1. Find the first failing package in the run log (`gh run view <run-id> --log-failed`).
   Publishing is sequential, so the packages after it were skipped, not broken.
2. Classify the failure:
   - Network or transport error (`error sending request`, `ECONNRESET`): re-run the failed job.
     `pnpm publish -r` skips versions already on npm.
   - `ENEEDAUTH`, `401`, or `404` on publish: trust is missing or expired. Use the runbook's
     troubleshooting table and `pnpm npm-trust audit` (needs `npm login`).
   - `preflight` errors: fix `repository` or reserve the package as described above.
   - `422` mentioning provenance: `repository` does not match `equinor/fusion-framework`.
3. The registry can take a few minutes to show new versions. Re-run `verify` before
   concluding that something is missing.

### Changing the release workflow

Trust is bound to the file name `release.yml` and the environment `npm`. Renaming either, or
publishing from another workflow (including a `workflow_call` caller), breaks publishing for every
package until trust is rebuilt and validated within 2 days. Flag such a change as high-risk
and point to the ADR before making it.

## Expected output

- For new packages: the manifest fields, the changeset, the `preflight` result, and an explicit
  maintainer action (`pnpm npm-trust add <name>`) with its timing.
- For failures: the first failing package, the classified cause, and the recovery command.
- For workflow changes: the trust impact and the required re-bootstrap and validation steps.

## Safety & constraints

Never:

- add an npm token, `_authToken`, or `NODE_AUTH_TOKEN` to workflows, actions, or `.npmrc`;
- run `pnpm npm-trust add`, `bootstrap`, `npm publish`, `npm trust revoke`, or dispatch a
  snapshot without explicit user confirmation. These change the public registry and cannot be
  undone;
- revoke trust configurations that belong to other repositories;
- move publishing out of `release.yml` as an incidental refactor.

Always:

- run `pnpm npm-trust preflight` and `verify` (no login needed) before claiming a package is
  ready or published;
- leave interactive 2FA steps to the user and say so.

# npm publishing

Every public `@equinor/*` package in this repository publishes to npm through
[trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC). No npm token exists in
CI. npm accepts a publish only from:

| Claim | Value |
| --- | --- |
| Repository | `equinor/fusion-framework` |
| Workflow file | `release.yml` |
| Environment | `npm` (deployment branches: `main`, `next`) |

The decision and its trade-offs are recorded in
[ADR 0002](../docs/adr/0002-npm-trusted-publishing.md).

## Release channels

All channels run in [`release.yml`](../.github/workflows/release.yml). Do not publish to npm from
any other workflow, and do not rename the file or the environment. If you do, every package
loses its trust configuration.

| Trigger | Channel | Dist-tag |
| --- | --- | --- |
| Push to `main` | Stable release through the changesets release PR | `latest` |
| Push to `next` with `.changeset/pre.json` | Pre-release through the changesets pre-release PR | tag from `pre.json` |
| `workflow_dispatch` from `main` or `next` | Snapshot of every public package | input `tag` (not `latest` or `next`) |

```sh
gh workflow run release.yml --ref main -f tag=my-snapshot
```

## Prerequisites for maintainers

The trust commands change npm package settings and require:

- npm CLI 11.15 or newer (`npm install -g npm@latest`);
- `npm login` with an account that maintains the `@equinor` packages and has 2FA enabled
  (pnpm logins are stored separately and are not used);
- a browser or authenticator to complete 2FA. On the first prompt, enable
  **skip two-factor authentication for the next 5 minutes**. Then the remaining packages run
  without further prompts.

## Commands

All commands are idempotent and accept `--package <name>` (repeatable) to limit the scope.

| Command | Login | Purpose |
| --- | --- | --- |
| `pnpm npm-trust audit` | optional | Repository metadata, npm existence, and trust status per package |
| `pnpm npm-trust bootstrap [--dry-run] [--replace]` | required | Trust `release.yml` for every published package |
| `pnpm npm-trust add <package...> [--dry-run] [--yes]` | required | Reserve a new package with a placeholder and trust it |
| `pnpm npm-trust verify [--tag <dist-tag>]` | none | Prove that the tagged versions were published through trusted publishing |
| `pnpm npm-trust preflight` | none | CI gate run before every publish |

## Bootstrap all packages

A new trust configuration **expires if it has not published within 2 days**. Run the bootstrap
only when you can dispatch a snapshot right afterwards.

1. Make sure `release.yml` with the `npm` environment is on `main`.
2. Preview the changes: `pnpm npm-trust bootstrap --dry-run`.
3. Apply them: `pnpm npm-trust bootstrap`.
4. Publish every package through the new trust configuration. The bootstrap prints the exact
   command with a dated tag, so an older snapshot cannot satisfy step 5:
   `gh workflow run release.yml --ref main -f tag=trusted-publishing-<yyyymmdd>`.
5. When the run succeeds, prove it: `pnpm npm-trust verify --tag trusted-publishing-<yyyymmdd>`.
   Every package must report `verified`. This means npm recorded a GitHub trusted publisher,
   and the provenance names `equinor/fusion-framework` and `.github/workflows/release.yml`.

If a package reports `conflict`, the registry rejected a second configuration. Rerun with
`--replace` to swap this repository's old configuration for the new one. With `--replace`,
the script always adds before it revokes, where npm allows it. If a swap leaves a package
without trust, the batch stops and prints the command to rerun. Configurations that belong to
other repositories are never touched.

`preflight` cannot see trust state, because that requires a maintainer login. Run
`pnpm npm-trust audit` before merging a release PR if trust may have expired.

## Add a new package

npm cannot trust a package name that does not exist yet. `preflight` fails the release before
anything is published if a new public package has not been added.

1. Merge the package with its changeset as usual.
2. Before merging the release PR that first publishes it, run
   `pnpm npm-trust add @equinor/<name>`. This publishes `0.0.0-trusted-publishing.0` under the
   `trusted-publishing-bootstrap` dist-tag and then trusts `release.yml`.
3. Merge the release PR within 2 days. Alternatively, dispatch a snapshot from `main` to
   validate the configuration.
4. Run `pnpm npm-trust verify --package @equinor/<name>` after the release.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `preflight` reports `not on npm yet` | The package is new. Run `pnpm npm-trust add <name>`. |
| `preflight` reports `repository must point at` | Add `repository.url` `git+https://github.com/equinor/fusion-framework.git` and `repository.directory` to the package's `package.json`. |
| Publish fails with `ENEEDAUTH`, `401`, or `404` | Trust is missing or expired. Run `pnpm npm-trust audit`. If it reports `untrusted`, run `bootstrap --package <name>`. If it reports `trusted`, the configuration probably expired: revoke it (`npm trust list <name>`, then `npm trust revoke <name> --id <id>`) before running `bootstrap --package <name>`. Then publish within 2 days. |
| Publish fails with `422` mentioning provenance | `repository` in `package.json` does not match `equinor/fusion-framework`. |
| Snapshot job waits for or rejects the deployment | Snapshots only run from `main` or `next` (`npm` environment policy). |
| `npm trust` prints `EOTP` | Complete 2FA in the prompt the script opens, and enable the 5-minute skip. |

## Hardening after verification

Once `verify` passes for every package:

1. Delete the `NPM_AUTH_TOKEN` repository secret and revoke the token on npmjs.com.
2. Optionally set each package's **Publishing access** to
   *Require two-factor authentication and disallow tokens*. Trusted publishing keeps working.

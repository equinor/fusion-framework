# npm publishing

Every public `@equinor/*` package in this repository publishes to npm through
[trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC). No npm token exists in
CI. npm accepts a publish only from:

| Claim | Value |
| --- | --- |
| Repository | `equinor/fusion-framework` |
| Workflow file | `release.yml` |
| Environment | `npm` (deployment branches: `main`, `feat/improve-telemetry`) |

The decision and its trade-offs are recorded in
[ADR 0002](../docs/adr/0002-npm-trusted-publishing.md).

## Release channels

All channels run in [`release.yml`](../.github/workflows/release.yml). Do not publish to npm from
any other workflow, and do not rename the file or the environment. If you do, every package
loses its trust configuration.

| Trigger | Channel | Dist-tag |
| --- | --- | --- |
| Push to `main` | Stable release through the changesets release PR | `latest` |
| Push to `feat/improve-telemetry` with `.changeset/pre.json` | Pre-release through the changesets pre-release PR | tag from `pre.json` (`next`) |
| `workflow_dispatch` from `main` or `feat/improve-telemetry` | Snapshot of every public package | input `tag` (not `latest` or `next`) |

The telemetry feature branch owns the `next` prerelease channel; there is no separate `next`
branch. Keep `.changeset/pre.json` on `feat/improve-telemetry`, not `main`. Feature PRs for this
rollout target `feat/improve-telemetry`. The release workflow creates a branch-specific
Changesets release PR; the former `changeset-release/next` PR is obsolete.

Changing the prerelease branch also requires updating the `npm` environment's deployment branch
policy. Keep `main` allowed and replace the old prerelease branch with the exact new branch name.
The workflow filename and environment stay unchanged, so npm trust does not need re-bootstrapping.

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
without trust, the batch stops and prints the command to rerun. If the new configuration was
added but an old one could not be revoked, the package reports `partial` and the run fails.
The new configuration still needs its validating publish. Rerun `bootstrap --replace` to
finish the cleanup. Configurations that belong to other repositories are never touched.

`preflight` cannot see trust state, because that requires a maintainer login. Run
`pnpm npm-trust audit` before merging a release PR if trust may have expired.

## Add a new package

npm cannot trust a package name that does not exist yet. `preflight` fails the whole release
before anything is published while any public package is missing from npm. One unreserved
package therefore blocks every other release.

1. In the package PR, set `publishConfig.access` to `public` and add `repository` with `url`
   `git+https://github.com/equinor/fusion-framework.git` and `directory` set to the package path.
   Add a changeset. In the PR, `pnpm npm-trust preflight` reports the package as `not on npm yet`.
   That is expected until step 3.
2. Merge the package PR as usual. The release workflow opens or updates the release PR.
3. Before merging that release PR, a maintainer with npm 2FA runs
   `pnpm npm-trust add @equinor/<name>`. This publishes `0.0.0-trusted-publishing.0` under the
   `trusted-publishing-bootstrap` dist-tag and then trusts `release.yml`. Preview it with
   `--dry-run`.
4. Merge the release PR within 2 days, or the new trust configuration expires. Alternatively,
   validate it sooner by dispatching a snapshot from `main`.
5. Run `pnpm npm-trust verify --package @equinor/<name>` after the release. The package must
   report `verified`.

Agents follow the same workflow through
[`custom-npm-publishing`](../.agents/skills/custom-npm-publishing/SKILL.md).

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `preflight` reports `not on npm yet` | The package is new. Run `pnpm npm-trust add <name>`. |
| `preflight` reports `repository must point at` | Add `repository.url` `git+https://github.com/equinor/fusion-framework.git` and `repository.directory` to the package's `package.json`. |
| Publish fails with `ENEEDAUTH`, `401`, or `404` | Trust is missing or expired. Run `pnpm npm-trust audit`. If it reports `untrusted`, run `bootstrap --package <name>`. If it reports `trusted`, the configuration probably expired: revoke it (`npm trust list <name>`, then `npm trust revoke <name> --id <id>`) before running `bootstrap --package <name>`. Then publish within 2 days. |
| Publish fails with `422` mentioning provenance | `repository` in `package.json` does not match `equinor/fusion-framework`. |
| Snapshot job waits for or rejects the deployment | Snapshots only run from `main` or `feat/improve-telemetry` (`npm` environment policy). |
| `npm trust` prints `EOTP` | Complete 2FA in the prompt the script opens, and enable the 5-minute skip. |
| Release stops partway with `error sending request` or `ECONNRESET` | Transient network error. Re-run the failed job. `pnpm publish -r` skips versions already on npm, so only the remaining packages are published. |
| `verify` reports `no-tag` right after a successful run | The registry can take a few minutes to show new versions. Wait, then run `verify` again. |

### A successful prerelease still serves old code

`pnpm publish -r` skips versions already on npm, even when the workspace contains different code.
Restarting a prerelease cycle with an old version can therefore leave consumers on an incompatible artifact
without failing the release job.

Compare the package's workspace version and runtime exports with its npm version history and dist-tag.
If the intended version already exists, advance the workspace prerelease counter to the highest occupied
counter for that version and tag, then add a patch changeset. Confirm that `pnpm changeset status --output <path>`
plans an unpublished version before merging the generated release PR. Do not republish or retag an old
artifact as a substitute for releasing the new runtime.

For example, if telemetry's source is `8.0.0-next.0` but npm already contains both `.0` and `.1`, seed the
manifest at `8.0.0-next.1`; the patch changeset must plan `8.0.0-next.2`. After publishing through
`release.yml`, verify the registry tag and test the packed runtime's exports, not just its TypeScript declarations.

## Hardening after verification

Once `verify` passes for every package:

1. Delete the `NPM_AUTH_TOKEN` repository secret and revoke the token on npmjs.com.
2. Optionally set each package's **Publishing access** to
   *Require two-factor authentication and disallow tokens*. Trusted publishing keeps working.

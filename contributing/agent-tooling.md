# Agent tooling

Fusion Framework uses [Agent Package Manager (APM)](https://microsoft.github.io/apm/)
to provide shared Fusion skills, the Fusion developer agent, repository instructions,
and Fusion MCP configuration for GitHub Copilot.

The committed [`apm.yml`](../apm.yml) declares the packages used by the repository.
The committed [`apm.lock.yaml`](../apm.lock.yaml) pins their resolved revisions and
content hashes.

## Set up APM

1. Install the APM CLI by following the
   [official installation guide](https://microsoft.github.io/apm/getting-started/installation/).
2. Use APM CLI **0.33.0**, matching the update and validation workflows. From the
   repository root, restore the locked agent configuration:

   ```sh
   apm install --frozen --target copilot
   ```

The command recreates the ignored `apm_modules/` cache and verifies that the committed
skills, agents, instructions, and `.vscode/mcp.json` match the lockfile. VS Code asks
you to sign in with your Equinor account when Fusion MCP is used for the first time;
the repository does not store credentials.

## Validate the agent configuration

Run both checks after changing APM dependencies or deployed agent files:

```sh
apm audit --ci --no-policy
pnpm verify:agent-context
```

`apm audit` checks lockfile consistency, deployed-file ownership, content integrity,
MCP configuration, and drift. `verify:agent-context` checks repository-specific agent
instructions against the workspace.

The `Agent context` workflow runs these checks for agent configuration changes once
a PR is ready for review. It audits committed files before installation so restoring
a missing file cannot hide a broken commit, then verifies that a frozen install
changes no tracked files and creates no untracked agent files, and audits again.
Automated PR workflows may require a maintainer to approve them to run.

## Update APM packages

APM dependencies use bounded Fusion Skills release ranges (`#^1.6.3`) to allow
compatible 1.x updates. The lockfile pins the installed revisions. To upgrade:

1. Review available updates:

   ```sh
   apm outdated
   ```

2. Refresh dependencies within the ranges in `apm.yml` and regenerate the installation
   and lockfile:

   ```sh
   apm update --target copilot
   ```

3. Review all changes under `.agents/`, `.github/agents/`,
   `.github/instructions/`, and `.vscode/mcp.json`.
4. Run the validation commands above.

Do not use `npx skills`, recreate `skills-lock.json`, or edit an APM-managed deployed
copy directly. Change the dependency version in `apm.yml`, or contribute the content
change to its source repository. Repository-owned `custom-*` skills remain under
`.agents/skills/` and are not replaced by an APM package update.

The [`Update APM dependencies`](../.github/workflows/apm-update.yml) GitHub Actions
workflow runs on weekdays (Monday-Friday) at 08:17 UTC and can also be run manually. It delegates to
the [Fusion Skills APM Sync workflow](https://github.com/equinor/fusion-skills/blob/v1.9.0/.github/workflows/apm-sync.yml),
pinned to `v1.9.0`, explicitly uses APM CLI `0.33.0`, and uses the
`automation/apm-update` branch. The shared workflow
refreshes dependencies within the declared ranges, regenerates the lockfile and
managed agent configuration, and opens or updates a non-draft pull request.
It does not run the audit or repository-specific context validation itself; the
`Agent context` workflow above supplies those safeguards before an update is merged.

The previous updater inherited APM `0.14.0` from the action's default. Its
[2026-10-12 run](https://github.com/equinor/fusion-framework/actions/runs/38225101495)
reported a successful update but left ten deployed skill directories missing.
The explicit CLI version avoids that obsolete deployment behavior; keep it aligned
between update and validation workflows when upgrading.

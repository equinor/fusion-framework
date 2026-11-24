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
2. Use APM CLI **0.33.0**, matching the Framework validation workflow. From the
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

The `agent-context.yml` workflow runs these checks for agent configuration changes once
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

[Fusion Greenkeeper](https://github.com/equinor/fusion-poc-greenkeeper) proposes APM
updates for Framework through its central weekday dependency maintenance workflow.
Framework's `agent-context.yml` still audits and validates those changes in PR CI,
the same way it does for maintainer-authored updates.

## CI access to Fusion Skills

`equinor/fusion-skills` is an internal repository, so the automatic job token of this
public repository cannot clone it. The `agent-context.yml` workflow
passes the repository secret `APM_FUSION_SKILLS_TOKEN` to APM as
`GITHUB_APM_PAT_EQUINOR`. The token needs read access to `equinor/fusion-skills` contents
only. Without the secret the workflow falls back to the job token and fails with an
authentication error during `apm audit` or `apm install`. Pull requests
from forks never receive the secret, so those checks fail there by design.

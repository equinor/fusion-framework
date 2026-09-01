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
2. From the repository root, restore the locked agent configuration:

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

## Update APM packages

APM dependencies are pinned to Fusion Skills release tags. To upgrade:

1. Change the relevant `#vX.Y.Z` references in `apm.yml`.
2. Regenerate the installation and lockfile:

   ```sh
   apm install --target copilot
   ```

3. Review all changes under `.agents/`, `.github/agents/`,
   `.github/instructions/`, and `.vscode/mcp.json`.
4. Run the validation commands above.

Do not use `npx skills`, recreate `skills-lock.json`, or edit an APM-managed deployed
copy directly. Change the dependency version in `apm.yml`, or contribute the content
change to its source repository. Repository-owned `custom-*` skills remain under
`.agents/skills/` and are not replaced by an APM package update.

The `Update APM dependencies` GitHub Actions workflow checks for a new Fusion Skills
release every Monday and can also be run manually. It updates all release pins together,
regenerates the APM installation, validates it, and opens a draft pull request for review.

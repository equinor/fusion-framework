# Codespaces issue-agent plan

Run ordinary Copilot CLI in the repository with its skills, instructions, Foundry
models, and hosted Fusion MCP. Use maintained tooling, not a custom solver framework.

## Keep the setup small

| Component | Responsibility |
| --- | --- |
| [Dev-container configuration](../.devcontainer/devcontainer.json) | Standard Node, pnpm, GitHub CLI, SSH, Copilot CLI, and editor extensions |
| [MCP configuration](../.devcontainer/mcp.json) | Hosted Fusion MCP connection using a runtime token |
| Future Actions workflow | Supply runtime credentials/settings, create/connect to the Codespace, run Copilot, publish a draft PR, and stop |

No Bun runtime, custom installers, authentication wrappers, MCP client implementation,
CLI launcher, or new plugin inside the container. The Copilot extension provides the
editor experience; the maintained Copilot CLI feature provides the executable for SSH.
CLI releases remain pinned, and pnpm matches the root manifest.

## 1. Prove the developer Codespace

Start with an approved maintainer-owned Codespace:

1. Verify organization access, billing approval, and available machine size.
2. Create a fresh Codespace using this branch's dev-container configuration.
3. Connect through `gh codespace ssh` or VS Code.
4. Supply approved Foundry settings and a token for hosted Fusion MCP at runtime.
   Use existing authentication tooling, not a new repository authentication framework.
5. Start Copilot from the repository root:

   ```bash
   : "${COPILOT_PROVIDER_BASE_URL:?Set the approved Foundry endpoint}"
   : "${COPILOT_PROVIDER_BEARER_TOKEN:?Provide a current model access token}"
   : "${FUSION_MCP_TOKEN:?Provide a current Fusion MCP access token}"
   copilot --no-auto-update \
     --additional-mcp-config @.devcontainer/mcp.json \
     --secret-env-vars=COPILOT_PROVIDER_BEARER_TOKEN,FUSION_MCP_TOKEN
   ```

   Supply the remaining provider/model settings using the supported configuration in
   [Dependabot AI review](../.github/workflows/dependabot-ai-review.yml).
   Foundry and MCP may require different token audiences; do not reuse tokens by assumption.
6. Confirm the CLI loads repository skills/instructions and actually calls Fusion MCP
   retrieval. Confirm a Foundry response and focused repository validation.
7. Stop the Codespace when finished. Stopped Codespaces still incur storage costs.

The configuration does not log in, refresh tokens, or promise that VS Code credentials
are available to the CLI. Missing or expired access must be resolved before starting an
unattended task. Live Codespaces, Foundry, and MCP validation is still outstanding.

## 2. Enable managed prebuilds after the first successful test

Configure prebuilds in repository Settings > Codespaces, initially for `main` in West
Europe with scheduled updates. GitHub manages the prebuild workflow; do not add a
custom image-building pipeline.

Dependency installation uses `updateContentCommand`, which runs during prebuilds and
can run again when workspace content changes. `waitFor` ensures development starts
after installation. Keep Foundry/MCP credentials and agent execution at runtime, never
inside a prebuild snapshot. Prebuilds consume Actions minutes and storage; enable them
only after billing approval and a successful fresh Codespace test.

## 3. Add one manually triggered workflow

Only proceed once developer setup and unattended authentication are proven.

- Use `workflow_dispatch` with an issue number. No label/comment triggers.
- Restrict orchestration to this repository's protected default branch.
- Create a fresh Codespace and connect with `gh codespace ssh`.
- Fetch the issue as data; record the issue snapshot, base SHA, and workflow run.
- Obtain model/MCP credentials using approved existing tooling on the Actions runner.
  Transfer only required settings and short-lived tokens securely to the remote process.
  Actions `env:` does not automatically reach a Codespace. Do not put token values in
  SSH command arguments or logs.
- Invoke the ordinary CLI with the task and MCP configuration. Do not duplicate the
  repository skills or implement a new issue-solving engine.
- Bound run time, require real validation evidence, and publish only a draft PR.
  Keep publication deterministic; do not run generated code with publisher credentials.
- Stop the exact Codespace on completion/failure. Use platform idle timeout and retention
  settings as backstops, test cancellation, and document manual recovery for cleanup failure.
- Keep human review and existing branch protections. Never auto-merge.

**Authentication gate:** an App installation token can dispatch Actions, but Codespaces
creation and connection need a separately supported user-context credential. Prove both
lifecycle API and SSH access. The workflow's `GITHUB_TOKEN` is not assumed sufficient.
Also prove unattended Foundry/MCP access before enabling the workflow.

Fusion MCP source confirms bearer authentication and a production delegated scope of
`api://fusion-mcp-service-prod/user_impersonation`. Retrieval acquires downstream tokens
on behalf of the user; accepting an incoming bearer token does not prove that an app-only
token can perform retrieval. Do not use the existing Foundry service principal as an
assumed substitute for a delegated MCP identity.

After approved `gh auth refresh -h github.com -s codespace`, the local GitHub CLI
successfully listed repository Codespaces and available machines. No existing
Codespaces were returned for the current user in this repository; 2-, 4-, 8-, and
16-core machines were listed. Creation, billing approval, SSH, and live Foundry/MCP
access remain unverified. Provisioning billable resources requires separate approval.

Codespaces can expose repository write credentials to its processes. It isolates the
machine, not the agent from those credentials. Review effective permissions and
downstream PR CI; draft status does not prevent CI execution.

## Acceptance and maintenance

- Developer: fresh setup, CLI available over SSH, Foundry response, actual Fusion MCP
  retrieval, instructions/skills loaded, and one supervised issue implementation.
- Workflow: one authorized dispatch, one Codespace, one draft PR, bounded costs, and
  verified stop behavior, including failures.
- Validate configuration locally, then prove hosted behavior. Do not create extra
  frameworks to simulate missing live authentication.
- No Codespace has been provisioned by this change. No new workflow is implemented yet.
- No changeset is required for dev-container configuration and internal planning docs.

References: [Codespaces CLI](https://cli.github.com/manual/gh_codespace_ssh),
[maintained Copilot feature](https://github.com/devcontainers/features/tree/main/src/copilot-cli),
[Codespaces prebuild lifecycle](https://docs.github.com/en/codespaces/prebuilding-your-codespaces/about-github-codespaces-prebuilds),
[Fusion MCP guidance](../.agents/skills/fusion-mcp/SKILL.md),
[production MCP configuration](https://github.com/equinor/fusion-mcp/blob/930a349e341dac75c132e32a0bbfbfc5e9a3958d/.azure/pipelines/values-fprd.yaml#L8-L35),
[MCP user-token acquisition](https://github.com/equinor/fusion-mcp/blob/930a349e341dac75c132e32a0bbfbfc5e9a3958d/src/Fusion.Mcp.Api/Services/FusionAiClient.cs#L140-L145).

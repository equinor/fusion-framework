# VS Code MCP config quick reference (Fusion MCP)

This guide is a distilled setup reference based on the upstream Fusion MCP README.
Use it when the user asks for a concrete VS Code MCP config example.

## Prerequisites

- Docker available locally
- Access to image source:
  - GHCR release image (`ghcr.io/equinor/fusion-poc-mcp[:tag]`), or
  - locally built image (`fusion-poc-mcp:local`). From the repository root, you can build and tag this image with:

    ```bash
    docker build -t fusion-poc-mcp:local .
    ```
- Required API keys available to the user (do not request values in plain text)

If using GHCR image, authenticate first:

```bash
gh auth login -h github.com -w
gh auth refresh -h github.com -s read:packages
gh auth token | docker login ghcr.io -u <github-username> --password-stdin
```

## Minimal VS Code MCP config (Docker `stdio`)

Use this as a baseline template and adapt env values as needed.

```json
{
  "servers": {
    "fusion-poc-mcp": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--read-only",
        "--tmpfs", "/tmp:rw,size=64m",
        "--cap-drop=ALL",
        "--security-opt=no-new-privileges",

        "-e", "MCP_TRANSPORT=stdio",
        "-e", "FusionSkills__CloneDirectory=/tmp/fusion-skills",
        "-e", "FusionSkills__SqlitePath=/tmp/fusion-skills-index.db",

        "-e", "AzureSearch__fusion-framework__ApiKey=${input:azure-framework-key}",
        "-e", "AzureSearch__fusion-docs__ApiKey=${input:azure-docs-key}",
        "-e", "Foundry__ApiKey=${input:foundry-key}",

        "ghcr.io/equinor/fusion-poc-mcp:v1"
      ]
    }
  },
  "inputs": [
    {
      "id": "azure-framework-key",
      "type": "promptString",
      "description": "Azure Search API key for fusion-framework index",
      "password": true
    },
    {
      "id": "azure-docs-key",
      "type": "promptString",
      "description": "Azure Search API key for fusion-docs index",
      "password": true
    },
    {
      "id": "foundry-key",
      "type": "promptString",
      "description": "Foundry API key",
      "password": true
    }
  ]
}
```

## Platform/runtime notes

- Apple Silicon with `amd64`-only image: add Docker arg `"--platform", "linux/amd64"`.
- If you need persistent `/tmp` state for skills DB/cache, replace `--tmpfs /tmp...` with a Docker volume mount.
- Prefer pinned release tags (`:v1`, `:v1.2.3`) over `:latest` for predictable behavior.

## Verification checklist

Use this lightweight smell test instead of a fixed tool-name check:

- Run `initialize` and confirm successful handshake.
- Run `tools/list` and confirm at least one tool is returned.
- Pick one non-destructive tool from the returned list and run `tools/call`.
- Pass criteria: response is non-empty (`content` or `structuredContent` contains data).
- Fail criteria: empty tool list or empty/failed tool response; treat as setup failure and apply troubleshooting below.

Examples of tools often seen today include `search_index`, `search_indexes_describe`, `search_metadata_types`, and `skills`, but this set can evolve.

If running locally for quick validation, use upstream smoke checks:

```bash
bash scripts/demo.sh smoke
bash scripts/mcp-skills-smoke-check.sh
```

## Troubleshooting quick map

- `403` / `unauthorized` pulling image: refresh GH auth + Docker login to GHCR.
- `no matching manifest for linux/arm64/v8`: add `--platform linux/amd64`.
- Tools missing in client: re-check env variable names and API-key availability.

## Sources

- https://github.com/equinor/fusion-poc-mcp/blob/main/README.md
- https://github.com/equinor/fusion-poc-mcp/blob/main/contribute/setup.md
- https://github.com/equinor/fusion-poc-mcp/blob/main/contribute/configuration.md
- https://github.com/equinor/fusion-poc-mcp/blob/main/contribute/testing.md

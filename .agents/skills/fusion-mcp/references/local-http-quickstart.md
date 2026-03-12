# Local build + HTTP endpoint quickstart (Fusion MCP)

Use this reference when the user wants to run `fusion-poc-mcp` locally and validate its HTTP health and MCP readiness.

## Prerequisites

- Docker Desktop (or Docker Engine + Compose)
- Required configuration values available for:
  - `AzureSearch__*`
  - `Foundry__*`

Do not request users to paste secrets into chat.

## Quick setup

1. Copy env template:

```bash
cp .env.example .env
```

2. Populate required env values in `.env`.

3. Start the API:

```bash
docker compose up -d --build api
```

4. Verify service health:

```bash
curl -sS http://localhost:${HOST_PORT:-8080}/health
```

5. Run baseline smoke validation:

```bash
bash scripts/demo.sh smoke
```

## Expected MCP outcome

A healthy setup should return a non-empty tool list and support at least one successful non-destructive MCP `tools/call`.

Examples of tools often seen today include `search_index`, `search_indexes_describe`, `search_metadata_types`, and `skills`, but this list can evolve.

For `skills`-focused verification:

```bash
bash scripts/mcp-skills-smoke-check.sh
```

## Common fixes

- Health check fails: verify `.env` values and restart with `docker compose up -d --build api`.
- Tools missing or partial behavior: verify Azure Search/Foundry env names and key availability.
- Port conflict: set `HOST_PORT` in `.env` to a free port and retry.

## Related references

- VS Code MCP config example: [vscode-mcp-config.md](vscode-mcp-config.md)

## Sources

- https://github.com/equinor/fusion-poc-mcp/blob/main/README.md
- https://github.com/equinor/fusion-poc-mcp/blob/main/contribute/setup.md
- https://github.com/equinor/fusion-poc-mcp/blob/main/contribute/configuration.md
- https://github.com/equinor/fusion-poc-mcp/blob/main/contribute/testing.md

# Fusion MCP references

Use this folder for concrete setup playbooks that support `fusion-mcp`.

Current iteration scope: VS Code MCP client configuration with Docker `stdio` transport and local HTTP endpoint validation quickstart.

## Choose the right guide

- [vscode-mcp-config.md](vscode-mcp-config.md)
  - Use when the user needs VS Code MCP client configuration with Docker `stdio`.
  - Includes GHCR auth, config template, validation checks, and troubleshooting.

- [local-http-quickstart.md](local-http-quickstart.md)
  - Use when the user wants to build/run locally and verify via HTTP endpoint.
  - Includes local compose flow, health checks, smoke checks, and common fixes.

- [mcp-call-snippets.md](mcp-call-snippets.md)
  - Use when the user asks for copy/paste MCP JSON-RPC payload examples.
  - Includes request payloads and expected response shapes.

## Source of truth

- Upstream repo: https://github.com/equinor/fusion-poc-mcp
- Upstream README: https://github.com/equinor/fusion-poc-mcp/blob/main/README.md
- Upstream contribute docs: https://github.com/equinor/fusion-poc-mcp/tree/main/contribute

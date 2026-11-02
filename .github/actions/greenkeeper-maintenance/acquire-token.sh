#!/usr/bin/env bash
set -euo pipefail

[[ "$AZURE_CONFIG_DIR" == "$RUNNER_TEMP/greenkeeper-azure" ]] ||
  { echo "::error::Use the isolated Greenkeeper Azure session."; exit 1; }

# Fusion AI and Fusion MCP are separate resources; a token for one is rejected by the other.
ai="$(az account get-access-token \
  --scope 0ec6e8f2-d309-4316-90e6-1d05628b5f07/.default \
  --query accessToken --output tsv)"
[[ -n "$ai" && "$ai" != *$'\n'* && "$ai" != *$'\r'* ]] ||
  { echo "::error::Azure did not return a single-line Fusion AI token."; exit 1; }
printf '::add-mask::%s\n' "$ai"
mcp="$(az account get-access-token \
  --scope 667fbbb5-3c45-4dad-affe-6fe4e323bcde/.default \
  --query accessToken --output tsv)"
[[ -n "$mcp" && "$mcp" != *$'\n'* && "$mcp" != *$'\r'* ]] ||
  { echo "::error::Azure did not return a single-line Fusion MCP token."; exit 1; }
printf '::add-mask::%s\n' "$mcp"
printf 'token=%s\nmcp-token=%s\n' "$ai" "$mcp" >> "$GITHUB_OUTPUT"

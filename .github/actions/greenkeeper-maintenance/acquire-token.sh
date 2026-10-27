#!/usr/bin/env bash
set -euo pipefail

[[ "$AZURE_CONFIG_DIR" == "$RUNNER_TEMP/greenkeeper-azure" ]] ||
  { echo "::error::Use the isolated Greenkeeper Azure session."; exit 1; }
token="$(az account get-access-token \
  --scope 0ec6e8f2-d309-4316-90e6-1d05628b5f07/.default \
  --query accessToken --output tsv)"
[[ -n "$token" && "$token" != *$'\n'* && "$token" != *$'\r'* ]] ||
  { echo "::error::Azure did not return a single-line Fusion AI token."; exit 1; }
printf '::add-mask::%s\n' "$token"
printf 'token=%s\n' "$token" >> "$GITHUB_OUTPUT"

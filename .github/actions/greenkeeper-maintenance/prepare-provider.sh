#!/usr/bin/env bash
set -euo pipefail

[[ "$PROVIDER_ENV" == "$RUNNER_TEMP/copilot-provider-"*".env" && -f "$PROVIDER_ENV" && ! -L "$PROVIDER_ENV" ]] ||
  { echo "::error::Expected the provider file created by Framework's trusted authentication action."; exit 1; }
trap 'rm -f -- "$PROVIDER_ENV"' EXIT

# The existing authentication action writes shell-escaped exports to this private, same-job file.
# shellcheck disable=SC1090
source "$PROVIDER_ENV"
[[ -n "${COPILOT_PROVIDER_BEARER_TOKEN:-}" &&
   "$COPILOT_PROVIDER_BEARER_TOKEN" != *$'\n'* &&
   "$COPILOT_PROVIDER_BEARER_TOKEN" != *$'\r'* ]] ||
  { echo "::error::The Framework provider did not supply a single-line AI token."; exit 1; }
[[ "${COPILOT_PROVIDER_BASE_URL:-}" =~ ^https://[A-Za-z0-9./:_-]+$ ]] ||
  { echo "::error::The Framework provider did not supply a valid HTTPS AI endpoint."; exit 1; }
printf '::add-mask::%s\n' "$COPILOT_PROVIDER_BEARER_TOKEN"
{
  printf 'token=%s\n' "$COPILOT_PROVIDER_BEARER_TOKEN"
  printf 'base-url=%s\n' "$COPILOT_PROVIDER_BASE_URL"
} >> "$GITHUB_OUTPUT"

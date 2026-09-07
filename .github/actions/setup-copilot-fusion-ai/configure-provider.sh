#!/usr/bin/env bash
set -euo pipefail

[[ "$FUSION_ENVIRONMENT" =~ ^[a-z][a-z0-9-]{1,15}$ ]]
[[ "$WIRE_MODEL" =~ ^gpt-[a-zA-Z0-9.-]+$ ]]
[[ "$AZURE_CONFIG_DIR" == "$RUNNER_TEMP/"* ]]

discovery_token="$(
  az account get-access-token \
    --scope '5a842df8-3238-415d-b168-9f16a6a6031b/.default' \
    --query accessToken \
    --output tsv
)"
echo "::add-mask::$discovery_token"

service="$(
  curl --fail-with-body --silent --show-error \
    --header "Authorization: Bearer ${discovery_token}" \
    "https://discovery.fusion.equinor.com/service-registry/environments/${FUSION_ENVIRONMENT}/services" |
    jq --exit-status 'map(select(.key == "ai")) | first'
)"
endpoint="$(jq --exit-status --raw-output '.uri' <<< "$service")"
scope="$(jq --exit-status --raw-output '.scopes[0]' <<< "$service")"
[[ "$endpoint" == https://* ]]
[[ -n "$scope" && "$scope" != null ]]

token="$(
  az account get-access-token \
    --scope "$scope" \
    --query accessToken \
    --output tsv
)"
echo "::add-mask::$token"

env_file="$RUNNER_TEMP/copilot-provider-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}.env"
umask 077
{
  printf 'export COPILOT_PROVIDER_TYPE=%q\n' azure
  printf 'export COPILOT_PROVIDER_BASE_URL=%q\n' "${endpoint%/}"
  printf 'export COPILOT_PROVIDER_BEARER_TOKEN=%q\n' "$token"
  printf 'export COPILOT_PROVIDER_MODEL_ID=%q\n' gpt-5.4
  printf 'export COPILOT_PROVIDER_WIRE_MODEL=%q\n' "$WIRE_MODEL"
  printf 'export COPILOT_PROVIDER_AZURE_API_VERSION=%q\n' 2025-01-01-preview
  printf 'export COPILOT_PROVIDER_WIRE_API=%q\n' completions
} > "$env_file"
chmod 600 "$env_file"

# Copilot receives only the scoped inference token; generated code cannot reuse Azure CLI login.
az logout
az account clear
rm -rf "$AZURE_CONFIG_DIR"
printf 'env-file=%s\n' "$env_file" >> "$GITHUB_OUTPUT"

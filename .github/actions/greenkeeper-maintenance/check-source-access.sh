#!/usr/bin/env bash
set -euo pipefail

[[ -n "${GH_TOKEN:-}" && "$GH_TOKEN" != *$'\n'* && "$GH_TOKEN" != *$'\r'* ]] ||
  { echo "::error::GREENKEEPER_SOURCE_TOKEN is missing or malformed."; exit 1; }
[[ "$RUNNER_REF" =~ ^[0-9a-f]{40}$ ]] ||
  { echo "::error::Source access diagnostics require a full runner commit SHA."; exit 1; }

umask 077
diagnostic="$(mktemp -d "$RUNNER_TEMP/greenkeeper-source-access.XXXXXX")"
trap 'rm -f -- "$diagnostic/headers" "$diagnostic/body"; rmdir -- "$diagnostic"' EXIT

for resource in \
  repos/equinor/fusion-poc-greenkeeper \
  "repos/equinor/fusion-poc-greenkeeper/git/commits/$RUNNER_REF"; do
  status="$(curl --silent --show-error --connect-timeout 15 --max-time 30 \
    --header "Authorization: Bearer $GH_TOKEN" \
    --header 'Accept: application/vnd.github+json' \
    --header 'X-GitHub-Api-Version: 2022-11-28' \
    --dump-header "$diagnostic/headers" --output "$diagnostic/body" \
    --write-out '%{http_code}' "https://api.github.com/$resource")"
  printf 'Greenkeeper source API: %s -> HTTP %s\n' "$resource" "$status"
  # Response bodies can contain private source. Print only these authorization diagnostic headers.
  awk '{
    key = tolower($1)
    if (key == "x-github-sso:" || key == "x-accepted-github-permissions:" ||
        key == "x-ratelimit-remaining:" || key == "x-ratelimit-reset:") {
      sub(/\r$/, "")
      print
    }
  }' "$diagnostic/headers"
  case "$status" in
    200) ;;
    401) echo "::error::GitHub rejected GREENKEEPER_SOURCE_TOKEN as invalid or expired."; exit 1 ;;
    403) echo "::error::GitHub forbids this token's source access. Check organization approval, token permissions, policy restrictions and reported rate limits."; exit 1 ;;
    404) echo "::error::The token cannot see the private repository or pinned commit. Check resource owner, selected repository, organization approval and the commit pin."; exit 1 ;;
    *) echo "::error::Unexpected GitHub source-access response: HTTP $status."; exit 1 ;;
  esac
done
echo 'The source token can read repository metadata and the pinned Git commit through the API.'
echo 'Git checkout is the next independent test; API success alone does not prove Git transport access.'

#!/usr/bin/env bash
set -euo pipefail

fail() { echo "::error::$*" >&2; exit 1; }

[[ "$GITHUB_REPOSITORY" =~ ^equinor/[A-Za-z0-9_.-]+$ ]] || fail "An Equinor caller repository is required."
[[ "$GITHUB_EVENT_NAME" =~ ^(push|schedule|workflow_dispatch)$ ]] || fail "Untrusted events cannot run dependency maintenance."
for image in "$ORCHESTRATOR_IMAGE" "$GREENKEEPER_IMAGE" "$GREENKEEPER_GATEWAY_IMAGE"; do
  [[ "$image" =~ ^ghcr\.io/equinor/fusion-poc-greenkeeper(@sha256:[a-f0-9]{64}|:[a-z]+(-[a-z]+)*-main)$ ]] ||
    fail "Greenkeeper images must be digests or main channel tags of ghcr.io/equinor/fusion-poc-greenkeeper."
done
[[ -n "$GH_TOKEN" && -n "$FUSION_AI_TOKEN" && -n "${FUSION_MCP_TOKEN:-}" ]] ||
  fail "Caller read and acquired AI and MCP tokens are required."
[[ -n "${GREENKEEPER_PUBLISH_TOKEN:-}" ]] || fail "Dependency maintenance publishes; a separate Framework write token is required."
# Scheduled events carry no repository payload, so the default branch is read from the API.
default_branch="$(gh api "repos/$GITHUB_REPOSITORY" --jq .default_branch)"
git check-ref-format --branch "$default_branch"
[[ "$GITHUB_REF" == "refs/heads/$default_branch" ]] || fail "Run dependency maintenance from the default branch."

# A channel tag can move; resolve each image once so the whole run uses one exact digest.
resolve() {
  local digest
  docker pull --quiet "$1" > /dev/null
  digest="$(docker image inspect --format '{{range .RepoDigests}}{{println .}}{{end}}' "$1" |
    grep -m 1 '^ghcr\.io/equinor/fusion-poc-greenkeeper@sha256:')"
  [[ "$digest" =~ ^ghcr\.io/equinor/fusion-poc-greenkeeper@sha256:[a-f0-9]{64}$ ]] ||
    fail "Could not resolve $1 to a digest."
  printf '%s' "$digest"
}
ORCHESTRATOR_IMAGE="$(resolve "$ORCHESTRATOR_IMAGE")"
GREENKEEPER_IMAGE="$(resolve "$GREENKEEPER_IMAGE")"
GREENKEEPER_GATEWAY_IMAGE="$(resolve "$GREENKEEPER_GATEWAY_IMAGE")"
export GREENKEEPER_IMAGE GREENKEEPER_GATEWAY_IMAGE
scratch="$(mktemp -d "$RUNNER_TEMP/greenkeeper-maintenance.XXXXXX")"

revision="$(gh api "repos/$GITHUB_REPOSITORY/git/ref/heads/$default_branch" --jq .object.sha)"
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || fail "Default branch did not resolve to a full SHA."
{
  echo '## Greenkeeper dependency maintenance'
  printf '\nDefault-branch commit: %s\n\n' "$revision"
  # shellcheck disable=SC2016 # Literal Markdown backticks.
  printf 'Images: orchestrator `%s`, sandbox `%s`, gateway `%s`\n\n' \
    "$ORCHESTRATOR_IMAGE" "$GREENKEEPER_IMAGE" "$GREENKEEPER_GATEWAY_IMAGE"
  # shellcheck disable=SC2016 # Literal Markdown backticks.
  echo 'Greenkeeper combines open Dependabot updates on `greenkeeper/dependencies` and opens or updates one pull request into the default branch. Nothing merges automatically.'
} >> "$GITHUB_STEP_SUMMARY"

# Sibling sandboxes use the host Docker daemon, so scratch paths must be identical inside and outside the orchestrator.
mkdir "$scratch/tmp"
export GREENKEEPER_REPOSITORY="$GITHUB_REPOSITORY"
export GREENKEEPER_REVISION="$revision"
export GREENKEEPER_OUTPUT_PATH="$scratch/results"
export GREENKEEPER_TIMEOUT_SECONDS=900
export GREENKEEPER_MODEL=gpt-6.1-sol
export GREENKEEPER_WORKER_MODEL=gpt-6-luna
export FUSION_AI_BASE_URL=https://ai.api.fusion.equinor.com/openai/v1
export FUSION_MCP_URL=https://mcp.api.fusion.equinor.com/mcp
status=0
docker run --rm --init --user "$(id -u):$(id -g)" \
  --read-only --cap-drop ALL --security-opt no-new-privileges \
  --tmpfs "/tmp:rw,nosuid,nodev" \
  --group-add "$(stat -c '%g' /var/run/docker.sock)" \
  --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
  --mount "type=bind,source=$scratch,target=$scratch" \
  --env "TMPDIR=$scratch/tmp" \
  --env GREENKEEPER_REPOSITORY --env GREENKEEPER_REVISION --env GREENKEEPER_OUTPUT_PATH \
  --env GREENKEEPER_PUBLISH_TOKEN --env GREENKEEPER_IMAGE --env GREENKEEPER_GATEWAY_IMAGE \
  --env GREENKEEPER_TIMEOUT_SECONDS --env GREENKEEPER_MODEL --env GREENKEEPER_WORKER_MODEL \
  --env GH_TOKEN --env FUSION_APM_TOKEN --env FUSION_AI_TOKEN --env FUSION_MCP_TOKEN \
  --env FUSION_AI_BASE_URL --env FUSION_MCP_URL \
  "$ORCHESTRATOR_IMAGE" --task dependencies --mode maintenance || status=$?
if [[ -f "$scratch/results/dependency-run.md" ]]; then
  cat "$scratch/results/dependency-run.md" >> "$GITHUB_STEP_SUMMARY"
fi
exit "$status"

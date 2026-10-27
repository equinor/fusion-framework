#!/usr/bin/env bash
set -euo pipefail

fail() { echo "::error::$*" >&2; exit 1; }

[[ "$GITHUB_REPOSITORY" =~ ^equinor/[A-Za-z0-9_.-]+$ ]] || fail "An Equinor caller repository is required."
[[ "$GITHUB_EVENT_NAME" == push || "$GITHUB_EVENT_NAME" == workflow_dispatch ]] || fail "Untrusted events cannot run maintenance."
[[ "$TASK" == dependency ]] || fail "Only dependency maintenance is supported."
[[ "$EXPORT_ONLY" == true || "$EXPORT_ONLY" == false ]] || fail "export-only must be true or false."
if [[ -n "$PREVIEW_POLICY_REVISION" ]]; then
  [[ "$GITHUB_EVENT_NAME" == workflow_dispatch && "$EXPORT_ONLY" == true && -z "${GREENKEEPER_PUBLISH_TOKEN:-}" &&
     "$PREVIEW_POLICY_REVISION" =~ ^[0-9a-f]{40}$ && "$PREVIEW_POLICY_REVISION" == "$GITHUB_SHA" ]] ||
    fail "Preview requires manual export-only execution at the exact caller SHA without a publisher."
else
  [[ "$GITHUB_REF" == "refs/heads/$DEFAULT_BRANCH" ]] || fail "Run production maintenance from the default branch."
fi
for image in "$ORCHESTRATOR_IMAGE" "$GREENKEEPER_IMAGE" "$GREENKEEPER_GATEWAY_IMAGE"; do
  [[ "$image" =~ ^ghcr\.io/equinor/fusion-poc-greenkeeper@sha256:[a-f0-9]{64}$ ]] ||
    fail "All three Greenkeeper images must use reviewed immutable digests."
done
[[ -n "$GH_TOKEN" && -n "$FUSION_AI_TOKEN" ]] || fail "Caller read and acquired AI tokens are required."
[[ "$EXPORT_ONLY" == true || -n "${GREENKEEPER_PUBLISH_TOKEN:-}" ]] || fail "Publishing requires a separate Framework write token."

for image in "$ORCHESTRATOR_IMAGE" "$GREENKEEPER_IMAGE" "$GREENKEEPER_GATEWAY_IMAGE"; do
  docker pull "$image"
done
tasks="$(cd "$(dirname "${BASH_SOURCE[0]}")/tasks" && pwd)"
scratch="$(mktemp -d "$RUNNER_TEMP/greenkeeper-maintenance.XXXXXX")"
container=(docker run --rm --init --user "$(id -u):$(id -g)"
  --read-only --cap-drop ALL --security-opt no-new-privileges
  --tmpfs "/tmp:rw,nosuid,nodev"
  --mount "type=bind,source=$tasks,target=/tasks,readonly"
  --env GREENKEEPER_TASKS_PATH=/tasks)

onto="$(gh api "repos/$GITHUB_REPOSITORY" --jq .default_branch)"
git check-ref-format --branch "$onto"
revision="$(gh api "repos/$GITHUB_REPOSITORY/git/ref/heads/$onto" --jq .object.sha)"
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || fail "Default branch did not resolve to a full SHA."
policy_revision="${PREVIEW_POLICY_REVISION:-$revision}"
gh api "repos/$GITHUB_REPOSITORY/contents/.github/greenkeeper.yml?ref=$policy_revision" \
  -H 'Accept: application/vnd.github.raw+json' > "$scratch/policy.yml"
branch="$("${container[@]}" --network none \
  --mount "type=bind,source=$scratch/policy.yml,target=/policy.yml,readonly" \
  "$ORCHESTRATOR_IMAGE" --dependency-branch /policy.yml)"
git check-ref-format --branch "$branch"
[[ "$branch" != "$onto" ]] || fail "The dependency branch must differ from the default branch."

prs='[]'
for page in {1..10}; do
  batch="$(gh api "repos/$GITHUB_REPOSITORY/pulls?state=open&per_page=100&page=$page")"
  selected="$(jq --compact-output --arg repo "$GITHUB_REPOSITORY" \
    '[.[] | select(.user.login == "dependabot[bot]" and .head.repo.full_name == $repo) | .number]' <<< "$batch")"
  prs="$(jq --compact-output --argjson selected "$selected" '. + $selected' <<< "$prs")"
  if [[ "$(jq length <<< "$batch")" -lt 100 ]]; then break; fi
  [[ "$page" -lt 10 ]] || fail "PR inventory exceeds ten pages; refusing incomplete discovery."
done
count="$(jq length <<< "$prs")"
head="$(gh api "repos/$GITHUB_REPOSITORY/git/matching-refs/heads/$branch" |
  jq --exit-status --raw-output --arg ref "refs/heads/$branch" '
    [.[] | select(.ref == $ref)] |
    if length == 0 then "missing"
    elif length == 1 then .[0].object.sha
    else error("Ambiguous dependency branch") end')"
maintain=false
if [[ "$head" == missing ]]; then
  if [[ "$count" == 0 ]]; then
    status='No branch and no open Dependabot PRs; nothing to maintain.'
  elif [[ "$EXPORT_ONLY" == true ]]; then
    status='Dependency branch missing; export-only run proposes creation from the default branch.'
  else
    current="$(gh api "repos/$GITHUB_REPOSITORY/git/ref/heads/$onto" --jq .object.sha)"
    [[ "$current" == "$revision" ]] || fail "Default branch moved after policy was read; retry."
    GH_TOKEN="$GREENKEEPER_PUBLISH_TOKEN" gh api --method POST "repos/$GITHUB_REPOSITORY/git/refs" \
      -f ref="refs/heads/$branch" -f sha="$revision" |
      jq --exit-status --arg ref "refs/heads/$branch" --arg sha "$revision" \
        '.ref == $ref and .object.sha == $sha' > /dev/null
    status='Created the dependency branch from the confirmed default-branch commit.'
  fi
else
  [[ "$head" =~ ^[0-9a-f]{40}$ ]] || fail "Dependency branch did not resolve to a full SHA."
  comparison="$(gh api "repos/$GITHUB_REPOSITORY/compare/$revision...$head" --jq .status)"
  case "$comparison" in
    ahead|identical) status='Dependency branch already includes the default branch; no rebase needed.' ;;
    behind|diverged) maintain=true; status='Dependency branch is outdated; continue with Git-first rebase maintenance.' ;;
    *) fail "Unexpected branch comparison status: $comparison" ;;
  esac
fi
{
  echo '## Dependency maintenance inventory'
  printf '\nOpen Dependabot PRs: %s\n\nPR numbers: %s\n' "$count" "$prs"
  printf '\nDependency branch: %s\n\nPolicy commit: %s\n\nDefault-branch commit: %s\n\n%s\n' \
    "$branch" "$policy_revision" "$revision" "$status"
} >> "$GITHUB_STEP_SUMMARY"
[[ "$maintain" == true ]] || exit 0

# Sibling workers use the host Docker daemon, so scratch paths must be identical inside and outside the orchestrator.
mkdir "$scratch/tmp"
export GREENKEEPER_REPOSITORY="$GITHUB_REPOSITORY"
export GREENKEEPER_REVISION="$head"
export GREENKEEPER_POLICY_REVISION="$revision"
export GREENKEEPER_OUTPUT_PATH="$scratch/results"
export GREENKEEPER_EXPORT_ONLY="$EXPORT_ONLY"
export GREENKEEPER_ALLOW_PUBLISH=false
if [[ "$EXPORT_ONLY" == false ]]; then export GREENKEEPER_ALLOW_PUBLISH=true; fi
export GREENKEEPER_TIMEOUT_SECONDS=900
export GREENKEEPER_MODEL=gpt-6.1-sol
export FUSION_AI_BASE_URL=https://ai.api.fusion.equinor.com/openai/v1
export FUSION_MCP_URL=https://mcp.api.fusion.equinor.com/mcp
"${container[@]}" \
  --group-add "$(stat -c '%g' /var/run/docker.sock)" \
  --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
  --mount "type=bind,source=$scratch,target=$scratch" \
  --env "TMPDIR=$scratch/tmp" \
  --env GREENKEEPER_REPOSITORY --env GREENKEEPER_REVISION --env GREENKEEPER_POLICY_REVISION \
  --env GREENKEEPER_OUTPUT_PATH --env GREENKEEPER_EXPORT_ONLY --env GREENKEEPER_ALLOW_PUBLISH \
  --env GREENKEEPER_PUBLISH_TOKEN --env GREENKEEPER_IMAGE --env GREENKEEPER_GATEWAY_IMAGE \
  --env GREENKEEPER_TIMEOUT_SECONDS --env GREENKEEPER_MODEL \
  --env GH_TOKEN --env FUSION_APM_TOKEN --env FUSION_AI_TOKEN --env FUSION_AI_BASE_URL --env FUSION_MCP_URL \
  "$ORCHESTRATOR_IMAGE" --rebase-branch "$branch" --onto "$onto" --validation pnpm

#!/usr/bin/env bash
set -euo pipefail

default_branch="$(
  gh api "repos/${REPOSITORY}" --jq '.default_branch'
)"
default_sha="$(
  gh api "repos/${REPOSITORY}/git/ref/heads/${default_branch}" --jq '.object.sha'
)"

# Only a confirmed missing ref is safe to recreate; API failures must not imply absence.
branch_response="$RUNNER_TEMP/maintenance-branch-response"
branch_exists=true
if gh api "repos/${REPOSITORY}/git/ref/heads/${MAINTENANCE_BRANCH}" \
  --include > "$branch_response"; then
  branch_exists=true
elif [[ "$(awk '/^HTTP/ {print $2}' "$branch_response")" == 404 ]]; then
  branch_exists=false
else
  echo "::error::Unable to check ${MAINTENANCE_BRANCH}."
  cat "$branch_response" >&2
  exit 1
fi

if [[ "$branch_exists" == false ]]; then
  gh api \
    --method POST \
    "repos/${REPOSITORY}/git/refs" \
    --field ref="refs/heads/${MAINTENANCE_BRANCH}" \
    --field sha="$default_sha"
  exit 0
fi

if [[ "$OPERATION" == initialize ]]; then
  echo "::error::${MAINTENANCE_BRANCH} already exists; use reset after promotion."
  exit 1
fi

# Recovery must never discard dependency updates already accumulated in the stream.
if [[ "$OPERATION" == ensure ]]; then
  echo "${MAINTENANCE_BRANCH} already exists; leaving it unchanged."
  exit 0
fi

open_prs="$(
  gh pr list \
    --repo "$REPOSITORY" \
    --state open \
    --base "$MAINTENANCE_BRANCH" \
    --json number \
    --jq 'length'
)"
if [[ "$open_prs" != 0 ]]; then
  echo "::error::Cannot reset while ${open_prs} pull request(s) target ${MAINTENANCE_BRANCH}."
  exit 1
fi

git fetch origin "$default_branch" "$MAINTENANCE_BRANCH"
if ! git diff --quiet "origin/${default_branch}" "origin/${MAINTENANCE_BRANCH}"; then
  echo "::error::Cannot reset because the maintenance branch contains unpromoted changes."
  exit 1
fi

gh api \
  --method PATCH \
  "repos/${REPOSITORY}/git/refs/heads/${MAINTENANCE_BRANCH}" \
  --field sha="$default_sha" \
  -F force=true

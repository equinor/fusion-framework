#!/usr/bin/env bash
set -euo pipefail

case "$OPERATION" in
  ensure|initialize|sync|reset) ;;
  *)
    echo "::error::Unknown maintenance operation: ${OPERATION}."
    exit 1
    ;;
esac

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "updated=false" >> "$GITHUB_OUTPUT"
  echo "has-changes=false" >> "$GITHUB_OUTPUT"
fi

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

if [[ "$OPERATION" == sync ]]; then
  git fetch origin \
    "+refs/heads/${default_branch}:refs/remotes/origin/${default_branch}" \
    "+refs/heads/${MAINTENANCE_BRANCH}:refs/remotes/origin/${MAINTENANCE_BRANCH}"
  base_ref="origin/${default_branch}"
  expected_sha="$(git rev-parse "origin/${MAINTENANCE_BRANCH}")"
  if git merge-base --is-ancestor "$base_ref" "$expected_sha"; then
    echo "${MAINTENANCE_BRANCH} already includes ${default_branch}."
    exit 0
  else
    status=$?
    if [[ "$status" != 1 ]]; then
      echo "::error::Unable to compare maintenance branch ancestry."
      exit "$status"
    fi
  fi

  git config user.name github-actions[bot]
  git config user.email 41898282+github-actions[bot]@users.noreply.github.com
  git -c core.hooksPath=/dev/null switch --detach "$expected_sha"
  # The write-enabled job must not execute hooks or dependency code from the stream.
  if ! git -c core.hooksPath=/dev/null rebase --no-autostash "$base_ref"; then
    echo "::error::Cannot rebase ${MAINTENANCE_BRANCH} onto ${default_branch}; resolve conflicts manually. The remote branch was not changed."
    exit 1
  fi

  has_changes=false
  if git diff --quiet "$base_ref" HEAD; then
    has_changes=false
  else
    status=$?
    if [[ "$status" != 1 ]]; then
      echo "::error::Unable to compare the rebased maintenance stream."
      exit "$status"
    fi
    has_changes=true
  fi

  git -c core.hooksPath=/dev/null push \
    --force-with-lease="refs/heads/${MAINTENANCE_BRANCH}:${expected_sha}" \
    origin "HEAD:refs/heads/${MAINTENANCE_BRANCH}"
  {
    echo "updated=true"
    echo "has-changes=${has_changes}"
  } >> "$GITHUB_OUTPUT"
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

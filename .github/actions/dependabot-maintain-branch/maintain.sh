#!/usr/bin/env bash
set -euo pipefail

# The pull request branch is checked out beside trusted action code, never over it.
if [[ "$WORKING_DIRECTORY" = /* || "$WORKING_DIRECTORY" == *..* ]]; then
  echo "::error::working-directory must be a relative path inside the workspace."
  exit 1
fi
cd "$WORKING_DIRECTORY"

git config user.name github-actions[bot]
git config user.email 41898282+github-actions[bot]@users.noreply.github.com
git fetch origin "$BASE_REF"

if [[ "$VERDICT" != merge ]]; then
  echo "head_sha=$EXPECTED_HEAD_SHA" >> "$GITHUB_OUTPUT"
  echo "ready=false" >> "$GITHUB_OUTPUT"
  echo "updated=false" >> "$GITHUB_OUTPUT"
  echo "The current research verdict does not recommend merging."
  exit 0
fi
# Readiness is not a gate: a missing changeset or an outdated branch reads as "needs changes",
# and this action exists to fix exactly those. Required checks still gate the merge itself.
if [[ "$OPERATION" == maintain && "$CONFIDENCE" != high ]]; then
  echo "head_sha=$EXPECTED_HEAD_SHA" >> "$GITHUB_OUTPUT"
  echo "ready=false" >> "$GITHUB_OUTPUT"
  echo "updated=false" >> "$GITHUB_OUTPUT"
  echo "Automatic maintenance requires high confidence."
  exit 0
fi

has_pr_changeset() {
  local package="$1"
  local changeset
  while read -r changeset; do
    if [[ -f "$changeset" ]] && grep -Fq "\"${package}\":" "$changeset"; then
      return 0
    fi
  done < <(
    git diff --name-only \
      "$(git merge-base "origin/${BASE_REF}" HEAD)...HEAD" \
      -- '.changeset/*.md'
  )
  return 1
}

mapfile -t manifests < <(
  git diff --name-only "$(git merge-base "origin/${BASE_REF}" HEAD)...HEAD" |
    grep -E '^(packages/.+|cookbooks/[^/]+)/package\.json$' || true
)
changeset_required=false
for manifest in "${manifests[@]}"; do
  package="$(jq --raw-output '.name' "$manifest")"
  if [[ "$manifest" == packages/* ]] &&
    ! jq --exit-status '.publishConfig != null' "$manifest" >/dev/null; then
    continue
  fi
  if ! has_pr_changeset "$package"; then
    changeset_required=true
    break
  fi
done

mergeable=UNKNOWN
for attempt in {1..5}; do
  mergeable="$(
    gh pr view "$PR_NUMBER" --repo "$REPOSITORY" --json mergeable --jq '.mergeable'
  )"
  if [[ "$mergeable" != UNKNOWN ]]; then
    break
  fi
  if [[ "$attempt" -lt 5 ]]; then
    sleep 2
  fi
done
if [[ "$mergeable" = UNKNOWN ]]; then
  echo "head_sha=$EXPECTED_HEAD_SHA" >> "$GITHUB_OUTPUT"
  echo "ready=false" >> "$GITHUB_OUTPUT"
  echo "updated=false" >> "$GITHUB_OUTPUT"
  echo "::notice::GitHub is still calculating mergeability; branch maintenance was deferred."
  exit 0
fi
if [[ "$mergeable" = CONFLICTING ]]; then
  marker="<!-- fusion-ai-dependabot-rebase:${EXPECTED_HEAD_SHA} -->"
  requested="$(
    gh api --paginate "repos/${REPOSITORY}/issues/${PR_NUMBER}/comments" \
      --jq ".[] | select(.body | contains(\"${marker}\")) | .id" \
      | head -n 1
  )"
  if [[ -z "$requested" ]]; then
    gh pr comment "$PR_NUMBER" \
      --repo "$REPOSITORY" \
      --body "${marker}
@dependabot rebase"
  fi
  echo "head_sha=$EXPECTED_HEAD_SHA" >> "$GITHUB_OUTPUT"
  echo "ready=false" >> "$GITHUB_OUTPUT"
  echo "updated=false" >> "$GITHUB_OUTPUT"
  echo "::notice::Dependabot was asked to rebase the conflicting branch."
  exit 0
fi
if [[ "$changeset_required" = true ]]; then
  if ! git rebase "origin/$BASE_REF"; then
    git rebase --abort
    echo "::error::Could not update the branch before adding its required changesets."
    exit 1
  fi
fi

mapfile -t manifests < <(
  git diff --name-only "$(git merge-base "origin/${BASE_REF}" HEAD)...HEAD" |
    grep -E '^(packages/.+|cookbooks/[^/]+)/package\.json$' || true
)
for manifest in "${manifests[@]}"; do
  package="$(jq --raw-output '.name' "$manifest")"
  if [[ "$manifest" == packages/* ]] &&
    ! jq --exit-status '.publishConfig != null' "$manifest" >/dev/null; then
    continue
  fi
  if has_pr_changeset "$package"; then
    continue
  fi

  slug="$(
    tr '/@_' '---' <<< "$package" |
      tr -c 'a-zA-Z0-9-' '-' |
      cut -c1-18
  )"
  package_hash="$(printf '%s' "$package" | sha256sum | cut -c1-8)"
  changeset=".changeset/dependency-${PR_NUMBER}-${slug}-${package_hash}.md"
  {
    echo '---'
    echo "\"${package}\": patch"
    echo '---'
    echo
    echo "Internal: ${UPDATE_SUMMARY}."
  } > "$changeset"
  git add "$changeset"
done

if ! git diff --cached --quiet; then
  git commit -m "chore(deps): add required changesets"
fi

new_head="$(git rev-parse HEAD)"
echo "head_sha=$new_head" >> "$GITHUB_OUTPUT"
echo "ready=true" >> "$GITHUB_OUTPUT"
if [[ "$new_head" = "$EXPECTED_HEAD_SHA" ]]; then
  echo "updated=false" >> "$GITHUB_OUTPUT"
  echo "The branch has no conflicts and all required changesets already exist."
  exit 0
fi
echo "updated=true" >> "$GITHUB_OUTPUT"

git push \
  --force-with-lease="refs/heads/${HEAD_REF}:${EXPECTED_HEAD_SHA}" \
  origin "HEAD:${HEAD_REF}"

gh workflow run pr.yml \
  --repo "$REPOSITORY" \
  --ref "$HEAD_REF" \
  -f head_sha="$new_head" \
  -f pr_number="$PR_NUMBER"
gh workflow run visual-checks.yml \
  --repo "$REPOSITORY" \
  --ref "$HEAD_REF" \
  -f head_sha="$new_head" \
  -f pr_number="$PR_NUMBER"
gh workflow run agent-context.yml \
  --repo "$REPOSITORY" \
  --ref "$HEAD_REF" \
  -f head_sha="$new_head" \
  -f pr_number="$PR_NUMBER"

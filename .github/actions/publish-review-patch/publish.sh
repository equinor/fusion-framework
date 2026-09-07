#!/usr/bin/env bash
set -euo pipefail

[[ "${GITHUB_REPOSITORY:-}" == equinor/fusion-framework ]]
[[ "${PR_NUMBER:-}" =~ ^[1-9][0-9]{0,9}$ ]]
[[ "${GENERATION_HEAD_SHA:-}" =~ ^[a-f0-9]{40}$ ]]
[[ "${HEAD_REF:-}" =~ ^automation/issue-[A-Za-z0-9][A-Za-z0-9._-]*$ ]]
git check-ref-format --branch "$HEAD_REF" >/dev/null
[[ -n "${GH_TOKEN:-}" ]]

max_comment_bytes=32768
max_changed_paths=100
max_patch_bytes=2097152
max_summary_bytes=16384

test -f "$PATCH_PATH"
test -f "$SUMMARY_PATH"
test -f "$CHECKSUM_PATH"
test "$(wc -c < "$PATCH_PATH")" -le "$max_patch_bytes"
test -s "$SUMMARY_PATH"
test "$(wc -c < "$SUMMARY_PATH")" -le "$max_summary_bytes"
[[ "$(wc -l < "$CHECKSUM_PATH" | tr -d '[:space:]')" == 2 ]]

IFS= read -r patch_checksum < "$CHECKSUM_PATH"
IFS= read -r summary_checksum < <(sed -n '2p' "$CHECKSUM_PATH")
patch_hash="$(sha256sum "$PATCH_PATH" | cut -d ' ' -f 1)"
summary_hash="$(sha256sum "$SUMMARY_PATH" | cut -d ' ' -f 1)"
[[ "$patch_checksum" == "$patch_hash  $(basename "$PATCH_PATH")" ]]
[[ "$summary_checksum" == "$summary_hash  $(basename "$SUMMARY_PATH")" ]]
IFS= read -r summary_heading < "$SUMMARY_PATH"
[[ "$summary_heading" == '## Review feedback summary' ]]
if grep -Fq '<!--' "$SUMMARY_PATH"; then
  echo 'Generated summary contains an HTML comment opener.' >&2
  exit 1
fi
if ! python3 - "$SUMMARY_PATH" <<'PY'
import pathlib
import re
import sys

summary = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
unsafe_markup = re.compile(
    r"!\[|\]\s*(?:\(|\[)|^[ \t]*\[[^\]]+\]:|(?:https?|ftp)://|mailto:|\bwww\.|[<>]",
    re.IGNORECASE | re.MULTILINE,
)
sys.exit(1 if unsafe_markup.search(summary) else 0)
PY
then
  echo 'Generated summary contains an external link, image, or HTML.' >&2
  exit 1
fi

default_branch="$(gh api "repos/${GITHUB_REPOSITORY}" --jq .default_branch)"
[[ "$GITHUB_REF" == "refs/heads/${default_branch}" ]]
[[ "$(git rev-parse HEAD)" == "$GITHUB_SHA" ]]
[[ -z "$(git status --porcelain)" ]]

pull_request="$(gh api "repos/${GITHUB_REPOSITORY}/pulls/${PR_NUMBER}")"
[[ "$(jq --raw-output .state <<< "$pull_request")" == open ]]
[[ "$(jq --raw-output .base.repo.full_name <<< "$pull_request")" == "$GITHUB_REPOSITORY" ]]
[[ "$(jq --raw-output .base.ref <<< "$pull_request")" == "$default_branch" ]]
[[ "$(jq --raw-output .head.repo.full_name <<< "$pull_request")" == "$GITHUB_REPOSITORY" ]]
[[ "$(jq --raw-output .head.ref <<< "$pull_request")" == "$HEAD_REF" ]]
[[ "$(jq --raw-output .head.sha <<< "$pull_request")" == "$GENERATION_HEAD_SHA" ]]
[[ "$(jq --raw-output .user.login <<< "$pull_request")" == 'github-actions[bot]' ]]
jq --exit-status \
  '.labels | any(.name == "🤖 AI generated")' <<< "$pull_request" >/dev/null

git fetch --no-tags origin \
  "refs/heads/${HEAD_REF}:refs/remotes/origin/${HEAD_REF}"
latest_head_sha="$(git rev-parse "refs/remotes/origin/${HEAD_REF}")"
[[ "$latest_head_sha" == "$(jq --raw-output .head.sha <<< "$pull_request")" ]]
# Validation is bound to the authorized commit, so a branch advance requires
# a new maintainer command instead of publishing an unvalidated merge result.
[[ "$latest_head_sha" == "$GENERATION_HEAD_SHA" ]]

if [[ -s "$PATCH_PATH" ]]; then
  git switch --detach "$latest_head_sha"
  git -c core.hooksPath=/dev/null apply --check --cached "$PATCH_PATH"
  git -c core.hooksPath=/dev/null apply --cached "$PATCH_PATH"

  paths=()
  while IFS= read -r -d '' path; do
    paths+=("$path")
  done < <(git diff --cached --name-only --no-renames -z)
  (( ${#paths[@]} > 0 && ${#paths[@]} <= max_changed_paths ))

  # Keep write-capable automation away from repository control surfaces even
  # when untrusted review text convinces the generator to edit them.
  allowed_path='^(packages/|cookbooks/|vue-press/|eds/|contributing/|[.]changeset/|README[.]md$)'
  for path in "${paths[@]}"; do
    check_path="${path#".changeset/"}"
    if ! [[ "$path" =~ $allowed_path ]] ||
      [[ "/$check_path/" == *"/."* ]] ||
      [[ "$path" == *\\* || "$path" == *$'\n'* || "$path" == *"/../"* ]] ||
      [[ "$path" == */AGENTS.md || "$path" == */CLAUDE.md || "$path" == */GEMINI.md ]]; then
      echo "Generated patch contains a disallowed path: $path" >&2
      exit 1
    fi
    entry="$(git ls-files --stage -- "$path")"
    if [[ -n "$entry" ]]; then
      mode="${entry%% *}"
      if [[ "$mode" != 100644 && "$mode" != 100755 ]]; then
        echo "Generated patch contains a disallowed file mode: $path ($mode)" >&2
        exit 1
      fi
    fi
  done

  git config user.name github-actions[bot]
  git config user.email 41898282+github-actions[bot]@users.noreply.github.com
  git -c core.hooksPath=/dev/null commit --message 'fix: address review feedback'
  # A normal push preserves a concurrently advanced branch by failing instead
  # of overwriting it; the maintainer can rerun the command on the new head.
  git push origin "HEAD:refs/heads/${HEAD_REF}"
fi

comment_file="$RUNNER_TEMP/review-feedback-comment.md"
{
  sed -e 's/@/\&commat;/g' "$SUMMARY_PATH"
  printf '\n\n%s\n' '> [!IMPORTANT]'
  printf '%s\n' '> Review threads were not resolved automatically. Human review and resolution are still required.'
} > "$comment_file"
test "$(wc -c < "$comment_file")" -le "$max_comment_bytes"
gh pr comment "$PR_NUMBER" \
  --repo "$GITHUB_REPOSITORY" \
  --body-file "$comment_file"

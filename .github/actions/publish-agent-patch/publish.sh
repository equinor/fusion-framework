#!/usr/bin/env bash
set -euo pipefail

[[ "$ISSUE_NUMBER" =~ ^[1-9][0-9]{0,9}$ ]]
[[ "$BASE_SHA" =~ ^[a-f0-9]{40}$ ]]
[[ "$TASK_BRANCH" == "automation/issue-${ISSUE_NUMBER}-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}" ]]
[[ "$GITHUB_REPOSITORY" == equinor/fusion-framework ]]
[[ -n "${GH_TOKEN:-}" ]]

test -f "$PATCH_PATH"
test -f "$REPORT_PATH"
test -f "$CHECKSUM_PATH"
test "$(wc -c < "$PATCH_PATH")" -le 2097152
test "$(wc -c < "$REPORT_PATH")" -le 32768
[[ "$(wc -l < "$CHECKSUM_PATH" | tr -d '[:space:]')" == 2 ]]
IFS= read -r patch_checksum < "$CHECKSUM_PATH"
IFS= read -r report_checksum < <(sed -n '2p' "$CHECKSUM_PATH")
patch_hash="$(sha256sum "$PATCH_PATH" | cut -d ' ' -f 1)"
report_hash="$(sha256sum "$REPORT_PATH" | cut -d ' ' -f 1)"
[[ "$patch_checksum" == "$patch_hash  $(basename "$PATCH_PATH")" ]]
[[ "$report_checksum" == "$report_hash  $(basename "$REPORT_PATH")" ]]

grep -Fq '**Why is this change needed?**' "$REPORT_PATH"
grep -Fq '**What is the new behavior?**' "$REPORT_PATH"
grep -Fq '**What is the intended behavior or invariant?**' "$REPORT_PATH"
grep -Fq '**Does this PR introduce a breaking change?**' "$REPORT_PATH"
grep -Fq '**Review guidance:**' "$REPORT_PATH"
grep -Fq '### Checklist' "$REPORT_PATH"
if grep -Fq '<!--' "$REPORT_PATH"; then
  echo 'Generated pull request body contains an HTML comment opener.' >&2
  exit 1
fi

default_branch="$(gh api "repos/${GITHUB_REPOSITORY}" --jq .default_branch)"
[[ "$GITHUB_REF" == "refs/heads/${default_branch}" ]]
[[ "$(gh api "repos/${GITHUB_REPOSITORY}/commits/${default_branch}" --jq .sha)" == "$BASE_SHA" ]]
issue="$(gh api "repos/${GITHUB_REPOSITORY}/issues/${ISSUE_NUMBER}")"
[[ "$(jq --raw-output .state <<< "$issue")" == open ]]
[[ "$(jq --raw-output 'has("pull_request")' <<< "$issue")" == false ]]
[[ "$(git rev-parse HEAD)" == "$BASE_SHA" ]]
[[ -z "$(git status --porcelain)" ]]

git -c core.hooksPath=/dev/null apply --check --cached "$PATCH_PATH"
git -c core.hooksPath=/dev/null apply --cached "$PATCH_PATH"
paths=()
while IFS= read -r -d '' path; do
  paths+=("$path")
done < <(git diff --cached --name-only --no-renames -z)
(( ${#paths[@]} > 0 && ${#paths[@]} <= 100 ))

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

body_file="$RUNNER_TEMP/pull-request-body.md"
{
  printf '%s\n\n' '## Agent-generated proposal'
  printf '%s\n\n' '> The following report is untrusted agent output rendered as plain text.'
  printf '%s\n' '<details><summary>Implementation report</summary><pre>'
  sed \
    -e 's/&/\&amp;/g' \
    -e 's/</\&lt;/g' \
    -e 's/>/\&gt;/g' \
    -e 's/@/\&commat;/g' \
    -e 's/#/\&num;/g' \
    "$REPORT_PATH"
  printf '%s\n\n' '</pre></details>'
  printf 'Closes #%s\n' "$ISSUE_NUMBER"
} > "$body_file"
test "$(wc -c < "$body_file")" -le 65536

if git ls-remote --exit-code --heads origin "refs/heads/${TASK_BRANCH}" >/dev/null 2>&1; then
  echo "Task branch already exists: $TASK_BRANCH" >&2
  exit 1
else
  status=$?
  [[ "$status" == 2 ]]
fi

git switch --create "$TASK_BRANCH"
git config user.name github-actions[bot]
git config user.email 41898282+github-actions[bot]@users.noreply.github.com
git -c core.hooksPath=/dev/null commit --message "fix: implement issue #${ISSUE_NUMBER}"
git push \
  --force-with-lease="refs/heads/${TASK_BRANCH}:" \
  origin \
  "HEAD:refs/heads/${TASK_BRANCH}"

pull_request_url="$(
  gh pr create \
    --repo "$GITHUB_REPOSITORY" \
    --draft \
    --base "$default_branch" \
    --head "$TASK_BRANCH" \
    --title "fix: implement issue #${ISSUE_NUMBER}" \
    --body-file "$body_file"
)"
printf 'pull_request_url=%s\n' "$pull_request_url" >> "$GITHUB_OUTPUT"

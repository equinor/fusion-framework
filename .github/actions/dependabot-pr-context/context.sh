#!/usr/bin/env bash
set -euo pipefail

pr="$(gh pr view "$PR_NUMBER" --repo "$GITHUB_REPOSITORY" --json author,baseRefName,body,headRefName,headRefOid,title)"
test "$(jq --raw-output '.author.login' <<< "$pr")" = app/dependabot

updates="$(node "$GITHUB_ACTION_PATH/extract-updates.mjs" <<< "$pr")"
if [[ "$(jq 'length' <<< "$updates")" = 0 ]]; then
  echo "::error::Could not extract dependency updates from the Dependabot pull request."
  exit 1
fi

dependency="$(
  jq --raw-output '
    if length == 1 then
      .[0].name
    else
      "\(length) grouped dependencies"
    end
  ' <<< "$updates"
)"
from_version="$(
  jq --raw-output 'if length == 1 then .[0].from else "multiple" end' <<< "$updates"
)"
version="$(
  jq --raw-output 'if length == 1 then .[0].to else "multiple" end' <<< "$updates"
)"
update_summary="$(
  jq --raw-output '
    if length == 1 then
      "bump `\(.[0].name)` from `\(.[0].from)` to `\(.[0].to)`"
    else
      "update grouped dependencies: " +
        (map("`\(.name)` (`\(.from)` to `\(.to)`)") | join(", "))
    end
  ' <<< "$updates"
)"
head_sha="$(jq --raw-output '.headRefOid' <<< "$pr")"
signature="$(
  printf '%s\n%s' "$updates" "$head_sha" |
    sha256sum |
    cut -d ' ' -f 1
)"

if [[ "$GITHUB_EVENT_NAME" == workflow_dispatch ]]; then
  [[ "$OPERATION" == research || "$OPERATION" == maintain || "$OPERATION" == resolve ]]
  if [[ "$OPERATION" != research ]]; then
    [[ "$CONFIRMED_HEAD_SHA" =~ ^[a-f0-9]{40}$ ]]
    [[ "$(jq --raw-output '.headRefOid' <<< "$pr")" == "$CONFIRMED_HEAD_SHA" ]]
  fi
  if [[ "$OPERATION" == resolve ]]; then
    [[ "$AUTHORIZED_ACTOR" =~ ^[A-Za-z0-9][A-Za-z0-9-]{0,38}$ ]]
    if [[ "$GITHUB_ACTOR" != 'github-actions[bot]' ]]; then
      [[ "$GITHUB_ACTOR" == "$AUTHORIZED_ACTOR" ]]
    fi
    permission="$(
      gh api \
        "repos/${GITHUB_REPOSITORY}/collaborators/${AUTHORIZED_ACTOR}/permission" \
        --jq .permission
    )"
    [[ "$permission" == write || "$permission" == maintain || "$permission" == admin ]]
  fi
fi

echo "number=$PR_NUMBER" >> "$GITHUB_OUTPUT"
echo "dependency=$dependency" >> "$GITHUB_OUTPUT"
echo "from_version=$from_version" >> "$GITHUB_OUTPUT"
echo "version=$version" >> "$GITHUB_OUTPUT"
echo "base_ref=$(jq --raw-output '.baseRefName' <<< "$pr")" >> "$GITHUB_OUTPUT"
echo "head_sha=$head_sha" >> "$GITHUB_OUTPUT"
echo "head_ref=$(jq --raw-output '.headRefName' <<< "$pr")" >> "$GITHUB_OUTPUT"
echo "signature=$signature" >> "$GITHUB_OUTPUT"
echo "update_summary=$update_summary" >> "$GITHUB_OUTPUT"

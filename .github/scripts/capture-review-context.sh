#!/usr/bin/env bash
set -euo pipefail

[[ "${GITHUB_REPOSITORY:-}" == equinor/fusion-framework ]]
[[ "${PR_NUMBER:-}" =~ ^[1-9][0-9]{0,9}$ ]]
[[ "${EXPECTED_HEAD_SHA:-}" =~ ^[a-f0-9]{40}$ ]]
[[ "${EXPECTED_HEAD_REF:-}" =~ ^automation/issue-[A-Za-z0-9][A-Za-z0-9._-]*$ ]]
[[ -n "${GH_TOKEN:-}" ]]
[[ -n "${OUTPUT_PATH:-}" ]]

owner="${GITHUB_REPOSITORY%%/*}"
repository="${GITHUB_REPOSITORY#*/}"
max_context_bytes=1048576
threads='[]'
pull_request='null'
cursor=''

read -r -d '' threads_query <<'GRAPHQL' || true
query ReviewThreads($owner: String!, $repository: String!, $number: Int!, $after: String) {
  repository(owner: $owner, name: $repository) {
    pullRequest(number: $number) {
      number
      title
      body
      url
      state
      author {
        login
      }
      baseRefName
      baseRefOid
      headRefName
      headRefOid
      reviewThreads(first: 100, after: $after) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          startLine
          diffSide
          originalLine
          originalStartLine
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
}
GRAPHQL

while true; do
  arguments=(
    graphql
    -f "query=${threads_query}"
    -F "owner=${owner}"
    -F "repository=${repository}"
    -F "number=${PR_NUMBER}"
  )
  if [[ -n "$cursor" ]]; then
    arguments+=(-f "after=${cursor}")
  fi

  response="$(gh api "${arguments[@]}")"
  page_pull_request="$(jq --compact-output '.data.repository.pullRequest // error("pull request not found")' <<< "$response")"
  if [[ "$pull_request" == null ]]; then
    pull_request="$(jq --compact-output 'del(.reviewThreads)' <<< "$page_pull_request")"
  fi
  threads="$(
    jq --compact-output \
      --argjson existing "$threads" \
      '$existing + (.reviewThreads.nodes // [])' <<< "$page_pull_request"
  )"

  if [[ "$(jq --raw-output '.reviewThreads.pageInfo.hasNextPage' <<< "$page_pull_request")" != true ]]; then
    break
  fi
  cursor="$(jq --raw-output '.reviewThreads.pageInfo.endCursor // empty' <<< "$page_pull_request")"
  [[ -n "$cursor" ]]
done

[[ "$(jq --raw-output .state <<< "$pull_request")" == OPEN ]]
[[ "$(jq --raw-output .author.login <<< "$pull_request")" == 'github-actions[bot]' ]]
[[ "$(jq --raw-output .headRefName <<< "$pull_request")" == "$EXPECTED_HEAD_REF" ]]
[[ "$(jq --raw-output .headRefOid <<< "$pull_request")" == "$EXPECTED_HEAD_SHA" ]]

read -r -d '' comments_query <<'GRAPHQL' || true
query ReviewThreadComments($thread: ID!, $after: String) {
  node(id: $thread) {
    ... on PullRequestReviewThread {
      id
      comments(first: 100, after: $after) {
        nodes {
          id
          databaseId
          body
          path
          line
          originalLine
          diffHunk
          createdAt
          updatedAt
          url
          author {
            login
          }
          replyTo {
            id
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
}
GRAPHQL

# Each thread owns an independent comments cursor, so paginate each unresolved
# chain separately rather than accepting GraphQL's nested first-page limit.
while IFS= read -r thread_id; do
  comments='[]'
  cursor=''
  while true; do
    arguments=(
      graphql
      -f "query=${comments_query}"
      -f "thread=${thread_id}"
    )
    if [[ -n "$cursor" ]]; then
      arguments+=(-f "after=${cursor}")
    fi

    response="$(gh api "${arguments[@]}")"
    thread="$(jq --compact-output '.data.node // error("review thread not found")' <<< "$response")"
    [[ "$(jq --raw-output .id <<< "$thread")" == "$thread_id" ]]
    comments="$(
      jq --compact-output \
        --argjson existing "$comments" \
        '$existing + (.comments.nodes // [])' <<< "$thread"
    )"

    if [[ "$(jq --raw-output '.comments.pageInfo.hasNextPage' <<< "$thread")" != true ]]; then
      break
    fi
    cursor="$(jq --raw-output '.comments.pageInfo.endCursor // empty' <<< "$thread")"
    [[ -n "$cursor" ]]
  done

  threads="$(
    jq --compact-output \
      --arg thread_id "$thread_id" \
      --argjson comments "$comments" \
      'map(if .id == $thread_id then . + {comments: $comments} else . end)' <<< "$threads"
  )"
done < <(jq --raw-output '.[] | select(.isResolved == false) | .id' <<< "$threads")

context="$(
  jq --null-input --compact-output \
    --argjson pull_request "$pull_request" \
    --argjson threads "$threads" \
    '{
      pull_request: $pull_request,
      unresolved_review_threads: [
        $threads[] | select(.isResolved == false)
      ]
    }'
)"
printf '%s\n' "$context" > "$OUTPUT_PATH"
test "$(wc -c < "$OUTPUT_PATH")" -le "$max_context_bytes"

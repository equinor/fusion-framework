#!/usr/bin/env bash
set -euo pipefail

source "$PROVIDER_ENV"
rm "$PROVIDER_ENV"
unset ACTIONS_ID_TOKEN_REQUEST_TOKEN ACTIONS_ID_TOKEN_REQUEST_URL
gh copilot -- --version
echo '::group::🤖 Fusion AI reasoning and tool activity'
review_prompt="$(cat "$GITHUB_ACTION_PATH/review-prompt.md")"
set +e
gh copilot -- \
  --agent "$REVIEW_AGENT" \
  --prompt "Review pull request #${PR_NUMBER} in audit-only mode using the fusion-dependency-review skill. ${review_prompt}" \
  --enable-reasoning-summaries \
  --output-format json \
  --stream off \
  --allow-all-tools \
  --allow-all-urls \
  --no-ask-user \
  --no-auto-update \
  --no-remote \
  --no-remote-export \
  --secret-env-vars=COPILOT_PROVIDER_BEARER_TOKEN,ACTIONS_ID_TOKEN_REQUEST_TOKEN,ACTIONS_ID_TOKEN_REQUEST_URL \
  | tee "$RUNNER_TEMP/dependabot-review.jsonl" \
  | jq --unbuffered --raw-output '
      select(type == "object") |
      if .type == "assistant.message" and
        (.data.content | length) > 0 and
        (.data.toolRequests | length) > 0
      then "💭 " + .data.content
      elif .type == "tool.execution_start"
      then "🔧 " + .data.toolName + (
        .data.arguments.description //
        .data.arguments.skill //
        .data.arguments.path //
        .data.arguments.url //
        .data.arguments.pattern //
        .data.arguments.query //
        .data.arguments.element //
        "" |
        if length > 0 then " — " + . else "" end
      )
      elif
        ((.type // "") | test("error|fail"; "i")) or
        (.error? != null) or
        (.data.error? != null)
      then "::error::Copilot: " + (
        .data.message? //
        .data.error.message? //
        .message? //
        .error.message? //
        "Copilot failed without an error message."
      )
      else empty
      end
    '
pipeline_status=("${PIPESTATUS[@]}")
set -e
echo '::endgroup::'

for status in "${pipeline_status[@]}"; do
  if [[ "$status" -ne 0 ]]; then
    exit "$status"
  fi
done

review_md="$RUNNER_TEMP/dependabot-review.md"
review_json="$RUNNER_TEMP/dependabot-review.json"

# The model's final message is the verdict contract: one JSON object validated against fixed enums.
# Tolerate a surrounding code fence, but nothing else.
jq --slurp --raw-output '
  [
    .[] |
    select(
      type == "object" and
      .type == "assistant.message" and
      (.data.toolRequests | length) == 0 and
      (.data.content | length) > 0
    ) |
    .data.content
  ] |
  (last // empty)
' "$RUNNER_TEMP/dependabot-review.jsonl" \
  | sed -e '/^[[:space:]]*```/d' > "$RUNNER_TEMP/dependabot-review.raw"

if ! jq --exit-status '
  type == "object" and
  (.verdict | IN("MERGE", "HOLD", "DECLINE")) and
  (.confidence | IN("high", "medium", "low")) and
  (.readiness | IN("ready", "waiting for checks", "waiting for approval", "needs changes")) and
  (.report | type == "string" and length > 0)
' "$RUNNER_TEMP/dependabot-review.raw" > /dev/null; then
  echo '::error::Copilot did not return a valid review JSON object.'
  echo '::group::Copilot final message'
  cat "$RUNNER_TEMP/dependabot-review.raw"
  echo '::endgroup::'
  echo '::group::Copilot event types'
  jq --raw-output 'select(type == "object") | .type' "$RUNNER_TEMP/dependabot-review.jsonl" | sort | uniq -c
  echo '::endgroup::'
  exit 1
fi

jq --compact-output '{verdict: (.verdict | ascii_downcase), confidence, readiness}' \
  "$RUNNER_TEMP/dependabot-review.raw" > "$review_json"

# The verdict marker is the machine-readable source for later runs; the markdown is for humans only.
jq --raw-output '
  "<!-- fusion-ai-verdict:" + ({verdict: (.verdict | ascii_downcase), confidence, readiness} | tojson) + " -->\n" +
  "## " + ({MERGE: "🟢", HOLD: "🟡", DECLINE: "🔴"}[.verdict]) + " Verdict: " + .verdict + "\n\n" +
  "**Confidence:** " + .confidence + "\n\n" +
  "**Readiness:** " + .readiness + "\n\n" +
  .report
' "$RUNNER_TEMP/dependabot-review.raw" > "$review_md"

{
  echo "markdown_file=$review_md"
  echo "merge_recommended=$(jq --raw-output '.verdict == "merge"' "$review_json")"
  echo "high_confidence=$(jq --raw-output '.confidence == "high"' "$review_json")"
  echo "auto_merge=$(jq --raw-output '.verdict == "merge" and .confidence == "high"' "$review_json")"
} >> "$GITHUB_OUTPUT"

cat "$review_md" >> "$GITHUB_STEP_SUMMARY"

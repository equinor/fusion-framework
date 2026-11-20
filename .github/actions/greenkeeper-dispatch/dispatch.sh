#!/usr/bin/env bash
set -euo pipefail

fail() { echo "::error::$*" >&2; exit 1; }
[[ "$GITHUB_REPOSITORY" == equinor/fusion-framework &&
   "$GITHUB_EVENT_NAME" == workflow_dispatch && "$GITHUB_REF" == refs/heads/main ]] ||
  fail "Request assessments only from Fusion Framework's main-branch workflow."
[[ "$PR_NUMBER" =~ ^[1-9][0-9]*$ ]] || fail "Select a positive Dependabot PR number."
[[ "$GITHUB_RUN_ID" =~ ^[1-9][0-9]*$ && "$GITHUB_RUN_ATTEMPT" =~ ^[1-9][0-9]*$ ]] ||
  fail "A valid Framework workflow run attempt is required."
[[ -n "$GH_TOKEN" && -n "$GREENKEEPER_DISPATCH_TOKEN" ]] ||
  fail "Configure GREENKEEPER_DISPATCH_TOKEN with Actions write access to equinor/fusion-poc-greenkeeper."

pull_request="$(gh api "repos/equinor/fusion-framework/pulls/$PR_NUMBER")"
head="$(jq -er '
  if .state == "open" and .user.login == "dependabot[bot]" and
     .base.repo.full_name == "equinor/fusion-framework" and .head.repo.full_name == "equinor/fusion-framework"
  then .head.sha
  else error("Select an open same-repository Dependabot PR.") end
' <<< "$pull_request")"
[[ "$head" =~ ^[a-f0-9]{40}$ ]] || fail "The PR must resolve to a full head SHA."
caller_run="https://github.com/equinor/fusion-framework/actions/runs/$GITHUB_RUN_ID/attempts/$GITHUB_RUN_ATTEMPT"

# Only identifiers cross repositories; provider identity and checkout credentials stay in Greenkeeper.
GH_TOKEN="$GREENKEEPER_DISPATCH_TOKEN" gh api --method POST \
  repos/equinor/fusion-poc-greenkeeper/actions/workflows/dependency-assessment.yml/dispatches \
  -f ref=main -f "inputs[pr-number]=$PR_NUMBER" -f "inputs[head-sha]=$head" -f "inputs[caller-run]=$caller_run"
{
  echo '## Greenkeeper assessment requested'
  printf '\nTarget: equinor/fusion-framework#%s\n\nConfirmed head: %s\n' "$PR_NUMBER" "$head"
  echo 'The dispatch was accepted; this is not an assessment result.'
  echo 'Execution, Entra authentication and the export-only result stay in PoC Greenkeeper.'
  echo 'Open https://github.com/equinor/fusion-poc-greenkeeper/actions/workflows/dependency-assessment.yml'
  printf ' and find the request linked to %s.\n' "$caller_run"
} >> "$GITHUB_STEP_SUMMARY"

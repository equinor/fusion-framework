#!/usr/bin/env bash
set -euo pipefail

[[ "$GITHUB_REF" == "refs/heads/$DEFAULT_BRANCH" ]] ||
  { echo "::error::Request Greenkeeper maintenance from the default branch only."; exit 1; }
case "$GITHUB_EVENT_NAME" in
  push|workflow_dispatch) ;;
  *) echo "::error::Greenkeeper maintenance does not accept PR or untrusted events."; exit 1 ;;
esac
[[ "$TASK" == dependency ]] ||
  { echo "::error::Unsupported Greenkeeper maintenance task: $TASK"; exit 1; }
[[ "$EXPORT_ONLY" == true || "$EXPORT_ONLY" == false ]] ||
  { echo "::error::export-only must be true or false."; exit 1; }
[[ "$REPOSITORY" =~ ^equinor/[A-Za-z0-9_.-]+$ ]] ||
  { echo "::error::Expected an Equinor target repository."; exit 1; }
[[ -n "$GH_TOKEN" ]] ||
  { echo "::error::DEPENDABOT_AUTOMATION_TOKEN must have Actions write access to equinor/fusion-poc-greenkeeper."; exit 1; }

gh workflow run maintenance.yml \
  --repo equinor/fusion-poc-greenkeeper \
  --ref main \
  -f repository="$REPOSITORY" \
  -f task="$TASK" \
  -f export_only="$EXPORT_ONLY"

{
  echo '## Greenkeeper maintenance requested'
  printf '\nTask: %s\n\nExport only: %s\n' "$TASK" "$EXPORT_ONLY"
  echo
  echo 'The private service decides whether to rebase the dependency branch or hire a conflict resolver.'
  echo 'Dispatch acceptance is not execution or validation success. Check the service run before reporting completion.'
} >> "$GITHUB_STEP_SUMMARY"

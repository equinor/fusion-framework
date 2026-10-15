#!/usr/bin/env bash
set -euo pipefail

default_branch="$(
  gh api "repos/${REPOSITORY}" --jq '.default_branch'
)"
git fetch origin "$default_branch" "$MAINTENANCE_BRANCH"
maintenance_ref="origin/${MAINTENANCE_BRANCH}"
if git diff --quiet "origin/${default_branch}" "$maintenance_ref"; then
  echo "::error::The maintenance stream has no changes to promote."
  exit 1
fi

report="$RUNNER_TEMP/dependabot-promotion.md"
cat > "$report" <<'EOF'
**Why is this change needed?**

Promote the Dependabot maintenance stream through the normal protected-branch review gate.

**What is the current behavior?**

Routine dependency updates accumulate on `maintenance/dependencies` without triggering `main` release and cache workflows.

**What is the new behavior?**

The accumulated dependency updates are promoted to `main` as one reviewed change.

**What is the intended behavior or invariant?**

Only updates already accepted into the maintenance stream are included. The combined stream must pass the full dependency validation suite before it is ready for review.

**Does this PR introduce a breaking change?**

No known breaking change. Individual dependency research remains linked from the included commits and pull requests.

**Impact assessment:**

- Breaking changes: No known breaking changes
- Version bump: Determined by the included changesets
- Consumer impact: Dependency updates described by the included changesets
- Downstream impact: Package builds and tests are validated together by the promotion run dispatched after each merged maintenance update

**Review guidance:**

Review the accumulated dependency updates, changesets, and the latest aggregate validation result. Pay particular attention to any manually accepted update in the stream.

**Additional context**

Included maintenance commits:

EOF
{
  git log \
    --format="- %s (\`%h\`)" \
    "origin/${default_branch}..${maintenance_ref}"
  if [[ "$VALIDATED" != true ]]; then
    cat <<'EOF'

This description was refreshed after a maintenance-stream update. Aggregate validation runs when the `promote` operation is dispatched, which happens after each Dependabot update is merged into the maintenance stream.

EOF
  else
    cat <<'EOF'

Aggregate validation completed before this pull request was created or updated:

- `pnpm build`
- `pnpm test`
- `pnpm -w check`

Auto-merge is enabled once this validation passes. Branch rules still require the approving review and all required checks before GitHub merges.

EOF
  fi
  cat <<'EOF'

### Checklist

- [x] Confirm completion of the self-review checklist
- [x] Confirm TSDoc captures intent when applicable
- [x] Confirm complex decisions explain why they exist when applicable
- [x] Confirm React logic is resolved before markup when applicable
- [x] Confirm documentation is updated when applicable
- [x] Confirm the promotion pull request reflects the current maintenance stream
- [x] Confirm adherence to the code of conduct
EOF
} >> "$report"

pr_number="$(
  gh pr list \
    --repo "$REPOSITORY" \
    --state open \
    --base "$default_branch" \
    --head "$MAINTENANCE_BRANCH" \
    --json number \
    --jq '.[0].number // empty'
)"
if [[ -z "$pr_number" ]]; then
  pr_url="$(
    gh pr create \
      --repo "$REPOSITORY" \
      --base "$default_branch" \
      --head "$MAINTENANCE_BRANCH" \
      --draft \
      --title 'chore(deps): promote dependency maintenance stream' \
      --body-file "$report"
  )"
  pr_number="${pr_url##*/}"
else
  # `gh pr edit` always resolves requested reviewers, which a fine-grained token cannot do
  # for CODEOWNERS team requests; the REST endpoint updates title and body without that lookup.
  gh api \
    --method PATCH \
    "repos/${REPOSITORY}/pulls/${pr_number}" \
    --raw-field title='chore(deps): promote dependency maintenance stream' \
    --raw-field body="$(cat "$report")" \
    --silent
  # New commits invalidate earlier validation, so drop auto-merge and return to draft.
  gh pr merge "$pr_number" --repo "$REPOSITORY" --disable-auto || true
  gh pr ready "$pr_number" --repo "$REPOSITORY" --undo || true
fi

head_sha="$(git rev-parse "$maintenance_ref")"
if [[ "$VALIDATED" == true ]]; then
  for workflow in pr.yml visual-checks.yml agent-context.yml; do
    gh workflow run "$workflow" \
      --repo "$REPOSITORY" \
      --ref "$MAINTENANCE_BRANCH" \
      -f head_sha="$head_sha" \
      -f pr_number="$pr_number"
  done
fi

{
  echo "head_sha=${head_sha}"
  echo "pr_number=${pr_number}"
} >> "$GITHUB_OUTPUT"

echo "Promotion pull request: https://github.com/${REPOSITORY}/pull/${pr_number}" \
  >> "$GITHUB_STEP_SUMMARY"

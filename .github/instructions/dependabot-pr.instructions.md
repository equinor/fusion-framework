---
description: Rules for reviewing and handling Dependabot pull requests
name: Dependabot PR Review Rules
applyTo: 
  - "**/dependabot.yml"
  - ".github/workflows/dependabot.yml"
  - ".github/dependabot.yml"
alwaysApply: true
---

# Dependabot PR Review Rules

**⚠️ CRITICAL: AI AGENTS MUST READ THIS ENTIRE FILE WHEN HANDLING DEPENDABOT PRs**

This instruction file contains **mandatory steps** that MUST be executed in order. Do not skip steps. Do not proceed without reading the full workflow below.

## TL;DR (for AI agents)

- **MANDATORY READING**: You MUST read this entire instruction file before handling any Dependabot PR. This is not optional.
- **Consent**: Never post comments, generate changesets, push commits, close PRs, or merge without explicit user approval.
- **Flow**: Rebase (if needed) → research dependency changes → install with `pnpm` → build → test → lint → (optionally) generate changeset → push → summarize → (optionally) merge.
- **Safety**: Stop immediately on build/test/lint/security failures or user timeout; do not auto-resolve complex conflicts.
- **Comments**: Use the provided research/results templates, create temporary markdown files, show content to the user for approval, then execute `gh pr comment <PR_NUMBER> -F <comment-file>.md` to post. Always clean up temporary files.
- **History**: Maintain linear history (force-with-lease after rebase) and clean up worktrees when done.

## Overview

This instruction provides guidelines for reviewing, testing, and merging Dependabot pull requests in the Fusion Framework repository.

## Critical Rules

**NEVER post comments without explicit user approval.**
**NEVER close PRs due to structural changes without explicit user approval.**
**NEVER proceed with destructive operations without user consent.**
**NEVER SKIP STEPS** - Execute all steps in numerical order.

### Consent Required Steps:
- **Research comment**: Requires user review and approval before posting
- **Changeset generation**: Requires user review and approval
- **Pushing changes**: Requires user confirmation
- **Results comment**: Requires user review and approval before posting
- **PR merge**: Requires explicit user approval

### Critical Rules:
- **5-minute timeout** on all user interactions
- **STOP EXECUTION** immediately if user times out or declines critical operations
- **No automated decisions** for safety-critical operations
- **MAINTAIN LINEAR HISTORY** - Always use force-with-lease after rebase operations

## Workflow Steps

### 1. Select PR

#### Scenario A: PR provided
- Store PR details: repository owner, name, PR number, branch name

#### Scenario B: Interactive selection
- List Dependabot PRs (actor_filter: "app/dependabot")
- Display categorized PR list (MAJOR/MINOR/PATCH)
- Request user PR selection
- Wait for user response
- Parse user selection and store PR details

**CRITICAL**: User MUST explicitly choose PR. Never auto-select.

### 2. Create Git Worktree for PR

1. Determine base repository location:
   - **If in workspace repository**: Use current repository as base
   - **If not in repository**: Clone repository using GitHub CLI: `gh repo clone <OWNER>/<REPO>` to temp directory
2. Fetch PR branch: `git fetch origin <PR_BRANCH_NAME>` or use `gh pr checkout <PR_NUMBER>` to fetch and track
3. Create worktree: `git worktree add <WORKTREE_PATH> <PR_BRANCH_NAME>`
   - Use descriptive path: `../worktrees/pr-<PR_NUMBER>` or similar
4. Change directory to worktree: `cd <WORKTREE_PATH>`
5. Verify PR branch state and worktree location

### 3. Rebase Branch

Execute rebase analysis against base branch (default: `main`).

#### Scenarios:

**A: Success**
- Verify no conflicts
- Force push rebased branch: `git push --force-with-lease`
- Continue to Step 4

**B: Version Conflict (Auto-Close)**
- Create temporary comment file: `gh-comment-version-conflict.md` with redundancy explanation
- **EXECUTE**: `gh pr comment <PR_NUMBER> -F gh-comment-version-conflict.md`
- Clean up: `rm gh-comment-version-conflict.md`
- Close PR: `gh pr close <PR_NUMBER> --comment "PR closed due to version conflict"`
- Proceed to cleanup

**C: Structural Conflict (User Consent Required)**
- Display conflict details to user
- Ask user: "Close PR as redundant due to structural changes?"
- Wait for response (5 min timeout)
- If approved: Close PR → cleanup
- If declined/timeout: **STOP EXECUTION**

**D: Complex Conflict (Stop Execution)**
- **STOP EXECUTION**: Display conflict analysis and manual resolution guidance

### 4. Research Dependencies

1. Verify environment: `pnpm --version`, changeset config, build scripts
2. Parse PR description for dependency updates
3. Research dependencies (changelog, security advisories, breaking changes)
4. Review codebase compatibility
5. Analyze dependency usage in codebase

**MANDATORY**: Proceed to Step 5 (Post Research Comment) - NEVER SKIP THIS STEP

### 5. Post Research Comment

**MANDATORY STEP - DO NOT SKIP**

1. Format research findings using [research comment template](dependabot-pr/research-comment.template.md)
2. Create temporary comment file: `gh-comment-research.md` with the formatted content
3. Display comment content to user (show the file contents)
4. Ask user: "Review research comment content. Is it accurate and complete?"
5. Wait for user response
6. Ask user: "Post this research comment to PR?"
7. Wait for user response
8. **If approved**: 
   - **EXECUTE**: `gh pr comment <PR_NUMBER> -F gh-comment-research.md`
   - Verify the comment was posted successfully
   - Clean up: `rm gh-comment-research.md`
9. **If declined**: Skip and continue (clean up: `rm gh-comment-research.md`)

**CRITICAL**: You MUST execute the `gh pr comment` command when approved. Do not just say you will post it - actually run the command.

**MANDATORY**: Proceed to Step 6 (Install Dependencies) - NEVER SKIP THIS STEP

### 6. Install Dependencies

1. Clean node_modules if lock file changed
2. Run `pnpm install --frozen-lockfile`

### 7. Build Project

1. Run `pnpm build`
2. Check for critical warnings

### 8. Run Tests

1. Run `pnpm test`
2. Verify all tests pass

**Error Handling**: If tests fail, **STOP EXECUTION** - Analyze failures, determine if dependency-related, require user decision to continue

### 9. Run Linting

1. Format: `npx biome format --fix`
2. Stage changes: `git add .`
3. Check: `npx biome check --diagnostic-level=error`
4. Document critical violations

**Error Handling**: If linting fails, **STOP EXECUTION** - Document violations, require user decision to continue

### 10. Generate Changeset

1. Skip if `.changeset` directory missing
2. Parse PR for package/version changes
3. Analyze dependency usage in affected packages
4. Generate changeset using [changeset rules](changesets.instructions.md)
5. Display changeset content to user
6. Ask user: "Review generated changeset. Create for semantic versioning?"
7. Wait for user response (5 min timeout)
8. If approved: Stage changeset files
9. If declined: Skip and continue
10. If timeout: **STOP EXECUTION** - User consent required

### 11. Push Changes

1. Check uncommitted changes: `git status --porcelain`
2. If changes detected, confront user about uncommitted changes
3. Confirm working directory clean or user accepts changes
4. Wait for user response (5 min timeout)
5. If timeout: **STOP EXECUTION** - User consent required
6. Commit generated files (changesets, formatting fixes)
7. Display commit summary to user
8. Ask user: "Push changes to PR branch?"
9. Wait for user response (5 min timeout)
10. If approved: Push to PR branch
11. If declined: Skip and continue
12. If timeout: **STOP EXECUTION** - User consent required

### 12. Comment PR Results

**MANDATORY STEP - DO NOT SKIP**

1. Format completion summary using [results comment template](dependabot-pr/results-comment.template.md)
2. Create temporary comment file: `gh-comment-results.md` with the formatted content
3. Display comment content to user (show the file contents)
4. Ask user: "Review validation results. Are they accurate?"
5. Wait for user response (5 min timeout)
6. Ask user: "Post this validation comment to PR?"
7. Wait for user response (5 min timeout)
8. **If approved**: 
   - **EXECUTE**: `gh pr comment <PR_NUMBER> -F gh-comment-results.md`
   - Verify the comment was posted successfully
   - Clean up: `rm gh-comment-results.md`
9. **If declined**: Skip and continue (clean up: `rm gh-comment-results.md`)
10. **If timeout**: **STOP EXECUTION** - User consent required (clean up: `rm gh-comment-results.md`)

**CRITICAL**: You MUST execute the `gh pr comment` command when approved. Do not just say you will post it - actually run the command.

### 13. Squash Merge PR

1. Display merge details and branch protection status
2. Ask user: "Merge Dependabot PR now?"
3. Wait for user response (5 min timeout)
4. If approved: Squash merge PR
5. If declined: Skip and leave PR open
6. If timeout: **STOP EXECUTION** - User consent required
7. **CONDITIONAL**: If branch protection blocks: Ask user for admin force approval

### 14. Cleanup Repository

1. **CONDITIONAL**: If auto-closing PR (version_conflict/structural_conflict): Close with appropriate comment
2. Remove worktree: `git worktree remove <WORKTREE_PATH>` (or `git worktree remove --force` if worktree has uncommitted changes)
3. **CONDITIONAL**: If repository was cloned in Step 2: Remove cloned repository temp directory
4. Delete remote PR branch if exists (optional cleanup)
5. Verify cleanup completion

### 15. Finalize Instruction

1. Verify all steps completed successfully
2. Confirm cleanup completed

## Success Criteria

- [ ] Dependencies validated and tested
- [ ] Build, tests, linting pass
- [ ] Changesets generated (if required)
- [ ] All user consents obtained
- [ ] PR merged or ready for review
- [ ] Full cleanup completed
- [ ] Instruction execution logged and finalized

## Failure Criteria

- [ ] Build/test/linting failures
- [ ] Security vulnerabilities found
- [ ] User consent timeout or denial
- [ ] Task execution failures
- [ ] Merge conflicts requiring manual intervention
- [ ] Repository access or permission issues

## Comment Templates

All PR comments must use the provided templates:

- **[Research Comment Template](dependabot-pr/research-comment.template.md)**: For posting dependency research findings
- **[Results Comment Template](dependabot-pr/results-comment.template.md)**: For posting validation results

## AI Agent Rules

**⚠️ MANDATORY: Read this entire section before handling Dependabot PRs**

When handling Dependabot PRs:

1. **READ THIS FILE FIRST** - You must read and understand all steps before starting
2. **Always get user consent** before posting comments or merging
3. **Follow all steps sequentially** - never skip steps, especially Steps 5 and 12 (comment posting)
4. **Use provided templates** for all PR comments
5. **POST COMMENTS USING GITHUB CLI**: When approved, you MUST execute `gh pr comment <PR_NUMBER> -F <comment-file>.md`. Do not just say you will post - actually run the command. See [GitHub CLI file-based bodies rule](../.cursor/rules/github-cli-file-bodies.mdc)
6. **Clean up comment files**: Always remove temporary comment files (`gh-comment-*.md`) after posting or if declined
7. **Validate thoroughly** - build, test, lint before approval
8. **Generate changesets** when required (follow [changeset rules](changesets.instructions.md))
9. **Maintain linear history** - use force-with-lease after rebase
10. **Clean up properly** - remove worktrees and temp directories
11. **Stop execution** on any critical failure or user timeout

## Error Handling

### Critical Errors (STOP EXECUTION)
- User consent timeout or denial
- Build/test/linting failures
- Security vulnerabilities found
- Merge conflicts requiring manual intervention
- Repository access or permission issues

### Non-Critical Errors (Continue with User Approval)
- Changeset generation skipped (if not configured)
- Formatting fixes applied automatically
- Minor warnings (document but continue)

## Best Practices

- **Be thorough**: Research dependencies completely before approval
- **Be transparent**: Show all findings to user before posting
- **Be safe**: Never proceed without explicit user consent
- **Be clean**: Always cleanup worktrees and temp directories
- **Be consistent**: Use templates for all comments
- **Be patient**: Wait for user responses, respect timeouts


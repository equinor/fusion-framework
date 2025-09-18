# PR Merge Command

## Overview
Automated PR merging tool that handles the complete workflow from listing PRs to merging and cleanup. Ensures code quality through validation and maintains clean git history with squashing.

## Prerequisites
- **pnpm** must be available (not npm)
- **GitHub CLI** (`gh` command) must be installed
- **Current directory**: Must be in the fusion-framework repository root
- **Node.js and TypeScript** environment
- **Write permissions** to the repository

## Command Formatting Guidelines
- **Always use backticks** for GitHub CLI commands: `` `gh pr view [PR_NUMBER]` ``
- **Multi-line commands** use backslash continuation: `` `gh api \` ``
- **Consistent placeholders**: Use `[PR_NUMBER]` not `<PULL_NUMBER>`
- **Code blocks** for command examples: ```bash ... ```
- **Escape backticks in body content**: Use `` \` `` inside `--body` parameters

## Workflow Steps Overview

| Step | Action | Purpose | Status |
|------|--------|---------|--------|
| [0](#0-optional-direct-pr-input-skip-step-1) | Direct PR Input | Skip listing, process specific PR | Optional |
| [1](#1-list-available-prs) | List Available PRs | Show mergeable PRs | Required (if step 0 not used) |
| [2](#2-checkout-pr) | Checkout PR | Switch to PR branch | Required |
| [3](#3-rebase-to-main) | Rebase to Main | Update PR with latest main | Required |
| [4](#4-build-project) | Build Project | Ensure code compiles | Required |
| [5](#5-run-tests) | Run Tests | Verify functionality | Required |
| [6](#6-run-lint) | Run Lint | Check code quality | Required |
| [7](#7-post-admin-comment) | Post Admin Comment | Add admin approval comment | Required |
| [8](#8-merge-pr) | Merge PR | Merge PR with squash | Required |
| [9](#9-delete-local-branch) | Delete Local Branch | Clean up local branches | Required |

**🤔 User Confirmation**: At each decision point, always ask user for confirmation (y/n) when in doubt

## Detailed Workflow Steps

### 0. Optional: Direct PR Input (Skip Step 1)
**USAGE**: If you already know the PR number or URL, you can skip the listing step.

**ACCEPTED INPUTS**:
- PR number: `1234` or `#1234`
- PR URL: `https://github.com/owner/repo/pull/1234`
- Full PR URL: `https://github.com/equinor/fusion-framework/pull/1234`

**VALIDATION**:
1. Extract PR number from input
2. Verify PR exists: `gh pr view [PR_NUMBER] --json number,title,author,state,mergeable`
3. Confirm PR is open: Check `state` equals `"OPEN"`
4. Confirm PR is mergeable: Check `mergeable` equals `true`

**IF VALID**: Proceed directly to step 2 (Checkout PR)
**IF INVALID**: Fall back to step 1 (List Available PRs)

**USAGE EXAMPLES**:
```bash
# Using PR number
/pr-merge 1234

# Using PR number with hash
/pr-merge #1234

# Using full GitHub URL
/pr-merge https://github.com/equinor/fusion-framework/pull/1234
```

**ERROR HANDLING**:
- **Invalid PR number**: "PR #1234 not found or not accessible"
- **PR is closed**: "PR #1234 is not open (state: CLOSED/MERGED)"
- **PR not mergeable**: "PR #1234 is not mergeable (mergeable: false)"
- **Invalid URL format**: "Invalid PR URL format. Expected: https://github.com/owner/repo/pull/1234"

### 1. List Available PRs
**COMMAND**: `gh pr list --state open --json number,title,author,createdAt,mergeable`

**FILTERING**:
- **Default**: Only show mergeable PRs (`--jq '.[] | select(.mergeable == true)'`)
- **Include all**: Use `--include-all` flag to show non-mergeable PRs

**OUTPUT FORMAT**: Display PRs with emoji prefixes:
```
🚀 PR #XXXX: [title] by @author (created X days ago) ✅ mergeable
🐛 PR #YYYY: [title] by @author (created X days ago) ✅ mergeable
📚 PR #ZZZZ: [title] by @author (created X days ago) ✅ mergeable
🔧 PR #AAAA: [title] by @author (created X days ago) ✅ mergeable
⚡ PR #BBBB: [title] by @author (created X days ago) ✅ mergeable
⚠️ PR #CCCC: [title] by @author (created X days ago) ❌ conflicts
🚫 PR #DDDD: [title] by @author (created X days ago) ❌ blocked
```

**EMOJI LEGEND**:
- 🚀 **Feature** - New features and enhancements
- 🐛 **Bug Fix** - Bug fixes and patches
- 📚 **Documentation** - Documentation updates
- 🔧 **Refactor** - Code refactoring and improvements
- ⚡ **Performance** - Performance optimizations
- 🎨 **Style** - Code style and formatting
- ⚠️ **Conflicts** - Has merge conflicts
- 🚫 **Blocked** - Blocked or not mergeable

**IMPORTANT RULES**:
- ❌ **Do NOT fetch detailed information** - only show the basic list
- ❌ **Do NOT run `gh pr view` commands** - wait for user selection
- ✅ **Wait for user to select** which PR to merge
- ✅ **Then checkout** using `gh pr checkout [PR_NUMBER]`

### 2. Checkout PR
**COMMAND**: `gh pr checkout [PR_NUMBER]`

**VALIDATION**:
1. Verify checkout was successful
2. Confirm we're on the correct branch
3. Check if branch is up to date with origin

**IF CHECKOUT FAILS**:
- Check if PR exists and is accessible
- Verify branch permissions
- Try fetching latest changes: `git fetch origin`

**SUCCESS MESSAGE**:
```
✅ Successfully checked out PR #[PR_NUMBER]
📍 Current branch: [branch-name]
```

### 3. Rebase to Main
**REBASE PROCESS**:

1. **Fetch latest changes**:
   ```bash
   git fetch origin
   ```

2. **Rebase onto main**:
   ```bash
   git rebase origin/main
   ```

3. **Handle conflicts** (if any):
   - **If conflicts occur**: Ask user: "Rebase conflicts detected. Should I help resolve them? (y/n)"
   - **If user confirms**: Guide through conflict resolution
   - **If user says no**: Abort rebase and ask for manual resolution

4. **Update lock file** (if conflicts in package files):
   ```bash
   # If package.json or pnpm-lock.yaml conflicts
   pnpm install
   git add pnpm-lock.yaml
   git rebase --continue
   ```

**CONFLICT RESOLUTION GUIDE**:
```bash
# When conflicts occur:
1. Check conflicted files: git status
2. Resolve conflicts in your editor
3. Stage resolved files: git add <file>
4. Continue rebase: git rebase --continue
5. Repeat until rebase completes
```

**SUCCESS MESSAGE**:
```
✅ Successfully rebased PR #[PR_NUMBER] onto main
📍 Branch is now up to date with main
```

**ERROR HANDLING**:
- **Rebase conflicts**: Guide user through resolution or abort
- **Rebase fails**: Provide specific error messages and solutions
- **Lock file conflicts**: Automatically update and continue

### 4. Build Project
**BUILD PROCESS**:

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Build project**:
   ```bash
   pnpm build
   ```

**VALIDATION CRITERIA**:
- ✅ **Install**: All dependencies install successfully
- ✅ **Build**: Project builds without errors

**DECISION POINT**:
- **If build fails**: 
  - Ask user: "Build failed. Should I abort the merge process? (y/n)"
  - If user confirms: Abort merge and provide error details
  - If user says no: Continue with tests anyway

**SUCCESS MESSAGE**:
```
✅ Build completed successfully
📦 All packages built without errors
```

### 5. Run Tests
**TEST PROCESS**:

1. **Run test suite**:
   ```bash
   pnpm vitest run
   ```

2. **Check test coverage** (optional):
   ```bash
   pnpm test:coverage
   ```

**VALIDATION CRITERIA**:
- ✅ **Tests**: All tests pass
- ✅ **Coverage**: Test coverage meets requirements (if applicable)

**DECISION POINT**:
- **If tests fail**: 
  - Ask user: "Tests failed. Should I abort the merge process? (y/n)"
  - If user confirms: Abort merge and provide test failure details
  - If user says no: Continue with linting anyway

**SUCCESS MESSAGE**:
```
✅ All tests passed
🧪 Test suite completed successfully
```

### 6. Run Lint
**LINT PROCESS**:

1. **Run linter**:
   ```bash
   pnpm check:errors
   ```

2. **Check for linting errors**:
   ```bash
   pnpm check:errors:check
   ```

**VALIDATION CRITERIA**:
- ✅ **Lint**: No linting errors
- ✅ **Format**: Code is properly formatted

**DECISION POINT**:
- **If linting fails**: 
  - Ask user: "Linting failed. Should I abort the merge process? (y/n)"
  - If user confirms: Abort merge and provide linting error details
  - If user says no: Continue with squashing anyway

**SUCCESS MESSAGE**:
```
✅ Linting passed
🎨 Code style is consistent
```

### 7. Post Admin Comment
**ADMIN COMMENT PROCESS**:

1. **Post admin approval comment**:
   ```bash
   gh pr comment [PR_NUMBER] --body "## 🔧 Admin Testing Complete
   
   This PR has been thoroughly tested by an admin and is ready for merge:
   
   ### Validation Results
   - ✅ **Rebase**: Successfully rebased onto main
   - ✅ **Build**: Project builds without errors
   - ✅ **Tests**: All tests pass
   - ✅ **Lint**: Code quality checks pass
   
   ### Admin Actions
   - [x] Code reviewed and validated
   - [x] Full test suite executed
   - [x] Build verification completed
   - [x] Linting checks passed
   
   **Status**: Ready to merge
   **Reviewer Requirements**: Skipped (admin tested)
   
   ---
   *This PR is being merged by admin after comprehensive testing.*"
   ```

**DECISION POINT**:
- **Before posting**: Ask user: "Ready to post admin approval comment? This will indicate the PR has been tested. Continue? (y/n)"
- **If user confirms**: Post the comment
- **If user says no**: Skip comment and proceed with merge

**SUCCESS MESSAGE**:
```
✅ Admin approval comment posted
📝 PR marked as admin tested and ready for merge
```

### 8. Merge PR
**MERGE PROCESS**:

1. **Check PR status**:
   ```bash
   gh pr view [PR_NUMBER] --json state,mergeable,mergeStateStatus
   ```

2. **Merge PR with squash**:
   ```bash
   gh pr merge [PR_NUMBER] --squash --delete-branch
   ```

3. **Verify merge success**:
   ```bash
   gh pr view [PR_NUMBER] --json state
   ```

**MERGE OPTIONS**:
- `--squash`: Squash all commits into a single commit
- `--delete-branch`: Automatically delete the PR branch after merge
- `--merge`: Use merge commit (alternative to squash)
- `--rebase`: Use rebase merge (alternative to squash)

**DECISION POINT**:
- **Before merging**: Ask user: "Ready to merge PR #[PR_NUMBER] with squash? This will close the PR. Continue? (y/n)"
- **If user confirms**: Proceed with merge
- **If user says no**: Abort merge process

**SUCCESS MESSAGE**:
```
✅ PR #[PR_NUMBER] merged successfully
🔀 Commits squashed into single commit
🗑️ PR branch deleted automatically
```

### 9. Delete Local Branch
**CLEANUP PROCESS**:

1. **Switch to main branch**:
   ```bash
   git checkout main
   ```

2. **Update main branch**:
   ```bash
   git pull origin main
   ```

3. **Delete local branch**:
   ```bash
   git branch -d [branch-name]
   ```

4. **Clean up remote tracking**:
   ```bash
   git remote prune origin
   ```

**NOTE**: The remote branch is automatically deleted by `gh pr merge --delete-branch`, so we only need to clean up the local branch.

**DECISION POINT**:
- **Before cleanup**: Ask user: "Ready to delete local branch [branch-name]? (y/n)"
- **If user confirms**: Proceed with cleanup
- **If user says no**: Skip cleanup

**SUCCESS MESSAGE**:
```
✅ Local branch [branch-name] deleted
🧹 Cleanup completed
```

## Error Handling

### Common Issues
- **PR not found**: Verify PR number and permissions
- **Checkout fails**: Check branch permissions and existence
- **Rebase conflicts**: Guide through conflict resolution
- **Build fails**: Document specific errors and provide fixes
- **Tests fail**: Analyze failures and provide solutions
- **Lint fails**: Show specific linting errors and fixes
- **Squash fails**: Provide rebase conflict resolution help

### Recovery Strategies
- **Network issues**: Retry commands with exponential backoff
- **Permission issues**: Check GitHub CLI authentication
- **Build issues**: Provide specific fix instructions
- **Test failures**: Analyze and provide targeted solutions
- **Rebase conflicts**: Step-by-step conflict resolution guide

## Success Criteria

- [ ] PR checked out successfully
- [ ] Rebased onto main without conflicts
- [ ] Project builds without errors
- [ ] All tests pass
- [ ] Linting passes
- [ ] Admin comment posted
- [ ] PR merged with squash
- [ ] Local branch cleaned up

## Quick Reference

### Direct PR Input
```bash
# Skip PR listing and go directly to merge
/pr-merge 1234                                    # PR number
/pr-merge #1234                                   # PR number with hash
/pr-merge https://github.com/owner/repo/pull/1234 # Full URL
```

### List PRs
```bash
# List mergeable PRs only
/pr-merge --list

# List all PRs including non-mergeable
/pr-merge --list --include-all
```

### Validation Commands
```bash
# Full validation sequence
pnpm install && pnpm build && pnpm vitest run && pnpm check:errors

# Individual validation steps
pnpm install    # Install dependencies
pnpm build      # Build project
pnpm vitest run # Run tests
pnpm check:errors       # Run linter
```

### Git Commands
```bash
# Rebase onto main
git fetch origin && git rebase origin/main

# Merge PR with squash
gh pr merge [PR_NUMBER] --squash --delete-branch

# Clean up local branches
git checkout main && git pull origin main && git branch -d [branch-name]
```

## Workflow State Markers

The command uses internal state tracking:

- **PR Selection**: Documented internally
- **Rebase Process**: Documented internally
- **Validation Results**: Documented internally
- **Admin Comment**: Documented internally
- **Merge Process**: Documented internally
- **Cleanup Process**: Documented internally
- **Final Status**: Single summary message

## Best Practices

### Before Merging
- [ ] Ensure PR has been reviewed and approved
- [ ] Verify all CI checks are passing
- [ ] Check that PR is mergeable
- [ ] Confirm no breaking changes without migration guides

### During Merging
- [ ] Always rebase onto latest main
- [ ] Resolve conflicts carefully
- [ ] Run full validation suite
- [ ] Use GitHub's squash merge for clean history

### After Merging
- [ ] Clean up local branches
- [ ] Update main branch
- [ ] Verify merge was successful
- [ ] Monitor for any issues

## Safety Features

- **Force push with lease**: Prevents accidental overwrites
- **User confirmation**: All destructive actions require confirmation
- **Conflict resolution**: Guided help for rebase conflicts
- **Validation checks**: Multiple quality gates before merge
- **Rollback capability**: Ability to abort at any step

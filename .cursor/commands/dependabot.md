# Dependabot PR Handler

## Overview
Automated workflow for handling Dependabot pull requests with dependency updates, changeset generation, and automated processing. Supports both interactive PR selection and direct PR input via number or URL.

## Prerequisites
- **pnpm** must be available (not npm)
- **GitHub CLI** (`gh` command) must be installed
- **Admin permissions** required for squashing PRs
- **Current directory**: Must be in the fusion-framework repository root

## Workflow Steps Overview

| Step | Action | Purpose | Status |
|------|--------|---------|--------|
| [0](#0-optional-direct-pr-input-skip-step-1) | Direct PR Input | Skip listing, process specific PR | Optional |
| [1](#1-list-and-select-dependabot-pr) | List & Select PR | Choose Dependabot PR to process | Required (if step 0 not used) |
| [2](#2-check-existing-pr-status) | Check PR Status | Analyze existing workflow comments | Required |
| [2.5](#25-handle-stale-prs-if-needed) | Handle Stale PRs | Create fresh PR if needed | Conditional |
| [3](#3-check-if-changes-already-merged) | Check Merged Changes | Verify if changes already in main | Required |
| [4](#4-rebase-from-originmain-mandatory) | Rebase from Main | Ensure latest codebase | **MANDATORY** |
| [5](#5-research-update-impact) | Research Impact | Analyze dependency changes & test | Required |
| [6](#6-plan-work) | Plan Work | Create detailed action plan | Required |
| [7](#7-generate-changesets-if-needed) | Generate Changesets | Create version bump files | Conditional |
| [8](#8-fix-and-build) | Fix & Build | Apply fixes and build packages | Required |
| [9](#9-run-tests) | Run Tests | Execute full test suite | Required |
| [10](#10-commit-and-push) | Commit & Push | Save all changes | Required |
| [11](#11-pre-merge-summary) | Pre-Merge Summary | Final review before merge | Required |
| [12](#12-admin-squash) | Admin Squash | Merge PR as admin | Required |
| [13](#13-cleanup) | Cleanup | Clean up branches and PR | Required |

**Key Decision Points:**
- **Step 0 vs 1**: Use direct input if you know the PR number/URL
- **Step 2.5**: Triggered by stale PR detection
- **Step 7**: Only needed if packages require changesets
- **Step 4**: Must complete before any research/build operations

## Detailed Workflow Steps

### 0. Optional: Direct PR Input (Skip Step 1)
**USAGE**: If you already know the PR number or URL, you can skip the listing step.

**ACCEPTED INPUTS**:
- PR number: `1234` or `#1234`
- PR URL: `https://github.com/owner/repo/pull/1234`
- Full PR URL: `https://github.com/equinor/fusion-framework/pull/1234`

**VALIDATION**:
1. Extract PR number from input
2. Verify PR exists: `gh pr view [PR_NUMBER] --json number,title,author`
3. Confirm it's a Dependabot PR: Check `author.login` equals `"dependabot[bot]"`
4. Verify PR is open: Check `state` equals `"OPEN"`

**IF VALID**: Proceed directly to step 2 (Handle Stale PRs)
**IF INVALID**: Fall back to step 1 (List and Select)

**USAGE EXAMPLES**:
```bash
# Using PR number
/dependabot 1234

# Using PR number with hash
/dependabot #1234

# Using full GitHub URL
/dependabot https://github.com/equinor/fusion-framework/pull/1234

# Using short GitHub URL
/dependabot https://github.com/owner/repo/pull/1234
```

**ERROR HANDLING**:
- **Invalid PR number**: "PR #1234 not found or not accessible"
- **Not a Dependabot PR**: "PR #1234 is not authored by dependabot[bot]"
- **PR is closed**: "PR #1234 is not open (state: CLOSED/MERGED)"
- **Invalid URL format**: "Invalid PR URL format. Expected: https://github.com/owner/repo/pull/1234"

### 1. List and Select Dependabot PR
**COMMAND**: `gh pr list --author "dependabot[bot]" --state open`

**OUTPUT FORMAT**: Group PRs by update type and display as:

```
🚨 MAJOR UPDATES (Breaking changes, requires careful review)
- PR #XXXX: package-name from X.X.X to Y.Y.Y
- PR #YYYY: package-name from X.X.X to Y.Y.Y

🧩 MINOR UPDATES (New features, backward compatible)
- PR #ZZZZ: package-name from X.X.X to Y.Y.Y
- PR #AAAA: package-name from X.X.X to Y.Y.Y

🐞 PATCH UPDATES (Bug fixes, safe to apply)
- PR #BBBB: package-name from X.X.X to Y.Y.Y
- PR #CCCC: package-name from X.X.X to Y.Y.Y
```

**IMPORTANT RULES**:
- ❌ **Do NOT fetch detailed information** - only show the basic list
- ❌ **Do NOT run `gh pr view` commands** - wait for user selection
- ✅ **Wait for user to select** which PR to process
- ✅ **Then checkout** using `gh pr checkout [PR_NUMBER]`

### 2. Check Existing PR Status
**COMMAND**: `gh pr view [PR_NUMBER] --json comments --jq '.comments[] | select(.author.login != "dependabot[bot]") | {author: .author.login, body: .body, createdAt: .createdAt}'`

**ANALYZE COMMENTS**: Look for existing workflow comments to determine current status:
- **Research Findings**: Check if research has already been completed
- **Planned Work**: Check if work plan has been established
- **Ready for Merge**: Check if PR is already processed and ready
- **Process Log**: Check if work is already in progress
- **Workflow State Markers**: Look for HTML comments like `<!-- WORKFLOW_STATE: RESEARCH_COMPLETE -->` for AI resumption

**STATUS DETERMINATION**:
- **No workflow comments**: Start from step 3 (Check if Changes Already Merged)
- **Rebase only**: Start from step 5 (Research Update Impact)
- **Research only**: Start from step 5 (Research Update Impact)
- **Planning only**: Start from step 6 (Plan Work)
- **Planned work exists**: Check if work is in progress or completed
- **Ready for merge**: Skip to step 13 (Pre-Merge Summary)
- **Process log exists**: Determine current step and continue from there

**IF WORK ALREADY COMPLETED**: Display status and ask user if they want to restart or continue

### 2.5. Handle Stale PRs (if needed)
**TRIGGER CONDITIONS**:
- PR contains "Automatic rebases have been disabled" message
- PR is significantly behind main branch
- User explicitly requests fresh start

**DETECTION**: Look for "Automatic rebases have been disabled" message in PR

**VALIDATION**: Verify PR is actually a dependency update by checking if package.json files are modified

**IF STALE PR DETECTED**:
1. Close stale PR: `gh pr close [PR_NUMBER] --comment "Starting fresh from main due to staleness"`
2. Switch to main: `git switch main`
3. Pull latest: `git pull origin main`
4. Create new branch: `git switch -c dependabot/fresh-[package-name]-[version]`
5. Check current version in main
6. Find latest stable version using `pnpm info <package-name> versions --json` (avoid pre-release/zero day versions)
7. Update package: `pnpm update -r "@SCOPE/PACKAGE@STABLE_VERSION"`
8. Commit: `git add package.json pnpm-lock.yaml .changeset/ && git commit -m "chore: bump [package-name] to [version]"`
9. Push: `git push origin dependabot/fresh-[package-name]-[version]`
10. Create PR: `gh pr create --title "chore: bump [package-name] from [old-version] to [new-version]" --body "Fresh update from main"`

**IF PR IS CURRENT**: Proceed with existing version

### 3. Check if Changes Already Merged
**CHECK**: `git diff HEAD~1 --name-only`

**IF ONLY LOCK FILE CHANGES**:
1. Post comment: "This dependency update has already been incorporated into main. Closing this PR as the changes are no longer needed."
2. Close PR: `gh pr close [PR_NUMBER] --comment "Changes already in main"`
3. Skip to cleanup (step 13)

### 4. Rebase from Origin/Main (MANDATORY)
**⚠️ CRITICAL**: This step MUST be completed before any research, build, or test operations to ensure we're working with the latest codebase.

**CHECK LINEAR HISTORY**:
1. `git fetch origin`
2. Check if branch is already linear with main: `git merge-base --is-ancestor origin/main HEAD`

**IF LINEAR HISTORY EXISTS** (branch is already up-to-date):
- Skip rebase, proceed to step 5 (Research Update Impact)

**IF REBASE NEEDED** (branch is behind main):
3. `git rebase origin/main`

**IF REBASE MADE CHANGES** (check if HEAD moved):
4. `git push --force-with-lease origin [branch-name]`

**IF LOCK FILE CONFLICTS**:
1. `pnpm clean && rm -f pnpm-lock.yaml`
2. `pnpm install`
3. `git add pnpm-lock.yaml`
4. `git rebase --continue`
5. `git push --force-with-lease origin [branch-name]`

### 5. Research Update Impact
**ANALYZE PR**: Use `gh pr view [PR_NUMBER] --json title,body` to get details

**RESEARCH TASKS**:
1. Check dependency versions being updated (from/to)
2. Fetch changelog from package repository or npm
3. Review release notes for the target version
4. Identify breaking changes, new features, or bug fixes
5. Check for security updates or performance improvements
6. Identify which packages will be affected by the update
7. **Install dependencies and run build/test to analyze potential errors**:
   - `pnpm install` - Install the updated dependencies
   - `pnpm build` - Check for compilation/build errors
   - `pnpm test` - Check for test failures
   - **ANALYZE ONLY** - Document any errors and determine if they're related to the dependency update
   - **DO NOT FIX** - Only document breaking changes or compatibility issues discovered
   - **FIXES WILL BE APPLIED IN STEP 9** - This is research phase only

8. **Check Requested Updates**:
   - **ANALYZE PR**: Identify which packages are being updated
   - **CHECK**: If package.json files are altered
   - **MAJOR VERSION GATE**: If any dependency has major version bump → **PAUSE** and require user confirmation
   - **DEPENDENCY ANALYSIS**:
     ```bash
     # Check direct dependencies
     pnpm list --depth=0
     
     # Trace dependency usage
     pnpm why <package-name>
     
     # Full dependency tree
     pnpm ls --depth=Infinity
     ```
   - **IDENTIFY COMPILATION PACKAGES**:
     - @equinor/fusion-framework-cli
     - @equinor/fusion-framework-vite-plugin-spa
     - @equinor/fusion-framework-dev-server

**POST RESEARCH COMMENT**:
```bash
gh pr comment [PR_NUMBER] --body "## Research Findings (PR #[PR_NUMBER])

<!-- WORKFLOW_STATE: RESEARCH_COMPLETE -->

### Affected Packages
- [List packages that will be affected]

### Package Updates
- [package-name]: [old-version] → [new-version]

[Only include if applicable:]
### Breaking Changes
- [List any breaking changes]

[Only include if applicable:]
### New Features
- [List new features]

[Only include if applicable:]
### Security Updates
- [List security updates]

### Build & Test Analysis
- **Install Status**: [✅ Success / ❌ Failed with errors]
- **Build Status**: [✅ Success / ❌ Failed with errors]
- **Test Status**: [✅ All tests passed / ❌ Failed tests: X failed, Y passed]
- **Error Analysis**: [Document any install/build/test errors and their relation to the dependency update]
- **Compatibility Issues**: [List any compatibility problems discovered]

### Process Log
- ✅ Step 4: Rebase from Origin/Main completed
- ✅ Step 5: Research Update Impact completed

### Links
- [Changelog link]
- [Release notes link]"
```

**ERROR HANDLING DURING RESEARCH**:
- **Install failures**: Document specific errors and determine if they're related to the dependency update
- **Build failures**: Document specific errors and determine if they're related to the dependency update
- **Test failures**: Analyze which tests failed and why (API changes, breaking changes, etc.)
- **If errors are unrelated to update**: Note them but proceed with caution
- **If errors are related to update**: Include in risk assessment and planned work
- **Critical errors**: Consider if the update should be postponed or if additional fixes are needed
- **IMPORTANT**: This is ANALYSIS ONLY - do not attempt to fix any errors during research phase

### 6. Plan Work
**ANALYZE RESEARCH FINDINGS**: Review all research data to create comprehensive work plan

**PLANNING TASKS**:
1. Assess risk level based on research findings
2. Determine mitigation strategies for identified issues
3. Plan specific fixes for build/test errors discovered
4. Identify which packages need changesets
5. Estimate effort and potential blockers
6. Create detailed action plan

**POST PLANNED WORK COMMENT**:
```bash
gh pr comment [PR_NUMBER] --body "## Planned Work (PR #[PR_NUMBER])

<!-- WORKFLOW_STATE: PLANNING_COMPLETE -->

Based on research findings, the following actions will be taken:

### Update Process
- [x] Rebase from origin/main (completed)
- [ ] Generate changesets for affected packages
- [ ] Fix any linting/type errors
- [ ] Fix any build errors discovered during research
- [ ] Fix any test failures discovered during research
- [ ] Run full test suite
- [ ] Verify build success

### Risk Assessment
- [Risk level: Low/Medium/High]
- [Mitigation strategy if applicable]
- [Build/Test Error Risk: Low/Medium/High based on research findings]

### Expected Impact
- [Brief description of expected changes]
- [Any special considerations]
- [Known issues to address based on build/test analysis]
```

**PAUSE**: Display planning summary and ask user to confirm continuation

### 7. Generate Changesets (if needed)
**CREATE CHANGESETS FOR**:
- Direct package.json changes
- Compilation packages (cli, spa plugin, dev-server) if they depend on updated packages

**CHANGESET FORMAT**:
```markdown
---
"@equinor/fusion-package-name": patch
---

Description of changes...

### Links
- [GitHub releases](https://github.com/owner/repo/releases/tag/vX.X.X)
- [npm changelog](https://www.npmjs.com/package/package-name?activeTab=versions)
```

**FILENAME**: `[package-name]_[update-type]_[date].md` (e.g., `cli_patch_2024-01-15.md`)
**VERSION TYPES**: 
- `patch`: Bug fixes, backward compatible
- `minor`: New features, backward compatible  
- `major`: Breaking changes, requires migration

### 8. Fix and Build
**⚠️ THIS IS WHERE FIXES BEGIN** - All errors discovered during research phase will be addressed here

**FIX ISSUES**: `pnpm check:errors --fix` (will only lint code)

**BUILD COMMANDS**:
- vue-press packages affected: `pnpm build:docs`
- Other packages affected: `pnpm build`
- Both affected: `pnpm build` (includes docs)

**SPECIAL VUE PACKAGES**:
```bash
# VuePress packages with unusual naming
pnpm upgrade "@vuepress/*@next"
pnpm upgrade "vuepress-theme-hope@latest"
```

**REQUIRED**: `pnpm install` (regenerate lock file)

**⚠️ NEVER MODIFY**:
- `PACKAGE_ROOT/dist/` folders
- `PACKAGE_ROOT/bin` folders  
- `node_modules/` folders
- Only modify source files, not generated output

### 9. Run Tests
**COMMAND**: `pnpm vitest run`
**REQUIREMENT**: All tests must pass before proceeding
**IF FAILURES**: Fix issues before committing changes

### 10. Commit and Push
**PAUSE**: Display summary of all changes and ask user to confirm before committing
**COMMIT**: All changes (dependency updates + changesets)
**PUSH**: `git push --force-with-lease origin [branch-name]`

### 11. Pre-Merge Summary
**PAUSE**: Display PR summary and ask user to confirm before squashing and merging
**POST PRE-MERGE COMMENT**:
```bash
gh pr comment [PR_NUMBER] --body "## Ready for Merge ✅ (PR #[PR_NUMBER])

<!-- WORKFLOW_STATE: READY_FOR_MERGE -->

### Summary
**Work Completed:**
- [Specific findings from research - e.g., "Identified breaking change in API method signature"]
- [Specific fixes applied - e.g., "Updated 3 test files to handle new async behavior"]
- [Specific changesets created - e.g., "Generated changeset for cli package due to transitive dependency"]
- [Specific issues resolved - e.g., "Fixed TypeScript errors in 2 modules after API changes"]
- [Specific packages affected - e.g., "Updated 5 packages: framework, cli, dev-server, and 2 cookbooks"]

**Update Details:** [X] package(s) updated from [old-version] to [new-version] ([patch/minor/major] changes)

### Packages Updated
- [package-name]: [old-version] → [new-version]

### Changesets Created
- [changeset-filename].md
  - [Permalink to changeset](https://github.com/equinor/fusion-framework/blob/[commit-sha]/.changeset/[changeset-filename].md)

### Fixes Applied
- [linting/type issues fixed]

### Test Results
- 👍🏻 All tests passed (Duration: [X]m [Y]s)
- 👍🏻 Build successful (Duration: [X]m [Y]s)

### Admin Merge Reason
This dependency update will be merged by admin to expedite the routine update process. All automated checks have passed and no breaking changes were detected, making it safe to merge without additional review.

🚀 Ready for squash."
```

### 12. Admin Squash
**COMMAND**: `gh pr merge [PR_NUMBER] --squash --delete-branch --admin`
**SQUASH**: PR as admin to clean up commit history

### 13. Cleanup
**COMMANDS**:
1. `git switch main`
2. `git pull origin main`
3. `git branch -D [branch-name]`

**IF PR STILL OPEN**: `gh pr close [PR_NUMBER] --comment "Changes have been incorporated into main"`

## Workflow State Markers

The command uses HTML comments in PR comments to enable AI resumption:

- `<!-- WORKFLOW_STATE: REBASE_COMPLETE -->` - Rebase phase completed
- `<!-- WORKFLOW_STATE: RESEARCH_COMPLETE -->` - Research phase completed
- `<!-- WORKFLOW_STATE: PLANNING_COMPLETE -->` - Work planning completed  
- `<!-- WORKFLOW_STATE: READY_FOR_MERGE -->` - Ready for admin merge

These markers help AI determine the current workflow state when resuming interrupted processes.

## Timeout Considerations

### Long-Running Operations
- **Build commands**: Set reasonable timeouts (e.g., 10-15 minutes)
- **Test suites**: Allow sufficient time for full test execution
- **Install operations**: Monitor for network timeouts and retry if needed

### Interrupted Workflows
- **AI resumption**: Use workflow state markers to resume from last completed step
- **Network issues**: Retry failed commands with exponential backoff
- **Process cleanup**: Ensure proper cleanup if workflow is interrupted

## Quick Reference

### Direct PR Input
```bash
# Skip PR listing and go directly to processing
/dependabot 1234                                    # PR number
/dependabot #1234                                   # PR number with hash
/dependabot https://github.com/owner/repo/pull/1234 # Full URL
```

### Dependency Analysis Commands
```bash
# Check which packages use the updated dependency
pnpm why <package-name>

# List all dependencies for a specific package
pnpm list --depth=0 --filter <package-name>

# Check workspace structure
cat tsconfig.json
```

### Changeset Requirements
- **Always create**: Direct package.json changes
- **Create for compilation packages**: If they depend on updated packages
- **Bundled dependencies**: Packages with `rollup.config.js` or `vite.config.ts`

### Error Handling
- **Major version updates**: Pause and require user approval
- **Research phase install failures**: Document errors and determine if related to dependency update
- **Research phase build failures**: Document errors and determine if related to dependency update
- **Research phase test failures**: Analyze failures and include in risk assessment
- **Rebase fails**: Abort and report conflict
- **Build fails**: Report specific errors and stop
- **Push fails**: Check permissions and retry
- **Branch deletion warning**: Safe to ignore "not yet merged to HEAD"
- **Checkout fails**: Verify PR exists and permissions
- **Changeset generation fails**: Check .changeset directory permissions
- **Test failures**: Fix issues before proceeding, rollback if needed

### Success Criteria
- [ ] PR checked out
- [ ] Rebased onto latest main (MANDATORY before research)
- [ ] Dependency updates verified
- [ ] Changesets created
- [ ] All checks pass (lint, type, build)
- [ ] Changes committed and pushed
- [ ] PR ready for admin squash merge

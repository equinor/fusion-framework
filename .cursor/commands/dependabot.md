# Dependabot PR Handler

## Overview
Automated workflow for handling Dependabot pull requests with dependency updates, changeset generation, and automated processing. Supports both interactive PR selection and direct PR input via number or URL.

## Prerequisites
- **pnpm** must be available (not npm)
- **GitHub CLI** (`gh` command) must be installed
- **Admin permissions** required for squashing PRs
- **Current directory**: Must be in the fusion-framework repository root

## Workflow Steps

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

**STATUS DETERMINATION**:
- **No workflow comments**: Start from step 4 (Research Update Impact)
- **Research only**: Start from step 5 (Rebase from Origin/Main)
- **Planned work exists**: Check if work is in progress or completed
- **Ready for merge**: Skip to step 11 (Pre-Merge Summary)
- **Process log exists**: Determine current step and continue from there

**IF WORK ALREADY COMPLETED**: Display status and ask user if they want to restart or continue

### 3. Handle Stale PRs (if needed)
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

### 4. Research Update Impact
**ANALYZE PR**: Use `gh pr view [PR_NUMBER] --json title,body` to get details

**RESEARCH TASKS**:
1. Check dependency versions being updated (from/to)
2. Fetch changelog from package repository or npm
3. Review release notes for the target version
4. Identify breaking changes, new features, or bug fixes
5. Check for security updates or performance improvements
6. Identify which packages will be affected by the update

**POST RESEARCH COMMENT**:
```bash
gh pr comment [PR_NUMBER] --body "## Research Findings

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

### Links
- [Changelog link]
- [Release notes link]"
```

**POST PLANNED WORK COMMENT**:
```bash
gh pr comment [PR_NUMBER] --body "## Planned Work

Based on research findings, the following actions will be taken:

### Update Process
- [ ] Rebase from origin/main
- [ ] Generate changesets for affected packages
- [ ] Fix any linting/type errors
- [ ] Run full test suite
- [ ] Verify build success

### Risk Assessment
- [Risk level: Low/Medium/High]
- [Mitigation strategy if applicable]

### Expected Impact
- [Brief description of expected changes]
- [Any special considerations]"
```

**PAUSE**: Display research summary and ask user to confirm continuation

### 5. Rebase from Origin/Main (if needed)
**CHECK LINEAR HISTORY**:
1. `git fetch origin`
2. Check if branch is already linear with main: `git merge-base --is-ancestor origin/main HEAD`

**IF LINEAR HISTORY EXISTS** (branch is already up-to-date):
- Skip rebase, proceed to step 6

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

### 5.1. Check if Changes Already Merged
**CHECK**: `git diff HEAD~1 --name-only`

**IF ONLY LOCK FILE CHANGES**:
1. Post comment: "This dependency update has already been incorporated into main. Closing this PR as the changes are no longer needed."
2. Close PR: `gh pr close [PR_NUMBER] --comment "Changes already in main"`
3. Skip to cleanup (step 11)

### 6. Check Requested Updates
**ANALYZE PR**: Identify which packages are being updated
**CHECK**: If package.json files are altered

**MAJOR VERSION GATE**:
- If any dependency has major version bump → **PAUSE** and require user confirmation
- Display packages with major updates and breaking changes
- User must explicitly approve before proceeding

**DEPENDENCY ANALYSIS**:
```bash
# Check direct dependencies
pnpm list --depth=0

# Trace dependency usage
pnpm why <package-name>

# Full dependency tree
pnpm ls --depth=Infinity
```

**IDENTIFY COMPILATION PACKAGES**: 
- @equinor/fusion-framework-cli, 
- @equinor/fusion-framework-vite-plugin-spa, 
- @equinor/fusion-framework-dev-server

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
gh pr comment [PR_NUMBER] --body "## Ready for Merge ✅

### Packages Updated
- [package-name]: [old-version] → [new-version]

### Changesets Created
- [changeset-filename].md
  - [Permalink to changeset](https://github.com/equinor/fusion-framework/blob/[commit-sha]/.changeset/[changeset-filename].md)

### Fixes Applied
- [linting/type issues fixed]

### Process Log
- ✅ [Actual step performed with context]
- ✅ [Actual step performed with context]
- ✅ [Actual step performed with context]

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

## Quick Reference

### Direct PR Input
```bash
# Skip PR listing and go directly to processing
dependabot 1234                                    # PR number
dependabot #1234                                   # PR number with hash
dependabot https://github.com/owner/repo/pull/1234 # Full URL
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
- **Rebase fails**: Abort and report conflict
- **Build fails**: Report specific errors and stop
- **Push fails**: Check permissions and retry
- **Branch deletion warning**: Safe to ignore "not yet merged to HEAD"
- **Checkout fails**: Verify PR exists and permissions
- **Changeset generation fails**: Check .changeset directory permissions
- **Test failures**: Fix issues before proceeding, rollback if needed

### Success Criteria
- [ ] PR checked out
- [ ] Rebased onto latest main
- [ ] Dependency updates verified
- [ ] Changesets created
- [ ] All checks pass (lint, type, build)
- [ ] Changes committed and pushed
- [ ] PR ready for admin squash merge

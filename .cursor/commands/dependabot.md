# Dependabot PR Handler

## Overview
Automated workflow for handling Dependabot pull requests with dependency updates, changeset generation, and automated processing.

## Prerequisites
- **pnpm** must be available (not npm)
- **GitHub CLI** (`gh` command) must be installed
- **Admin permissions** required for squashing PRs
- **Current directory**: Must be in the fusion-framework repository root

## Workflow Steps

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

### 2. Handle Stale PRs (if needed)
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

### 3. Research Update Impact
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

### Package Updates
- [package-name]: [old-version] → [new-version]

### Breaking Changes
- [List any breaking changes]

### New Features
- [List new features]

### Security Updates
- [List security updates]

### Affected Packages
- [List packages that will be affected]

### Links
- [Changelog link]
- [Release notes link]"
```

**PAUSE**: Display research summary and ask user to confirm continuation

### 4. Rebase from Origin/Main
**COMMANDS**:
1. `git fetch origin`
2. `git rebase origin/main`

**IF LOCK FILE CONFLICTS**:
1. `rm pnpm-lock.yaml node_modules/ -rf`
2. `pnpm install`
3. `git add pnpm-lock.yaml`
4. `git rebase --continue`

### 4.1. Check if Changes Already Merged
**CHECK**: `git diff HEAD~1 --name-only`

**IF ONLY LOCK FILE CHANGES**:
1. Post comment: "This dependency update has already been incorporated into main. Closing this PR as the changes are no longer needed."
2. Close PR: `gh pr close [PR_NUMBER] --comment "Changes already in main"`
3. Skip to cleanup (step 11)

### 5. Check Requested Updates
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

### 6. Generate Changesets (if needed)
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

### 7. Fix and Build
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

### 8. Run Tests
**COMMAND**: `pnpm vitest run`
**REQUIREMENT**: All tests must pass before proceeding
**IF FAILURES**: Fix issues before committing changes

### 9. Commit and Push
**PAUSE**: Display summary of all changes and ask user to confirm before committing
**COMMIT**: All changes (dependency updates + changesets)
**PUSH**: `git push --force-with-lease origin [branch-name]`

### 10. Admin Squash
**PAUSE**: Display PR summary and ask user to confirm before squashing and merging
**COMMAND**: `gh pr merge [PR_NUMBER] --squash --delete-branch`
**SQUASH**: PR as admin to clean up commit history
**POST COMPLETION COMMENT**:
```bash
gh pr comment [PR_NUMBER] --body "## Update Complete ✅

### Packages Updated
- [package-name]: [old-version] → [new-version]

### Changesets Created
- [changeset-filename].md

### Fixes Applied
- [linting/type issues fixed]

### Test Results
- All tests passed ✅
- Build successful ✅"
```

### 11. Cleanup
**COMMANDS**:
1. `git switch main`
2. `git pull origin main`
3. `git branch -D [branch-name]`

**IF PR STILL OPEN**: `gh pr close [PR_NUMBER] --comment "Changes have been incorporated into main"`

## Quick Reference

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

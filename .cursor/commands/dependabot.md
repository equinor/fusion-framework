# Dependabot PR Handler

## Overview
Automated workflow for handling Dependabot pull requests with dependency updates, changeset generation, and automated processing.

## Workflow Steps

### 1. List and Select Dependabot PR
- List all open PRs from dependabot[bot] using `gh pr list --author "dependabot[bot]"`
- Display PRs in a simple list format grouped by update type:

**🚨 MAJOR UPDATES** (Breaking changes, requires careful review)
- PR #XXXX: package-name from X.X.X to Y.Y.Y
- PR #YYYY: package-name from X.X.X to Y.Y.Y

**🧩 MINOR UPDATES** (New features, backward compatible)
- PR #ZZZZ: package-name from X.X.X to Y.Y.Y
- PR #AAAA: package-name from X.X.X to Y.Y.Y

**🐞 PATCH UPDATES** (Bug fixes, safe to apply)
- PR #BBBB: package-name from X.X.X to Y.Y.Y
- PR #CCCC: package-name from X.X.X to Y.Y.Y

- **Do NOT fetch detailed information** - just show the grouped list
- Allow user to select which PR to process
- Checkout the selected PR using `gh pr checkout [PR_NUMBER]`

### 2. Handle Stale PRs (if needed)
- **Check if PR is stale**: Look for "Automatic rebases have been disabled" message
- **If stale PR detected**: Start fresh from main
  - Close the stale PR: `gh pr close [PR_NUMBER] --comment "Starting fresh from main due to staleness"`
  - Switch to main: `git switch main`
  - Pull latest changes: `git pull origin main`
  - Create new branch: `git checkout -b dependabot/fresh-[package-name]-[version]`
  - Check current dependency version in main
  - Find latest stable version (avoid pre-release/zero day versions)
  - Use `pnpm update -r "@SCOPE/PACKAGE@STABLE_VERSION"` to update outdated packages
  - Commit the updated version: `git add . && git commit -m "chore: bump [package-name] to [version]"`
  - Push new branch: `git push origin dependabot/fresh-[package-name]-[version]`
  - Create new PR: `gh pr create --title "chore: bump [package-name] from [old-version] to [new-version]" --body "Fresh update from main"`
- **If PR is current**: Proceed with existing version

### 3. Research Update Impact
- Analyze the selected PR to understand the full impact
- Check dependency versions being updated (from/to)
- **Analyze package changelog and release notes:**
  - Fetch changelog from package repository or npm
  - Review release notes for the target version
  - Identify breaking changes, new features, or bug fixes
  - Check for security updates or performance improvements
- Identify which packages will be affected by the update
- Generate a short summary of the impact and implications
- **Post research findings as PR comment:**
  - Create detailed comment with research summary
  - Include links to changelog/release notes
  - Highlight breaking changes, new features, or security updates
  - Mention affected packages and potential impact
  - Use `gh pr comment [PR_NUMBER] --body "research findings"` command
- **PAUSE**: Display research summary and ask user to confirm continuation

### 4. Rebase from Origin/Main
- Fetch latest changes from origin
- Rebase the PR branch onto origin/main to ensure latest changes
- **If merge conflicts occur in lock file:**
  - Delete `pnpm-lock.yaml` and `node_modules/`
  - Run `pnpm install` to regenerate clean lock file
  - Continue rebase with regenerated lock file

### 4.1. Check if Changes Already Merged
- **After rebase, check if changes are already in main:**
  - Run `git diff HEAD~1 --name-only` to see what changed
  - If only lock file changes and they're already in main, proceed to close PR
  - If changes are already incorporated, skip to PR closing step
- **If changes already in main:**
  - Post comment: "This dependency update has already been incorporated into main. Closing this PR as the changes are no longer needed."
  - Close the PR: `gh pr close [PR_NUMBER] --comment "Changes already in main"`
  - Skip remaining steps and go directly to cleanup

### 5. Check Requested Updates
- Analyze the PR to identify which packages are being updated
- Check if package.json files are altered
- **GATE: Check for major version updates**
  - If any dependency has a major version bump, pause and require user confirmation
  - Display which packages have major updates and potential breaking changes
  - User must explicitly approve before proceeding
- Determine if packages are part of compilation packages (cli, spa plugin, dev-server)
- **Use dependency graph to understand impact scope:**
  - Run `pnpm list --depth=0` to see direct dependencies
  - Use `pnpm why <package-name>` to trace dependency usage
  - Check `pnpm-workspace.yaml` for workspace structure
  - Analyze `package.json` files in affected packages
  - Use `pnpm ls --depth=Infinity` for full dependency tree

### 6. Generate Changesets (if needed)
- If package.json is altered, create changeset for affected packages
- If compilation packages are affected, analyze dependency graph and create changesets
- **Manually create changeset files in `.changeset/` folder:**
  - Generate unique filename: `[package-name]_[description].md`
  - Use proper YAML frontmatter format
  - Include clear description of changes
  - **Add links to dependency release/changelog:**
    - Link to GitHub releases page
    - Link to npm package changelog
    - **Summarize specific version release notes** in the changeset description
  - Use appropriate version bump type (patch/minor/major)

### 7. Fix and Build
- Run `pnpm check:errors --fix` to fix any linting/type issues
- **Check if packages affect vue-press (docs):**
  - If vue-press packages are affected: Run `pnpm build:docs`
  - If other packages are affected: Run `pnpm build`
  - If both are affected: Run `pnpm build` (includes docs)
- **Handle special Vue packages:**
  - `@vuepress/*@next` - Use `pnpm upgrade "@vuepress/*@next"`
  - `vuepress-theme-hope@latest` - Use `pnpm upgrade "vuepress-theme-hope@latest"`
  - These packages have unusual naming patterns and require specific upgrade commands
- **ALWAYS regenerate lock file**: Run `pnpm install` to update `pnpm-lock.yaml`
- **⚠️ NEVER alter files in build output directories:**
  - Avoid `PACKAGE_ROOT/dist/` folders
  - Avoid `PACKAGE_ROOT/bin` folders
  - Avoid `node_modules/` folders
  - Only modify source files, not generated output

### 8. Run Tests
- **Execute all tests**: Run `pnpm vitest run` to ensure all tests pass
- **Tests must pass**: If any tests fail, fix issues before proceeding
- **No test failures allowed**: All tests must pass before committing changes

### 9. Commit and Push
- Commit all changes (dependency updates + changesets)
- Push the updated branch to remote: `git push --force-with-lease origin [branch-name]`

### 10. Admin Squash
- Squash the PR as admin to clean up commit history
- Ensure clean, single-commit merge
- **Post completion summary as PR comment:**
  - Document all changes made during the update process
  - List packages that were updated and their new versions
  - Mention any changesets created
  - Note any fixes applied (linting, type issues, etc.)
  - Include test results and build status
  - Use `gh pr comment [PR_NUMBER] --body "completion summary"` command

### 11. Cleanup
- Switch to main branch: `git switch main`
- Pull latest changes: `git pull origin main`
- **If PR is still open and changes are already in main:**
  - Close the PR: `gh pr close [PR_NUMBER] --comment "Changes have been incorporated into main"`
- **Force delete local branch**: `git branch -D [branch-name]`
- Verify cleanup completed successfully

## Dependency Graph Analysis Methodology

### Quick Dependency Analysis
1. **Identify affected packages:**
   ```bash
   # Check which packages use the updated dependency
   pnpm why <package-name>
   
   # List all dependencies for a specific package
   pnpm list --depth=0 --filter <package-name>
   ```

2. **Check workspace structure:**
   - Review `pnpm-workspace.yaml` for package relationships
   - Check TypeScript path mappings in `tsconfig.json`
   - Identify compilation packages (cli, spa plugin, dev-server)
   - **For compilation packages**: Check for `rollup.config.js` or `vite.config.ts`
     - Dev dependencies are bundled (except type libs and testing tools)
     - All bundled dependencies require changesets

3. **Determine impact scope:**
   - **Direct dependencies**: Packages that directly import the updated package
   - **Transitive dependencies**: Packages that depend on packages using the updated dependency
   - **Compilation packages**: CLI, spa plugin, dev-server that need changesets

### Changeset Requirements
- **Always create changesets for**: Direct package.json changes
- **Create changesets for compilation packages**: If they depend on updated packages
- **Bundled dependencies**: For packages with `rollup.config.js` or `vite.config.ts`
  - All dev dependencies are bundled (except type libs and testing tools)
  - Changesets required for any bundled dependency updates
- **Use dependency graph**: To determine which packages need changesets

## Dependencies Check
- Verify pnpm is being used (not npm)
- Check GitHub CLI is available (`gh` command)
- Ensure user has admin permissions for squashing

## Error Handling
- If major version updates detected, pause and require explicit user approval
- If rebase fails, abort and report conflict
- If build fails, report specific errors and stop
- If changeset generation fails, report missing dependencies
- If push fails, check permissions and retry
- **Branch deletion warning**: If `git branch -d` shows "not yet merged to HEAD" warning, this is safe to ignore - the branch was deleted before remote merge completed

## Handling Already-Merged PRs
- **Detection**: After rebase, if `git diff HEAD~1 --name-only` shows only lock file changes
- **Verification**: Check if the dependency version in the lock file matches what's already in main
- **Action**: If changes are already incorporated:
  - Post explanatory comment to PR
  - Close the PR with appropriate message
  - Skip all remaining processing steps
  - Proceed directly to cleanup
- **Benefits**: Prevents duplicate work and keeps PR list clean

## Success Criteria
- [ ] PR successfully checked out
- [ ] Rebased onto latest main
- [ ] All dependency updates verified
- [ ] Changesets created for affected packages
- [ ] All checks pass (lint, type, build)
- [ ] Changes committed and pushed
- [ ] PR ready for admin squash merge

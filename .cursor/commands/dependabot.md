# Dependabot PR Handler

## Overview
Automated workflow for handling Dependabot pull requests with dependency updates, changeset generation, and automated processing.

## Workflow Steps

### 1. List and Select Dependabot PR
- List all open PRs from dependabot[bot] using `gh pr list --author dependabot[bot]`
- Display basic PR info: title, number, status, and update type indicators:
  - 🚨 **Major updates** - Breaking changes, requires careful review
  - 🧩 **Minor updates** - New features, backward compatible
  - 🐞 **Patch updates** - Bug fixes, safe to apply
- **Do NOT fetch detailed information** - just show the list
- Allow user to select which PR to process
- Checkout the selected PR using `gh pr checkout [PR_NUMBER]`

### 2. Update Stale PRs (if needed)
- **Check if PR is stale**: Look for "Automatic rebases have been disabled" message
- **If stale PR detected**: Update to latest version (but not zero day)
  - Check current dependency version in PR
  - Find latest stable version (avoid pre-release/zero day versions)
  - Use `pnpm update -r "@SCOPE/PACKAGE@STABLE_VERSION"` to update outdated packages
  - Commit the updated version
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
- **PAUSE**: Display research summary and ask user to confirm continuation

### 4. Rebase from Origin/Main
- Fetch latest changes from origin
- Rebase the PR branch onto origin/main to ensure latest changes
- **If merge conflicts occur in lock file:**
  - Delete `pnpm-lock.yaml` and `node_modules/`
  - Run `pnpm install` to regenerate clean lock file
  - Continue rebase with regenerated lock file

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

### 11. Cleanup
- Switch to main branch: `git switch main`
- Pull latest changes: `git pull origin main`
- **Check if PR is fully merged**: `gh pr view [PR_NUMBER] --json state`
- Delete local branch: `git branch -d [branch-name]`
- **If warning appears**: The branch was deleted before remote merge completed (safe to ignore)
- **Alternative approach**: Wait 30 seconds after squash merge before deleting local branch
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

## Success Criteria
- [ ] PR successfully checked out
- [ ] Rebased onto latest main
- [ ] All dependency updates verified
- [ ] Changesets created for affected packages
- [ ] All checks pass (lint, type, build)
- [ ] Changes committed and pushed
- [ ] PR ready for admin squash merge

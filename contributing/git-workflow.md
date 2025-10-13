# Git Workflow: Linear History

> **🚨 CRITICAL RULE: NEVER rebase or push directly to main**<br/>
> All commits to main must come through Pull Requests (PRs) with proper code review, CI checks, and approval. Work on feature branches only!

## Why Linear History?

Linear history keeps your repository clean and understandable:
- **Clarity**: Chronological order of changes
- **Debugging**: Easy to bisect and find when bugs were introduced
- **Reverting**: Simple to revert specific changes
- **Merging**: Fewer conflicts and cleaner integration

## Core Workflow

```bash
# 1. Create feature branch from main
git checkout -b feature/my-feature

# 2. Make focused commits with clear messages
git commit -m "feat: add user authentication"

# 3. Rebase to stay current with main
git rebase origin/main

# 4. Clean up commits before PR
git rebase -i HEAD~3  # Interactive rebase

# 5. Push and create PR
git push origin feature/my-feature

# NEVER: git checkout main && git rebase ...
# NEVER: git push origin main --force-with-lease
```

## Rebase Essentials

Rebase moves your commits to a new base. See [git-rebase docs](https://git-scm.com/docs/git-rebase) for details.

**Key Commands:**
- `git rebase origin/main` - Update feature branch with latest main
- `git rebase -i HEAD~n` - Interactive rebase to clean commits
- `git rebase --onto <newbase> <oldbase>` - Advanced rebasing

**Interactive Rebase Actions:**
- `pick` - Keep commit as-is
- `squash` - Combine with previous commit
- `reword` - Change commit message
- `drop` - Remove commit

## Common Pitfalls

### ❌ Never Rebase Main or Published Branches
Main branch should **only** receive commits via approved PRs. Never:
- `git checkout main && git rebase origin/main`
- `git push origin main --force-with-lease`

### ❌ Force Push Without Care
- Use `git push --force-with-lease` only on your own feature branches
- Never `git push --force` - it can overwrite others' work

### ❌ Squash Commits Too Early
Wait until PR review to squash - it makes review harder when commits disappear.

### ✅ Recovery from Rebase Issues
If conflicts occur during rebase:
```bash
# Fix conflicts, then:
git add <resolved-files>
git rebase --continue

# Or abort and start over:
git rebase --abort

# Special case: pnpm-lock.yaml conflicts
# Just run pnpm install to regenerate:
pnpm install
git add pnpm-lock.yaml
git rebase --continue
```

## Best Practices

### ✅ Essential Rules
- **Always work on feature branches** - never commit directly to main
- **Rebase regularly** to avoid large merge conflicts
- **Clean commits** with interactive rebase before PR
- **Test thoroughly** after rebasing
- **All main changes via PRs** - code review, CI, and approval required

### ✅ Git Worktree Tip
For working on multiple branches simultaneously without stashing:
```bash
# Create a new worktree for a branch
git worktree add ../feature-branch feature/my-feature

# List all worktrees
git worktree list

# Remove worktree when done
git worktree remove ../feature-branch
```
This keeps your main directory clean while working on multiple features.

### ❌ Critical Don'ts
- Don't rebase published/shared branches
- Don't force push to main (ever!)
- Don't ignore rebase conflicts
- Don't work directly on main branch

## Links
- [Git Rebase Documentation](https://git-scm.com/docs/git-rebase)
- [Interactive Rebase](https://git-scm.com/docs/git-rebase#_interactive_mode)
- [Git Workflow Best Practices](https://git-scm.com/book/en/v2/Git-Branching-Rebasing)

**Keep it simple: Feature branches + PRs = linear history**

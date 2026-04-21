---
description: Prompt for handling Dependabot pull requests
name: Dependabot PR Handler Prompt
---

# Dependabot PR Handler

Follow `.github/instructions/dependabot-pr.instructions.md` for safety rules.

## Determine intent

Ask the user if unclear:

- **"Review a single PR"** → load and follow `.agents/skills/fusion-dependency-review/SKILL.md`
- **"Process all / batch-process / clear backlog"** → load and follow `.agents/skills/custom-dependency-pr-solver/SKILL.md`

## If no PR is specified

List open Dependabot PRs first:

```bash
gh pr list --author "app/dependabot" --state open --json number,title
```

Let the user choose a PR (single review) or confirm the batch (solver).
- **Never skip steps**: Especially Steps 5 and 12 (comment posting)
- **Execute commands**: When posting comments, you MUST run `gh pr comment <PR_NUMBER> -F <comment-file>.md`, not just say you will
- **Get user consent**: For all critical operations (comments, pushes, merges)
- **Clean up**: Always remove temporary files and worktrees when done


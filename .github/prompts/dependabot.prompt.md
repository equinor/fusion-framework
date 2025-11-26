---
description: Prompt for handling Dependabot pull requests
name: Dependabot PR Handler Prompt
---

# Dependabot PR Handler Prompt

You are handling a Dependabot pull request. Follow the instructions in `.github/instructions/dependabot-pr.instructions.md` **completely and in order**.

## Initial Step: Identify the PR

### If PR URL is provided:
- Extract PR details: repository owner, repository name, PR number, and branch name
- Store these details for use throughout the workflow
- Proceed to Step 2: Create Git Worktree for PR

### If NO PR URL is provided:
You MUST do the following:

1. **List Dependabot PRs** (always do this first):
   - Execute: `gh pr list --author "app/dependabot" --state open --json number,title`
   - Display the list of open Dependabot PRs to the user in a formatted way:
     ```
     Open Dependabot PRs:
     
     #<number> - <title>
     
     [Repeat for each PR]
     ```
   - Categorize PRs by update type (MAJOR/MINOR/PATCH) if possible from the title or labels
   - Group by update type if multiple PRs exist

2. **Ask user to select PR**:
   - Prompt: "Please provide the Dependabot PR number (e.g., 1234) or PR URL from the list above"
   - Wait for user response
   - Parse the response to extract PR number or URL
   - If PR number provided: Use `gh pr view <PR_NUMBER>` to get full PR details
   - Store PR details (repository owner, name, PR number, branch name)
   - Proceed to Step 2: Create Git Worktree for PR

**CRITICAL**: Never auto-select a PR. The user MUST explicitly choose which PR to handle.

## After PR Selection

Once the PR is identified (either from URL, ID, or user selection from list), continue with the full workflow from `.github/instructions/dependabot-pr.instructions.md`:

1. ✅ Select PR (completed above)
2. Create Git Worktree for PR
3. Rebase Branch
4. Research Dependencies
5. Post Research Comment (MANDATORY - use `gh pr comment <PR_NUMBER> -F <file>.md`)
6. Install Dependencies
7. Build Project
8. Run Tests
9. Run Linting
10. Generate Changeset
11. Push Changes
12. Comment PR Results (MANDATORY - use `gh pr comment <PR_NUMBER> -F <file>.md`)
13. Squash Merge PR (optional, requires user approval)
14. Cleanup Repository
15. Finalize Instruction

## Important Reminders

- **Read the full instruction file**: `.github/instructions/dependabot-pr.instructions.md` before starting
- **Never skip steps**: Especially Steps 5 and 12 (comment posting)
- **Execute commands**: When posting comments, you MUST run `gh pr comment <PR_NUMBER> -F <comment-file>.md`, not just say you will
- **Get user consent**: For all critical operations (comments, pushes, merges)
- **Clean up**: Always remove temporary files and worktrees when done


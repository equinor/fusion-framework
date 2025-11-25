---
description: Rules for creating and managing pull requests
name: Pull Request Rules
---

# Pull Request Rules

## TL;DR (for AI agents)

- **Before PR**: Ensure `pnpm test && pnpm build && pnpm -w check` pass, changesets exist for consumer-facing or docs changes, and docs/TSDoc are updated.
- **Template**: Always use `.github/PULL_REQUEST_TEMPLATE.md`; fill all sections, describe current vs. new behavior, and clearly call out breaking changes.
- **Commits**: Use Conventional Commits for titles and commit messages (e.g. `feat(module-http): add retry logic`).
- **Content**: Do not list changed files in the PR body (GitHub already shows them); focus on motivation, behavior changes, and risk/impact.
- **Review**: When reviewing PRs, the PR body must be reviewed and should clearly explain what the PR does and how to review the changes.

## PR Creation

### Before Creating PR
- [ ] All local checks pass: `pnpm test && pnpm build && pnpm -w check`
- [ ] Changeset created if change affects consumers
- [ ] Code follows project standards
- [ ] Tests written and passing
- [ ] Documentation updated (TSDoc, README)

### PR Template
**ALWAYS use the PR template** located at `.github/PULL_REQUEST_TEMPLATE.md`

Required sections:
- **Why**: What kind of change, current behavior, new behavior
- **Breaking changes**: Yes/no and explanation
- **Related issues**: Link to issues this PR closes
- **Checklist**: Confirm self-review, validation, code of conduct

### PR Process
1. **Create as Draft**: All PRs must start as drafts
2. **Fill Template**: Complete all required sections
3. **Link Issues**: Reference related issues
4. **Self-Review**: Complete self-review checklist
5. **Mark Ready**: When all checks pass, mark as ready for review

## Commit Messages

Follow [Conventional Commits](contributing/conventional-commits.md):
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
- `feat(module-http): add retry logic`
- `fix(framework): resolve memory leak`
- `docs(readme): update installation instructions`

## PR Review Process

### When Reviewing a PR
- **Review the PR body**: The PR body content must be reviewed as part of the code review process
- **Clarity check**: The PR body must clearly explain what the PR does, including current vs. new behavior
- **Review guidance**: The PR body should provide clear text on how to review the changes (e.g., what to focus on, testing steps, areas of concern)
- If the PR body is unclear or missing essential information, request clarification before proceeding with code review

### When Changes Requested
- PR automatically moves to draft
- Creator must address feedback
- Creator must request re-review after changes

### When Approved
- Creator is normally responsible for merging
- Use auto-merge when appropriate
- Ensure all checks pass before merging

## PR Best Practices
- Keep PRs focused (one feature/fix per PR)
- Write clear, descriptive PR descriptions
- Link related issues and PRs
- Respond to review feedback promptly
- Keep PRs up to date with main branch

## AI Agent Rules

When generating PR content:
- Always use the PR template
- Fill all required sections
- Link related issues
- Include breaking change notes if applicable
- Reference changeset if created
- Follow conventional commit format for commits
- Ensure the PR body clearly explains what the PR does and provides guidance on how to review the changes

When reviewing PRs:
- Always review the PR body content as part of the review process
- Verify the PR body clearly explains the change and provides review guidance
- Request clarification if the PR body is unclear or missing essential information


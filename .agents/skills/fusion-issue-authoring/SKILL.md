---
name: fusion-issue-authoring
description: Orchestrate GitHub issue authoring by classifying request type, routing to a type-specific issue-author skill, and enforcing shared safety gates before mutation.
license: MIT
metadata:
  version: "0.2.3"
  status: active
  owner: "@equinor/fusion-core"

  role: "orchestrator"
  skills:
    - fusion-issue-author-bug
    - fusion-issue-author-feature
    - fusion-issue-author-user-story
    - fusion-issue-author-task
  tags:
    - github
    - issue-authoring
  mcp:
    required:
      - github
---

# Issue Authoring Orchestrator

## Subordinates

This skill routes to the following subordinate skills:

- `fusion-issue-author-bug` (`skills/fusion-issue-author-bug/SKILL.md`): bug-focused issue drafting and triage structure
- `fusion-issue-author-feature` (`skills/fusion-issue-author-feature/SKILL.md`): feature-focused scope and acceptance structure
- `fusion-issue-author-user-story` (`skills/fusion-issue-author-user-story/SKILL.md`): role/workflow/scenario-driven story structure
- `fusion-issue-author-task` (`skills/fusion-issue-author-task/SKILL.md`): checklist-first task decomposition and dependency planning

All subordinates require this orchestrator for shared gates (labels, assignee confirmation, draft review, publish confirmation, and mutation sequencing).

## When to use

Use this skill when you need to turn ideas, bugs, feature requests, or user needs into clear, actionable GitHub issues.
Use it as the top-level router for both creating and updating issues.

Typical triggers:
- "create an issue"
- "draft a ticket"
- "turn this into a GitHub issue"
- "help me structure this work item"
- "update this issue"
- "maintain/clean up this issue"

## When not to use

Do not use this skill for:
- Implementing code changes
- Pull request authoring or review
- General research tasks not resulting in an issue draft
- Mutating GitHub state without explicit user confirmation

## Required inputs

Collect before publishing:
- Target repository for issue creation/update
- Issue intent/context
- Issue type (Bug, Feature, User Story, Task)
- Existing issue number/url when updating
- Repository label set (or confirmation that labels are intentionally skipped). Reuse cached label results per repository within the same session.
- Parent/related issue links and dependency direction (sub-issue vs blocking)
- Assignee preference (assign to user, specific person, or leave unassigned)

If required details are missing, ask concise clarifying questions from `references/questions.md`.
If issue destination is unclear, ask explicitly where the issue should be created/updated before drafting mutation commands.

## Instructions

### Step 1 — Classify and route

Classify request as `Bug`, `Feature`, `User Story`, or `Task`, then route to:
- Bug -> `skills/fusion-issue-author-bug/SKILL.md`
- Feature -> `skills/fusion-issue-author-feature/SKILL.md`
- User Story -> `skills/fusion-issue-author-user-story/SKILL.md`
- Task -> `skills/fusion-issue-author-task/SKILL.md`

If ambiguous, ask only essential clarifying questions.

### Step 2 — Resolve repository and template

- Resolve the destination repository before any mutation.
- Template precedence:
  1. repository template (`.github/ISSUE_TEMPLATE/`)
  2. specialist fallback template

### Step 3 — Check duplicates

Run one focused duplicate search with `mcp_github::search_issues` and surface matches before drafting/publishing.
Do not run repeated broad duplicate scans unless the user changes scope/title materially.

### Step 4 — Draft first

Draft in `.tmp/{TYPE}-{CONTEXT}.md` using GitHub Flavored Markdown.

### Step 5 — Review and confirm

- Ask for content edits first.
- Ask explicit publish confirmation before mutation.
- Never publish/update in the same pass as first draft unless user explicitly confirms.

### Step 6 — Apply shared gates

Before mutation, confirm:
- labels (only labels that exist in the target repo)
- assignee intent (`@me`, specific login, or unassigned)

### Step 7 — Mutate via MCP (ordered)

After explicit confirmation, execute MCP mutations in this order:
1. `mcp_github::issue_write` create/update with the full known payload (`title`, `body`, and include `labels`, `assignees`, `type` only when supported)
2. Optional single follow-up `mcp_github::issue_write` only when required fields were unknown in step 1 and become available later
3. `mcp_github::sub_issue_write` only when relationship/order changes are requested
4. `mcp_github::add_issue_comment` only when blocker/status notes are explicitly requested

If mutation fails due to missing MCP server/auth/config:
- explain the failure clearly
- guide user to setup steps in `references/mcp-server.md`
- retry after user confirms setup is complete

Rate-limit behavior:
- Detect and report rate-limit failures clearly (`API rate limit exceeded`, `secondary rate limit`, GraphQL quota exhaustion).
- Stop non-essential lookups and skip optional enrichments when rate limits are hit.
- Keep draft artifacts and return a safe retry plan instead of looping retries.
- Prefer MCP tools over ad hoc `gh api`/GraphQL retries when equivalent MCP capability exists.
- When using GraphQL fallback: mutations cost 5 secondary-limit points each (vs 1 for queries), so batch fields into a single mutation call and pause at least 1 second between mutation calls.
- Respect `retry-after` and `x-ratelimit-reset` headers before retrying any request.

`type` rule:
- Only use `type` if the repository has issue types configured.
- Use cached issue types per organization when available.
- Call `mcp_github::list_issue_types` only on cache miss or invalid cache.
- If issue types are not supported, omit `type` for the rest of the session.

### Step 8 — Validate relationships

Before linking:
- use sub-issues for decomposition
- use sub-issue ordering to represent prerequisites
- ensure no contradictory dependency graph

Use detailed behavior and payload examples in `references/instructions.md` and `references/mcp-server.md`.

## Core behavior to preserve

- Classification-first workflow
- Route-to-specialized-skill workflow
- Draft-first workflow
- Clarifying questions for missing critical context
- Explicit confirmation before any GitHub mutation

Use detailed authoring guidance in `references/instructions.md`.
Specialist fallback template locations:
- Bug: `skills/fusion-issue-author-bug/assets/issue-templates/bug.md`
- Feature: `skills/fusion-issue-author-feature/assets/issue-templates/feature.md`
- User Story: `skills/fusion-issue-author-user-story/assets/issue-templates/user-story.md`
- Task: `skills/fusion-issue-author-task/assets/issue-templates/task*.md`

## Expected output
- Selected specialized skill path
- Draft issue file path under `.tmp/`
- Template source used (repository template path or fallback asset path)
- Proposed title, body summary, and labels
- Issue type plan
- Dependency plan (order + proposed sub-issue/blocking links)
- Assignee plan (who will be assigned, or explicit unassigned decision)
- Explicit status: `Awaiting user content approval` before any publish/update command
- Any related/duplicate issue links found
- Exact create/update command(s) to be run after confirmation
- Created/updated issue URL/number only after confirmed mutation
- Suggested template maintenance follow-up when repository templates are missing or weak

## Safety & constraints

Never:
- Run `mcp_github::issue_write` create/update without explicit user confirmation
- Publish/update an issue before the user confirms the draft content is correct
- Assume the user wants to publish to GitHub
- Request or expose secrets/credentials
- Perform destructive commands without explicit confirmation

Always:
- Keep drafts concise and editable
- Prefer WHAT/WHY over implementation HOW in issue text
- Use full repository issue references (for example `owner/repo#123`)
- Use issue-closing keywords when closure is intended (for example `fixes owner/repo#123`, `resolves owner/repo#123`, or `closes owner/repo#123`)

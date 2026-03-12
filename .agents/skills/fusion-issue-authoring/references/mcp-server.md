# GitHub MCP server reference

Use this file for GitHub MCP-specific tools and payload examples.

- Server repository: https://github.com/github/github-mcp-server

## Preferred issue-authoring tools

- `mcp_github::issue_write`: create or update issues.
- `mcp_github::search_issues`: search issues for duplicates/context.
- `mcp_github::sub_issue_write`: add/remove/reprioritize sub-issues.
- `mcp_github::search_users`: search users for assignment candidates.
- `mcp_github::add_issue_comment`: add comment to issue.
- `mcp_github::list_issue_types`: list available issue types.

## High-cost operations and mitigation

Common expensive paths in issue workflows:

- repeated `list_issue_types` calls per issue,
- repeated duplicate searches with broad queries,
- unnecessary second-pass issue updates for labels/assignees,
- GraphQL fallback retries that loop on rate-limit errors.

Mitigation policy:

- cache issue types per owner for the active session,
- run one focused duplicate search unless scope materially changes,
- send full known issue payload in the first `issue_write` call,
- run GraphQL fallback only when MCP coverage is missing and without retry loops.

## MCP readiness check

Run a read-only probe before issue authoring:

1. Try `mcp_github::search_issues` in the target repository with a lightweight query.
2. If that succeeds, MCP is ready.
3. If tools are unavailable or auth fails, run install-assist below.

## Install assist (VS Code)

1. Ensure VS Code supports remote MCP.
2. Configure GitHub MCP server:

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

3. Open Copilot Chat Agent mode and complete OAuth sign-in if prompted.
4. Re-run readiness probe (`mcp_github::search_issues`).

If remote MCP is not available in the host, use local server setup from the GitHub MCP server README.

## Tool quick map

- `mcp_github::issue_write` - Create or update issue.
- `mcp_github::search_issues` - Search issues.
- `mcp_github::sub_issue_write` - Change sub-issue.
- `mcp_github::search_users` - Search users.
- `mcp_github::add_issue_comment` - Add comment to issue.

## Blocking dependency note

There is no dedicated Issues MCP tool in this set for setting blocking/blocked links directly.

- Prefer `mcp_github::sub_issue_write` to organize issues in a logical execution order.
- Use `mcp_github::add_issue_comment` (or issue body text) to document blocker relationships when needed.

## `type` parameter rule

`type` is optional.

- Use `mcp_github::list_issue_types` to get valid type values for the organization.
- Only send `type` when the repository has issue types configured.
- If issue types are unsupported, omit `type`.

## Issue type lookup caching (recommended)

Do **not** run `mcp_github::list_issue_types` on every request.

Use this strategy:

1. Keep an in-session cache keyed by organization owner (`owner -> [types]`).
2. On create/update where `type` may be used:
  - if cache hit: validate against cached values
  - if cache miss: call `mcp_github::list_issue_types`, then cache result
3. If `mcp_github::issue_write` with `type` fails due to unsupported types, mark that owner as `types_unsupported` for the session and omit `type` afterwards.

Optional local cache file for longer runs:
- `.tmp/issue-type-cache.json` (never committed)
- refresh when owner changes or validation fails.

## Duplicate search minimization

- Prefer one focused query that combines key title terms and repository scope.
- Reuse the same duplicate search result set throughout draft review unless the problem statement changes.
- Avoid broad repeated searches after mutation failures; resolve auth/config first.

## Example props

### Create a Task issue

Only include `type` when issue types are supported.

```json
{
  "method": "create",
  "owner": "equinor",
  "repo": "fusion-skills",
  "title": "task: migrate issue-authoring flows to MCP",
  "body": "## Objective\nMove issue authoring from scripts to MCP-based operations.",
  "type": "Task",
  "assignees": ["odinr"]
}
```

### Update an issue and set type

Only include `type` when issue types are supported.

```json
{
  "method": "update",
  "owner": "equinor",
  "repo": "fusion-skills",
  "issue_number": 21,
  "type": "Task",
  "body": "Updated body with latest scope and checklist."
}
```

### Add a sub-issue to a parent issue

```json
{
  "method": "add",
  "owner": "equinor",
  "repo": "fusion-skills",
  "issue_number": 21,
  "sub_issue_id": 3969391411
}
```

Note: `sub_issue_id` is the sub-issue **ID**, not issue number.

### Reprioritize sub-issues

```json
{
  "method": "reprioritize",
  "owner": "equinor",
  "repo": "fusion-skills",
  "issue_number": 21,
  "sub_issue_id": 3969391411,
  "after_id": 3969391300
}
```

Use either `after_id` or `before_id` for reprioritization.

## Minimal task-batch order

1. `mcp_github::issue_write` create/update with full known fields (`title`, `body`, `labels`, `assignees`, optional `type`)
2. Optional single follow-up `mcp_github::issue_write` only for fields that were unavailable in step 1
3. `mcp_github::sub_issue_write` add/reprioritize children in execution order only when linkage changed
4. Optional: `mcp_github::add_issue_comment` to record blocker context when requested

## Rate-limit fallback behavior

GitHub GraphQL limits (summary from https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api):

| Limit | Value |
|---|---|
| Primary budget | 5,000 pts/hour per user (1,000 for `GITHUB_TOKEN` in Actions) |
| Mutation secondary cost | 5 pts per GraphQL mutation, 1 pt per read query |
| Secondary throughput | max 2,000 pts/minute; max 80 content-creating requests/minute |
| Concurrency | max 100 concurrent requests (shared REST + GraphQL) |
| Timeout | 10 s per request; timeout deducts extra points |

Behavior when limits are approached or hit:

- Check `x-ratelimit-remaining` and `retry-after` headers; respect the reset window.
- Stop optional enrichments and avoid automatic retry loops.
- Pause at least 1 second between consecutive mutation calls.
- Preserve draft state and return a clear retry sequence to the user.
- Prefer MCP calls over ad hoc GraphQL retries when equivalent MCP tools are available.
- Never retry a request that returned a secondary rate-limit error without waiting for the `retry-after` period.

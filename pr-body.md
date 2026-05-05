## Skills Upgrade

Automated run of `npx skills update` to update agent skills to their latest versions.
**Date:** 2026-05-05 08:46 UTC
**Node version:** 24

## Summary
- Changed / added skills: 3

## Updated Skills
- **fusion-issue-authoring**
  <details><summary>CHANGELOG additions for fusion-issue-authoring</summary>

## 0.3.4 - 2026-05-04
### patch
- [#153](https://github.com/equinor/fusion-skills/pull/153) [`3911da5`](https://github.com/equinor/fusion-skills/commit/3911da5922ab0b392d6c9b93a284ce0746870364) - Clarify sub_issue_id requires object ID, not issue number
  - Promote the ID vs number distinction to a prominent warning block above the example
  - Add a `gh api` command showing how to retrieve the object ID
  - Add a troubleshooting table covering 404, invalid input, and silent-failure modes
  - Clarify that `after_id`/`before_id` in reprioritize are also object IDs
  - Add sub-issue linking activation cues to SKILL.md triggers
  resolves equinor/fusion-skills#79
- [#156](https://github.com/equinor/fusion-skills/pull/156) [`3ed5296`](https://github.com/equinor/fusion-skills/commit/3ed52962820549c21ddbec57df01273c5c930749) - Strengthen devil's-advocate agent for task-planning context
  Expands the devil's advocate with:
  - Auto-escalation to interrogator mode when a task-planning pass surfaces two or more architecture-ambiguity signals (no user trigger required)
  - Extended Task concerns in moderate mode: premature decomposition, implicit cross-task contracts, and tasks that hide unresolved architecture assumptions
  - New "Task-planning context" section in interrogator mode with four targeted decision branches: premature decomposition, implicit contracts, sequencing pressure, and hidden assumptions
  resolves equinor/fusion-skills#132

</details>

- **fusion-issue-task-planning**
  <details><summary>CHANGELOG additions for fusion-issue-task-planning</summary>

## 0.1.6 - 2026-05-04
### patch
- [#156](https://github.com/equinor/fusion-skills/pull/156) [`3ed5296`](https://github.com/equinor/fusion-skills/commit/3ed52962820549c21ddbec57df01273c5c930749) - Add explicit devil's-advocate review step before task draft generation
  Inserts a new step 6 that inspects the proposed task set for architecture-ambiguity signals before any drafts are generated. When two or more signals are present (unresolved design decisions, implicit backend/frontend contracts, vague sequencing, contested ownership), the workflow automatically routes to interrogator mode without requiring a user trigger. In draft-only mode with unresolved ambiguities, an `⚠ Ambiguity warning` block is emitted at the top of the plan preview.
  resolves equinor/fusion-skills#132

</details>

- **fusion-mcp**
  <details><summary>CHANGELOG additions for fusion-mcp</summary>

## 1.0.0 - 2026-05-04
### major
- [#150](https://github.com/equinor/fusion-skills/pull/150) [`7f7c2d4`](https://github.com/equinor/fusion-skills/commit/7f7c2d480b8a562ddf6e5028a877b13a90bdb11a) - Update skill to reflect the new `equinor/fusion-mcp` server
  - Replace all references to the old `fusion-poc-mcp` PoC server and image
  - Promote the hosted production server (`https://mcp.api.fusion.equinor.com/mcp`) as the only recommended setup path; remove local Docker/GHCR guidance for end users
  - Update VS Code config to use HTTP + OAuth (Microsoft Entra) instead of Docker `stdio` with API keys
  - Rewrite `references/vscode-mcp-config.md` with one-click install link and manual OAuth config template
  - Update tool inventory to match the new server: `search`, `search_framework`, `search_docs`, `search_backend_code`, `search_eds`, `search_indexes`
  - Rewrite `references/mcp-call-snippets.md` with accurate per-tool parameter tables sourced from server code
  - Remove `references/local-http-quickstart.md` (local setup not promoted to end users)
  - Update troubleshooting to cover hosted-server failure modes (Entra auth, `401`, empty tool list)
  Resolves equinor/fusion-skills#149

</details>


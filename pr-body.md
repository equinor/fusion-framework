## Skills Upgrade

Automated run of `npx skills update` to update agent skills to their latest versions.
**Date:** 2026-06-03 09:38 UTC
**Node version:** 24

## Summary
- Changed / added skills: 14

## Updated Skills
- **fusion-code-conventions**
  <details><summary>CHANGELOG additions for fusion-code-conventions</summary>

## 0.1.3 - 2026-05-07
### patch
- [#170](https://github.com/equinor/fusion-skills/pull/170) [`5e43223`](https://github.com/equinor/fusion-skills/commit/5e432232917b2b1642431d80cf1698bbefe80ee8) - Apply caveman-compress prose style to SKILL.md and all convention references.
  - Drop articles, filler, hedging from SKILL.md activation body
  - Compress typescript, react, csharp, markdown convention references

</details>

- **fusion-dependency-review**
  <details><summary>CHANGELOG additions for fusion-dependency-review</summary>

## 0.1.4 - 2026-05-07
### patch
- [#170](https://github.com/equinor/fusion-skills/pull/170) [`5e43223`](https://github.com/equinor/fusion-skills/commit/5e432232917b2b1642431d80cf1698bbefe80ee8) - Apply caveman-compress prose style to SKILL.md, agents, and references.
  - Drop articles, filler, hedging from SKILL.md activation body
  - Compress research-advisor and verdict-advisor agent files
  - Compress instructions and questions references

</details>

- **fusion-discover-skills**
  <details><summary>CHANGELOG additions for fusion-discover-skills</summary>

## 0.1.5 - 2026-03-21
### patch
- [#113](https://github.com/equinor/fusion-skills/pull/113) [`d777366`](https://github.com/equinor/fusion-skills/commit/d777366fe6e1b710876a8e1abd2f311e3f4440c4) - Deprecate `fusion-discover-skills` in favour of `fusion-skills`
  All discovery, install, update, and remove functionality has been absorbed into the `discover` mode of `fusion-skills`. The skill is moved to `.deprecated/` with `metadata.status: deprecated` and `metadata.successor: fusion-skills`.
  Install the replacement: `npx -y skills add equinor/fusion-skills fusion-skills`
## 0.1.4 - 2026-03-21
### patch
- [#107](https://github.com/equinor/fusion-skills/pull/107) [`d75d8c6`](https://github.com/equinor/fusion-skills/commit/d75d8c60f15888fbe71340b53b2698f3361ac4c8) - Advertise `mcp_fusion_search_skills` for semantic discovery alongside advisory `mcp_fusion_skills`.
  - add `mcp_fusion_search_skills` to `mcp.suggested`
  - update compatibility line to distinguish source-backed search (`mcp_fusion_search_skills`) from advisory/lifecycle operations (`mcp_fusion_skills`)
  - update step 4 in instructions to route discovery to `mcp_fusion_search_skills` and lifecycle to `mcp_fusion_skills`
  Resolves equinor/fusion-core-tasks#834
## 0.1.3 - 2026-03-17
### patch
- [#85](https://github.com/equinor/fusion-skills/pull/85) [`c8ba3df`](https://github.com/equinor/fusion-skills/commit/c8ba3df924c5a712c835cdb9f4de44bac03b7ad4) - Make all GitHub-API-consuming skills more conservative with token usage.
  - `fusion-issue-authoring`: concrete session-cache flow for labels and assignee candidates; per-session budget table
  - `fusion-issue-solving`: expanded low-token strategy with session-cache references and budget awareness
  - `fusion-github-review-resolution`: token budget guidance for thread-heavy reviews; cache PR metadata once
  - `fusion-issue-task-planning`: session-cache delegation rules and batch-size warning for large task plans
  - `fusion-dependency-review`: explicit data-reuse rules across parallel advisor fan-out
  - `fusion-discover-skills`: tighter GraphQL budget and call-count cap for discovery sessions
  resolves equinor/fusion-core-tasks#797

</details>

- **fusion-github-review-resolution**
  <details><summary>CHANGELOG additions for fusion-github-review-resolution</summary>

## 0.1.7 - 2026-05-07
### patch
- [#170](https://github.com/equinor/fusion-skills/pull/170) [`5e43223`](https://github.com/equinor/fusion-skills/commit/5e432232917b2b1642431d80cf1698bbefe80ee8) - Apply caveman-compress prose style to SKILL.md.
  - Drop articles, filler, hedging from SKILL.md activation body

</details>

- **fusion-issue-author-bug**
  <details><summary>CHANGELOG additions for fusion-issue-author-bug</summary>

## 0.1.3 - 2026-03-18
### patch
- [#98](https://github.com/equinor/fusion-skills/pull/98) [`6bb9cdc`](https://github.com/equinor/fusion-skills/commit/6bb9cdcc1e2e0ed25d562bfd5db4dfab52559c0f) - Deprecate in favor of consolidated `fusion-issue-authoring` skill
  - Set `metadata.status: deprecated` and `metadata.successor: fusion-issue-authoring`
  - Move to `skills/.deprecated/` placement lane
  - Add deprecation notice pointing to the consolidated skill
  Resolves equinor/fusion-core-tasks#802

</details>

- **fusion-issue-author-feature**
  <details><summary>CHANGELOG additions for fusion-issue-author-feature</summary>

## 0.1.3 - 2026-03-18
### patch
- [#98](https://github.com/equinor/fusion-skills/pull/98) [`6bb9cdc`](https://github.com/equinor/fusion-skills/commit/6bb9cdcc1e2e0ed25d562bfd5db4dfab52559c0f) - Deprecate in favor of consolidated `fusion-issue-authoring` skill
  - Set `metadata.status: deprecated` and `metadata.successor: fusion-issue-authoring`
  - Move to `skills/.deprecated/` placement lane
  - Add deprecation notice pointing to the consolidated skill
  Resolves equinor/fusion-core-tasks#802

</details>

- **fusion-issue-author-task**
  <details><summary>CHANGELOG additions for fusion-issue-author-task</summary>

## 0.1.3 - 2026-03-18
### patch
- [#98](https://github.com/equinor/fusion-skills/pull/98) [`6bb9cdc`](https://github.com/equinor/fusion-skills/commit/6bb9cdcc1e2e0ed25d562bfd5db4dfab52559c0f) - Deprecate in favor of consolidated `fusion-issue-authoring` skill
  - Set `metadata.status: deprecated` and `metadata.successor: fusion-issue-authoring`
  - Move to `skills/.deprecated/` placement lane
  - Add deprecation notice pointing to the consolidated skill
  Resolves equinor/fusion-core-tasks#802

</details>

- **fusion-issue-author-user-story**
  <details><summary>CHANGELOG additions for fusion-issue-author-user-story</summary>

## 0.1.3 - 2026-03-18
### patch
- [#98](https://github.com/equinor/fusion-skills/pull/98) [`6bb9cdc`](https://github.com/equinor/fusion-skills/commit/6bb9cdcc1e2e0ed25d562bfd5db4dfab52559c0f) - Deprecate in favor of consolidated `fusion-issue-authoring` skill
  - Set `metadata.status: deprecated` and `metadata.successor: fusion-issue-authoring`
  - Move to `skills/.deprecated/` placement lane
  - Add deprecation notice pointing to the consolidated skill
  Resolves equinor/fusion-core-tasks#802

</details>

- **fusion-issue-authoring**
  <details><summary>CHANGELOG additions for fusion-issue-authoring</summary>

## 0.3.5 - 2026-05-07
### patch
- [#170](https://github.com/equinor/fusion-skills/pull/170) [`5e43223`](https://github.com/equinor/fusion-skills/commit/5e432232917b2b1642431d80cf1698bbefe80ee8) - Apply caveman-compress prose style to SKILL.md and references.
  - Drop articles, filler, hedging from SKILL.md activation body
  - Compress instructions, mcp-server, questions references
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

- **fusion-issue-solving**
  <details><summary>CHANGELOG additions for fusion-issue-solving</summary>

## 0.1.7 - 2026-05-07
### patch
- [#170](https://github.com/equinor/fusion-skills/pull/170) [`5e43223`](https://github.com/equinor/fusion-skills/commit/5e432232917b2b1642431d80cf1698bbefe80ee8) - Apply caveman-compress prose style to SKILL.md.
  - Drop articles, filler, hedging from SKILL.md activation body

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

## 1.0.1 - 2026-05-07
### patch
- [#170](https://github.com/equinor/fusion-skills/pull/170) [`5e43223`](https://github.com/equinor/fusion-skills/commit/5e432232917b2b1642431d80cf1698bbefe80ee8) - Apply caveman-compress prose style to SKILL.md and references.
  - Drop articles, filler, hedging from SKILL.md activation body
  - Compress mcp-call-snippets and vscode-mcp-config references
- [#168](https://github.com/equinor/fusion-skills/pull/168) [`6c56986`](https://github.com/equinor/fusion-skills/commit/6c56986a322214a89bddb6e549c4cdf8622a9025) - Fix diagnostic issues in fusion-mcp SKILL.md
  - Resolve contradiction between "only recommended path" and exception clause for self-hosted alternatives
  - Replace ambiguous "minimal validation checklist" with explicit three-step validation criteria
  - Restructure troubleshooting from flat bullets into numbered Check/Fix substeps to reduce cognitive load
  - Add coverage for users without an Equinor Entra account
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

- **fusion-skill-authoring**
  <details><summary>CHANGELOG additions for fusion-skill-authoring</summary>

## 0.3.4 - 2026-05-07
### patch
- [#170](https://github.com/equinor/fusion-skills/pull/170) [`5e43223`](https://github.com/equinor/fusion-skills/commit/5e432232917b2b1642431d80cf1698bbefe80ee8) - Apply caveman-compress prose style to SKILL.md and references.
  - Drop articles, filler, hedging from SKILL.md activation body
  - Compress skill-authoring-platform-references reference

</details>

- **fusion-skill-self-report-bug**
  <details><summary>CHANGELOG additions for fusion-skill-self-report-bug</summary>

## 0.1.2 - 2026-03-21
### patch
- [#113](https://github.com/equinor/fusion-skills/pull/113) [`d777366`](https://github.com/equinor/fusion-skills/commit/d777366fe6e1b710876a8e1abd2f311e3f4440c4) - Deprecate `fusion-skill-self-report-bug` in favour of the `warden` agent in `fusion-skills`
  The bug reporting workflow has been inlined into `fusion-skills/agents/warden.agent.md`, which also adds proactive frustration detection and skill smell inspection. The `fusion-skill-self-report-bug` skill is no longer needed as a standalone install.
  Superseded by the `warden` agent in `fusion-skills`.

</details>


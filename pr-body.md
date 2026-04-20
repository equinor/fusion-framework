## Skills Upgrade

Automated run of `npx skills update` to update agent skills to their latest versions.
**Date:** 2026-04-20 08:47 UTC
**Node version:** 24

## Summary
- Changed / added skills: 7

## Updated Skills
- **fusion-dependency-review**
  <details><summary>CHANGELOG additions for fusion-dependency-review</summary>

## 0.1.3 - 2026-03-24
### patch
- [#126](https://github.com/equinor/fusion-skills/pull/126) [`1470bc8`](https://github.com/equinor/fusion-skills/commit/1470bc81e1b04e9727049f01742ea881579ad57b) - Add repository-policy handoff section for governance alignment
  - Add explicit "Repository-policy handoff" section that defers commit, validation, changeset, and PR rules to repo-local instructions
  - Update source-control-advisor to also defer to repo-local workflow instructions
  Resolves equinor/fusion-core-tasks#581
## 0.1.2 - 2026-03-17
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

## 0.1.6 - 2026-03-24
### patch
- [#126](https://github.com/equinor/fusion-skills/pull/126) [`1470bc8`](https://github.com/equinor/fusion-skills/commit/1470bc81e1b04e9727049f01742ea881579ad57b) - Add repository-policy handoff section for governance alignment
  - Add explicit "Repository-policy handoff" section that defers commit, validation, changeset, and PR rules to repo-local instructions
  - Keeps the skill portable while ensuring repo-local policy takes precedence when present
  Resolves equinor/fusion-core-tasks#581
## 0.1.5 - 2026-03-17
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

- **fusion-issue-authoring**
  <details><summary>CHANGELOG additions for fusion-issue-authoring</summary>

## 0.3.3 - 2026-04-06
### patch
- [#135](https://github.com/equinor/fusion-skills/pull/135) [`5fa9384`](https://github.com/equinor/fusion-skills/commit/5fa938467edfad41d381f0ee2d7320b609c156ed) - Make draft location flexible — check user preferences and session memory before defaulting to `.tmp/`
  - Step 4 now checks user preferences and session memory for a preferred draft location
  - Asks once when intent is ambiguous and remembers the answer for the session
  - Falls back to `.tmp/{TYPE}-{CONTEXT}.md` only when no preference is found
## 0.3.2 - 2026-03-23
### patch
- [#121](https://github.com/equinor/fusion-skills/pull/121) [`831f8ee`](https://github.com/equinor/fusion-skills/commit/831f8eed3054ee747d3300c9144312ef3b5c02e0) - Add devil's advocate agent for issue authoring
  - Always-on moderate mode raises 2-3 key concerns after classification
  - Interrogator mode runs full structured interview on explicit user request or when scope/criteria gaps are significant
  - Wired into SKILL.md agent modes section
  Refs: equinor/fusion-core-tasks#847
## 0.3.1 - 2026-03-21
### patch
- [#112](https://github.com/equinor/fusion-skills/pull/112) [`e90fb97`](https://github.com/equinor/fusion-skills/commit/e90fb97b20d1aceb0929dbc96bddf28fdf358f0a) - Add contributor-guide-aware repository routing to issue authoring
  - SKILL.md Step 2: read active workspace `CONTRIBUTING.md` / `contribute/` for routing rules before asking the user
  - `references/instructions.md`: add Repository routing note pointing to SKILL.md Step 2 as authoritative flow
## 0.3.0 - 2026-03-18
### minor
- [#98](https://github.com/equinor/fusion-skills/pull/98) [`6bb9cdc`](https://github.com/equinor/fusion-skills/commit/6bb9cdcc1e2e0ed25d562bfd5db4dfab52559c0f) - Consolidate issue-authoring capability into a single skill with agent modes
  - Merge type-specific drafting logic from 4 subordinate skills into agent mode files (`agents/*.agent.md`)
  - Move all 10 issue templates into `assets/issue-templates/` within this skill
  - Update orchestrator to route to internal agent modes instead of external subordinate skills
  - Retain full 8-step workflow, shared gates, caching strategy, and MCP mutation sequencing
  Resolves equinor/fusion-core-tasks#802
## 0.2.4 - 2026-03-17
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

- **fusion-issue-solving**
  <details><summary>CHANGELOG additions for fusion-issue-solving</summary>

## 0.1.6 - 2026-03-24
### patch
- [#126](https://github.com/equinor/fusion-skills/pull/126) [`1470bc8`](https://github.com/equinor/fusion-skills/commit/1470bc81e1b04e9727049f01742ea881579ad57b) - Add repository-policy handoff section for governance alignment
  - Add explicit "Repository-policy handoff" section that defers commit, validation, changeset, and PR rules to repo-local instructions
  Resolves equinor/fusion-core-tasks#581
## 0.1.5 - 2026-03-17
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

- **fusion-issue-task-planning**
  <details><summary>CHANGELOG additions for fusion-issue-task-planning</summary>

## 0.1.5 - 2026-03-24
### patch
- [#126](https://github.com/equinor/fusion-skills/pull/126) [`1470bc8`](https://github.com/equinor/fusion-skills/commit/1470bc81e1b04e9727049f01742ea881579ad57b) - Add repository-policy handoff section for governance alignment
  - Add explicit "Repository-policy handoff" section that defers issue type, changeset, and PR rules to repo-local instructions
  Resolves equinor/fusion-core-tasks#581
## 0.1.4 - 2026-03-17
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

- **fusion-mcp**
  <details><summary>CHANGELOG additions for fusion-mcp</summary>

## 0.1.2 - 2026-03-21
### patch
- [#107](https://github.com/equinor/fusion-skills/pull/107) [`d75d8c6`](https://github.com/equinor/fusion-skills/commit/d75d8c60f15888fbe71340b53b2698f3361ac4c8) - Document `search_skills` in the MCP server tool surface.
  - add explicit tool listing to the setup instructions: `search_framework`, `search_docs`, `search_eds`, `search_skills`, `search_indexes`, `skills`, `skills_index_status`
  Resolves equinor/fusion-core-tasks#834
- [#106](https://github.com/equinor/fusion-skills/pull/106) [`1f8a01d`](https://github.com/equinor/fusion-skills/commit/1f8a01ddcb5c9afe9119a1fcf1ded2c6980036d0) - Connect `fusion-mcp` to `fusion-research` as a next-step redirect.
  - add "When not to use" entry directing source-backed research questions to `fusion-research` once MCP is running

</details>

- **fusion-skill-authoring**
  <details><summary>CHANGELOG additions for fusion-skill-authoring</summary>

## 0.3.3 - 2026-03-23
### patch
- [#121](https://github.com/equinor/fusion-skills/pull/121) [`831f8ee`](https://github.com/equinor/fusion-skills/commit/831f8eed3054ee747d3300c9144312ef3b5c02e0) - Add devil's advocate agent for skill authoring
  - Always-on moderate mode raises 2-3 key concerns during scoping/drafting
  - Interrogator mode runs full structured interview on explicit user request or when the orchestrator detects significant ambiguity
  - Wired into SKILL.md helper agents and Step 6 validation sections
  Refs: equinor/fusion-core-tasks#847
## 0.3.2 - 2026-03-18
### patch
- [#98](https://github.com/equinor/fusion-skills/pull/98) [`6bb9cdc`](https://github.com/equinor/fusion-skills/commit/6bb9cdcc1e2e0ed25d562bfd5db4dfab52559c0f) - Extract template baseline and validation signals to references/
  - Move folder structure and SKILL.md baseline template to `references/skill-template-baseline.md`
  - Move success/failure signals and recovery steps to `references/validation-signals.md`
  - Reduce SKILL.md from 356 to 286 lines (below 300-line CI warning threshold)
## 0.3.1 - 2026-03-18
### patch
- [#88](https://github.com/equinor/fusion-skills/pull/88) [`8cd7d9d`](https://github.com/equinor/fusion-skills/commit/8cd7d9d3a878b27425eb8a3e7be8398278e337e3) - Document SKILL.md size limits and CI guardrails
  - Document 300-line recommended limit (triggers CI warning)
  - Document 500-line hard limit (fails CI)
  - Clarify expectation to move overflow to references/ early
  - Add failure signal for exceeding size thresholds
  Relates to: equinor/fusion-core-tasks#84

</details>


# Changelog

## 0.2.3 - 2026-03-11

### patch

- [#76](https://github.com/equinor/fusion-skills/pull/76) [`3efc478`](https://github.com/equinor/fusion-skills/commit/3efc47886871a14b18eb9f68abd562a10c6cf277) - Reduce token-heavy issue authoring behaviors by tightening MCP-first mutation sequencing and fallback guidance.


  - Replace redundant two-pass issue update guidance with single-call-first `issue_write` sequencing
  - Clarify cache-first behavior for labels and issue types to avoid repeated lookups
  - Add explicit rate-limit handling guidance that avoids retry loops and preserves local draft state
  - Tighten duplicate-search guidance to one focused pass unless scope changes

  resolves equinor/fusion-core-tasks#535

## 0.2.2 - 2026-03-05

### patch

- [#55](https://github.com/equinor/fusion-skills/pull/55) [`2d346c8`](https://github.com/equinor/fusion-skills/commit/2d346c812b4927ed1fdf17c92d51856d1fdc09c3) - Add required ownership metadata (`metadata.owner`, `metadata.status`) to all skills. Owner is set to `@equinor/fusion-core` (repository default) and status is set according to skill lifecycle (`active` for production skills, `experimental` for early-stage skills). Sponsor metadata was considered but is not required for MVP.


  resolves equinor/fusion-core-tasks#474

## 0.2.1 - 2026-03-03

### patch

- [#42](https://github.com/equinor/fusion-skills/pull/42) [`947c0ab`](https://github.com/equinor/fusion-skills/commit/947c0ab73844f5eb13b80e7cb2f3e5ea8146ea59) - Normalize issue-authoring orchestration/reference docs to canonical MCP tool naming (`mcp_github::tool`) for duplicate checks, ordered mutations, and issue-type lookup guidance.


  Maintains MCP-first behavior and adds documented GraphQL fallback query assets for parent/sub-issue and issue-type operations where MCP write coverage is unavailable.

  refs equinor/fusion-skills#40
  resolves equinor/fusion-core-tasks#446

## 0.2.0 - 2026-02-20

### minor

- [#23](https://github.com/equinor/fusion-skills/pull/23) [`14b9c99`](https://github.com/equinor/fusion-skills/commit/14b9c9902dbf8bafdae9fe0fc6c08c81dec004b1) - Migrate issue authoring guidance from helper scripts to GitHub MCP-first workflows, including MCP metadata declarations and updated orchestration/ref docs.


  resolves equinor/fusion-skills#21

## 0.1.1 - 2026-02-20

### patch

- [#20](https://github.com/equinor/fusion-skills/pull/20) [`66d85b8`](https://github.com/equinor/fusion-skills/commit/66d85b8200f7712fd916148e75906bf7fa15101c) - Clarify issue-closing keyword guidance across skill and contributor docs:


  - align wording to keyword families (`fix|fixes|resolve|resolves|close|closes`)
  - standardize direct issue reference examples (`owner/repo#123`)
  - keep `Refs`/`Ref` as the default for non-closing references

- [#13](https://github.com/equinor/fusion-skills/pull/13) [`205df94`](https://github.com/equinor/fusion-skills/commit/205df948ffaaf785e15f2cacd392126ca4c398e3) - Improve issue automation reliability in `fusion-issue-authoring`:


  - switch issue-type updates to GraphQL `updateIssue(issueTypeId: ...)` in shell and PowerShell helpers
  - add explicit post-update verification output for issue type
  - guard `set -u` in VS Code integrated zsh sessions to avoid shell integration hook failures
  - update runbook/docs snippets to use the robust pattern and verification command

  resolves equinor/fusion-core-tasks#402

## 0.1.0 - 2026-02-20

### minor

- [#10](https://github.com/equinor/fusion-skills/pull/10) [`d473723`](https://github.com/equinor/fusion-skills/commit/d4737239be54736e344d74be4ce8271b9be84313) - Adds structured frontmatter metadata for discoverability and clarifies skill relationship semantics.


  Scope delivered:
  - Added `metadata.tags` to affected skills for discoverability.
  - Renamed relationship keys to a clearer schema: `skill_role` → `role`, `required_skill` → `orchestrator`, `sub_skills` → `skills`.
  - Updated dependent role value from `subskill` to `subordinate` to explicitly indicate orchestrator dependency.
  - Updated skill authoring guidance to document `metadata.role`, `metadata.orchestrator`, `metadata.skills`, and `metadata.tags`.

- [#7](https://github.com/equinor/fusion-skills/pull/7) [`2194e7a`](https://github.com/equinor/fusion-skills/commit/2194e7a99f6055dd394dffca6e0e6286d3bb2d41) - Implements `equinor/fusion-core-tasks#395` (sub-task of `#391`) by restructuring issue authoring skills into a top-level orchestrator plus type-specific specialists.


  Refs: `equinor/fusion-core-tasks#391`

  closes equinor/fusion-core-tasks#395

  Scope delivered:
  - `fusion-issue-authoring` is now the orchestration layer for shared gates (classification, labels, assignee, confirmation, publish flow).
  - Added specialist skills: `fusion-issue-author-bug`, `fusion-issue-author-feature`, `fusion-issue-author-user-story`, and `fusion-issue-author-task`.
  - Specialist skills now explicitly depend on `fusion-issue-authoring` and keep only type-specific guidance.
  - Moved fallback templates from shared assets to each specialist skill’s own `assets/issue-templates/`.
  - Added label listing helpers: `list-labels.sh` and `list-labels.ps1`.
  - Hardened relationship scripts for reliable GraphQL calls and idempotent "already linked" handling.

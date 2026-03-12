# Changelog

## 0.1.4 - 2026-03-11

### patch

- [#76](https://github.com/equinor/fusion-skills/pull/76) [`3efc478`](https://github.com/equinor/fusion-skills/commit/3efc47886871a14b18eb9f68abd562a10c6cf277) - Improve issue-solving workflow reliability under GitHub API limits by documenting a low-token execution strategy.


  - Require reuse of fetched issue context instead of repeated reads
  - Add MCP-first guidance for issue workflow mutations and lookups
  - Add explicit no-retry-loop behavior for rate-limit failures
  - Extend the workflow checklist with token-usage and fallback controls

  resolves equinor/fusion-core-tasks#535

## 0.1.3 - 2026-03-11

### patch

- [#71](https://github.com/equinor/fusion-skills/pull/71) [`b7fe258`](https://github.com/equinor/fusion-skills/commit/b7fe2581ba6bab7325d953c44b853a2a94ba65da) - Strengthen issue-solving discovery cues for short prompts and direct GitHub issue URLs.


  - move representative activation phrases into the frontmatter description so semantic routing can match `solve #123`, `lets solve #123`, and full `https://github.com/owner/repo/issues/123` prompts
  - clarify that direct GitHub issue URLs can stand in for `#123` references, including URL-first prompts

  resolves equinor/fusion-skills#66

## 0.1.2 - 2026-03-05

### patch

- [#55](https://github.com/equinor/fusion-skills/pull/55) [`2d346c8`](https://github.com/equinor/fusion-skills/commit/2d346c812b4927ed1fdf17c92d51856d1fdc09c3) - Add required ownership metadata (`metadata.owner`, `metadata.status`) to all skills. Owner is set to `@equinor/fusion-core` (repository default) and status is set according to skill lifecycle (`active` for production skills, `experimental` for early-stage skills). Sponsor metadata was considered but is not required for MVP.


  resolves equinor/fusion-core-tasks#474

- [#55](https://github.com/equinor/fusion-skills/pull/55) [`2d346c8`](https://github.com/equinor/fusion-skills/commit/2d346c812b4927ed1fdf17c92d51856d1fdc09c3) - Improve skill activation and discoverability cues


  - Enhance description with explicit activation keywords: "continue on", "GitHub issue workflow"
  - Reorganize "When to use" section to lead with "continue work on" pattern as primary trigger
  - Add discoverable trigger examples matching common issue-solving requests

## 0.1.1 - 2026-03-03

### patch

- [#40](https://github.com/equinor/fusion-skills/pull/40) [`cd68535`](https://github.com/equinor/fusion-skills/commit/cd685353575cca870a01e255cf1c13ccf6e55290) - Remove deprecated `origin` frontmatter metadata from the experimental `fusion-issue-solving` skill.

## 0.1.0 - 2026-03-02

### minor

- [#35](https://github.com/equinor/fusion-skills/pull/35) [`73809e4`](https://github.com/equinor/fusion-skills/commit/73809e42d8cac011c6ba5e5c06fa321cb82ab9f7) - Add experimental `fusion-issue-solving` skill under `skills/.experimental/` with a structured workflow for issue intake, planning, implementation, validation, and PR-ready reporting.


  Includes a companion execution checklist asset for consistent progress tracking.

  resolves equinor/fusion-core-tasks#432

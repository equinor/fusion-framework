# Changelog

## 0.1.1 - 2026-03-05

### patch

- [#55](https://github.com/equinor/fusion-skills/pull/55) [`2d346c8`](https://github.com/equinor/fusion-skills/commit/2d346c812b4927ed1fdf17c92d51856d1fdc09c3) - Add required ownership metadata (`metadata.owner`, `metadata.status`) to all skills. Owner is set to `@equinor/fusion-core` (repository default) and status is set according to skill lifecycle (`active` for production skills, `experimental` for early-stage skills). Sponsor metadata was considered but is not required for MVP.


  resolves equinor/fusion-core-tasks#474

## 0.1.0 - 2026-03-02

### minor

- [#30](https://github.com/equinor/fusion-skills/pull/30) [`1ad69fb`](https://github.com/equinor/fusion-skills/commit/1ad69fb80e6f8c9050f40b26b10e281a376f15e7) - Add an experimental `fusion-mcp` skill scoped to VS Code + Docker setup, with prerequisite guidance, MCP client configuration instructions, actionable troubleshooting, and MCP JSON-RPC validation examples including a non-empty basic query pass check.


  Bug-report guidance and template updates are tracked in a dedicated follow-up changeset.

  resolves equinor/fusion-core-tasks#409

### patch

- [#30](https://github.com/equinor/fusion-skills/pull/30) [`1ad69fb`](https://github.com/equinor/fusion-skills/commit/1ad69fb80e6f8c9050f40b26b10e281a376f15e7) - Add bug report guidance and template usage for MCP setup failures/misbehavior, including default issue-target guidance in the skill and sanitized report structure.


  resolves equinor/fusion-core-tasks#413

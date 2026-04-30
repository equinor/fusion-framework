# Changelog

## 0.1.3 - 2026-04-22

### patch

- [#143](https://github.com/equinor/fusion-skills/pull/143) [`3c02e1d`](https://github.com/equinor/fusion-skills/commit/3c02e1d348a4de8ee9a0fd5a088ff18c0019dc2b) Thanks [@alftore](https://github.com/alftore)! - Document backend code tools in the Fusion MCP setup guide.


  - Add `search_backend_code` to retrieval tool examples
  - Add `get_backend_symbol` and `list_backend_projects` in the available backend tooling list

## 0.1.2 - 2026-03-21

### patch

- [#107](https://github.com/equinor/fusion-skills/pull/107) [`d75d8c6`](https://github.com/equinor/fusion-skills/commit/d75d8c60f15888fbe71340b53b2698f3361ac4c8) - Document `search_skills` in the MCP server tool surface.


  - add explicit tool listing to the setup instructions: `search_framework`, `search_docs`, `search_eds`, `search_skills`, `search_indexes`, `skills`, `skills_index_status`

  Resolves equinor/fusion-core-tasks#834

- [#106](https://github.com/equinor/fusion-skills/pull/106) [`1f8a01d`](https://github.com/equinor/fusion-skills/commit/1f8a01ddcb5c9afe9119a1fcf1ded2c6980036d0) - Connect `fusion-mcp` to `fusion-research` as a next-step redirect.


  - add "When not to use" entry directing source-backed research questions to `fusion-research` once MCP is running

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

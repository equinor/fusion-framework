# Changelog

## 0.1.2 - 2026-03-11

### patch

- [#76](https://github.com/equinor/fusion-skills/pull/76) [`3efc478`](https://github.com/equinor/fusion-skills/commit/3efc47886871a14b18eb9f68abd562a10c6cf277) - Tighten GraphQL fallback guidance in discover-skills to minimize point cost and avoid retries on rate-limit errors.


  - Require small `first`/`last` values and shallow connections for catalog queries
  - Do not retry on rate-limit errors; surface the failure and suggest retrying later

  resolves equinor/fusion-core-tasks#535

## 0.1.1 - 2026-03-10

### patch

- [#64](https://github.com/equinor/fusion-skills/pull/64) [`01ce2c7`](https://github.com/equinor/fusion-skills/commit/01ce2c748ddf31518deb8f8b75122cbe1fcc9586) - Fix missing trailing newlines in SKILL.md and follow-up-questions.md


  Resolves equinor/fusion-core-tasks#521

## 0.1.0 - 2026-03-10

### minor

- [#62](https://github.com/equinor/fusion-skills/pull/62) [`1f7d4f9`](https://github.com/equinor/fusion-skills/commit/1f7d4f99e32dcd0c15cb964888a0cdbb9fc58541) - Add an experimental MCP-backed skills discovery skill that routes user requests through the Fusion skills index and returns actionable next-step guidance.


  - Detect query, install, update, and remove intent before calling the skills MCP tool
  - Preserve advisory lifecycle commands exactly when MCP returns them
  - Allow GitHub MCP, shell listing, and GraphQL-backed discovery fallback when Fusion MCP is unavailable
  - Add a follow-up question bank for vague requests so discovery can narrow to the right skill before searching
  - Place the first iteration in the experimental skill lane
  - Require explicit low-confidence handling instead of guessed matches

  resolves equinor/fusion-core-tasks#412

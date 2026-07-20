---
name: custom-index-eval
description: 'Evaluates Fusion MCP search quality against eval/index domain files. USE FOR: eval core, eval all, validate MCP index recall, check search freshness, verify documented framework patterns. DO NOT USE FOR: authoring eval patterns, editing docs, CI automation, or application-development search answers.'
license: MIT
compatibility: Requires Fusion MCP search tools and local access to `eval/index/`.
metadata:
  version: "0.2.0"
  status: experimental
  owner: "@equinor/fusion-core"
  tags:
    - evaluation
    - mcp
    - search
    - index
    - fusion-framework
  mcp:
    required:
      - mcp_fusion
---

# Evaluate Fusion MCP Search Index

## When To Use

Use when the user wants a pass/fail read on whether Fusion MCP returns the expected framework knowledge for documented query patterns.

Trigger phrases:
- `eval core`
- `eval <domain>`
- `eval all`
- "check MCP index accuracy"
- "validate search recall"
- "is the index stale?"

## Inputs

- Domain target: `all` or a file stem under `eval/index/`, such as `core`.
- Strictness: `full` by default, or `strict` for `must` expectations only.

Ask one question if the user says only `eval`.

## Workflow

1. Resolve domain files:
   - `<domain>` maps to `eval/index/<domain>.md`.
   - `all` means every markdown file in `eval/index/` except `README.md`.
   - Skip empty files or files without `##` query headings.

2. Parse each domain file:
   - `#` heading is the domain name.
   - Text under `#` is judgement guidance for every query.
   - Each `##` heading is the MCP query.
   - `- must ...` and `- should ...` bullets are expectations.

3. Judge each query:
   - Prefer the `agents/query-judge.md` sub-agent.
   - If sub-agents are unavailable, run the same flow inline.
   - Search with `mcp_fusion_search_framework` first, then `mcp_fusion_search` if needed.
   - Verdicts are `pass`, `partial`, or `fail`; never inflate ambiguous results.

4. Report using `assets/report-template.md`:
   - Include date, domain file, strictness, verdict table, summary counts, and recommendations.
   - For `all`, lead with per-domain summary before detailed results.
   - Call out `must` failures as critical index gaps.

## Safety

- Read-only repository behavior; do not edit eval files, docs, or index content.
- MCP calls are read-only.
- Stop clearly if MCP is unavailable or rate-limited.
- Do not cache verdicts across sessions; results represent current index state.

## Expected Output

- Per-query verdicts with one-sentence explanations
- Must/should satisfaction counts
- Pass rate and failure summary
- Concrete recommendations for stale, missing, or weak search coverage

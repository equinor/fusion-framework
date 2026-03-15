---
name: custom-index-eval
description: 'Iterative evaluation of Fusion Framework MCP search quality against documented domain patterns. Loads domain files from eval/index/, queries Fusion MCP for each pattern, validates recall against must/should requirements, and produces a human-readable pass/fail report. USE FOR: eval core, eval all, evaluate MCP index accuracy, validate search recall for a domain, check index freshness. DO NOT USE FOR: writing domain patterns, populating eval/index/ files, running CI pipelines, or batch automation.'
license: MIT
compatibility: Requires Fusion MCP access via `mcp_fusion_search` or `mcp_fusion_search_framework`. Works in any runtime that can read local files and call MCP tools.
metadata:
  version: "0.2.0"
  status: experimental
  owner: "@equinor/fusion-core"
  tags:
    - evaluation
    - mcp
    - search
    - index
    - quality
    - validation
    - fusion-framework
  mcp:
    required:
      - mcp_fusion
---

# Evaluate Fusion MCP Search Index

## When to use

Use this skill to evaluate whether Fusion MCP search returns accurate, relevant results for documented framework patterns.

Typical triggers:
- `eval core` — evaluate all patterns in `eval/index/core.md`
- `eval http-services` — evaluate patterns in `eval/index/http-services.md`
- `eval all` — evaluate every domain file in `eval/index/`
- "check MCP index accuracy for auth patterns"
- "validate search recall for the state-data domain"
- "how well does the index cover framework initialization?"
- "run an eval pass against the index"

## When not to use

Do not use this skill for:
- Writing or populating domain pattern files (use normal editing workflow)
- Creating new domain files in `eval/index/` (follow the README template)
- CI/CD integration or scheduled evaluation runs (future phase)
- Batch automation without human review (future phase)
- Searching the index for application development answers (use Fusion MCP directly)

## Required inputs

Collect before execution:
- **Domain target**: a specific domain file name (e.g., `core`, `http-services`) or `all`
- **Evaluation strictness** (optional): `strict` (must patterns only) or `full` (must + should); default is `full`

If the user says only `eval` with no domain, ask which domain to evaluate or whether to run `all`.

## Instructions

### Step 1 — Resolve domain files

1. If the target is a specific domain (e.g., `core`), read `eval/index/<domain>.md`
2. If the target is `all`, list all `.md` files in `eval/index/` except `README.md` and process each one sequentially
3. If the file does not exist or has no `##` query sections, report it as empty and skip

### Step 2 — Parse the domain file

Domain files have a simple structure:

- `# Domain Name` — the domain heading
- Paragraph below `#` — **judgement instructions** for how to evaluate results across all queries in this domain
- `## <query>` — each `##` heading is a search query to run against MCP
- `- must ...` / `- should ...` — expectations for each query's results

Extract the judgement instructions once (use them as context when evaluating every query). Then build a list of queries, each with its `must` and `should` expectations.

### Step 3 — Evaluate each query via judge sub-agent

For each `##` heading, spin up a **query-judge** sub-agent (see `agents/query-judge.md`). Pass it:

- The heading text (search query)
- The `must` and `should` bullets for that query
- The domain-level judgement instructions

The judge sub-agent will:
1. Search MCP using the heading text
2. Check results against each expectation
3. Return a verdict (`pass` / `partial` / `fail`) with counts and explanation

If the runtime does not support sub-agents, follow the same workflow inline:
1. Use the heading text as the search query
2. Call `mcp_fusion_search_framework` (preferred) or `mcp_fusion_search`
3. Check results against each `must` / `should` bullet
4. Record verdict with explanation

Collect all verdicts before producing the report.

### Step 4 — Generate the evaluation report

Produce a report following the template in `assets/report-template.md`. The report includes:

1. **Header**: domain name, evaluation date, strictness level
2. **Pattern results table**: one row per pattern with name, requirement, verdict, and explanation
3. **Summary statistics**: total patterns, pass/partial/fail counts, pass rate
4. **Recommendations**: actionable next steps for failed or partial patterns

### Step 5 — Present results

- Print the full report to the conversation
- For `eval all`, present a per-domain summary first, then offer to show detailed results for any domain
- Highlight `must` failures prominently — these indicate critical index gaps
- Suggest concrete remediation for each failure (e.g., "re-index package X", "add documentation for Y")

## Expected output

A structured evaluation report containing:
- Per-pattern pass/partial/fail verdicts with explanations
- Summary statistics (total, pass rate, must vs should breakdown)
- Prioritized recommendations for improving index coverage
- Clear identification of stale or missing content

## Example: `eval core`

**User:** `eval core`

**Workflow:**
1. Read `eval/index/core.md`
2. Note judgement instructions: "Results should reference `@equinor/fusion-framework` and `@equinor/fusion-framework-module`..."
3. Extract 5 queries from `##` headings
4. For each, search MCP and check `must`/`should` bullets
5. Produce report:

```
## Evaluation Report: core

Date: 2026-03-14
Strictness: full
Domain: eval/index/core.md

| # | Query | Verdict | Explanation |
|---|-------|---------|-------------|
| 1 | How to initialize Fusion Framework | pass | Results mention FrameworkConfigurator, init, configureMsal |
| 2 | How to create a custom module | pass | Module interface, BaseConfigBuilder, BaseModuleProvider all covered |
| 3 | Module lifecycle phases | partial | Lifecycle order shown but postConfigure/postInitialize hooks not detailed |
| 4 | How to configure an app with AppModuleInitiator | fail | No results reference AppModuleInitiator |
| 5 | How to listen to framework events | pass | addEventListener, dispatchEvent, event module all returned |

### Summary
- Queries: 5 | Pass: 3 | Partial: 1 | Fail: 1
- Must expectations met: 14/17 (82%)

### Recommendations
1. **[CRITICAL]** Query 4: Re-index `packages/app/src/types.ts` and `cookbooks/app-react/src/config.ts`
2. **[IMPROVE]** Query 3: Enrich lifecycle section in `packages/modules/module/README.md`
```

## Safety & constraints

- This skill is read-only with respect to the repository — it never modifies domain files or index content
- MCP search calls are read-only queries; no mutations are performed
- Do not fabricate pass verdicts — if results are ambiguous, mark as `partial` with explanation
- If MCP is unavailable or rate-limited, report the failure clearly and stop; do not retry in a loop
- Evaluation results reflect index state at query time; they are not cached across sessions

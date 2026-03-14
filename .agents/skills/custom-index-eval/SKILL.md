---
name: custom-index-eval
description: 'Iterative evaluation of Fusion Framework MCP search quality against documented domain patterns. Loads domain files from eval/index/, queries Fusion MCP for each pattern, validates recall against must/should requirements, and produces a human-readable pass/fail report. USE FOR: eval core, eval all, evaluate MCP index accuracy, validate search recall for a domain, check index freshness. DO NOT USE FOR: writing domain patterns, populating eval/index/ files, running CI pipelines, or batch automation.'
license: MIT
compatibility: Requires Fusion MCP access via `mcp_fusion_search` or `mcp_fusion_search_framework`. Works in any runtime that can read local files and call MCP tools.
metadata:
  version: "0.1.0"
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
3. If the file does not exist or has no `## Pattern:` sections, report it as empty and skip

### Step 2 — Parse patterns from the domain file

For each domain file, extract every `## Pattern:` section. Each pattern contains:

- **Pattern name**: the heading text after `## Pattern:`
- **Requirement level**: `must` or `should` from the `**Requirement:**` line
- **Description**: the prose explaining the pattern
- **Code examples**: TypeScript codeblocks showing canonical usage
- **File references**: real monorepo file paths
- **Notes**: constraints, edge cases, related patterns

Build a list of patterns to evaluate. Track the requirement level for each.

### Step 3 — Query Fusion MCP for each pattern

For each pattern, construct a search query and call Fusion MCP:

1. Use the pattern name as the primary search query
   - Example: for `## Pattern: Initialize framework with FrameworkConfigurator and init`, search for `"Initialize framework with FrameworkConfigurator and init"`
2. Call `mcp_fusion_search_framework` (preferred) or `mcp_fusion_search` with the query
3. Collect the top results returned by MCP

### Step 4 — Validate results against the pattern

For each pattern, evaluate whether the MCP results satisfy the documented expectations:

**Pass criteria:**
- At least one result references the same package, API, or concept described in the pattern
- Key exported symbols mentioned in the pattern appear in the returned content
- The returned guidance is consistent with (not contradicting) the pattern's must/should statements

**Fail criteria:**
- No results returned for the query
- Results reference unrelated packages or concepts
- Results contradict the documented must/should requirements
- Key symbols or file paths from the pattern are absent from all returned results

**Partial criteria:**
- Results cover the concept but miss specific details (e.g., returns the package but not the specific API pattern)
- Results are correct but outdated compared to the documented pattern
- Only some of the key symbols appear in results

Record the verdict as `pass`, `partial`, or `fail` with a brief explanation.

### Step 5 — Generate the evaluation report

Produce a report following the template in `assets/report-template.md`. The report includes:

1. **Header**: domain name, evaluation date, strictness level
2. **Pattern results table**: one row per pattern with name, requirement, verdict, and explanation
3. **Summary statistics**: total patterns, pass/partial/fail counts, pass rate
4. **Recommendations**: actionable next steps for failed or partial patterns

### Step 6 — Present results

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
2. Extract 5 patterns: "Initialize framework with FrameworkConfigurator and init", "Define a module with the Module interface", "Module lifecycle phases", "Configure application modules with AppModuleInitiator", "Listen to framework events with addEventListener"
3. For each pattern, search Fusion MCP:
   - Search: `"Initialize framework with FrameworkConfigurator and init"`
   - Evaluate: Do results mention `FrameworkConfigurator`, `init`, `@equinor/fusion-framework`?
4. Produce report:

```
## Evaluation Report: core

Date: 2026-03-14
Strictness: full
Domain: eval/index/core.md

| # | Pattern | Req | Verdict | Explanation |
|---|---------|-----|---------|-------------|
| 1 | Initialize framework with FrameworkConfigurator and init | must | pass | Results include @equinor/fusion-framework README with FrameworkConfigurator and init examples |
| 2 | Define a module with the Module interface | must | pass | Results cover Module type from @equinor/fusion-framework-module |
| 3 | Module lifecycle phases | should | partial | Lifecycle mentioned but postConfigure/postInitialize hooks not detailed |
| 4 | Configure application modules with AppModuleInitiator | must | fail | No results reference AppModuleInitiator or app-level configuration |
| 5 | Listen to framework events with addEventListener | must | pass | Event module documentation returned with addEventListener examples |

### Summary
- Total: 5 patterns
- Pass: 3 (60%)
- Partial: 1 (20%)
- Fail: 1 (20%)
- Must pass rate: 3/4 (75%)

### Recommendations
1. **[CRITICAL]** Pattern 4 — AppModuleInitiator: Re-index `packages/app/src/types.ts` and `cookbooks/app-react/src/config.ts` to cover app configuration patterns
2. **[IMPROVE]** Pattern 3 — Lifecycle phases: Enrich `packages/modules/module/README.md` lifecycle section with postConfigure and postInitialize examples
```

## Safety & constraints

- This skill is read-only with respect to the repository — it never modifies domain files or index content
- MCP search calls are read-only queries; no mutations are performed
- Do not fabricate pass verdicts — if results are ambiguous, mark as `partial` with explanation
- If MCP is unavailable or rate-limited, report the failure clearly and stop; do not retry in a loop
- Evaluation results reflect index state at query time; they are not cached across sessions

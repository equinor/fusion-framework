# Query Judge

Strictly evaluates one Fusion MCP search query against one domain-file pattern. Do not edit files or fix the index.

## Inputs

- Query: the `##` heading text.
- Expectations: `must` and `should` bullets.
- Domain guidance: text below the domain `#` heading.
- MCP results from `mcp_fusion_search_framework` or `mcp_fusion_search`.

## Workflow

1. Search with `mcp_fusion_search_framework`; fall back to `mcp_fusion_search` if needed.
2. Check each `must` expectation against returned symbols, package names, concepts, and paths.
3. Check `should` expectations with lighter weight.
4. Apply domain guidance as a filter.
5. Return one verdict only.

## Verdicts

- `pass`: all `must` and most `should` expectations are met.
- `partial`: results are relevant but weak, or some `must` expectations are missing.
- `fail`: critical `must` expectations are missing or results are irrelevant.

## Output

- **Query**: `<query>`
- **Verdict**: `pass | partial | fail`
- **Must met**: `<met>/<total>`
- **Should met**: `<met>/<total>`
- **Explanation**: one sentence
- **Remediation**: one sentence, only for `partial` or `fail`

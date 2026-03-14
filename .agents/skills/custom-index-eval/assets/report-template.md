# Evaluation Report Template

Use this template when producing evaluation reports.

---

## Evaluation Report: {domain}

**Date:** {YYYY-MM-DD}
**Strictness:** {full | strict}
**Domain file:** `eval/index/{domain}.md`

### Pattern Results

| # | Pattern | Req | Verdict | Explanation |
|---|---------|-----|---------|-------------|
| {n} | {pattern name} | {must\|should} | {pass\|partial\|fail} | {brief explanation of what MCP returned vs what was expected} |

### Summary

- **Total patterns:** {count}
- **Pass:** {count} ({percent}%)
- **Partial:** {count} ({percent}%)
- **Fail:** {count} ({percent}%)
- **Must pass rate:** {must_pass}/{must_total} ({percent}%)
- **Should pass rate:** {should_pass}/{should_total} ({percent}%)

### Recommendations

List recommendations in priority order. Use `[CRITICAL]` for `must` failures, `[IMPROVE]` for `should` failures or partials:

1. **[CRITICAL]** Pattern {n} — {name}: {concrete action to fix the gap}
2. **[IMPROVE]** Pattern {n} — {name}: {concrete action to improve coverage}

### Notes

- {optional context about MCP availability, rate limits, or evaluation conditions}

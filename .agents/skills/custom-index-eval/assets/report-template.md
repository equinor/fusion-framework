# Evaluation Report Template

Use this template when producing evaluation reports.

---

## Evaluation Report: {domain}

**Date:** {YYYY-MM-DD}
**Strictness:** {full | strict}
**Domain file:** `eval/index/{domain}.md`

### Results

| # | Query | Verdict | Explanation |
|---|-------|---------|-------------|
| {n} | {## heading text} | {pass\|partial\|fail} | {which must/should expectations were met or missed} |

### Summary

- **Queries:** {count} | **Pass:** {count} | **Partial:** {count} | **Fail:** {count}
- **Must expectations met:** {met}/{total} ({percent}%)

### Recommendations

1. **[CRITICAL]** Query {n}: {concrete action to fix the gap}
2. **[IMPROVE]** Query {n}: {concrete action to improve coverage}

### Notes

- {optional context about MCP availability, rate limits, or evaluation conditions}

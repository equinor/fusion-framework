---
"@equinor/fusion-framework-cli-plugin-copilot": patch
---

Preserve agent-browser JSON failure messages and codes, including `outcome_unknown`, so browser tool callers can inspect whether a command ran before retrying it. Prefer JSON failures over stderr diagnostics, normalize embedded line breaks into a single-line summary, and safely fall back to the process error message when captured streams are not strings.

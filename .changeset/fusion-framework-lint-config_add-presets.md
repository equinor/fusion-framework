---
"@equinor/fusion-framework-lint-config": minor
---

Add `default`, `balanced`, and `strict` Fusion lint presets. The implicit default is intentionally loose for application code but still warns when exported functions, hooks, or components lack TSDoc and when TODOs lack issue references, while reusable public code can select `balanced` and critical framework code can select `strict`.

---
"@equinor/fusion-framework-react-router": patch
---

Fix a regression from the `routes/index.ts` filename-alignment refactor where the `IndexRoute` class was no longer re-exported from `@equinor/fusion-framework-react-router/routes`.

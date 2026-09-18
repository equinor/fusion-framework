---
"@equinor/fusion-framework-dev-portal": patch
---

Keep the context selector preview in sync with application-driven context changes, including `setCurrentContextByIdAsync` in route loaders. Render an explicit empty preview when context is cleared instead of dispatching a document-wide clear event that can overwrite an updated preview or reset other selectors.

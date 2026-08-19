---
"@equinor/fusion-framework-vitest-plugin-react-app": patch
---

Revert the mocked framework's default navigation history from browser history back to in-memory
history. Browser history leaked URL/history state between tests; `configureFusion`/`enableNavigation`
can still opt back into browser history for a test that specifically needs it.

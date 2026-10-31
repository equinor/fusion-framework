---
"@equinor/fusion-openapi-mock-server": major
---

Upgrade middleware route matching to `path-to-regexp` v9. `RouteContext.params` changes for patterns with multiple parameters in one segment: `router.get('/:file.:ext', handler)` matching `/foo.json.html` now passes `{ file: 'foo', ext: 'json.html' }`, previously `{ file: 'foo.json', ext: 'html' }`.

Audit routes registered through `ServiceBuilder.middleware` or `createRouter`, plus handlers that read `params`. Prefer `/files/:file/extensions/:ext` with `/files/foo.json/extensions/html` to keep the values unambiguous, and update test clients alongside the route. If URLs must remain stable, register one segment parameter and parse it explicitly in the handler.

Direct `createRouter` usage still uses `trailing: false`: `/files/` accepts exactly one trailing slash, not `/files` or `/files//`. Standalone service dispatch continues to normalize empty path segments before middleware matching; register `/files` for that entry point. Simple parameters in separate segments are unchanged. See the README's **Migration: path-to-regexp v9** section for examples and regression-check guidance.

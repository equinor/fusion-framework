---
"@equinor/fusion-framework-vite-plugin-api-service": major
---

Upgrade route matching to `path-to-regexp` v9. This changes the parameters returned by `createRouteMatcher` for patterns with multiple parameters in one segment: `/:file.:ext` matching `/foo.json.html` now returns `{ file: 'foo', ext: 'json.html' }`, previously `{ file: 'foo.json', ext: 'html' }`.

Audit string-pattern routes and handlers that read captured parameters. Prefer separate segments, such as `/files/:file/extensions/:ext` with `/files/foo.json/extensions/html`, when each value must be unambiguous; update callers alongside the route. If URLs cannot change, use a custom matcher with explicitly defined capture behavior.

Explicitly slash-terminated patterns such as `/files/` no longer match `/files//`; normalize callers to one trailing slash. The package uses ESM and the named `match` export. See the README's **Migration: path-to-regexp v9** section for examples and regression-check guidance.

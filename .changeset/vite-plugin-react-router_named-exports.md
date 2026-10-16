---
"@equinor/fusion-framework-vite-plugin-react-router": patch
---

Recognize local named route-module exports and aliases, including `export { guards as middleware }`, so middleware is not silently omitted. Resolve re-exports by their public names and ignore type-only exports.

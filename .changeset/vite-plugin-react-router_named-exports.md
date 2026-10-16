---
"@equinor/fusion-framework-vite-plugin-react-router": patch
---

Parse TypeScript/JSX route-module exports without executing pages or following imports, including local aliases and quoted-source re-exports. Ignore comments, strings and type-only exports so middleware is neither invented nor silently omitted. Fail explicitly when an existing route module cannot be inspected.

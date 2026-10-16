---
"@equinor/fusion-framework-vite-plugin-react-router": patch
---

Inspect TypeScript/JSX route-module exports with Rolldown/Oxc without executing pages or following imports, including local aliases and quoted-source re-exports. Ignore comments, strings and type-only exports so middleware is neither invented nor silently omitted. Fail explicitly when an existing route module cannot be inspected. Use Rolldown instead of introducing an esbuild dependency in the Vite plugin.

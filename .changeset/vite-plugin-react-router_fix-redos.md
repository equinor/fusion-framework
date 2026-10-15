---
"@equinor/fusion-framework-vite-plugin-react-router": patch
---

Fix catastrophic regex backtracking when scanning route modules. Route modules that contain long runs of whitespace inside unfinished `route()`, `layout()`, or DSL `import { ... }` statements could previously stall the Vite transform for seconds to minutes. Route DSL detection, transformation, and import removal behave the same as before.

Resolves CodeQL `js/polynomial-redos` alerts in `react-router-plugin.ts`.

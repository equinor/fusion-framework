---
"@equinor/fusion-framework-module-context": patch
---

Revalidate a parent context even when its ID matches the child's current context, allowing an unsupported context type to resolve to the type configured by the child app.

Fixes: https://github.com/equinor/fusion-core-tasks/issues/2202

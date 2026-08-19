---
"@equinor/fusion-framework-module-context": patch
---

Restructure documentation so the README is an entry point rather than a manual, matching the convention already used by `@equinor/fusion-framework-module` and `@equinor/fusion-framework-module-http`.

Long-form content moves into `docs/data-model.md` (the `ContextItem`/`ContextItemType` shape and query/related parameter types), `docs/lifecycle.md` (setting/resolving context, initial-context resolution, parent/child propagation), and `docs/recipes.md` (OData query parameters, path rewriting, accepting a family of related context types, skipping the default initial-context lookup, custom search errors). The README keeps the elevator pitch, a "How it fits together" section on module dependencies, and a documentation table linking to the rest.

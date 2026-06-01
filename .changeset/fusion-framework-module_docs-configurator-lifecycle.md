---
"@equinor/fusion-framework-module": patch
"@equinor/fusion-framework-docs": patch
---

Document the `@equinor/fusion-framework-module` configurator and lifecycle.

Adds structured `docs/` pages covering:

- **concepts** — module system overview, roles, and mental model
- **lifecycle** — configure → initialize → post-initialize → dispose phase sequence
- **configuration** — how to register modules and use `addConfig` / `configure`
- **cross-module deps** — `requireInstance` pattern for inter-module dependencies
- **events** — `event$` observable and event naming conventions
- **authoring modules** — step-by-step guide for creating a custom module
- **common mistakes** — FAQ-style pitfalls and how to avoid them

All pages are structured for retrieval (chunked sections, import paths, copy-pasteable examples) to improve Fusion Knowledge / Azure AI Search answer quality.

Closes: equinor/fusion-core-tasks#1258

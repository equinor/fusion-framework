---
"@equinor/fusion-framework-docs": patch
---

Add the analytics module's `docs/` pages (`adapters.md`, `collectors.md`, `tracking-events.md`,
`testing.md`) to the vue-press site, matching the `event`/`http`/`module` `docs/` convention:
`README.md` is slimmed to an overview, entry points, and a documentation table, and the new
`analytics/docs/*.md` pages `@include` the package's own docs instead of duplicating content.
The sidebar is updated to match.

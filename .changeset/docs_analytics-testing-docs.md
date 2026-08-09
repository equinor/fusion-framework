---
"@equinor/fusion-framework-docs": patch
---

Add the analytics module's `docs/testing.md` (`MockAnalyticsAdapter`, recording and awaiting
tracked events, and using a bespoke `ModulesConfigurator` in tests) to the vue-press site,
matching the `event`/`http`/`module` `docs/` convention: `README.md` links to it and the new
`analytics/docs/testing.md` page `@include`s the package's own doc instead of duplicating
content. The sidebar is updated to match.

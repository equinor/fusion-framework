---
"@equinor/fusion-framework-module-analytics": patch
---

Fix `extractContextMetadata` to use nullish coalescing (`?? undefined`) for
optional fields (`externalId`, `title`, `source`), ensuring `null` values from
`ContextItem` are coerced to `undefined` to comply with the Zod context schema.

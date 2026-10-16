---
"@equinor/fusion-framework-cli": minor
---

Generate manifest sitemaps from an explicit DSL registry. Configure a registry
with `routes: 'src/custom-routes.ts'`, or omit `routes` to use `src/routes.ts`.
When no default registry exists, the CLI warns with a documentation link and
continues without a generated sitemap. Invalid registries and missing explicit
paths fail. Serialized route entries, `routes: []` and `routes: null` take
precedence over default lookup. Application rendering is unchanged.

---
"@equinor/fusion-query": patch
---

Internal: resolve `noExplicitAny`/`noConfusingVoidType` Biome warnings across `Query`, cache/client action creators, cache types, and `QueryCacheEvent`. Generic defaults that must remain bivariant `any` (`CacheSortFn`, `ActionBuilder`/`ActionMap`/`Actions`, `Query`'s `TQueryArguments`) are suppressed with explanatory `biome-ignore` comments rather than loosened to `unknown`, since that broke cross-file assignability within the package. Event payload fields (`mutation`, `criteria.sort`/`validate`) were safely tightened from `any` to `unknown`. No public API or behavior change.

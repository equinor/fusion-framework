---
"@equinor/fusion-openapi-mock-server": patch
---

Upgrade the runtime `graphql` dependency from `16.14.2` to `17.0.2`. The analytics GraphQL mock behaves the same, but `executeAppFeatureEventsQuery` (exported from `@equinor/fusion-openapi-mock-server/presets/fusion`) now returns graphql 17's `ExecutionResult`. Projects that type that result against their own `graphql@16` install may need to align their `graphql` version.

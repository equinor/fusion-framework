---
"@equinor/fusion-framework-module-http": patch
---

Internal: resolve `noConfusingVoidType` Biome warning on the `ProcessOperator` callback type with an explanatory `biome-ignore` comment, since the `| void` relies on TypeScript's void-callback leniency for operator functions that don't transform the request. No public API or behavior change.

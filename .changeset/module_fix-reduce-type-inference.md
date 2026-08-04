---
"@equinor/fusion-framework-module": patch
---

Internal: pin explicit generic types on the `reduce` operator in `createModuleConfigs` so the accumulator type is no longer inferred as `unknown` under TypeScript 7's stricter inference, which broke builds for consumers with composite project references.

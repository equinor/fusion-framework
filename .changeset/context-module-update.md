---
"@equinor/fusion-framework-module-context": patch
---

Improve context module initialization by adding type guard utilities and refactoring resolve-initial-context. Changed return type from `ContextItem | void` to `ContextItem | null` for better type safety and added null handling with defaultIfEmpty operator. Added new `hasContextModule` utility function to perform type checking.

---
"@equinor/fusion-framework-module-context": patch
---

Fixed matching type of `ContextClient` to extended `Observable` type. Only refactor, no functional changes.

**note:** _the context client context item observable should not be able to be undefined, only item or `null`. this should be fixed in the future, added `@todo` comment to remind us to fix this in the future._

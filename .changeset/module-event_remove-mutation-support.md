---
"@equinor/fusion-framework-module-event": major
---

Remove unused event mutation support and detail cloning to fix `DataCloneError` with non-serializable values.

The event module was throwing `DataCloneError` when event details contained functions (like event listeners) because `structuredClone` cannot serialize functions. We've simplified the event model by removing unused mutation support.

**Removed internal APIs (unused in codebase):**
- `event.originalDetail` - getter removed
- `event.allowEventDetailsMutation` - getter removed  
- `event.updateDetails()` - method removed
- `FrameworkEventInit.mutableDetails` - property removed

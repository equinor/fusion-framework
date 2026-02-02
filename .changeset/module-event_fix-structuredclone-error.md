---
"@equinor/fusion-framework-module-event": patch
---

Fix `DataCloneError` when event details contain functions by replacing `structuredClone` with custom deep clone implementation that preserves class instances and handles non-serializable values.

The custom deep clone function gracefully handles functions (preserving them as references), supports circular references, and maintains the prototype chain for class instances, preventing serialization errors while still providing a deep copy of event details.

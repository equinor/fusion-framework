---
'@equinor/fusion-framework-module-event': patch
---

Mutating complex objects like class instances would cause immer to throw an error. This change adds a try-catch block around the creation of immutable copies of event details to handle potential errors and disable mutations if the event details cannot be securely mutated.

**added:**
-   Imported `enableMapSet` from `immer` and invoked `enableMapSet()` to support Map and Set types in Immer drafts.
-   Added a try-catch block around the creation of immutable copies of event details to handle potential errors and disable mutations if the event details cannot be securely mutated.

**modified:**
-   Removed the initial assignment of `#detail` and `#originalDetail` to the immutable copy produced by `immer`. Instead, they are initially assigned the raw `args.detail` value.
-   The assignment of `#detail` and `#originalDetail` to an immutable copy is now done inside the try block, ensuring that mutations are only disabled upon failure to create an immutable copy.
-   The assignment of `#source` is now done directly from `args.source` without attempting to create an immutable copy.

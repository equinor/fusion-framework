---
"@equinor/fusion-framework-module-bookmark": patch
---

Remove unnecessary deepEqual check from the currentBookmark$ selector to ensure the current bookmark is always emitted, even when re-selected. This improves consistency and ensures consumers receive updates as expected.

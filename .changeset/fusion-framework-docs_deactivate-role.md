---
"@equinor/fusion-framework-docs": patch
---

Document how to deactivate a claimed Roles V2 assignment and explain that successful activation
or deactivation invalidates role-read caches.
Explain the observable client contract and consumer-controlled async pagination for the
access-role registry, including early exit and cancellation.

Related to #5449.

---
"@equinor/fusion-framework-module-bookmark": patch
---

Allow reselection of the current bookmark by removing the check that prevented setting the same bookmark as current. This enables applications to reselect a bookmark even if it is already active, supporting scenarios where application state changes require a re-selection event.

---
"@equinor/fusion-framework-cookbook-app-react-bookmark-advanced": patch
---

Fix the bookmark form when a bookmark without a description or sharing flag is selected. The form now falls back to an empty description and `isShared: false`, instead of storing `undefined` and failing when it reads the description length.

refs equinor/fusion-core-tasks#1626

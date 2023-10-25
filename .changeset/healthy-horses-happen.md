---
'@equinor/fusion-framework-module-navigation': minor
'@equinor/fusion-framework-cookbook-app-react-router': minor
---

Prevent duplicate push event when navigating

Added `master` | `slave` property when creating navigator.
When configured as `slave`, the navigator will replace the action from `PUSH` to `REPLACE`
The result should be that only the `master` will execute the `PUSH` action to `window.location`
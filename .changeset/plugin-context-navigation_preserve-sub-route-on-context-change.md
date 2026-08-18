---
"@equinor/fusion-framework-plugin-context-navigation": patch
---

Fix the path adapter to preserve the app's sub-route when the context changes, instead of always resetting to the app root. The sub-route is still dropped when context is cleared entirely, since there's no valid context to resolve it against.

Fixes: https://github.com/equinor/fusion/issues/904

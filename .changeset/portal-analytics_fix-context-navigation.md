---
"portal-analytics": patch
---

Fix context navigation using `NavigationProvider.navigate` instead of `replace` to trigger the synthetic `pop()` workaround. This ensures apps with listeners filtered to `POP` actions (e.g. React Router via `BaseHistory.listen`) correctly detect URL changes when context switches.

Also handles `null` context (cleared) through `generatePathname` returning `'/'` rather than a separate branch.

Fixes: https://github.com/equinor/fusion-framework/issues/4295

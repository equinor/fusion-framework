---
"portal-analytics": patch
---

Internal: use React 19's `React.JSX.Element` return type instead of the removed global `JSX` namespace, so the cookbook type-checks on its own.

refs equinor/fusion-core-tasks#1626

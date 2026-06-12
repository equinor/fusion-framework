---
"@equinor/fusion-framework-react-app": patch
---

Fix `useAppEnvironmentVariables` to map environment values from app config through a memoized observable before subscribing with `useObservableState`, improving subscription stability.
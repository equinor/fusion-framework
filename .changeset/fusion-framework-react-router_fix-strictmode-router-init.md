---
"@equinor/fusion-framework-react-router": patch
---

Fix blank page and broken back/forward navigation under React StrictMode.

`router.initialize()` was previously called during render (inside `useMemo`), which creates history listener side effects before React's commit phase. In StrictMode, React intentionally mounts, unmounts, and remounts components in development, which left stale initialized router instances with dangling history subscriptions. This caused `navigation.navigate()` to update the URL without the app router reacting, and browser back/forward to produce a blank page.

The router is now initialized and disposed inside a `useEffect`, matching React's expected side-effect lifecycle. A `loader` prop (already accepted by `RouterProps`) is rendered as a fallback during the brief initialization window.

Fixes: https://github.com/equinor/fusion/issues/848

---
"@equinor/fusion-framework-react-router": patch
---

Fix blank page caused by route object mutation and stale router context.

- **Route mutation**: `mapRouteProperties` now shallow-clones each route before wrapping loaders, actions, and components. Previously it mutated the original objects, causing double-wrapping on router recreation.
- **Stale context**: The Fusion router context is now stored in a ref and read lazily via `getContext()`, so context updates no longer destroy and recreate the entire router instance (which lost navigation state).
- **Router cleanup**: The router is now disposed on unmount or recreation, preventing leaked history listeners from routing into a stale instance.
- **Single-route input**: A single `RouteNode` passed as the `routes` prop is now correctly normalized into an array.

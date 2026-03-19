---
"@equinor/fusion-framework-react-router": patch
---

Fix white screen when using `clientLoader` by adding `HydrateFallback` support.

The Vite plugin now recognizes the `HydrateFallback` export from route files and wires it as the `HydrateFallback` component on the route object. Previously, even if a route file exported `HydrateFallback`, the plugin ignored it, causing React Router v7 to render nothing while loaders ran.

Closes #4242

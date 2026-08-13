---
"@equinor/fusion-framework-cookbook-app-react-context": patch
---

Internal: add Vitest coverage for the `App` component, rendering it through the cookbook's real `configure` via `renderAppComponent`; no runtime changes. Coverage includes the seeded initial context on startup, the related-context items resolved for it (excluding the current item itself), switching to a different context via the app's own context module ref (`renderAppComponent`'s `fusion.app`), and the related-context section updating along with it.

---
"@equinor/fusion-framework-app": minor
"@equinor/fusion-framework-react-app": minor
---

Add `enableAppNavigation` (`@equinor/fusion-framework-app/enable-navigation`, re-exported from `@equinor/fusion-framework-react-app/navigation`) and `AppEnv.navigation` so startup adopts the initiator's host or memory navigation strategy without `enableNavigation` or copying `env.basename`.

`renderApp` now disposes the app modules, including the navigation history they own, when the app is unmounted. Host-owned history is never disposed.

Tracking: equinor/fusion-core-tasks#2354.

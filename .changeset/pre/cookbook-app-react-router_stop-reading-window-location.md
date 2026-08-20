---
"@equinor/fusion-framework-cookbook-app-react-router": patch
---

Tests no longer read or seed `window.location`/`window.history`. Now that
`resolveFusion` defaults navigation to in-memory history, real browser
location never reflects the app's navigation state — assertions read
`app.navigation.path.pathname` instead, and link `href` assertions match on
path rather than full origin.

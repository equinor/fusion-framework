---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Fix SPA bootstrap continuing to resolve service discovery and the portal configuration when reloaded inside MSAL's hidden redirect iframe. This could send an unauthenticated scoped request to Fusion Discovery while the parent frame was still completing authentication, producing avoidable 401 responses. Bootstrap now stops right after MSAL processes the redirect response when the window is embedded and the URL fragment carries an MSAL response parameter (`code`, `error`, or `state`); top-level callbacks and ordinary embedded applications are unaffected.

Fixes: https://github.com/equinor/fusion-core-tasks/issues/2035

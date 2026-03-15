---
"@equinor/fusion-framework-module-msal": patch
---

**Fix:** Skip full authentication flow when running inside MSAL's silent renewal iframe.

MSAL's `acquireTokenSilent()` opens a hidden iframe that loads the app URL. Previously the app would re-initialize the MSAL provider inside the iframe, attempt `loginRedirect()`, and crash with `BrowserAuthError: block_iframe_reload`. This caused blank pages and console errors during token renewal.

The provider now detects the iframe context (`window !== window.parent`) early in `initialize()` and only runs `client.initialize()` + `handleRedirectPromise()` — enough for the iframe to process the auth response and post it back to the parent frame, without triggering a redundant login flow.

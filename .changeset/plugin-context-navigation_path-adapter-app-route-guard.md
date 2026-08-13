---
"@equinor/fusion-framework-plugin-context-navigation": patch
---

Fix `createPathAdapter` matching on non-app routes. `canHandle` now rejects a URL when `currentURL.pathname` does not parse as a valid app route (e.g. portal chrome), preventing the path adapter from incorrectly claiming ownership of URLs where there is no app route to encode context into.

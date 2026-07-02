---
"@equinor/fusion-framework-dev-portal": patch
---

Fixes the portal chrome (Header/TopBar and its ContextSelector dropdown) being hidden behind a loaded app's content when the app sets its own internal `z-index`. The dev-portal's header region now establishes an explicit stacking context above the main content area, and the main content area isolates any stacking context an app creates internally so it can no longer escape and cover the portal chrome.

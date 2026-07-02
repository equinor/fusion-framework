---
"@equinor/fusion-framework-dev-portal": patch
---

Fixes the portal chrome (Header/TopBar and its ContextSelector dropdown) being hidden behind a loaded app's content when the app sets its own internal `z-index`. The dev-portal's header region now uses an explicit `z-index` high enough to beat small, incidental z-index values apps tend to use for ordinary layout elements, while staying below the conventional z-index range used by real overlay/backdrop components — so an app's intentional fullscreen scrim (e.g. opening a sidepanel) can still render above the header when desired.

---
"@equinor/fusion-framework-module-navigation": patch
---

Fix blank page caused by trailing slash in app basename.

`NavigationProvider` now normalizes the basename on construction by stripping trailing slashes. React Router performs a strict `startsWith` check against the basename, so a basename of `/apps/my-app/` would never match the URL `/apps/my-app` and the router would render nothing.

The `AppLoader` in the dev portal extracts the basename with a regex that captures an optional trailing slash from the current URL, which could produce basenames like `/apps/app-admin/`. This fix ensures such values are normalized regardless of how the basename is supplied.

Fixes: https://github.com/equinor/fusion/issues/848

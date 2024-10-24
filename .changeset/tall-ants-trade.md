---
'@equinor/fusion-framework-module-app': patch
---

### Changes:

- Updated `AppClient` class to improve the query for fetching app manifests:
  - Adjusted the query path manifests method to include `$expand=category,admins,owners,keywords` when `filterByCurrentUser` is not specified.
  - Minor formatting changes for better readability.

---
'@equinor/fusion-framework-module-app': patch
---

### Changes:
- Updated the `AppClient` class to modify the query path in the `fn` method for fetching app manifests:
  - Changed the path from `/apps/${appKey}` to `/persons/me/apps/${appKey}`.
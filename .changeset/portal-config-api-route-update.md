---
"@equinor/fusion-framework-vite-plugin-spa": patch
"@equinor/fusion-framework-cli": patch
---

Update portal config and manifest API routes and types for consistency:

- Change dev server API route for portal manifest/config from `/portals/portals/...` to `/portal-config/portals/...` for alignment with client usage.
- Make portal config optional in dev server route and type definitions.
- Update SPA bootstrap to use `portal-config` as the service discovery client key.
- Refactor portal manifest/config loading and merging to use `RecursivePartial` and `lodash.mergewith` for deep merge support.
- Remove unused zod import from portal config type.

These changes improve consistency, flexibility, and correctness in portal manifest/config handling across CLI and SPA plugin.

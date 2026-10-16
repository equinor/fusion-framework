---
"@equinor/fusion-framework-react-router": minor
---

Add `resolveRoutes` to the new build-tool entry point `@equinor/fusion-framework-react-router/build`. It resolves file routes under `src/routes` (or an explicit `routes.ts` registry, which replaces discovery) into a canonical route graph with stable `file:` route IDs, parent relationships, path patterns, module capabilities, metadata and source-path diagnostics, without running route modules, a DOM or Vite.

```ts
import { assertRouteGraph, resolveRoutes } from '@equinor/fusion-framework-react-router/build';

const graph = assertRouteGraph(await resolveRoutes({ root: '/repo/apps/my-app' }));
```

See `docs/route-discovery.md` for the file conventions, exclusions and diagnostics.

Ref: equinor/fusion-core-tasks#2350

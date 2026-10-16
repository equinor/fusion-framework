---
"@equinor/fusion-framework-react-router": minor
---

Add `resolveRoutes` to the new build-tool entry point `@equinor/fusion-framework-react-router/build`. It resolves file routes under `src/routes` (or an explicit `routes.ts` registry, which replaces discovery) into a canonical route graph with stable `file:` route IDs, parent relationships, path patterns, module capabilities, metadata and source-path diagnostics, without running route modules, a DOM or Vite. Registries resolve relative module references at the DSL call site, may import only the route DSL and other registry modules (checked before evaluation), and are evaluated in a short-lived worker per call.

```ts
import { assertRouteGraph, resolveRoutes } from '@equinor/fusion-framework-react-router/build';

const graph = assertRouteGraph(await resolveRoutes({ root: '/repo/apps/my-app' }));
```

See `docs/route-discovery.md` for the file conventions, exclusions and diagnostics.

Ref: equinor/fusion-core-tasks#2350

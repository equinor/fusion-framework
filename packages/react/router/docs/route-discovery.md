# Route discovery and the canonical route graph

`resolveRoutes` turns an application's routes into one canonical route graph that build tooling can share: generated startup, the Vite integration, preview and routing manifest generation. It reads either file-route modules under `src/routes` or an explicit route registry, and it never mounts React, needs a DOM, starts Vite or runs route components, loaders or actions.

The resolver is exported from the build-tool entry point `@equinor/fusion-framework-react-router/build`. It is Node.js-only; do not import it from application code.

> [!NOTE]
> This guide covers the resolver API. Generated startup, middleware, navigation and manifest publication consume this graph and are documented separately when they ship.

## Quick start

```ts
import { assertRouteGraph, resolveRoutes } from '@equinor/fusion-framework-react-router/build';

const graph = assertRouteGraph(await resolveRoutes({ root: '/repo/apps/my-app' }));

for (const route of graph.routes) {
  console.log(route.id, route.parentId, route.kind, route.path, route.capabilities);
}
```

| Option | Default | Meaning |
| --- | --- | --- |
| `root` | — (required, absolute) | Project root. All relative paths and route IDs are relative to it, never to the process working directory. |
| `directory` | `src/routes` | Route directory for file-route discovery. |
| `routesFile` | `routes.ts` / `routes.tsx` in `directory` if present | Explicit route registry module. |

## File-route conventions

| File or folder | Route |
| --- | --- |
| `index.tsx` | Index route at its containing path |
| `layout.tsx` | Pathless layout around every route in its directory and below |
| `projects/index.tsx` | `/projects` |
| `projects/[projectId]/index.tsx` | `/projects/:projectId` |
| `projects/[projectId]/reports.tsx` | `/projects/:projectId/reports` |
| `projects/layout.tsx` | Layout for the `/projects` section |

- Route modules are `.ts` or `.tsx` files. A route module must export a default component, a `clientLoader` or an `action`.
- A plain file or folder name is a static URL segment. `[name]` is a required dynamic segment `:name`; the name must be a JavaScript-style identifier.
- Layouts do not add a URL segment. A layout becomes the parent of the index, routes and nested folders beside it.
- Optional segments, splats and other advanced shapes are not discovered. Declare them with the explicit route DSL.

### Excluded files

Discovery ignores these, so they are the right place for helpers, tests and mocks:

- declaration files (`*.d.ts`)
- test and spec files (`*.test.ts(x)`, `*.spec.ts(x)`)
- hidden names (starting with `.`)
- private names starting with `_`, including `__tests__` and `__mocks__` folders
- files that are not `.ts` or `.tsx`

## Explicit route registry

When `routesFile` is set, or `src/routes/routes.ts` exists, that registry **replaces** discovery. The registry and discovered files are never merged. Registries use the existing DSL and keep all advanced shapes:

```ts
// src/routes/routes.ts
import { index, layout, prefix, route } from '@equinor/fusion-framework-react-router/routes';

export default layout('./layout.tsx', [
  index('./index.tsx', { description: 'Home' }),
  prefix('products', [index('./products/index.tsx'), route(':id', './products/[id]/index.tsx')]),
  route(':lang?/docs', './docs.tsx'),
  route('*', './not-found.tsx'),
]);
```

- The registry exports route DSL nodes as its `default` export, or as a named `routes` export.
- Module references may be relative to the registry file, absolute paths or `import.meta.resolve(...)` results. When a registry is split across files, use `import.meta.resolve` in the nested files so references do not depend on the registry's folder.
- Only the registry module is evaluated. Page modules are referenced by path and are read as text, never imported.
- Route metadata passed to `index()` / `route()` becomes `metadata` in the graph.

## The route graph

`resolveRoutes` returns a `ResolvedRouteGraph`:

| Field | Meaning |
| --- | --- |
| `source` | `{ kind: 'discovery', directory }`, `{ kind: 'registry', file }` or `{ kind: 'none', directory }` |
| `routes` | Routes in canonical order: parents before children, siblings sorted by path, kind and ID |
| `diagnostics` | Problems, each naming the project-relative source files involved |
| `dependencies` | Project-relative files read while resolving |

Each `ResolvedRoute` has:

| Field | Example |
| --- | --- |
| `id` | `file:src/routes/projects/[projectId]/index.tsx` |
| `parentId` | `file:src/routes/projects/layout.tsx` or `null` |
| `kind` | `layout`, `index` or `route` |
| `path` | `/projects/:projectId` (full app-relative pattern) |
| `module` | `src/routes/projects/[projectId]/index.tsx` |
| `capabilities` | `['component', 'clientLoader', 'handle']` |
| `metadata` | `{ description, params, search }` from the explicit DSL; `{}` for discovered routes |

### Route IDs

- IDs are `file:` plus the normalized project-relative module path with `/` separators, so they are identical on every machine and build.
- Moving or renaming a module changes its ID.
- When a registry reuses one module in several places, each occurrence gets its graph location appended: `file:src/pages/list.tsx#route:/a/items`.

### Capabilities

Capabilities are detected by scanning module exports, without executing them: `component` (`default`), `clientLoader`, `action`, `handle`, `errorElement` (`ErrorElement`), `hydrateFallback` (`HydrateFallback`), `shouldRevalidate` and `middleware`. `detectRouteModuleCapabilities(source)` exposes the same detection.

## Diagnostics

| Code | Cause |
| --- | --- |
| `duplicate-route-path` | Two unrelated routes match the same URL, including differences in parameter names or letter case |
| `duplicate-index` / `duplicate-layout` | More than one `index` or `layout` module in a directory |
| `case-collision` | Names in one directory differ only by letter case |
| `invalid-dynamic-segment` | `[name]` or `:name` with an invalid parameter name |
| `unsupported-route-segment` | Splat, optional or other advanced shapes in file names |
| `missing-route-capability` | A route module exports no component, `clientLoader` or `action` |
| `unresolved-route-file` | A registry references a module that does not exist |
| `route-file-outside-root` | A route directory, registry or module is outside the project root |
| `missing-routes-file` / `ambiguous-route-registry` | The configured registry is missing, or both `routes.ts` and `routes.tsx` exist |
| `invalid-route-registry` / `route-registry-load-failed` | The registry export is not DSL nodes, or the registry cannot be evaluated |

`assertRouteGraph(graph)` throws a `RouteResolutionError` listing every error with its files. Build steps should call it before using the graph.

## Development and incremental changes

`resolveRoutes` is stateless. Call it again after a file under the route directory is added, removed or moved, or after a file in `graph.dependencies` changes, to get the updated graph without restarting a development server.

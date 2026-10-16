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
- Relative module references (`./Page.tsx`, `../pages/list`) resolve against the module that calls `index()`, `layout()` or `route()`, as the Vite plugin does. A registry can therefore be split into helper registries that each reference their own `./Page.tsx`. Absolute paths, `file:` URLs and `import.meta.resolve(...)` results are accepted too.
- Page modules are referenced by path and read as text. They are never imported or executed, so the graph, capabilities and metadata come without running components, loaders or actions.

### What a registry may import

A registry is ordinary trusted build-time code, like `vite.config.ts`. It is bundled in memory and evaluated to read its DSL nodes. Evaluation is **not a sandbox**: registry code and the helpers it imports run with full Node.js access. Registries may import:

- the route DSL (`@equinor/fusion-framework-react-router/routes` or the package root);
- other registry modules (helpers that call `index()`, `layout()` or `route()` and reference their own `./Page.tsx`);
- ordinary project helpers, such as path constants in `./paths.ts`, even when they do not import the DSL. tsconfig `paths` aliases that point inside the project are followed;
- Node.js built-ins such as `node:path`. `import.meta.url`, `import.meta.dirname` and `import.meta.filename` keep the values of the original source module;
- installed packages (ESM or CommonJS). They are loaded from `node_modules` at evaluation time.

Project helpers are listed in `graph.dependencies` and re-read on every call. Installed packages are not listed.

**Route modules are never executed.** Before anything runs, every bundled project module is scanned. A module is treated as a route module, and the import is rejected with `unsupported-registry-import` naming the importing and imported files, when:

- it exports a route-only capability (`clientLoader`, `action`, `handle`, `ErrorElement`, `HydrateFallback`, `shouldRevalidate`, `middleware`), directly or through `export * from`;
- it is not a registry module and has a default export in a `.tsx`/`.jsx` file, or an `export default function`/`class`;
- a registry module references it by a quoted relative path (for example `route('about', './About.ts')`) while also importing it.

The same diagnostic is reported when the entry registry is itself a route module. After evaluation, every route reference is compared with the bundled modules again. A computed reference to a module that registry code imported is rejected. In that case the imported module did run, because it looked like an ordinary helper (for example a `.ts` file with an expression default and no route-only exports). Keep route modules out of registry imports and reference them by path only.

Relative or alias imports that resolve outside the project root are rejected with `route-file-outside-root`, because they could not be watched. Workspace packages reached through `node_modules` are allowed. Imports that esbuild cannot load without a loader (for example CSS or images) and Vite-only aliases cause `route-registry-load-failed`.

Each resolution evaluates the registry in a fresh worker thread. The worker is terminated when evaluation finishes, throws, calls `process.exit`, never settles, or runs for more than 10 seconds. Nothing is cached between calls and no files are written, so every call sees current sources and repeated resolution does not grow the process.

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
- When a registry reuses one module in several places, each occurrence gets its graph location (kind and full path) appended: `file:src/pages/list.tsx#route:/a/items`. If the same module appears more than once with the same kind and path, later occurrences get an ordinal in declaration order (`#route:/items~2`); that situation is also a `duplicate-route-path` error.

### Capabilities

Capabilities are detected by scanning module source text, without executing it: `component` (`default`), `clientLoader`, `action`, `handle`, `errorElement` (`ErrorElement`), `hydrateFallback` (`HydrateFallback`), `shouldRevalidate` and `middleware`. `detectRouteModuleCapabilities(source)` exposes the same detection.

The scan recognizes function, class and `const`/`let`/`var` declarations (every declarator, including destructuring), `export { ... }` lists, named and namespace (`export * as handle from`) re-exports. Before matching, it blanks comments, strings, template literals (including nested `${}`) and regular expression literals, so `/export default/` or `'export const middleware'` never count. Type-only and `declare` exports are ignored.

`export * from './x'` re-exports are followed when resolving routes: relative targets are read (recursively, with cycle protection), contribute their named capabilities but never `default`, and are added to `graph.dependencies`. A star re-export of a package or of a file that cannot be found is reported as `unresolved-route-capabilities`, because it could hide a guard such as `middleware`. `detectRouteModuleCapabilities(source)` scans a single source text and does not follow re-exports.

The scan is a lightweight lexer, not a TypeScript parser, and is not guaranteed to match the Vite plugin's export detection in every case. Regular expression detection uses the preceding token, so rare shapes such as `if (x) /re/.test(y)` can be misread.

## Diagnostics

| Code | Cause |
| --- | --- |
| `duplicate-route-path` | Two unrelated routes match the same URL, including differences in parameter names or letter case |
| `duplicate-index` / `duplicate-layout` | More than one `index` or `layout` module in a directory |
| `case-collision` | Names in one directory differ only by letter case |
| `invalid-dynamic-segment` | `[name]` or `:name` with an invalid parameter name |
| `unsupported-route-segment` | Splat, optional or other advanced shapes in file names |
| `missing-route-capability` | A route module exports no component, `clientLoader` or `action` |
| `unresolved-route-file` | A registry references a module that does not exist, or uses a bare specifier |
| `route-file-unreadable` | A route module or folder exists but cannot be read (for example, permission denied) |
| `unsupported-registry-import` | Registry code imports a route module, or references a module it also imported |
| `unresolved-route-capabilities` | A route module uses `export * from` a package or a missing file, so its capabilities are unknown |
| `route-file-outside-root` | A route directory, registry or module is outside the project root |
| `missing-routes-file` / `ambiguous-route-registry` | The configured registry is missing, or both `routes.ts` and `routes.tsx` exist |
| `invalid-route-registry` / `route-registry-load-failed` | The registry export is not DSL nodes, or the registry cannot be evaluated |

`assertRouteGraph(graph)` throws a `RouteResolutionError` listing every error with its files. Build steps should call it before using the graph.

Missing files (`ENOENT`, `ENOTDIR`) are treated as absent and dangling symlinks are skipped. Other file system failures are never treated as "not found": they are reported as `route-file-unreadable`, or thrown when they affect the project root, route directory or registry lookup.

## Development and incremental changes

`resolveRoutes` is stateless. Call it again after a file under the route directory is added, removed or moved, or after a file in `graph.dependencies` changes (including helper registries imported by the registry), to get the updated graph without restarting a development server.

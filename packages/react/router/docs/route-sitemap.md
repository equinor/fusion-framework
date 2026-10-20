# Explicit route registries and manifest sitemaps

Declare the application URL tree in `src/routes.ts`. The CLI reads this conventional
registry when the manifest omits `routes`. Page filenames do not define URLs: the
existing `index`, `layout`, `prefix` and `route` DSL does. Filesystem route discovery
is not part of this feature.

## Define the route tree

```ts
// src/routes.ts
import { index, layout, prefix, route } from '@equinor/fusion-framework-react-router/routes';

export default layout('./routes/layout.tsx', [
  index('./routes/index.tsx'),
  prefix('projects/:slug', [
    index('./routes/projects/index.tsx'),
    route('demands/:demandId', './routes/projects/demands/index.tsx'),
  ]),
]);
```

Module paths are relative to the registry and include their file extensions.
The layout renders an `Outlet`. Page modules keep their default component,
`clientLoader`, actions, middleware and `handle` exports.

## Generate the build manifest sitemap

When no `routes` value is configured, the CLI looks for `src/routes.ts`, including
when there is no local manifest config. If that file is missing, the CLI warns
about missing DSL routing with a link to this guide and continues without a
generated sitemap. An existing registry that is invalid or unreadable is an error,
not a warning.

To use a different registry, set a pointer in the manifest config:

```ts
// app.manifest.ts
import { defineAppManifest } from '@equinor/fusion-framework-cli/app';

export default defineAppManifest(() => ({
  routes: 'src/routes.ts',
}));
```

The registry is resolved when generating the manifest, including `ffc app manifest`,
build, packaging and local development. JSON manifests accept the same pointer.
The emitted sitemap uses the existing **`routes`** field, not a new `sitemap` field:

```json
{
  "routes": [
    ["/", "Home"],
    ["projects/:slug", "Projects"],
    ["projects/:slug/demands/:demandId", "Demand", {
      "params": { "slug": "Project identifier", "demandId": "Demand identifier" }
    }]
  ]
}
```

Descriptions, parameter descriptions and search descriptions come from each page's
`handle.route`. Inline DSL schemas override the corresponding module-schema fields.
Layouts and prefixes contribute hierarchy, not separate sitemap entries.

Neither registry nor page code executes during sitemap generation. TypeScript and
JSX are parsed; unrelated UI-only `handle` properties are not evaluated. Registry
exports must be a declarative tree of DSL calls, arrays and local constants.
Bindings contributing to the registry or selected metadata must not be reassigned,
mutated or passed to untrusted runtime code, including through aliases and containing
objects. These uses are conservatively rejected without executing them: for example,
build an array in its declaration rather than appending routes with `routes.push()`.
Property reads, destructuring and spreads that could invoke getters on these
bindings are also rejected: a getter can mutate metadata even when its result is
ignored. An unselected UI getter that is never read remains unevaluated.
Unrelated UI state and unselected UI-only metadata remain outside this check.
Imported helper values, computed route trees, metadata functions, namespace imports,
re-exports and `import.meta.resolve()` are not supported by source-only generation.
Missing files and unsupported expressions fail explicitly rather than producing a
partial sitemap. Apps needing computed manifests can supply serialized `routes`
entries themselves; existing serialized manifests remain supported.

The lower-level Node-only API defaults to `src/routes.ts`:

```ts
import { resolveSitemap } from '@equinor/fusion-framework-react-router/build';

const sitemap = await resolveSitemap({ root: process.cwd() });
```

An explicit pointer takes precedence over `src/routes.ts`; a missing explicitly
configured file is an error. Already serialized `routes` entries are preserved.
Use `routes: []` or `routes: null` to opt out of conventional registry lookup and
its warning. There is no folder scan or inference from page filenames.

Automatic application routing is outside this contract; no future feature is
committed by this guide. Manifest generation does not change application startup
or rendering: the manifest is documentation, not a runtime route configuration.

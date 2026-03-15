# @equinor/fusion-framework-module-context

Context module for the Fusion Framework. Manages the active context (project, facility, contract, etc.) within Fusion-based applications and portals, providing query, validation, resolution, and parent–child synchronization out of the box.

## When to use

Use this module when your application or portal needs to:

- set, read, or clear the active context (e.g. selecting a project)
- search and filter available context items from the Fusion context API
- validate whether a given context item matches the allowed context types
- resolve context across parent–child provider boundaries (portal → app)
- deep-link by extracting a context ID from the URL path

> **Application developers** will typically use the higher-level
> `@equinor/fusion-framework-react-app/context` package, which wraps this
> module with React hooks and providers.
>
> **Portal developers** will use `@equinor/fusion-framework-react/context`
> for the same purpose at the portal level.

## Key concepts

| Concept | Description |
|---|---|
| **ContextItem** | A typed record representing a single context entity (project, facility, etc.). |
| **ContextProvider** | Runtime service exposing query, set, validate, resolve, and event APIs. |
| **ContextConfigBuilder** | Fluent builder for configuring context types, filters, clients, and hooks. |
| **enableContext** | Helper that registers the module on a modules configurator. |
| **Context resolution** | Automatic lookup of related context items when a context type does not match the configured types. |
| **Parent connection** | Bi-directional sync between a parent portal context and a child app context. |

## Quick start

```ts
import { enableContext } from '@equinor/fusion-framework-module-context';

export const configure = (configurator) => {
  enableContext(configurator, (builder) => {
    // only accept ProjectMaster context items
    builder.setContextType(['ProjectMaster']);
  });
};
```

Once initialized, access the provider from the module instance:

```ts
// observe context changes
modules.context.currentContext$.subscribe((ctx) => {
  console.log('context changed', ctx);
});

// search for context items
const items = await modules.context.queryContextAsync('Johan');

// set context by item
await modules.context.setCurrentContextAsync(items[0]);

// set context by ID
await modules.context.setCurrentContextByIdAsync('7fd97952-...');

// clear the active context
modules.context.clearCurrentContext();
```

## Configuration

All configuration flows through `enableContext` → `ContextConfigBuilder`:

```ts
enableContext(configurator, (builder) => {
  // restrict accepted context types
  builder.setContextType(['ProjectMaster', 'Facility']);

  // post-query filter
  builder.setContextFilter((items) => items.filter((i) => i.isActive));

  // custom parameter mapping for the search API
  builder.setContextParameterFn(({ search, type }) => ({
    search,
    filter: { type },
  }));

  // custom validation logic
  builder.setValidateContext(function (item) {
    return item !== null && this.validateContext(item);
  });

  // custom context resolution
  builder.setResolveContext(function (item) {
    return this.relatedContexts({ item, filter: { type: ['ProjectMaster'] } });
  });

  // connect (or disconnect) from parent context
  // when enabled (default), onParentContextChanged fires before mirroring the parent's context locally
  builder.connectParentContext(false);

  // path ↔ context integration
  // the default resolver uses extractContextIdFromPath to pull a GUID from the URL,
  // then fetches the matching context item — see resolveInitialContext in utils
  builder.setContextPathExtractor((path) => path.split('/')[2]);
  builder.setContextPathGenerator((ctx, path) =>
    path.replace(/\/context\/[^/]+/, `/context/${ctx.id}`),
  );

  // provide a fully custom context client
  builder.setContextClient({
    get: (args) => fetch(`/api/context/${args.id}`).then((r) => r.json()),
    query: (args) => fetch(`/api/context?q=${args.search}`).then((r) => r.json()),
  });
});
```

### Configuration reference

| Builder method | Purpose |
|---|---|
| `setContextType(types)` | Allowed context type IDs for validation |
| `setContextFilter(fn)` | Post-query result filter |
| `setContextParameterFn(fn)` | Maps search + type to API query params |
| `setValidateContext(fn)` | Custom validation (`this` = provider) |
| `setResolveContext(fn)` | Custom resolution (`this` = provider) |
| `connectParentContext(bool)` | Enable/disable parent context sync (fires `onParentContextChanged` on change) |
| `setContextPathExtractor(fn)` | Extract context ID from URL path |
| `setContextPathGenerator(fn)` | Generate URL path from context item |
| `setResolveInitialContext(fn)` | Override initial context resolution (default uses `extractContextIdFromPath` → `resolveContextFromPath`) |
| `setContextClient(client)` | Custom get/query/related clients |

## Events

The context module dispatches events via the `@equinor/fusion-framework-module-event` system. All events are scoped to the `ContextProvider` source.

| Event | When | Cancelable |
|---|---|---|
| `onCurrentContextChange` | Before the current context is updated | Yes |
| `onCurrentContextChanged` | After the current context has changed | No |
| `onParentContextChanged` | Before a parent context change is mirrored locally | Yes |
| `onSetContextResolve` | Before context resolution begins | Yes |
| `onSetContextResolved` | After context resolution completes | Yes |
| `onSetContextValidationFailed` | When validation fails (no resolution) | No |
| `onSetContextResolveFailed` | When resolution fails with an error | No |

```ts
modules.event.addEventListener('onCurrentContextChanged', (e) => {
  console.log('previous:', e.detail.previous);
  console.log('next:', e.detail.next);
});
```

## Errors

The module exports `FusionContextSearchError` (from `@equinor/fusion-framework-module-context/errors.js`) for search-related failures:

```ts
import { FusionContextSearchError } from '@equinor/fusion-framework-module-context/errors.js';

try {
  await modules.context.queryContextAsync('...');
} catch (err) {
  if (err instanceof FusionContextSearchError) {
    console.error(err.title, err.description);
  }
}
```

## Utilities

Additional helpers are available from `@equinor/fusion-framework-module-context/utils`:

| Export | Purpose |
|---|---|
| `enableContext` | Register the context module on a configurator |
| `resolveInitialContext` | Default initial-context resolver (path → parent fallback) |
| `extractContextIdFromPath` | Extract a GUID-format context ID from a URL path |
| `resolveContextFromPath` | Create a resolver function that fetches a context item from a URL path |

## Package exports

| Specifier | Description |
|---|---|
| `@equinor/fusion-framework-module-context` | Main entry — module, provider, configurator, types |
| `@equinor/fusion-framework-module-context/errors.js` | `FusionContextSearchError` |
| `@equinor/fusion-framework-module-context/utils` | Utility functions for path resolution and enablement |


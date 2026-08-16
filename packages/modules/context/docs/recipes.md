# Recipes

Configuration patterns that go beyond the [Configuration reference](../README.md#configuration-reference)
in the README.

## OData query parameters

`setContextParameterFn` maps a search + type into the parameters `setContextClient`'s `query`
receives. The default shape is a plain `{ search, filter: { type } }` object, but a context API
backed by OData can build the filter with [`odata-query`](https://www.npmjs.com/package/odata-query)
instead:

```ts
import buildQuery from 'odata-query';

enableContext(configurator, (builder) => {
  builder.setContextParameterFn(({ search, type }) =>
    buildQuery({
      search,
      filter: { type: { in: type } },
    }),
  );
});
```

## Rewriting a path on context change

`setContextPathGenerator` builds the URL a navigation module pushes to when the current
context changes. Beyond a simple GUID swap, a path can also carry an application-specific key
derived from the resolved item:

```ts
enableContext(configurator, (builder) => {
  builder.setContextPathGenerator((item, path) => {
    // /app/old-app-key/overview -> /app/new-app-key/overview
    return path.replace(/^(\/)?app\/[^/]+(.*)$/, `/app/${item.value.appKey}$2`);
  });
});
```

Pair this with a matching `setContextPathExtractor` so the same key round-trips back into a
context id on page load — see [setContextPathExtractor](../README.md#configuration-reference)
in the README.

## Accepting a family of related context types

`setContextType` matches exact type IDs, so an allow-list of `['ProjectMaster']` rejects a
`'Facility'` item even if that facility's [`ContextItemType.parentTypeIds`](data-model.md#contextitemtype-and-hierarchies)
includes `'ProjectMaster'`. To accept a type *and* its declared children, widen validation
instead of the allow-list:

```ts
enableContext(configurator, (builder) => {
  const acceptedTypes = ['ProjectMaster'];

  builder.setContextType(acceptedTypes);
  builder.setValidateContext((item) => {
    if (acceptedTypes.includes(item.type.id)) return true;
    return Boolean(item.type.isChildType && item.type.parentTypeIds?.some((id) => acceptedTypes.includes(id)));
  });
});
```

This keeps `setContextType` as the source of truth for the query allow-list (so searches still
scope to the right types server-side) while letting validation reason about the type hierarchy.

## Skipping the default initial-context lookup

By default, a newly initialized instance tries to resolve its context from the URL, then from
its parent — see [Resolving the initial context](lifecycle.md#resolving-the-initial-context).
An application that manages its own startup context entirely (e.g. from application state
rather than the URL or a parent) can replace that lookup outright:

```ts
import { EMPTY } from 'rxjs';

enableContext(configurator, (builder) => {
  // never auto-resolve an initial context; the application sets one explicitly later
  builder.setResolveInitialContext(() => EMPTY);
});
```

## Custom search errors

`FusionContextSearchError`, thrown from `setContextClient`'s `query`, lets an application
surface a domain-specific search failure instead of a generic error — see the
[app-react-context-custom-error](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-context-custom-error/src/config.ts)
cookbook for a complete example.


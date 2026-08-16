# Data Model

What a context item actually looks like, how context *types* relate to each other, and the
shapes used to query and filter them.

## `ContextItem`

A context item is the thing your application or portal is currently scoped to — a project, a
facility, a contract, or any other entity the Fusion context API knows about.

```ts
type ContextItem<TValue = Record<string, unknown>> = {
  id: string;
  type: ContextItemType;
  value: TValue;
  externalId?: string;
  source?: string;
  title?: string;
  subTitle?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  created?: Date;
  updated?: Date;
  graphic?: string | { type: 'html' | 'svg'; content: string };
  meta?: string | { type: 'html' | 'svg'; content: string };
};
```

The fields that matter most day to day:

- **`id`** — the identifier the context module itself uses everywhere: `setCurrentContextById`,
  `extractContextIdFromPath`, cache keys, and equality checks (`connectParentContext` only
  reacts when `id` actually changes).
- **`type`** — see [`ContextItemType`](#contextitemtype-and-hierarchies) below; this is what
  `contextType` allow-lists and `validateContext` check against.
- **`value`** — the domain payload for this item (e.g. the actual project or facility record).
  Type it with the generic parameter, `ContextItem<MyProjectShape>`, when you know the shape.
- **`externalId`** and **`source`** — identifiers from an upstream system, when the context item
  was imported or mirrored from somewhere other than the context API itself.
- **`title`** / **`subTitle`** / **`graphic`** / **`meta`** — presentation hints for UI
  components (e.g. a context switcher) to render without needing to know the `value` shape.

> [!NOTE]
> `ContextItem` is currently a hand-written type, not yet backed by a runtime schema — see
> [issue #5122](https://github.com/equinor/fusion-framework/issues/5122). Values coming back
> from a real context API are not validated at the type boundary; a custom `setContextClient`
> is responsible for shaping its own responses correctly.

## `ContextItemType` and hierarchies

```ts
interface ContextItemType {
  id: string;
  isChildType?: boolean;
  parentTypeIds?: string[];
}
```

Every context item carries a `type` that says what *kind* of entity it is — `'ProjectMaster'`,
`'Facility'`, `'Contract'`, and so on. Types can be organized as a shallow hierarchy:
`isChildType: true` plus `parentTypeIds` marks a type as a child of one or more parent types
(e.g. a `'Facility'` that belongs to a `'ProjectMaster'`).

This hierarchy is informational — nothing in this module walks `parentTypeIds` automatically.
It exists so that:

- application code can build a "these types are related" UI (e.g. grouping facilities under
  their parent project) without a second API call,
- a custom `resolveContext` or `contextParameterFn` can use `parentTypeIds` to broaden a search
  or a relation lookup by type family instead of a single exact type ID.

`setContextType(['ProjectMaster'])` restricts which type **IDs** `validateContext` accepts — it
does not expand automatically to include child or parent types unless you list them explicitly
or write a custom `setValidateContext`.

> [!NOTE]
> Type ID matching in `validateContext`'s default implementation is case-insensitive, so
> `'projectmaster'` and `'ProjectMaster'` are treated the same.

## Querying and relating

```ts
type QueryContextParameters = {
  search?: string;
  filter?: { type?: string[]; externalId?: string };
};

type RelatedContextParameters = {
  item: ContextItem;
  filter?: { type?: string[] };
};

type ContextFilterFn = (items: ContextItem[]) => ContextItem[];
```

- **`QueryContextParameters`** is what `queryContext`/`queryContextAsync` sends to the query
  client, after `contextParameterFn` has had a chance to transform it — see
  [`setContextParameterFn`](../README.md#configuration-reference) and the
  [OData recipe](recipes.md#odata-query-parameters) for a non-default mapping.
- **`RelatedContextParameters`** is what `relatedContexts`/`relatedContextsAsync` sends when
  looking up items related to a given `item` — this is what the default `resolveContext`
  uses internally when validation fails; see [Lifecycle](lifecycle.md#resolving-context).
- **`ContextFilterFn`** (`setContextFilter`) runs *after* a query returns, entirely client-side —
  use it to hide items the API returned but that shouldn't be selectable (e.g. `isDeleted`
  items), as opposed to `contextParameterFn`, which shapes the request itself.

## The context client

`ContextClient` is the piece that actually holds "the current context" and fetches a single
item by ID. It underlies `currentContext`/`currentContext$` on `ContextProvider` — the provider
does not keep its own separate copy of the state.

```ts
type GetContextParameters = { id: string };
```

`currentContext$` (and `currentContext`) can be in exactly three states, and the difference
matters for anything that reacts to it:

| Value | Meaning |
|---|---|
| `undefined` | No context has been resolved yet — the provider hasn't initialized (or finished initial-context resolution). |
| `null` | Context was explicitly cleared, e.g. via `clearCurrentContext()`. |
| a `ContextItem` | A context is actively set. |

Treat `undefined` and `null` differently in UI code: `undefined` usually means "still loading,
don't show an empty state yet", while `null` means "there really is no context — show the
picker".

## Errors

`ContextClient`/the query clients throw `FusionContextSearchError` for domain-specific search
failures thrown from a custom `setContextClient`'s `query` — see
[Errors](../README.md#errors) in the README for a full example.

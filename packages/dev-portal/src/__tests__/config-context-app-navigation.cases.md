# Context App Navigation — Intended Use Cases

These cases describe the **observable URL behavior** the portal navigation subscription must
produce. They are written from the outside in (URL in → URL out) so tests can verify behavior
without coupling to implementation details.

---

## Terminology

| Term | Meaning |
|---|---|
| **legacy app** | app whose context module version is < 8.0.0 — does **not** call `setRoutingStrategy`, so `routingStrategy` is `undefined` on the provider |
| **modern app** | app whose context module version is ≥ 8.0.0 — explicitly calls `setRoutingStrategy('query' \| 'path' \| 'custom')` |
| **query strategy** | modern app called `setRoutingStrategy('query')` — context id lives in `?$ctx=` |
| **path strategy** | modern app called `setRoutingStrategy('path')` — context id is the 3rd URL segment |
| **custom strategy** | modern app called `setRoutingStrategy('custom')` — app owns its own URL shape |
| **context cleared** | portal emits `null` for `currentContext$` |
| **bare app route** | URL matches `/apps/:appKey` with no further segments |

---

## 1. Context selected — modern app, query strategy

**Given** a modern app (v8+) that called `setRoutingStrategy('query')`  
**And** the portal URL is `/apps/my-app`  
**When** the user selects a context with id `ctx-abc`  
**Then** the URL becomes `/apps/my-app?$ctx=ctx-abc`  
**And** the pathname does **not** contain a context segment

Confirmed: ✅
---

## 2. Context selected — modern app, path strategy

**Given** a modern app (v8+) that called `setRoutingStrategy('path')`  
**And** the portal URL is `/apps/my-app`  
**When** the user selects a context with id `ctx-abc`  
**Then** the URL becomes `/apps/my-app/ctx-abc`  
**And** there is no `$ctx` query parameter


Confirmed: ✅

note: context here will always be guid if the app is using default context client. if app provides own context client we dont know the shape of the id, but we can still test that it is correctly written to the URL according to the strategy
---

## 3. Context changes — modern app, query strategy, previous context already in URL

**Given** a modern app (v8+) that called `setRoutingStrategy('query')`  
**And** the portal URL is `/apps/my-app?$ctx=old-ctx`  
**When** the user selects a different context with id `new-ctx`  
**Then** the URL becomes `/apps/my-app?$ctx=new-ctx`  
**And** `old-ctx` is gone from both path and query

Confirmed: ✅
---

## 4. Context selected — legacy app (v < 8)

**Given** a legacy app (version < 8.0.0) that never called `setRoutingStrategy` (so `routingStrategy` is `undefined`)  
**And** the portal URL is `/apps/my-app`  
**When** the user selects a context with id `ctx-abc`  
**Then** the URL becomes `/apps/my-app/ctx-abc`  
**And** there is no `$ctx` query parameter  
**And** the version gate forces path-only behavior — `routingStrategy` is never read

Confirmed: ✅
---

## 4b. Context selected — legacy app with custom path hooks (v < 8)

**Given** a legacy app (version < 8.0.0) that configured custom `extractContextIdFromPath` and `generatePathFromContext` but never called `setRoutingStrategy`  
**And** the portal URL is `/apps/my-app/route-a/ctx-abc` (custom path shape)  
**When** the user selects a new context with id `ctx-xyz`  
**Then** the portal calls the app's `generatePathFromContext` to build the next pathname  
**And** the URL reflects the custom path shape produced by the app — e.g. `/apps/my-app/route-a/ctx-xyz`  
**And** there is no `$ctx` query parameter — the version gate forces path-only, custom hooks are honored within that constraint

Confirmed: ✅
---

## 5. Context cleared — modern app, query strategy

**Given** a modern app (v8+) that called `setRoutingStrategy('query')`  
**And** the portal URL is `/apps/my-app?$ctx=ctx-abc`  
**When** the user clears context  
**Then** the URL becomes `/apps/my-app`  
**And** `$ctx` is removed  
**And** the user stays on the app — **not redirected to `/`**

Confirmed: ✅

---

## 6. Context cleared — modern app, query strategy, on a sub-route

**Given** a modern app (v8+) that called `setRoutingStrategy('query')`  
**And** the portal URL is `/apps/my-app/some-route?$ctx=ctx-abc`  
**When** the user clears context  
**Then** the URL becomes `/apps/my-app/some-route`  
**And** `$ctx` is removed  
**And** `some-route` is preserved — it is an app sub-route, **not** a context segment

Note: the app itself has to handle navigation if the current route requires context, since portal does not know which routes are valid without context.

Discussion needed: should app configuration declare either
1. explicit non-context routes, or
2. a dedicated clear-context fallback route
so portal/app can navigate safely when context is removed?

Confirmed: ❎
---

## 7. Context cleared — modern app, path strategy

**Given** a modern app (v8+) that called `setRoutingStrategy('path')`  
**And** the portal URL is `/apps/my-app/ctx-abc`  
**When** the user clears context  
**Then** the URL becomes `/apps/my-app`  
**And** the context path segment is removed  
**And** the user stays on the app

Confirmed: ✅

---

## 8. Context cleared — legacy app

**Given** a legacy app (version < 8.0.0, no `routingStrategy` set)  
**And** the portal URL is `/apps/my-app/ctx-abc`  
**When** the user clears context  
**Then** the URL becomes `/apps/my-app`  
**And** the user stays on the app

Confirmed: ✅

Note: this has been the historical behavior for legacy apps, and we want to preserve it even though the URL shape is the same as the path strategy. The version gate ensures that legacy apps get path-only behavior without needing to check `routingStrategy`.
---

## 9. URL has path-embedded context when query strategy is active

**Given** a modern app (v8+) that called `setRoutingStrategy('query')`  
**And** somehow the portal URL is `/apps/my-app/ctx-abc`  
  (e.g. navigated here from a legacy path URL before the app loaded)  
**When** the context-change subscription fires for `ctx-abc`  
**Then** the URL is normalized to `/apps/my-app?$ctx=ctx-abc`  
**And** the path segment is stripped  
**And** `$ctx` is written

Confirmed: ✅

---

## 10. App switch — from query app to legacy app (carry-over)

**Given** the portal has context `ctx-abc` active  
**And** the user was on a modern app with query strategy at `/apps/new-app?$ctx=ctx-abc`  
**When** the user navigates to `/apps/legacy-app` (a legacy app, version < 8, no `routingStrategy`)  
**Then** the portal carry-over writes the URL as `/apps/legacy-app/ctx-abc`  
**And** `$ctx` is **not** added to the search string  
**And** path-only behavior is used because version gate applies before `routingStrategy` is read

Confirmed: ✅
---

## 11. App switch — from legacy app to query app (carry-over)

**Given** the portal has context `ctx-abc` active  
**And** the user was on a legacy app at `/apps/old-app/ctx-abc`  
**When** the user navigates to `/apps/new-app` (a modern app that called `setRoutingStrategy('query')`)  
**Then** the portal carry-over writes the URL as `/apps/new-app?$ctx=ctx-abc`  
**And** there is no context segment in the pathname

Confirmed: ✅
---

## 11b. App switch — from modern path app to modern query app (carry-over)

**Given** the portal has context `ctx-abc` active  
**And** the user was on a modern app with path strategy at `/apps/path-app/ctx-abc`  
**When** the user navigates to `/apps/query-app` (a modern app that called `setRoutingStrategy('query')`)  
**Then** the portal carry-over writes the URL as `/apps/query-app?$ctx=ctx-abc`  
**And** there is no context segment in the pathname  
**And** the path-embedded context from the previous app is not carried to the new pathname

Confirmed: ✅
---

## 11c. App switch — from modern query app to modern path app (carry-over)

**Given** the portal has context `ctx-abc` active  
**And** the user was on a modern app with query strategy at `/apps/query-app?$ctx=ctx-abc`  
**When** the user navigates to `/apps/path-app` (a modern app that called `setRoutingStrategy('path')`)  
**Then** the portal carry-over writes the URL as `/apps/path-app/ctx-abc`  
**And** there is no `$ctx` in the search string  
**And** the query-embedded context from the previous app is not leaked to the new search string

Confirmed: ✅

---

## 12. App switch — carry-over deferred when app not yet initialized

**Given** the portal has context `ctx-abc` active  
**And** the user navigates to `/apps/new-app`  
**And** the app module has not yet provided instance modules  
**Then** the carry-over subscription does **nothing** yet  
**And** once the app initializes and the context stream emits, subscription 1 writes the correct URL

Confirmed: ✅
---

## 13. App switch — app key mismatch, navigation event races ahead of app module

**Given** the portal URL becomes `/apps/new-app`  
**And** `appModule.current.appKey` still reflects the previous app  
**Then** the carry-over subscription does **nothing**  
**And** it only acts once the app module has caught up to `new-app`

Confirmed: ✅
---

## 14. Custom strategy — portal never rewrites the URL

**Given** a modern app (v8+) with `routingStrategy: 'custom'`  
**When** the context changes or the user navigates  
**Then** the portal context does **not** modify the pathname or add `$ctx`  
**And** the app context handler is responsible for parsing the URL and performing any navigation needed based on the new context
**And** the app is solely responsible for its own URL shape

Confirmed: ✅

Note: `context cleared` in custom strategy is also app-owned. The portal must not try to guess a fallback route (root, app root, or sub-route). The app decides what URL to navigate to when context is removed.

---

## 14b. Custom strategy — context cleared is app-owned

**Given** a modern app (v8+) with `routingStrategy: 'custom'`  
**And** the current URL is whatever shape the app uses for custom context routing  
**When** the user clears context  
**Then** the portal does not rewrite the URL based on path/query assumptions  
**And** the app decides the resulting route and performs any navigation needed

---

## 15. Context not yet initialized — no premature URL update

**Given** a newly loaded app  
**And** the portal context stream emits `undefined` (initializing state)  
**Then** no URL update occurs  
**And** the subscription waits for the first `null` or `ContextItem` emission

Confirmed: ✅

---

## 16. Identical context re-emitted — no redundant navigation

**Given** the portal URL already reflects context `ctx-abc`  
**When** the context stream emits `ctx-abc` again (same id)  
**Then** no URL update or history entry is created

Confirmed: ✅

---

## Notes for test implementation

- **Do not** test internal functions directly. Drive each case through the exported
  `configureAppContextNavigation(modules)` entry point using mock module instances.
- **Observe** what `portalNavigation.replace(...)` was called with — that is the assertion target.
- **Cover** both subscription paths: context-change stream (subscription 1) and navigation
  state events (subscription 2 / carry-over).
- **Use** a mock `IContextProvider` that can return arbitrary `version`, `routingStrategy`,
  `currentContext`, and `extractContextIdFromPath`.

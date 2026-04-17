# @equinor/fusion-framework-module-context-navigation

Framework module for synchronizing context state with the browser URL. Keeps the active context identifier in the URL as users select contexts, switch apps, or navigate — and resolves context back from URLs on page load and deep links.

## When to use

Use this module in a **portal** (not in individual apps) when you need to:

- keep the URL updated as the active context changes
- carry over the active context when switching between apps
- guard against accidental context loss during in-app navigation
- support both query-parameter (`?$contextId=...`) and path-segment (`/apps/:appKey/:contextId`) URL conventions
- respect per-app routing strategy declarations (`query`, `path`, or `custom`)

Individual apps declare their preferred routing strategy via `@equinor/fusion-framework-module-context`. This module reads that declaration and applies the correct URL strategy at the portal level.

## Key concepts

| Concept | Description |
|---|---|
| **Routing strategy** | Per-app declaration (`query` / `path` / `custom`) that controls where the context id lives in the URL. Declared via `builder.setRoutingStrategy()` in the app's context module config. |
| **Strategy adapter** | Pluggable adapter that translates a context change into a URL navigation instruction for a given routing strategy. |
| **Navigation orchestrator** | Resolves the active routing strategy from the loaded app's context module and dispatches navigation through the correct adapter. |
| **App-switch carry-over** | Automatically appends the current context id when the user navigates to a new app route, so context survives app transitions. |
| **URL guard** | Watches for URL changes that accidentally drop the context parameter and silently re-applies it via `history.replace`. |
| **Source factory** | Composable RxJS factory that builds the primary observable driving context-to-URL sync. Default: `createAppFirstSource` (app × context). |

## Quick start

Enable the module in your portal's framework configuration:

```ts
import { enableContextNavigation } from '@equinor/fusion-framework-module-context-navigation';

export const configure = (configurator) => {
  // ... other modules (app, context, navigation, etc.)

  enableContextNavigation(configurator, (builder) => {
    builder.setConsoleDebug(true);       // verbose logging in dev
    builder.enableTelemetry(true);       // track navigation events
    builder.setWarnOnCustomStrategy(true); // warn when apps use custom strategy
  });
};
```

That's it. The module subscribes to app and context changes automatically and keeps the URL in sync.

## How it works

The module runs three internal subscriptions:

### Subscription 1 — Context change → URL update

When the active context changes (user selects a new context, or context is cleared), the module:

1. Reads the loaded app's routing strategy from its context module configuration.
2. Passes the context change to the matching **strategy adapter** (query, path, or custom).
3. The adapter produces a **navigation instruction** (pathname + search updates).
4. The module executes the navigation via the framework navigation module.

### Subscription 2 — App switch carry-over

When the user navigates to a different app (URL changes to `/apps/:newAppKey`), the module checks whether the new route is missing the current context id. If so, it appends it using the new app's preferred strategy.

### Subscription 3 — URL guard

Watches portal URL changes and re-applies the active context id whenever it goes missing — for example, when an app accidentally navigates without preserving the context parameter. Uses `replace` so it stays invisible in browser history.

## Configuration

All configuration is optional. The module works out of the box with sensible defaults.

| Option | Type | Default | Description |
|---|---|---|---|
| `portalName` | `string` | `'Portal'` | Human-readable name used in log output. |
| `sourceFactory` | `SourceFactory` | `createAppFirstSource()` | RxJS factory driving subscription 1. Override with `createContextFirstSource()` for context-portal setups. |
| `enableAppSwitchCarryOver` | `boolean` | `true` | Whether to auto-inject context on app switch. |
| `warnOnCustomStrategy` | `boolean` | `false` | Emit `console.warn` when a loaded app uses custom strategy. |
| `consoleDebug` | `boolean` | `false` | Verbose `console.debug` output. |
| `enableTelemetry` | `boolean` | `false` | Track navigation events via the telemetry module. |
| `enableContextUrlGuard` | `boolean` | `true` | Re-apply context id when accidentally dropped from URL. |
| `onCustomStrategyDetected` | `callback` | — | Custom handler when an app declares custom routing strategy. |
| `nullContextHandler` | `callback` | — | Override navigation behavior when context is cleared. |

### Configuration examples

#### Minimal setup

```ts
enableContextNavigation(configurator);
```

#### Full configuration

```ts
enableContextNavigation(configurator, (builder) => {
  builder.setPortalName('my-portal');
  builder.setConsoleDebug(true);
  builder.enableTelemetry(true);
  builder.setWarnOnCustomStrategy(true);
  builder.enableAppSwitchCarryOver(true);
  builder.enableContextUrlGuard(true);
  builder.setOnCustomStrategyDetected((appKey, mode) => {
    console.warn(`App [${appKey}] uses custom strategy (mode: ${mode})`);
  });
  builder.setNullContextHandler(({ appKey }) => ({
    pathname: `/apps/${appKey}/`,
  }));
});
```

#### Context-portal setup

For portals where context selection drives app loading (rather than the other way around):

```ts
import { createContextFirstSource } from '@equinor/fusion-framework-module-context-navigation/sources';

enableContextNavigation(configurator, (builder) => {
  builder.setSourceFactory(createContextFirstSource());
  builder.enableAppSwitchCarryOver(false); // context drives navigation
});
```

## Routing strategies

Apps declare their strategy in their context module configuration:

```ts
// In app config
enableContext(configurator, (builder) => {
  builder.setRoutingStrategy('query'); // recommended
  builder.setContextType(['projectMaster']);
});
```

### Query strategy (recommended)

Context id lives in the URL query string as `$contextId`:

```
/apps/my-app/?$contextId=abc-123
/apps/my-app/some/route?$contextId=abc-123
```

- Preserves app-owned path structure
- Context parameter survives in-app navigation naturally
- Works with any router setup

### Path strategy (legacy)

Context id is a path segment after the app key:

```
/apps/my-app/abc-123
/apps/my-app/abc-123/some/route
```

- Existing convention in many Fusion apps
- App routes must account for the context segment

### Custom strategy

App fully owns its URL shape. The portal does not modify the URL for context changes — the app handles it via its own `extractContextIdFromPath` and `generatePathFromContext` hooks.

## Strategy adapters

Each routing strategy has a corresponding adapter:

| Strategy | Adapter | Behavior |
|---|---|---|
| `query` | `QueryStrategyAdapter` | Sets/reads `$contextId` query parameter. |
| `path` | `PathStrategyAdapter` | Injects context id as 3rd path segment. |
| `path` (legacy) | `LegacyPathAdapter` | Same as path but handles apps without explicit strategy declaration. |
| `custom` | `CustomAdapter` | Delegates to app-provided hooks; portal skips URL modification. |

## Telemetry events

When telemetry is enabled, the module tracks:

| Event | Properties |
|---|---|
| `context-navigation.context-change` | `strategy`, `mode`, `appKey`, `executorType` |
| `context-navigation.app-switch` | `appKey`, `contextId`, `carryOverResult` |
| `context-navigation.custom-detected` | `appKey` |

## Module dependencies

This module requires the following peer modules to be enabled:

- `@equinor/fusion-framework-module-app` — app lifecycle and manifest
- `@equinor/fusion-framework-module-context` — context state
- `@equinor/fusion-framework-module-navigation` — URL navigation
- `@equinor/fusion-framework-module-telemetry` (optional) — event tracking

## Exports

### Main entry (`@equinor/fusion-framework-module-context-navigation`)

- `enableContextNavigation` — registration helper
- `module` / `moduleKey` — module definition
- `ContextNavigationProvider` — runtime provider
- `ContextNavigationConfigurator` — configuration builder
- `contextNavigationOrchestrator` — orchestration logic
- `resolveNavigationExecutor` — executor resolution
- `getContextNavigationStrategyAdapter` — adapter registry lookup

### Sources (`@equinor/fusion-framework-module-context-navigation/sources`)

- `createAppFirstSource` — default source: app.current$ × context$
- `createContextFirstSource` — inverted source: context$ × app.current$

### Utils (`@equinor/fusion-framework-module-context-navigation/utils`)

- `buildContextUrlForStrategy` — URL builder for a given strategy
- `resolveContextIdFromUrl` — extract context id from URL (query-first)
- `extractContextIdFromPath` — extract context id from path segment
- `extractContextIdFromQuery` — extract context id from query string
- `isContextInUrl` — check whether URL contains a context id
- `buildAppRouteMatcher` — create URLPattern matcher for app routes

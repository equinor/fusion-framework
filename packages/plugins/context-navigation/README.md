# Context Navigation Plugin (`@equinor/fusion-framework-plugin-context-navigation`)

Event-driven context-to-URL reconciler plugin for Fusion Framework portals. It keeps the active context synchronized with the browser URL by reacting to context changes and app switches, encoding context into the URL, and optionally guarding against manual URL edits that drop context.

## When to Use

Use this plugin when your **portal** needs to:

- Reflect the active context (project, facility, etc.) in the browser URL automatically
- Support multiple URL encoding strategies (path segment, query parameter, or app-defined custom encoding)
- Preserve context across app switches and page reloads
- Prevent users from accidentally losing context by editing the URL manually

> [!NOTE]
> This plugin is intended for **portal hosts**, not individual applications.
> Applications declare their preferred routing strategy via the app manifest's
> `build.options.contextRouting` field — the portal's context-navigation plugin
> picks up that declaration and applies the correct URL encoding automatically.

## Key Concepts

| Concept | Description |
|---|---|
| **Adapter** | A self-selecting URL encoder/decoder. Each adapter declares `canHandle()` and provides `encode()` / `decode()` methods. |
| **Reconciler** | The reactive loop that watches context + app changes and triggers navigation when the URL is out of sync. |
| **URL Guard** | An optional secondary subscription that re-applies context encoding if an external navigation drops the context from the URL. |
| **Source** | The observable factory that drives the reconciler — determines whether app switches or context changes take priority. |

### How It Works

1. **Observe** — The reconciler watches the current app and current context via a configurable source factory.
2. **Resolve adapter** — For each app, the first adapter whose `canHandle()` returns `true` is selected.
3. **Encode** — The selected adapter encodes the context into a target URL.
4. **Compare** — If the target URL differs from the current URL, navigation proceeds.
5. **Dispatch** — A cancelable `onContextNavigationNavigate` event fires. Listeners can call `preventDefault()` to abort.
6. **Navigate** — The framework navigation module performs the URL update.
7. **Confirm** — An `onContextNavigationNavigated` event fires after navigation completes.

## Installation

```sh
pnpm add @equinor/fusion-framework-plugin-context-navigation
```

## Quick Start

### App-portal (app switches lead)

An app-portal shows one app at a time. When the user switches apps, the reconciler
picks up the new app's context and encodes it into the URL. This is the default behavior.

```ts
import { enableContextNavigation } from '@equinor/fusion-framework-plugin-context-navigation';

export const configure = (configurator) => {
  enableContextNavigation(configurator, (builder) => {
    builder.setPortalName('app-portal');
    builder.setDebug(true);
  });
};
```

The default source factory (`createAppFirstSource`) watches `app.current$` and
resolves the app's context modules before emitting to the reconciler. When an app
switch happens, the new app's active context drives the URL update.

### Context-portal (context changes lead)

A context-portal is organized around a shared context (e.g. a project). When the
user selects a context, navigation updates the URL immediately — regardless of
which app is active. Clearing context navigates back to the portal root.

```ts
import { enableContextNavigation } from '@equinor/fusion-framework-plugin-context-navigation';
import { createContextFirstSource } from '@equinor/fusion-framework-plugin-context-navigation/sources';

export const configure = (configurator) => {
  enableContextNavigation(configurator, (builder) => {
    builder.setPortalName('context-portal');
    builder.setSourceFactory(createContextFirstSource());
    builder.setNullContextUrl('/');
    builder.setDebug(true);
  });
};
```

Key differences from app-portal:
- **`createContextFirstSource()`** — context changes are the primary trigger; app modules are resolved as a dependency.
- **`setNullContextUrl('/')`** — when context is cleared, navigate to the portal landing page instead of delegating to the adapter.

## Built-in Adapters

The plugin ships with three adapters evaluated in priority order:

| Adapter | URL Shape | When Selected |
|---|---|---|
| **custom** | App-defined (via `generatePathFromContext` / `extractContextIdFromPath` hooks) | App provides `generatePathFromContext` and/or `extractContextIdFromPath` hooks on its context provider |
| **query** | `?$contextId={id}` | App manifest declares `build.options.contextRouting: 'query'` |
| **path** | `/apps/{appKey}/{contextId}/sub-route` | Default fallback — context as 3rd path segment |

When no custom adapters are registered, all three built-in adapters are available. The first whose `canHandle()` returns `true` for the current app wins.

### Registering a Custom Adapter

```ts
import type { ContextNavigationAdapter } from '@equinor/fusion-framework-plugin-context-navigation/adapters';

const hashAdapter: ContextNavigationAdapter = {
  id: 'hash',
  canHandle: ({ routingStrategy }) => routingStrategy === 'hash',
  encode: ({ context, currentURL }) => {
    const url = new URL(currentURL.href);
    url.hash = context ? `#ctx=${context.id}` : '';
    return url;
  },
  decode: (url) => {
    const match = url.hash.match(/^#ctx=(.+)$/);
    return match?.[1] ?? null;
  },
};

enableContextNavigation(configurator, (builder) => {
  builder.registerAdapter(hashAdapter);
  // NOTE: registering any adapter disables built-in defaults.
  // Register all adapters you need explicitly.
});
```

## Configuration

| Builder Method | Default | Description |
|---|---|---|
| `registerAdapter(adapter)` | Built-in set | Register a navigation adapter (object or factory). First match wins. |
| `setPortalName(name)` | `'Portal'` | Name used in debug log output. |
| `setOrigin(origin)` | `window.location.origin` | Origin for constructing absolute URLs. |
| `setUrlGuard(enabled)` | `true` | Re-sync context if an external navigation drops it from the URL. With `replace: false`, back/forward navigations update context from the URL instead of overwriting it. |
| `setDebug(enabled)` | `false` | Enable verbose `console.debug` output. |
| `setNullContextUrl(urlOrFn)` | — | Function (or static string) that returns the URL to navigate to when context is cleared. Receives `{ appKey, currentURL }`. |
| `setNavigationOptions(options)` | `{ replace: true }` | Options passed to `navigation.navigate()` during URL updates. Set `{ replace: false }` to push history entries — back/forward will then sync context from the URL rather than re-asserting the active context. |
| `setOnTransition(fn)` | — | Side-effect hook called after each successful navigation. |
| `setSourceFactory(factory)` | `createAppFirstSource()` | Observable source factory that drives the reconciler. |

## Events

The plugin dispatches events through the Fusion Framework event system. Subscribe via `framework.event.addEventListener()`.

| Event | When | Cancelable |
|---|---|---|
| `onContextNavigationNavigate` | Before navigation — adapter resolved, target URL computed | **Yes** |
| `onContextNavigationNavigated` | After navigation completes | No |
| `onContextNavigationAdapterResolved` | When an adapter is selected for an app | No |
| `onContextNavigationSkipped` | When reconciliation decides NOT to navigate | No |

### Skip Reasons

The `onContextNavigationSkipped` event includes a `reason` field:

| Reason | Meaning |
|---|---|
| `'url-matches'` | Target URL already matches the current URL |
| `'no-context'` | Context is `undefined` (still initializing) |
| `'no-adapter'` | No adapter could handle the current app |
| `'encode-returned-null'` | Adapter's `encode()` returned `null` |
| `'canceled'` | A listener called `preventDefault()` on the navigate event |

### Intercepting Navigation

```ts
framework.event.addEventListener('onContextNavigationNavigate', (event) => {
  console.log('About to navigate:', event.detail.targetURL.pathname);

  // Cancel navigation conditionally
  if (shouldBlock(event.detail)) {
    event.preventDefault();
  }
});
```

## Adapter Interface

```ts
interface ContextNavigationAdapter {
  /** Unique identifier for logging and diagnostics. */
  id: string;
  /** Return `true` if this adapter handles the given app/URL combination. */
  canHandle(ctx: AdapterResolutionContext): boolean;
  /** Encode context into a URL. Return `null` to skip navigation. */
  encode(args: { context: ContextItem | null; currentURL: URL }): URL | null;
  /** Decode a context ID from a URL. Return `null` if not present. */
  decode(url: URL): string | null;
}

interface AdapterResolutionContext {
  appKey: string;
  appContext: IContextProvider;
  routingStrategy?: 'path' | 'query' | null;
  currentURL: URL;
}
```

## Exports

| Specifier | Description |
|---|---|
| `@equinor/fusion-framework-plugin-context-navigation` | Plugin runtime, configurator, enable helper, types, events |
| `@equinor/fusion-framework-plugin-context-navigation/adapters` | Built-in adapter factories (`createPathAdapter`, `createQueryAdapter`, `createCustomAdapter`) |
| `@equinor/fusion-framework-plugin-context-navigation/sources` | Source factories (`createAppFirstSource`, `createContextFirstSource`) and reconciler types |
| `@equinor/fusion-framework-plugin-context-navigation/utils` | URL utility functions |

## Peer Dependencies

| Package | Purpose |
|---|---|
| `@equinor/fusion-framework-module` | Base module contract |
| `@equinor/fusion-framework-module-app` | App switching and instance loading |
| `@equinor/fusion-framework-module-context` | Context state management |
| `@equinor/fusion-framework-module-navigation` | URL navigation |
| `@equinor/fusion-framework-module-event` | Event dispatch |
| `rxjs` | Reactive streams |

## See Also

- [`@equinor/fusion-framework-module-context`](../../modules/context/) — context module for query, validation, and resolution
- [`@equinor/fusion-framework-module-app`](../../modules/app/) — app module defining `FrameworkOptions.contextRouting` in build manifest

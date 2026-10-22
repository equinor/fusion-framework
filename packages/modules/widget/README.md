# @equinor/fusion-framework-module-widget

Fusion Framework module for loading, managing, and rendering **widgets** — self-contained UI micro-frontends that can be dynamically fetched, configured, and mounted into a host application.

## When to use this module

Use this module when your application needs to:

- Load remote widget manifests and scripts at runtime
- Render isolated micro-frontend widgets inside a host app
- Manage widget lifecycle (initialize → load manifest → import script → render → dispose)
- React to widget lifecycle events via the Fusion event system

## Installation

```sh
pnpm add @equinor/fusion-framework-module-widget
```

### Peer dependencies

The module requires these Fusion Framework modules as peer dependencies:

| Package | Required |
|---|---|
| `@equinor/fusion-framework-module` | **yes** |
| `@equinor/fusion-framework-module-event` | optional |
| `@equinor/fusion-framework-module-http` | optional |
| `@equinor/fusion-framework-module-service-discovery` | optional |

## Key concepts

### Widget lifecycle

A widget moves through the following states:

1. **Create** — `getWidget(name)` creates a `Widget` instance with initial state
2. **Load manifest** — fetches the widget manifest (name, version, entry point, asset path)
3. **Import script** — dynamically imports the widget's JavaScript entry point
4. **Initialize** — combines manifest + script (+ optional config) and emits the result
5. **Render** — the imported script module exposes render functions (`renderWidget`, `render`, etc.)
6. **Dispose** — cleans up subscriptions and resources

### Architecture

```
enableWidgetModule()
  └─► WidgetModuleConfigurator   (configure HTTP client, endpoints)
        └─► WidgetModuleProvider (create and manage Widget instances)
              └─► Widget         (manifest, script, config, state machine)
                    └─► state/   (actions, reducer, flows — RxJS-based)
```

- **`WidgetModuleConfigurator`** — configures the HTTP client used to fetch widget manifests and configs from the backend API
- **`WidgetModuleProvider`** — implements `IWidgetModuleProvider` and serves as the entry point for creating `Widget` instances
- **`Widget`** — manages a single widget's full lifecycle using an RxJS-based state machine (`FlowSubject`)

## Quick start

### Enable the module

```typescript
import { enableWidgetModule } from '@equinor/fusion-framework-module-widget';

// In your framework configuration callback:
enableWidgetModule(configurator);
```

### Customize the HTTP client

```typescript
enableWidgetModule(configurator, (widgetConfigurator) => {
  widgetConfigurator.setClient(async (client) => {
    // Return a custom IClient implementation
    return myCustomClient;
  });
});
```

### Retrieve and initialize a widget

```typescript
const provider = modules.widget; // IWidgetModuleProvider

// Create a widget instance
const widget = provider.getWidget('my-widget');

// Initialize: loads manifest, imports script, prepares config
widget.initialize().subscribe({
  next: ({ manifest, script, config }) => {
    // Mount the widget into a DOM element
    const cleanup = script.renderWidget(hostElement, { fusion, env: { manifest } });
  },
  error: (err) => console.error('Widget initialization failed', err),
  complete: () => console.log('Widget ready'),
});
```

### Observe manifest or config individually

```typescript
// Stream the manifest
provider.getWidgetManifest('my-widget').subscribe((manifest) => {
  console.log('Manifest:', manifest);
});

// Stream the config
provider.getWidgetConfig('my-widget').subscribe((config) => {
  console.log('Config:', config);
});
```

## Exported entry points

| Export path | Description |
|---|---|
| `@equinor/fusion-framework-module-widget` | Main entry — module definition, configurator, provider, types, and `enableWidgetModule` |
| `@equinor/fusion-framework-module-widget/errors.js` | Error classes: `WidgetManifestLoadError`, `WidgetConfigLoadError`, `WidgetScriptModuleError` |

## Events

When the optional `@equinor/fusion-framework-module-event` peer dependency is available, the module dispatches lifecycle events on the framework event bus:

| Event | Fired when |
|---|---|
| `onWidgetManifestLoad` | Manifest fetch starts |
| `onWidgetManifestLoaded` | Manifest fetch succeeds |
| `onWidgetManifestFailure` | Manifest fetch fails |
| `onWidgetScriptLoad` | Script import starts |
| `onWidgetScriptLoaded` | Script import succeeds |
| `onWidgetScriptFailure` | Script import fails |
| `onWidgetInitialize` | Widget initialization starts |
| `onWidgetInitialized` | Widget initialization completes |
| `onWidgetInitializeFailure` | Widget initialization fails |
| `onWidgetDispose` | Widget is disposed |

## Error handling

The module provides typed error classes for HTTP-level failures:

- **`WidgetManifestLoadError`** — manifest fetch failed (maps 401 → `unauthorized`, 404 → `not_found`)
- **`WidgetConfigLoadError`** — config fetch failed (same HTTP status mapping)
- **`WidgetScriptModuleError`** — script import failed

Each error carries a `type` discriminator (`'not_found' | 'unauthorized' | 'unknown'`) for programmatic branching.

## API reference

### `enableWidgetModule(configurator, builder?)`

Registers the widget module on a framework configurator. Accepts an optional builder callback to customize the `WidgetModuleConfigurator`.

### `WidgetModuleProvider` / `IWidgetModuleProvider`

- `getWidget(name, args?)` — creates a `Widget` instance
- `getWidgetManifest(name, args?)` — returns `Observable<WidgetManifest>`
- `getWidgetConfig(name, args?)` — returns `Observable<WidgetConfig>`
- `dispose()` — cleans up all query subscriptions

### `Widget`

- `state` — current `WidgetState` snapshot
- `initialize()` — returns `Observable<{ manifest, script, config }>`
- `getManifest(force?)` — returns `Observable<WidgetManifest>`
- `getConfig(force?)` — returns `Observable<WidgetConfig>`
- `getWidgetModule(force?)` — returns `Observable<WidgetScriptModule>`
- `getWidgetModuleAsync(allowCache?)` — returns `Promise<WidgetScriptModule>`
- `loadManifest(update?)` — dispatches manifest fetch action
- `loadConfig(update?)` — dispatches config fetch action
- `updateManifest(manifest, replace?)` — sets manifest in state
- `dispose()` — unsubscribes all internal subscriptions

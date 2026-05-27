# Plugins - @equinor/fusion-framework-module

Configurator plugins are application-level side effects that run after all modules are initialized and before `ModulesConfigurator.initialize()` resolves. Use plugins when wiring needs the complete `ModulesInstance`, such as telemetry bridges, global browser listeners, feature instrumentation, or subscriptions that connect multiple providers.

Plugins are registered with `IModulesConfigurator.registerPlugin`. A plugin receives `FrameworkPluginArgs` with the initialized module map and optional `ref` object. It can return `undefined` when no cleanup is needed, or a `FrameworkPluginTeardown` callback/object that runs during `configurator.dispose()`.

## When to use plugins

Use a plugin when the work is owned by the application or framework host rather than by one module provider.

| Need | Prefer |
|---|---|
| A module must finish its own setup after all providers exist | `module.postInitialize` |
| A consumer wants to inspect the finished module instance once | `onInitialized` |
| The host app needs long-lived side effects connected to initialized providers | `registerPlugin` |
| A provider owns subscriptions or sockets internally | `BaseModuleProvider.subscription` and provider `dispose` |

The plugin phase runs after `postInitialize`, `afterInit`, and `onInitialized` callbacks have settled. `initialize()` does not resolve until plugin registration completes, so render-time consumers receive a module instance whose host-level side effects are already connected.

## Register a named plugin

Use `createPlugin(name, callback)` from `@equinor/fusion-framework-module/plugins` when you want lifecycle events to show a stable plugin name. The callback receives the module map directly.

```typescript
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import { createPlugin } from '@equinor/fusion-framework-module/plugins';

const configurator = new ModulesConfigurator([eventModule, telemetryModule]);

const contextTelemetryPlugin = createPlugin<[typeof eventModule, typeof telemetryModule]>(
  'contextTelemetry',
  (modules) => {
    const teardown = modules.event.addEventListener('context:changed', (event) => {
      modules.telemetry.track('context.changed', event.detail);
    });

    return teardown;
  },
);

configurator.registerPlugin(contextTelemetryPlugin);
```

The `name` passed to `createPlugin` is used in plugin lifecycle events such as `ModuleConfigurator.plugin.registered`. `createPlugin` throws when the name is empty or whitespace, which helps keep diagnostics readable.

## Register an inline plugin

Inline callbacks are useful for small one-off integrations. They receive the lower-level `FrameworkPluginArgs` object.

```typescript
import type { FrameworkPluginArgs, FrameworkPluginRegistration } from '@equinor/fusion-framework-module/plugins';

function connectResizeTelemetry({
  modules,
}: FrameworkPluginArgs<[typeof telemetryModule]>): FrameworkPluginRegistration {
  const handleResize = (): void => {
    modules.telemetry.track('window.resized', {
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  window.addEventListener('resize', handleResize);

  return () => window.removeEventListener('resize', handleResize);
}

configurator.registerPlugin(connectResizeTelemetry);
```

Return a teardown whenever the plugin creates subscriptions, event listeners, timers, or other long-lived resources. Teardowns may be functions or objects with a `dispose()` method, and they may complete synchronously or return a promise.

## Failure and teardown behavior

Plugin registration is isolated. If one plugin throws or rejects, `ModulesConfigurator` emits a warning event named `ModuleConfigurator.plugin.registerError` and continues running the remaining plugins. The failed plugin does not block `initialize()` unless your surrounding code chooses to react to that warning.

During `configurator.dispose(instance, ref?)`, plugin teardowns run before module `dispose` hooks. Teardown failures are reported as warning events and do not prevent other plugin teardowns or module disposal from running. After teardown, the internal teardown registry is cleared so repeated dispose calls do not run the same plugin cleanup twice.

## Plugin API reference

| Export | Package entrypoint | Purpose |
|---|---|---|
| `FrameworkPluginArgs` | `@equinor/fusion-framework-module/plugins` | Arguments passed to inline plugin callbacks: `{ modules, ref }` |
| `FrameworkPluginCallback` | `@equinor/fusion-framework-module/plugins` | Callback type accepted by `IModulesConfigurator.registerPlugin` |
| `FrameworkPluginTeardown` | `@equinor/fusion-framework-module/plugins` | Cleanup callback or disposable object returned by a plugin |
| `FrameworkPluginRegistration` | `@equinor/fusion-framework-module/plugins` | Plugin return type: teardown or `undefined` |
| `FrameworkPlugin` | `@equinor/fusion-framework-module/plugins` | Named plugin callback returned by `createPlugin` |
| `FrameworkPluginInitializer` | `@equinor/fusion-framework-module/plugins` | Developer-facing callback signature used by `createPlugin` |
| `createPlugin` | `@equinor/fusion-framework-module/plugins` | Creates a named plugin callback for stable diagnostics |

The same plugin types and `createPlugin` helper are also available from the `@equinor/fusion-framework-module/configurator` secondary entrypoint for consumers that already import configurator APIs there.

## Next Steps

- [Lifecycle](./lifecycle.md) - see where the plugin phase runs in the configure -> initialize -> dispose pipeline
- [Events](./events.md) - observe plugin registration and teardown events through `event$`
- [Authoring Modules](./authoring-modules.md) - decide whether setup belongs in a module hook or in a host-level plugin
---
"@equinor/fusion-framework-module": minor
"@equinor/fusion-framework-react-module": patch
---

Add `registerPlugin` to `IModulesConfigurator` and `ModulesConfigurator` for application-level side effects that run after modules are initialized and before application render.

Plugins receive the initialized module map through `FrameworkPluginArgs` and may return a teardown callback that runs during `dispose`. Plugin-related types and the `createPlugin(name, callback)` helper are available from the dedicated `@equinor/fusion-framework-module/plugins` entrypoint. Plugin registration and teardown failures are isolated so one failing plugin does not block other plugins or module disposal. `ModuleConfiguratorEventName` and `ModuleConfiguratorEventBaseName` are available from the `@equinor/fusion-framework-module/configurator` entrypoint for filtering `ModuleConfigurator.{name}.{state}` lifecycle events without hard-coded strings.

```typescript
import { createPlugin } from '@equinor/fusion-framework-module/plugins';

const contextTelemetryPlugin = createPlugin<[EventModule, TelemetryModule]>(
	'contextTelemetry',
	(modules) => modules.event.addEventListener('context:changed', (event) => {
		modules.telemetry.track('context.changed', event.detail);
	}),
);

configurator.registerPlugin(contextTelemetryPlugin);
```

Align `createModuleProvider` configurator typing with the module configurator reference type so React module package builds against the new plugin callback contract.

Fixes: https://github.com/equinor/fusion-core-tasks/issues/1259
---
"@equinor/fusion-framework-module": patch
---

Internal: split `ModulesConfigurator` monolith into explicit lifecycle phase modules.

`src/configurator.ts` (1 034 lines) is replaced by a thin orchestrator class backed by four focused phase functions under `lib/configurator/phases/`:

- `configure` — module config builder creation and post-configure hooks
- `initialize` — concurrent module initialization and cross-module dependency resolution
- `post-initialize` — `postInitialize` hooks and `onInitialized` callbacks
- `dispose` — ordered teardown with failure isolation

All configurator symbols remain available from the package root and are also exposed through the `@equinor/fusion-framework-module/configurator` secondary entrypoint. No consumer-facing behaviour is altered.

Prerequisite for the plugin registration phase (equinor/fusion-core-tasks#1256).

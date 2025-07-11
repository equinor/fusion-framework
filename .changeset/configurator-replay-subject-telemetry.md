---
"@equinor/fusion-framework-module": minor
---

- Refactored `typesVersions` formatting in `package.json` for clarity.
- Removed unused `config` property from `ConfigBuilderCallbackArgs` type in `BaseConfigBuilder.ts`.
- Changed event property from `events` (Subject) to `event$` (ReplaySubject) in `configurator.ts` for improved event handling and completion on dispose. This change ensures that all subscribers receive the full event history, even if they subscribe after events have been emitted, which is important for module lifecycle tracking and debugging. Additionally, this allows the telemetry module—which is initialized after the configurator is created—to capture all relevant events as telemetry, even those emitted before its initialization.
- Updated `ModuleEventLevel` enum values in `types.ts` to correct order and semantics.

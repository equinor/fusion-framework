---
"@equinor/fusion-framework-module-module": minor

---

feat(module): add event stream to ModulesConfigurator

- Introduced an `events` observable to the `ModulesConfigurator` and `IModulesConfigurator` interface for streaming module lifecycle and diagnostic events.
- Added internal event registration and emission throughout the configuration, initialization, post-configuration, post-initialization, and disposal phases.
- Replaced logger usage with event emission for better observability and integration with external monitoring tools.
- Added new types: `ModuleEvent` and `ModuleEventLevel` to describe event structure and severity.
- This enables consumers to subscribe to module events for debugging, monitoring, or analytics purposes.

---
"@equinor/fusion-framework-module-event": minor
---

Fix EventModuleProvider to extend BaseModuleProvider as required by the module system. This resolves telemetry errors indicating the provider was not properly extending the base class.

Also removed the subscribe method from the IEventModuleProvider interface and implementation, as consumers can use the event$ Observable property for subscription instead.

**Migration:** Replace `modules.event.subscribe(...)` with `modules.event.event$.subscribe(...)`. The `event$` property provides full Observable functionality including `pipe`, `map`, `filter`, and other RxJS operators.

*Note: Using minor version bump since the framework internally does not use subscribe or pipe on the event module.*

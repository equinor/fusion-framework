---
"@equinor/fusion-framework-module": patch
---

Add event system to module configurator for lifecycle tracking.

- Add `ModuleEvent` and `ModuleEventLevel` types for structured event emission
- Enhance module configurator with event emission capabilities
- Support event levels: Error, Warning, Information, Debug
- Include contextual data, error information, and performance metrics in events

resolves: [#3489](https://github.com/equinor/fusion-framework/issues/3489)

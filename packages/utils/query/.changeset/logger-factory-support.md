---
"@equinor/fusion-query": minor
---

This update improves logger flexibility and internal handling in the Query and QueryClient classes. It also includes some bug fixes and type improvements. No breaking changes for most users.

Key changes:
- You can now pass a logger factory function to the Query constructor for per-instance loggers.
- The logger option accepts either an ILogger instance or a function (namespace: string) => ILogger.
- Added a static createDefaultLogger(namespace: string) for consistent logger creation.
- All internal logging is now conditional on logger presence (no more default ConsoleLogger unless you provide it).
- QueryClient also makes logger usage fully optional.
- Improved logger handling and cache mutation logic.

Bug fixes and improvements:
- Fixed cache mutation logic to properly handle the allowCreation option.
- Fixed cancellation logic in QueryClient.
- Improved type safety and documentation for logger usage.

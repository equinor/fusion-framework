---
"@equinor/fusion-query": major
---

Added comprehensive event system for enhanced observability and telemetry integration.

- Introduced base event interfaces and types for query lifecycle tracking
- Added QueryCache events for monitoring cache operations (insertions, mutations, invalidations, etc.)
- Added QueryClient events for tracking job execution stages
- Integrated event emission throughout Query class for complete lifecycle observability
- Exported new event types and interfaces from package index

This enhancement enables proper telemetry logging without flooding console output, addressing the need for structured event monitoring in Fusion Framework applications. Developers can now subscribe to specific event streams for debugging, analytics, and performance monitoring instead of relying on verbose console logging.

Related to: https://github.com/equinor/fusion-framework/issues/3482

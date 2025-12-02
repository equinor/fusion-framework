---
"@equinor/fusion-framework-module-telemetry": minor
---

Export `TelemetryScope` enum from telemetry module.

The `TelemetryScope` enum was previously only available internally but is now exported for use by consumers. This allows applications to properly scope their telemetry items:

```typescript
import { TelemetryScope } from '@equinor/fusion-framework-module-telemetry';

// Use in telemetry items
{
  name: 'my-event',
  scope: TelemetryScope.Application
}
```


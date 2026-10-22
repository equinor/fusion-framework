---
"@equinor/fusion-framework-module-telemetry": minor
---

Export `createOperationalReporter` from `@equinor/fusion-framework-module-telemetry/utils`,
the reporter the built-in HTTP and query integrations use, so modules report safe
operational outcomes without copying their own helper. It resolves the provider lazily,
records one `fusion.<module>.<operation>.duration` metric plus one sanitized failure per
measured report, and isolates delivery failures from business operations.

Notifications accept an optional `level`; it defaults to `Error` for a `failure` outcome and
`Information` otherwise, so a recoverable degradation can be reported as `Warning`. The
provider argument accepts any object with `source`, `track` and `trackEvent`, exported as
`OperationalTelemetryTarget`.

```ts
import { createOperationalReporter } from '@equinor/fusion-framework-module-telemetry/utils';

const report = createOperationalReporter(() => telemetry);
report({ module: 'reports', operation: 'export', outcome: 'success', duration: 12 });
```

Ref: #5804.

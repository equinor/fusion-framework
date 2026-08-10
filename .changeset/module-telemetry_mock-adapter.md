---
"@equinor/fusion-framework-module-telemetry": minor
---

Add `MockTelemetryAdapter` and a `./mock` subpath for asserting on tracked telemetry in tests.

```ts
import { enableTelemetryMock } from '@equinor/fusion-framework-module-telemetry/mock';

let recorder;
enableTelemetryMock(configurator, (builder) => {
  recorder = builder.adapter;
});

// ... exercise the app under test, then assert:
const item = await recorder.waitForItem('button-click');
expect(item.properties?.section).toBe('header');
```

### `getItems(matcher?)`

Returns recorded telemetry items synchronously, filtered by an item name, an array of names, or a predicate. Omit the matcher to get every recorded item.

### `waitForItem(matcher, options?)`

Resolves with the first matching item, resolving immediately if one was already recorded, or waiting for a future one. Supports an optional `timeout` (ms) and `AbortSignal` so a test cannot hang indefinitely, and rejects if the adapter is disposed before a match occurs.

`TelemetryMockConfigurator` and `telemetryMockModule` are exported alongside it, following the same shape as the module's real `TelemetryConfigurator`/`module` pair, so existing `enableTelemetry`-style call sites work unchanged against the mock.

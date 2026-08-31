---
"@equinor/fusion-framework-module-analytics": minor
---

Add `MockAnalyticsAdapter` and `./mock` subpath for asserting on tracked analytics events in tests.

```ts
import { enableAnalytics } from '@equinor/fusion-framework-module-analytics';
import { MockAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/mock';

const recorder = new MockAnalyticsAdapter();

enableAnalytics(configurator, (builder) => {
  builder.setAdapter('mock', async () => recorder);
});

// ... exercise the app under test, then assert:
const event = await recorder.waitForAnalytic('button-click');
expect(event.attributes?.section).toBe('header');
```

### `getAnalytics(matcher?)`

Returns recorded events synchronously, filtered by an event name, an array of names, or a predicate. Omit the matcher to get every recorded event.

### `waitForAnalytic(matcher, options?)`

Resolves with the first matching event, resolving immediately if one was already recorded, or waiting for a future one. Supports an optional `timeout` (ms) and `AbortSignal` so a test cannot hang indefinitely, and rejects if the adapter is disposed before a match occurs.

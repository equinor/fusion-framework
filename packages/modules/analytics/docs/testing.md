# Testing

Use `MockAnalyticsAdapter` from `@equinor/fusion-framework-module-analytics/mock` to assert on tracked analytics events without exporting them to a real backend. Register it like any other adapter via `setAdapter`, then query or await recorded events from your test:

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

// or synchronously inspect everything recorded so far:
expect(recorder.getAnalytics('page-view')).toHaveLength(1);
```

`MockAnalyticsAdapter` is a genuine `IAnalyticsAdapter` implementation — it works the same way through the real `enableAnalytics` configuration pipeline as `ConsoleAnalyticsAdapter` or `FusionAnalyticsAdapter`, so registering it alongside other adapters doesn't change their behavior.

## `getAnalytics(matcher?)`

Returns recorded events synchronously, filtered by an event name, an array of names, or a predicate. Omit the matcher to get every recorded event.

```ts
recorder.getAnalytics(); // every recorded event
recorder.getAnalytics('button-click'); // by name
recorder.getAnalytics(['button-click', 'page-view']); // any of these names
recorder.getAnalytics((event) => event.attributes?.section === 'header'); // predicate
```

## `waitForAnalytic(matcher, options?)`

Resolves with the first matching event — immediately if one was already recorded, or waiting for a future one. Supports an optional `timeout` (ms) and `signal` (`AbortSignal`) so a test can't hang indefinitely, and rejects if the adapter is disposed before a match occurs.

```ts
// Rejects after 1000ms if the event never fires
const event = await recorder.waitForAnalytic('button-click', { timeout: 1000 });

// Rejects immediately when the signal aborts
const controller = new AbortController();
const event = await recorder.waitForAnalytic('button-click', { signal: controller.signal });
```

## Using a bespoke `ModulesConfigurator`

`MockAnalyticsAdapter` works the same way with a manually composed set of modules — no app or portal host required:

```ts
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import { enableAnalytics } from '@equinor/fusion-framework-module-analytics';
import { MockAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/mock';

const recorder = new MockAnalyticsAdapter();
const configurator = new ModulesConfigurator([]);

enableAnalytics(configurator, (builder) => {
  builder.setAdapter('mock', async () => recorder);
});

const { analytics } = await configurator.initialize();
analytics.trackAnalytic({ name: 'button-click', value: 'save' });

expect(recorder.getAnalytics('button-click')).toHaveLength(1);
```

## Disposal

`MockAnalyticsAdapter` completes its internal event stream on `[Symbol.dispose]()`, rejecting any pending `waitForAnalytic` calls instead of leaving them hanging:

```ts
const pending = recorder.waitForAnalytic('button-click');
recorder[Symbol.dispose]();

await expect(pending).rejects.toThrow('disposed before a matching event was recorded');
```

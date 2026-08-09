# Collectors

Collectors implement `IAnalyticsCollector` (or extend `BaseCollector`) and emit
`AnalyticsEvent` objects that are forwarded to all adapters. All collectors
support async initialisation.

## ContextSelectedCollector

Emits an event when the active Fusion context changes. Includes the new context,
the previous context, and the current app key in attributes.

```typescript
builder.setCollector('context-selected', async (args) => {
  const ctx = await args.requireInstance('context');
  const app = await args.requireInstance('app');
  return new ContextSelectedCollector(ctx, app);
});
```

## AppSelectedCollector

Emits an event when the active application changes. Includes the new and
previous app key metadata.

```typescript
builder.setCollector('app-selected', async (args) => {
  const app = await args.requireInstance('app');
  return new AppSelectedCollector(app);
});
```

## AppLoadedCollector

Emits an event when an application's modules finish loading. Includes app
manifest metadata and the current context (if available).

```typescript
builder.setCollector('app-loaded', async (args) => {
  const event = await args.requireInstance('event');
  const app = await args.requireInstance('app');
  return new AppLoadedCollector(event, app);
});
```

## Creating a Custom Collector

### Extending `BaseCollector`

Extend `BaseCollector` with a Zod schema for validation:

```typescript
import { BaseCollector, createSchema } from '@equinor/fusion-framework-module-analytics/collectors';
import { z } from 'zod';
import { of } from 'rxjs';

const schema = createSchema(z.string(), z.object({ page: z.string() }));

class PageViewCollector extends BaseCollector<string, { page: string }> {
  constructor() {
    super('page-view', schema);
  }

  _initialize() {
    return of({ value: window.location.pathname, attributes: { page: document.title } });
  }
}
```

### Implementing `IAnalyticsCollector` directly

For cases that don't need schema validation, implement the `Subscribable` contract directly:

```typescript
import { type AnalyticsEvent, enableAnalytics } from '@equinor/fusion-framework-module-analytics';
import { Subject } from 'rxjs';

const configure = (configurator: IModulesConfigurator<any, any>) => {
  enableAnalytics(configurator, (builder) => {
    builder.setCollector('click-test', async () => {
      const subject = new Subject<AnalyticsEvent>();
      window.addEventListener('click', () => {
        subject.next({ name: 'window-clicker', value: 42 });
      });

      return {
        subscribe: (subscriber) => subject.subscribe(subscriber),
      };
    });
  });
};
```

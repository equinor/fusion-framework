# Events and Observability — @equinor/fusion-framework-module

Every `ModulesConfigurator` emits structured lifecycle events on its `event$` observable. This is the primary hook for telemetry, debugging, progress tracking, and error monitoring — without reaching into private internals.

## The event$ observable

`configurator.event$` is an `Observable<ModuleEvent>`. It is backed by a `ReplaySubject` that buffers the last 100 events. This means a subscriber that attaches _after_ `initialize()` has already started will still receive all previously emitted events — useful for telemetry systems that connect late.

```typescript
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

const configurator = new ModulesConfigurator();

// Subscribe before initialize() to capture all events.
// Subscribing after is also fine — the replay buffer covers you.
configurator.event$.subscribe((event) => {
  console.log(`[${event.level}] ${event.name}: ${event.message}`);
});

const modules = await configurator.initialize();
```

---

## ModuleEvent shape

Every event is a `ModuleEvent` object:

```typescript
type ModuleEvent = {
  /** Severity: 'error' | 'warning' | 'info' | 'debug' */
  level: ModuleEventLevel;

  /** Machine-readable event name, e.g. 'moduleConfigAdded', 'initializeStart' */
  name: string;

  /** Human-readable description */
  message: string;

  /** Structured metadata — content varies by event */
  properties?: Record<string, unknown>;
};
```

`ModuleEventLevel` is a string enum with four values: `'error'`, `'warning'`, `'info'`, and `'debug'`. Use `filter` to select the severity level you care about.

---

## Common event names

| Event name | Level | When it fires |
|---|---|---|
| `moduleConfigAdded` | `debug` | A module is registered via `addConfig` |
| `configureStart` | `info` | The configure phase begins |
| `configureEnd` | `info` | The configure phase completes |
| `initializeStart` | `info` | The initialize phase begins |
| `initializeModuleStart` | `debug` | A single module's `initialize` is called |
| `initializeModuleEnd` | `debug` | A single module's `initialize` resolves |
| `initializeEnd` | `info` | All modules have initialized |
| `disposeStart` | `info` | Dispose begins |
| `disposeEnd` | `info` | Dispose completes |

The framework emits many `debug`-level events during normal operation. Filter to `info` and `error` in production telemetry to keep volume manageable.

---

## Filtering by level or name

Use RxJS `filter` to select the events you care about:

```typescript
import { filter } from 'rxjs/operators';
import { ModuleEventLevel } from '@equinor/fusion-framework-module';

// Only errors
configurator.event$.pipe(
  filter((e) => e.level === ModuleEventLevel.Error),
).subscribe((e) => {
  errorTracker.captureException(new Error(e.message), { extra: e.properties });
});

// Measure initialize duration
configurator.event$.pipe(
  filter((e) => e.name === 'initializeStart' || e.name === 'initializeEnd'),
).subscribe((e) => {
  telemetry.mark(e.name);
});
```

---

## Forwarding to Application Insights / OpenTelemetry

A common pattern in Fusion apps is to forward lifecycle events to a tracing backend. Because `event$` is a plain RxJS observable, you can pipe it into any sink:

```typescript
import { tap } from 'rxjs/operators';

configurator.event$.pipe(
  tap((e) => {
    appInsights.trackEvent({
      name: `fusion.module.${e.name}`,
      properties: {
        level: e.level,
        message: e.message,
        ...e.properties,
      },
    });
  }),
).subscribe();
```

Alternatively, subscribe inside `onInitialized` so the subscription is automatically associated with the module instance lifetime:

```typescript
configurator.onInitialized(() => {
  const sub = configurator.event$.subscribe((e) => forwardToTelemetry(e));
  // Remember to unsubscribe on dispose if you want clean teardown.
});
```

---

## Emitting events from your own module

Module authors can emit events directly through the `registerEvent` function passed to each phase function. This is an internal API used by the phase implementations. Consumer modules should not emit events into the configurator's stream directly — use your provider's own observable properties instead.

If you need to expose an event stream from your module, add it as an observable property on your provider:

```typescript
class MyProvider extends BaseModuleProvider {
  readonly #subject = new Subject<MyEvent>();

  /** Stream of events emitted by this provider. */
  readonly event$ = this.#subject.asObservable();

  constructor(args: BaseModuleProviderCtorArgs) {
    super(args);
    this.subscription.add(() => this.#subject.complete());
  }

  doSomething(): void {
    this.#subject.next({ type: 'somethingDone', timestamp: Date.now() });
  }
}
```

Consumers subscribe to `modules.myModule.event$` — a clean, typed stream that does not bleed through the configurator.

---

## Debugging with ModuleConsoleLogger

`ModuleConsoleLogger` is a styled console logger shipped with this package. It wraps `console.log/warn/error` with a coloured module-name prefix so events from different modules are visually distinguishable in the browser console.

```typescript
import { ModuleConsoleLogger } from '@equinor/fusion-framework-module';

const logger = new ModuleConsoleLogger('MyModule');

logger.debug('Provider initialized');   // [MyModule] Provider initialized
logger.warn('Missing optional config'); // ⚠ [MyModule] Missing optional config
logger.error('Failed to connect', err); // ✖ [MyModule] Failed to connect
```

Use it inside your module's `initialize` or provider constructor for development-time diagnostics. Gate it behind a debug flag in production.

---

## Next Steps

- [Lifecycle](./lifecycle.md) — when each event fires in the pipeline
- [Common Mistakes](./common-mistakes.md) — observable subscription pitfalls

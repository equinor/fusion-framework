# Diagnose framework operations with safe telemetry

`@equinor/fusion-framework-module-telemetry` captures operational outcomes separately
from application usage analytics. Standard framework, app and widget hosts enable
bounded lifecycle capture automatically. They do not create exporters: configure an
adapter or inherit an available parent.

The contract was approved in [#5802](https://github.com/equinor/fusion-framework/issues/5802#issuecomment-6284993442)
and implemented for [#5803](https://github.com/equinor/fusion-framework/issues/5803).

## Records and privacy

Each attempted module initialization and default-phase module disposal produces one
`fusion.<module>.initialize.duration` or `fusion.<module>.dispose.duration` metric.
The host produces `fusion.host.initialize.duration` and `fusion.host.dispose.duration`.
Durations are finite, nonnegative milliseconds; zero is valid. Camel-case module
keys become kebab-case, for example `serviceDiscovery` becomes `service-discovery`.

A failed boundary adds one `.failure` exception with a controlled message and no
original error or stack. Cancellation is a terminal `cancelled` outcome, not an
exception. Skipped work produces no terminal metric.

The versioned `diagnostic` envelope contains:

- `schemaVersion: 1`, `module`, `operation`, `outcome`, `unit: 'ms'`, and `occurredAt`;
- a random, lifecycle-local `hostId`;
- optional host-defined `source` kind, `hostName` and `hostVersion`;
- existing OpenTelemetry `traceId`, `spanId`, and `traceFlags`, when available.

The telemetry module is agnostic about where it runs and assigns no meaning to host
kinds. It does not default to `framework`: a host that never calls `setSource` emits
unclassified records with only a `hostId`, and the OTLP adapter does not infer a
`source` attribute for them. Any composition root can describe itself:

```ts
builder.setSource({
  source: 'portal',
  hostId: crypto.randomUUID(),
  hostName: 'my-portal',
  hostVersion: '1.4.0',
});
```

Source kinds, like module and operation names, must be lowercase kebab-case
identifiers (`/^[a-z][a-z0-9-]*$/`), so URLs, user names or payload fragments cannot
become exported labels. `setSource` throws a `RangeError` for anything else.
`hostName` and `hostVersion` must be static identity, never request or user data.

The bundled hosts use this generic contract rather than special fields: framework,
app and widget hosts set `framework`, `app` and `widget`; the app host maps its
manifest key and build version to `hostName` and `hostVersion`. Widget records omit
widget manifest identity.

Capture occurs before asynchronous enrichment. Relaying preserves origin, occurrence
time and correlation. No spans or trace providers are created. OTLP logs use that
captured timestamp and context even when exported later.

Raw lifecycle messages, arbitrary event properties, URLs, request/response bodies,
headers, tokens, query arguments/cache keys, and original errors are not copied.
Built-in records ignore dynamic metadata and custom default scopes; custom telemetry
retains the existing metadata and scope contract. Consumers of custom telemetry remain
responsible for its privacy. The event bus is not a blanket export source, and usage
analytics is not duplicated into operational telemetry.

## Choose the destination

| Configuration | Delivery |
| --- | --- |
| Child has no explicit exporter | Relay to eligible parent adapters, including `fallback` adapters. |
| Child has a non-fallback exporter | Export locally; ordinary parent adapters still receive relayed records, but ancestor `fallback` adapters skip them. |
| Child exporter fails, rejects, or filters a record | Ownership does not change; inherited fallback does not activate. |
| Parent contains both ordinary and fallback adapters | Only fallback adapters are suppressed by child ownership. |
| Child sets `setParent(undefined)` or rejects a relay filter | Do not forward to the parent. |
| No adapters or parent | Do not invent an exporter. A pre-provider host startup failure has a controlled local warning. |

Multiple configured destinations are intentional, not deduplicated by delivery
acknowledgement. Ownership propagates across nested widgets, apps and framework hosts.
Async adapter factories that fail retain explicit ownership. Before a callback-based
relay filter resolves, bootstrap failure delivery conservatively rejects forwarding
rather than bypassing an unresolved policy.

Legacy custom parents without `trackRelayed` retain track-only live forwarding. On
bootstrap failure, an explicitly owned child does not forward through such a parent
because fallback suppression cannot be represented; it reports a controlled warning.

To stop lifecycle records reaching a provider without disabling custom telemetry:

```ts
import { enableTelemetry } from '@equinor/fusion-framework-module-telemetry';

enableTelemetry(configurator, { attachConfiguratorEvents: false });
```

The opt-out is configuration, and the last call wins. It does not stop the host's own
startup capture: if startup fails before a provider exists, the host still reports the
sanitized failure records to its parent.

## Startup buffering and shutdown

Telemetry is itself a module, so it cannot observe the startup it is part of. Each host
creates a `StartupCapture` as soon as it is configured, before any user code runs, and
attaches its records to the telemetry configurator. The configurator itself only records
configuration; it does not own capture.

```ts
import {
  StartupCapture,
  TelemetryConfigurator,
  telemetryModule,
} from '@equinor/fusion-framework-module-telemetry';

const source = { source: 'portal', hostId: crypto.randomUUID() };
const capture = new StartupCapture(configurator, { source, parent });
configurator.addConfig({
  module: telemetryModule,
  configurator: new TelemetryConfigurator()
    .setSource(source)
    .setParent(parent)
    .attachLifecycleItems(capture.items),
});
try {
  await configureHost(configurator);
} catch (error) {
  capture.fail();
  throw error;
}
```

Framework, app and widget hosts do this for you. For a custom host using a plain
`ModulesConfigurator`, `enableTelemetry(configurator, { attachConfiguratorEvents: true })`
creates a capture when no host already did. Once the provider exists, it stamps its own
host identity on lifecycle records, so every record from one host shares a `hostId`.

Lifecycle and custom item streams have independent, provider-owned subscriptions:
a custom stream error reports through the existing health channel without disabling
host diagnostics.

Only safe terminal records enter a queue, independently of the generic 100-event
configurator replay buffer. The queue reserves 255 records plus one
`fusion.telemetry.startup-overflow` summary with a numeric `dropped` count.
Overflow preferentially retains failure evidence rather than successful records.

If startup fails before telemetry initializes, the host's parent receives the safe
buffered outcomes. The child's exporters and relay filter are not configured yet, so
recovery relays without exporter ownership: the parent's fallback exporters may also
receive these records, and nothing is dropped. Once the provider exists, explicit
child exporters keep the parent's fallback exporters silent. The original business
rejection is preserved. Successfully initialized providers from that attempt,
including providers finishing after a sibling failure, are cleaned up. Initialization
and rollback share one attempt-owned provider map, not a configurator-wide registry.

Built-in enrichment is bounded to 256 pending items per provider and a one-second
deadline; failure, saturation or timeout emits the original safe record. Custom
metadata subscriptions are also owned, but keep their legacy timing and are canceled
on disposal. Async adapter processing is owned and bounded to 256 pending calls per
adapter; a saturated adapter cannot starve a healthy sibling.

Module disposal uses fixed `disposePhase` values, concurrent within each phase:
`default` (used when omitted), then `diagnostics` for telemetry, then `events` for the event bus.
Infrastructure phases are not a dependency-ordering mechanism for ordinary modules.
The host disposal duration ends after ordinary module/plugin teardown, before sink flush.
Telemetry and event sink shutdown completion are deliberately not exported through
their own already-closed sink. Sink failures remain observable through lifecycle
health events. Supported async processing and adapter shutdown are awaited.
Repeated disposal shares one promise; tracking after disposal produces no records.

`TelemetryProvider` is a thin facade over the `TelemetryProviderState` engine. Records
are delivered synchronously within `track`, but `initialize()` and `dispose()` settle
through flow actions on the RxJS `asyncScheduler`. Tests using fake timers must advance
timers, for example `await vi.advanceTimersByTimeAsync(1)` until the operation settles,
or framework disposal will not complete.

Exporter initialization, processing, filters, metadata and event/relay delivery
failures cannot replace business outcomes. Controlled health reports use
`onTelemetryError`, or a sanitized console warning if unavailable; they never
recursively export an error record. Repeats are counted and summarized at teardown.
An adapter or module initializer that never settles still requires its own timeout
or cancellation contract; arbitrary application promises are not forcibly aborted.

## Add HTTP and query instrumentation without dependency cycles

Both integrations are optional and use lazy provider lookup. They do not wait for
telemetry initialization or subscribe to business execution a second time.

```ts
import {
  createHttpTelemetry,
  observeQueryTelemetry,
} from '@equinor/fusion-framework-module-telemetry/integrations';

const diagnostics = createHttpTelemetry(() => modules.telemetry);
httpClient.middlewareHandler.use(diagnostics.middleware);
const querySubscription = observeQueryTelemetry(query.event$, () => modules.telemetry);

// During the owning lifecycle's teardown:
diagnostics.dispose();
querySubscription?.unsubscribe();
```

Register HTTP telemetry **after retry middleware** so it is innermost and measures
each actual transport attempt. `fusion.http.request.duration` ends when fetch resolves
or rejects, not when a streamed body finishes. Non-2xx responses are failures; an
aborted signal is cancellation. Original responses, errors and body consumption
remain unchanged.

An export transport using the shared HTTP client marks its exporter-owned request with
`markTelemetryExportRequest(init)` from `@equinor/fusion-framework-module`.
The `telemetryExportRequest` symbol identifies telemetry delivery so operational
instrumentation does not instrument its own exports. The marker survives request
object spreads but is not a header or serialized payload field. Ownership is
request-local, so simultaneous application traffic remains observable; this does
not globally disable diagnostics. The analytics OTLP HTTP transport marks its requests.

`observeQueryTelemetry` separates `fusion.query.schedule.duration` (requested to
executing) from `fusion.query.execute.duration` (executing to terminal outcome).
Cancellation before execution terminates scheduling only. Transaction IDs are used
internally in a bounded 256-job map and cleared on unsubscribe, never exported.
Existing `query_cache_hit` and `query_cache_miss` events become safe
`fusion.query.cache-hit` and `fusion.query.cache-miss` notifications without fabricated
lookup durations. These describe the existing events, not domain success or cache
freshness; the query stream may report a hit before rejecting an invalid entry.

Navigation connects optional host telemetry after initialization. Automatic wiring
emits safe `Navigation::navigated` notifications, not per-action debug chatter.
Explicit `setTelemetry(provider)` retains detailed static debug notifications;
`setTelemetry(undefined)` disables automatic hookup. Route locations, state and
action payloads are never included. Custom navigation providers opt in to automatic
wiring by implementing the optional `INavigationProvider.connectTelemetry` method.

## Report your own operational outcomes

Use `createOperationalRecords` for a measured terminal outcome: it returns one
`fusion.<module>.<operation>.duration` metric and, on failure, one sanitized
`.failure` exception. Use `createDiagnosticContext` for a notification that has no
measured duration, and attach the envelope to your own event. Both validate the
module, operation and source kind as static kebab-case identifiers, and capture
occurrence time and the active OpenTelemetry span immediately.

```ts
import { TelemetryLevel } from '@equinor/fusion-framework-module-telemetry';
import {
  createDiagnosticContext,
  createOperationalRecords,
} from '@equinor/fusion-framework-module-telemetry/utils';

const source = telemetry.source;
if (source) {
  // Measured outcome: duration metric, plus a sanitized exception on failure.
  for (const record of createOperationalRecords({
    source,
    module: 'reports',
    operation: 'export',
    outcome: 'success',
    duration: performance.now() - started,
  })) {
    telemetry.track(record);
  }

  // Notification: no fabricated duration, just the safe envelope.
  telemetry.trackEvent({
    name: 'Reports::exported',
    level: TelemetryLevel.Information,
    diagnostic: createDiagnosticContext({
      source,
      module: 'reports',
      operation: 'notification',
      outcome: 'success',
    }),
  });
}
```

## Migrate dashboards and custom integrations

This is a breaking change to automatic lifecycle telemetry, not custom tracking:

- Replace raw configurator event-name queries with `fusion.<module>.<operation>.duration`
  and `.failure`; use `diagnostic` for source, outcome and correlation.
- Do not depend on arbitrary lifecycle properties, error stacks, dynamic metadata,
  or custom default scopes being attached to built-in records.
- Navigation event consumers must no longer expect route/state/action payloads or
  dynamically named per-action records.
- Inspect `configurator.event$` locally for detailed debugging. Exporting additional
  records is an explicit consumer opt-in with its own privacy and volume policy.

## Measured budget gates

The co-located `operational-budgets.test.ts` uses five warm-ups and 30 paired measured
runs. On macOS with Node 24.19.0 and Vitest 5.0.4, one local isolated run measured:

| Workload | Capture off p95 | Capture on p95 |
| --- | --- | --- |
| 16 default-phase modules plus telemetry, including capture setup | 0.412 ms | 0.843 ms |
| 100 stubbed HTTP attempts against an uninstrumented baseline | 0.015 ms | 0.220 ms |

The startup emitted exactly 18 terminal metrics (17 attempted module initializations
plus the host), and 17 disposal metrics (16 default-phase modules plus the host).
Per-record p95 was 0.00204 ms, below the 0.5 ms gate.
Both workload increases were below `max(5 ms, 5% of baseline p95)`.

These are in-process synthetic foundation measurements, not browser/device guarantees
or collector/network benchmarks. Collector latency is excluded. Re-run the tests
for the target environment; no sampling is used to conceal volume.

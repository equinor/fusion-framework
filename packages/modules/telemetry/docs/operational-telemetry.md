# Diagnose framework operations with safe telemetry

`@equinor/fusion-framework-module-telemetry` captures operational outcomes separately
from application usage analytics. Standard framework, app and widget hosts enable
bounded lifecycle capture automatically. They do not create exporters: configure an
adapter or inherit an available parent.

The contract was approved in [#5802](https://github.com/equinor/fusion-framework/issues/5802#issuecomment-6284993442)
and implemented for [#5803](https://github.com/equinor/fusion-framework/issues/5803).

## Records and privacy

Each attempted module initialization and business-module disposal produces one
`fusion.<module>.initialize.duration` or `fusion.<module>.dispose.duration` metric.
The host produces `fusion.host.initialize.duration` and `fusion.host.dispose.duration`.
Durations are finite, nonnegative milliseconds; zero is valid. Camel-case module
keys become kebab-case, for example `serviceDiscovery` becomes `service-discovery`.

A failed boundary adds one `.failure` exception with a controlled message and no
original error or stack. Cancellation is a terminal `cancelled` outcome, not an
exception. Skipped work produces no terminal metric.

The versioned `diagnostic` envelope contains:

- `schemaVersion: 1`, `module`, `operation`, `outcome`, `unit: 'ms'`, and `occurredAt`;
- `source: 'framework' | 'app' | 'widget'` and a random, lifecycle-local `hostId`;
- optional manifest `appKey`, `appVersion`, `widgetKey`, and `widgetVersion`;
- existing OpenTelemetry `traceId`, `spanId`, and `traceFlags`, when available.

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

To disable automatic lifecycle records without disabling custom telemetry:

```ts
import { enableTelemetry } from '@equinor/fusion-framework-module-telemetry';

enableTelemetry(configurator, { attachConfiguratorEvents: false });
```

## Startup buffering and shutdown

Capture begins at the host's telemetry-enable boundary, before user configuration.
Only safe terminal records enter a queue, independently of the generic 100-event
configurator replay buffer. The queue reserves 255 records plus one
`fusion.telemetry.startup-overflow` summary with a numeric `dropped` count.
Overflow preferentially retains failure evidence rather than successful records.

If configuration fails before telemetry initializes, an available parent receives
the safe buffered outcomes under the same ownership and relay policy. The original
business rejection is preserved. Successfully created partial providers, including
providers finishing after a sibling failure, are cleaned up.

Built-in enrichment is bounded to 256 pending items per provider and a one-second
deadline; failure, saturation or timeout emits the original safe record. Custom
metadata subscriptions are also owned, but keep their legacy timing and are canceled
on disposal. Async adapter processing is owned and bounded to 256 pending calls per
adapter; a saturated adapter cannot starve a healthy sibling.

Module disposal uses ascending `disposePriority` groups, concurrent within each:
business providers default to `0`, telemetry uses `1`, and event uses `2`.
The host disposal duration ends after business/plugin teardown, before sink flush.
Telemetry and event sink shutdown completion are deliberately not exported through
their own already-closed sink. Sink failures remain observable through lifecycle
health events. Supported async processing and adapter shutdown are awaited.
Repeated disposal shares one promise; tracking after disposal produces no records.

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
} from '@equinor/fusion-framework-module-telemetry';

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

An export transport using the shared HTTP client must call
`excludeDiagnostics(init)` from `@equinor/fusion-framework-module`. Its symbol marker
survives request object spreads but is not a header or serialized payload.
Exclusion is request-local, so simultaneous business traffic remains observable.
The analytics OTLP HTTP transport uses this marker.

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
action payloads are never included.

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
| 16 business modules plus telemetry, including capture setup | 0.412 ms | 0.843 ms |
| 100 stubbed HTTP attempts against an uninstrumented baseline | 0.015 ms | 0.220 ms |

The startup emitted exactly 18 terminal metrics (17 attempted module initializations
plus the host), and 17 disposal metrics (16 business modules plus the host).
Per-record p95 was 0.00204 ms, below the 0.5 ms gate.
Both workload increases were below `max(5 ms, 5% of baseline p95)`.

These are in-process synthetic foundation measurements, not browser/device guarantees
or collector/network benchmarks. Collector latency is excluded. Re-run the tests
for the target environment; no sampling is used to conceal volume.

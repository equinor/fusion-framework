import { AzureMonitorTraceExporter } from '@azure/monitor-opentelemetry-exporter';
import { type Attributes, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SimpleSpanProcessor, TracerProvider } from '@opentelemetry/sdk-trace';

import { TELEMETRY_TOOL_NAME } from './telemetry-tool-name.js';

/** Outcome of one CLI invocation. */
export type InvocationOutcome = 'success' | 'failure' | 'cancelled';

/** The single usage record exported per CLI invocation. Contains no argument or option values. */
export interface InvocationRecord {
  /** W3C trace id shared with outgoing Fusion requests; becomes the `operation_Id`. */
  traceId: string;
  /** Span id of the invocation request; parent of outgoing Fusion requests. */
  spanId: string;
  /** CLI package version. */
  version: string;
  /** Static command path, e.g. `app build`; empty for the root command. */
  command: string;
  commandKind: 'builtin' | 'plugin';
  /** Names of the registered options used, never their values. */
  optionNames: string[];
  exitCode: number;
  outcome: InvocationOutcome;
  /** Type name of the error that terminated the run, never its message. */
  exceptionType?: string;
  /** Epoch milliseconds when the invocation started. */
  startTime: number;
  /** Epoch milliseconds when the invocation ended. */
  endTime: number;
  os: string;
  arch: string;
  nodeVersion: string;
  ci: boolean;
  /** Known target Fusion environment, when the command selected one. */
  fusionEnvironment?: string;
  /** One-way hash identifying the machine. */
  machineId: string;
}

/** Options for {@link exportInvocation}. */
export interface ExportInvocationOptions {
  /** Application Insights connection string of the destination. */
  connectionString: string;
  /** Upper bound for delivery and shutdown; the CLI never waits longer. */
  timeoutMs: number;
}

/**
 * How {@link exportInvocation} ended: `settled` when no exporter work remains, `timedOut` when
 * the time bound elapsed first and a request or retry may still hold the event loop open.
 */
export type InvocationExportResult = 'settled' | 'timedOut';

/**
 * Exporter settings that are read from the environment at construction time. They disable
 * SDK self-telemetry (statsbeat and SDK stats) and the extra `_OTELRESOURCE_` metric, so the
 * invocation request is the only item sent.
 */
const EXPORTER_ENV_OVERRIDES: Readonly<Record<string, string>> = {
  APPLICATION_INSIGHTS_NO_STATSBEAT: 'true',
  APPLICATIONINSIGHTS_STATSBEAT_DISABLED: 'true',
  APPLICATIONINSIGHTS_SDKSTATS_DISABLED: 'true',
  APPLICATIONINSIGHTS_OPENTELEMETRY_RESOURCE_METRIC_DISABLED: 'true',
};

/** Runs `create` with the exporter overrides applied, restoring the caller's environment after. */
const withExporterEnv = <T>(create: () => T): T => {
  // Capture the caller's environment before applying settings required for one exporter instance.
  const previous = Object.fromEntries(
    // Restore only these keys so unrelated environment changes remain untouched.
    Object.keys(EXPORTER_ENV_OVERRIDES).map((key) => [key, process.env[key]]),
  );
  // The Azure SDK reads these overrides when constructing its exporter.
  Object.assign(process.env, EXPORTER_ENV_OVERRIDES);
  try {
    return create();
  } finally {
    // Restore the exact prior values after construction, including absence.
    for (const [key, value] of Object.entries(previous)) {
      // Delete keys that the caller did not define rather than leaving SDK overrides behind.
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
};

/**
 * Resolves when `task` settles or `timeoutMs` elapses, whichever comes first; never rejects.
 * Resolves `true` when `task` settled in time.
 */
const settleWithin = async (task: Promise<unknown>, timeoutMs: number): Promise<boolean> => {
  let timer: NodeJS.Timeout | undefined;
  const settled = await Promise.race([
    task.then(
      () => true,
      () => true,
    ),
    new Promise<boolean>((resolve) => {
      timer = setTimeout(() => resolve(false), timeoutMs);
    }),
  ]);
  clearTimeout(timer);
  return settled;
};

/** Exporter attribute that sets the `ai.location.ip` tag; it is never sent as a property. */
const ANONYMOUS_CLIENT_IP_ATTRIBUTE = 'microsoft.client.ip';
/** Unroutable address that keeps Application Insights from geolocating the sender. */
const ANONYMOUS_CLIENT_IP = '0.0.0.0';

/** Maps the record to request custom dimensions; only primitives from allowlisted fields. */
const toAttributes = (record: InvocationRecord): Attributes => ({
  tool: TELEMETRY_TOOL_NAME,
  cliVersion: record.version,
  command: record.command,
  commandKind: record.commandKind,
  options: record.optionNames.join(','),
  exitCode: record.exitCode,
  outcome: record.outcome,
  os: record.os,
  arch: record.arch,
  nodeVersion: record.nodeVersion,
  ci: record.ci,
  machineId: record.machineId,
  ...(record.exceptionType ? { exceptionType: record.exceptionType } : {}),
  ...(record.fusionEnvironment ? { fusionEnvironment: record.fusionEnvironment } : {}),
});

/**
 * Sends one invocation as an Application Insights request through Microsoft's Azure Monitor
 * exporter, then shuts the exporter down.
 *
 * The request is an OpenTelemetry server span on a private tracer provider: no global providers,
 * instrumentations or automatic collection are registered. Offline storage, SDK self-telemetry and
 * the resource metric are disabled, and the resource sets `service.instance.id` to the hashed
 * machine id so the exporter never falls back to the host name for the role instance.
 *
 * Delivery and shutdown together are bounded by `timeoutMs`. Failures, including an invalid
 * connection string or an unreachable endpoint, are swallowed so telemetry can never change the
 * command's outcome.
 *
 * @param record - The invocation to export.
 * @param options - Destination and time bound.
 * @returns Resolves once delivery finished or failed (`settled`), or the time bound elapsed
 * (`timedOut`).
 */
export const exportInvocation = async (
  record: InvocationRecord,
  options: ExportInvocationOptions,
): Promise<InvocationExportResult> => {
  const deadline = Date.now() + options.timeoutMs;
  let provider: TracerProvider;
  try {
    const exporter = withExporterEnv(
      () =>
        new AzureMonitorTraceExporter({
          connectionString: options.connectionString,
          disableOfflineStorage: true,
        }),
    );
    provider = new TracerProvider({
      resource: resourceFromAttributes({
        'service.name': TELEMETRY_TOOL_NAME,
        'service.version': record.version,
        'service.instance.id': record.machineId,
      }),
      // Reuse the invocation identity so the request id matches outgoing `traceparent` headers.
      idGenerator: {
        generateTraceId: () => record.traceId,
        generateSpanId: () => record.spanId,
      },
      spanProcessors: [new SimpleSpanProcessor({ exporter })],
    });
    const span = provider
      .getTracer(TELEMETRY_TOOL_NAME)
      .startSpan(`${TELEMETRY_TOOL_NAME} ${record.command}`.trim(), {
        kind: SpanKind.SERVER,
        startTime: record.startTime,
        attributes: {
          ...toAttributes(record),
          // Sets `ai.location.ip`, so ingestion derives no city or country from the sender's IP.
          [ANONYMOUS_CLIENT_IP_ATTRIBUTE]: ANONYMOUS_CLIENT_IP,
        },
      });
    span.setStatus({
      code: record.outcome === 'success' ? SpanStatusCode.OK : SpanStatusCode.ERROR,
    });
    span.end(record.endTime);
  } catch {
    // Invalid destination: telemetry is silently skipped.
    return 'settled';
  }
  const flushed = await settleWithin(provider.forceFlush(), deadline - Date.now());
  const shutDown = await settleWithin(provider.shutdown(), Math.max(0, deadline - Date.now()));
  return flushed && shutDown ? 'settled' : 'timedOut';
};

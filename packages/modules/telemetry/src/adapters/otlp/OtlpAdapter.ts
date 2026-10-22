import type { TelemetryItem } from '../../types.js';
import { BaseTelemetryAdapter } from '../../TelemetryAdapter.js';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import {
  LoggerProvider,
  BatchLogRecordProcessor,
  type LogRecordExporter,
} from '@opentelemetry/sdk-logs';
import { SeverityNumber, type LogAttributes, type Logger } from '@opentelemetry/api-logs';
import { resourceFromAttributes } from '@opentelemetry/resources';

/** Configuration for exporting Fusion telemetry with the standard OTLP/HTTP logs exporter. */
export interface OtlpAdapterOptions {
  /** Full OTLP/HTTP logs URL, including the signal path. */
  url: string;
  /** Service resource identity. Defaults to `fusion.telemetry`. */
  serviceName?: string;
  /** When true, explicit child adapters take precedence over this adapter. Defaults to false. */
  fallback?: boolean;
}

/**
 * Exports Fusion telemetry as OTLP/HTTP log records using the standard OpenTelemetry SDK.
 *
 * Records include app identity and source attributes, and automatically inherit the active
 * OpenTelemetry trace/span context. No global logger provider or console patch is installed.
 * Collector failures are reported once without blocking initialization or app execution.
 *
 * @example
 * ```ts
 * import { OtlpAdapter } from '@equinor/fusion-framework-module-telemetry/otlp-adapter';
 *
 * enableTelemetry(configurator, {
 *   configure: (builder) => builder.setAdapter('otlp', new OtlpAdapter({
 *     url: 'http://localhost:4318/v1/logs',
 *   })),
 * });
 * ```
 */
export class OtlpAdapter extends BaseTelemetryAdapter {
  /** Whether explicitly configured child adapters take precedence. */
  readonly fallback: boolean;
  #reportedFailure = false;
  readonly #logger: Logger;
  readonly #provider: LoggerProvider;

  /**
   * Creates an OTLP adapter without contacting the collector.
   * @param options - Logs endpoint, optional service identity, and fallback precedence.
   */
  constructor(options: OtlpAdapterOptions) {
    super();
    this.fallback = options.fallback ?? false;
    const exporter = new OTLPLogExporter({ url: options.url, timeoutMillis: 5_000 });
    const reportingExporter: LogRecordExporter = {
      export: (records, callback) => {
        exporter.export(records, (result) => {
          // Report once without replacing the SDK's failure result with a success.
          if (result.code !== 0 && !this.#reportedFailure) {
            this.#reportedFailure = true;
            console.warn('OTLP log delivery failed; telemetry is best effort.', result.error);
          }
          callback(result);
        });
      },
      forceFlush: () => exporter.forceFlush(),
      shutdown: () => exporter.shutdown(),
    };
    this.#provider = new LoggerProvider({
      resource: resourceFromAttributes({
        'service.name': options.serviceName ?? 'fusion.telemetry',
      }),
      // Bootstrap emits bursts; batching avoids the exporter's concurrent-request limit.
      processors: [
        new BatchLogRecordProcessor({
          exporter: reportingExporter,
          scheduledDelayMillis: 1_000,
          maxExportBatchSize: 128,
          maxQueueSize: 2_048,
        }),
      ],
    });
    this.#logger = this.#provider.getLogger('fusion.telemetry');
  }

  /**
   * Flushes pending records and releases the SDK exporter without affecting global telemetry.
   * @returns Resolves after pending exports finish and the SDK provider shuts down.
   */
  shutdown(): Promise<void> {
    return this.#provider.shutdown();
  }

  /**
   * Exports buffered records immediately, for deterministic tests and explicit lifecycle boundaries.
   * @returns Resolves when the SDK finishes exporting pending records.
   * @example
   * ```ts
   * await adapter.forceFlush();
   * ```
   */
  forceFlush(): Promise<void> {
    return this.#provider.forceFlush();
  }

  /**
   * Exports a telemetry item as an OTLP LogRecord.
   * @param item - App or framework record, including inherited Fusion metadata.
   */
  protected _processItem(item: TelemetryItem): void {
    const fusion = item.metadata?.fusion;
    const app = fusion && typeof fusion === 'object' && 'app' in fusion ? fusion.app : undefined;
    const appKey =
      app && typeof app === 'object' && 'key' in app && typeof app.key === 'string'
        ? app.key
        : undefined;
    const attributes: LogAttributes = {
      source: appKey ? 'app' : 'framework',
      'fusion.telemetry.type': item.type,
      'fusion.telemetry.scope': item.scope,
      ...(appKey ? { 'fusion.app.key': appKey } : {}),
    };
    // OTLP attributes accept primitive values, not arbitrary application objects.
    for (const [key, value] of Object.entries(item.properties ?? {})) {
      // Preserve supported values without serializing circular application objects.
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        attributes[`fusion.properties.${key}`] = value;
      }
    }
    // Error instances do not serialize as useful OTLP attributes automatically.
    if ('exception' in item && item.exception instanceof Error) {
      attributes['exception.type'] = item.exception.name;
      attributes['exception.message'] = item.exception.message;
      attributes['exception.stacktrace'] = item.exception.stack;
    }
    // Keep metric values when representing Fusion metrics as OTLP log records.
    if ('value' in item && typeof item.value === 'number') {
      attributes['fusion.telemetry.value'] = item.value;
    }
    this.#logger.emit({
      body: item.name,
      attributes,
      severityNumber: [
        SeverityNumber.DEBUG,
        SeverityNumber.INFO,
        SeverityNumber.WARN,
        SeverityNumber.ERROR,
        SeverityNumber.FATAL,
      ][item.level],
    });
  }
}

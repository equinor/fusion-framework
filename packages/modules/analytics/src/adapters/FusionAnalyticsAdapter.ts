import type { IAnalyticsAdapter } from './AnalyticsAdapter.interface.js';
import type { AnalyticsEvent } from '../types.js';

import {
  LoggerProvider,
  BatchLogRecordProcessor,
  type ReadableLogRecord,
} from '@opentelemetry/sdk-logs';
import type { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';
import {
  SeverityNumber,
  type LogAttributes,
  type Logger,
  type LogRecord,
} from '@opentelemetry/api-logs';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { version } from '../version.js';
import { v7 as uuid } from 'uuid';

/**
 * Analytics adapter that forwards events to an OpenTelemetry log exporter.
 *
 * @remarks
 * Uses `@opentelemetry/sdk-logs` to batch and export log records through the
 * provided {@link OTLPExporterBase} transport. Each analytics event is mapped
 * to an OTLP `LogRecord` with severity `INFO`.
 *
 * Resource attributes automatically include the module version, a unique
 * session ID (UUIDv7), and the portal ID supplied at construction time.
 *
 * @template T - Analytics event type, defaults to {@link AnalyticsEvent}.
 *
 * @example
 * ```ts
 * import { FusionAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/adapters';
 * import { OTLPLogExporter } from '@equinor/fusion-framework-module-analytics/logExporters';
 *
 * builder.setAdapter('fusion-log', async () => {
 *   const logExporter = new OTLPLogExporter({ url: '/v1/logs' });
 *   return new FusionAnalyticsAdapter({ portalId: 'my-portal', logExporter });
 * });
 * ```
 *
 * @see {@link OTLPExporterBase}
 */
export class FusionAnalyticsAdapter<T extends AnalyticsEvent = AnalyticsEvent>
  implements IAnalyticsAdapter
{
  #logExporter: OTLPExporterBase<ReadableLogRecord[]>;
  #loggerProvider: LoggerProvider;
  #logger: Logger;

  /**
   * Creates a new `FusionAnalyticsAdapter`.
   *
   * @param args - Construction options.
   * @param args.portalId - Portal identifier attached to every exported log record.
   * @param args.logExporter - An OTLP-compatible log exporter for transport.
   */
  constructor(args: { portalId: string; logExporter: OTLPExporterBase<ReadableLogRecord[]> }) {
    this.#logExporter = args.logExporter;

    this.#loggerProvider = new LoggerProvider({
      processors: [new BatchLogRecordProcessor(this.#logExporter)],
      resource: resourceFromAttributes({
        'module.version': version,
        'session.id': uuid(),
        'portal.id': args.portalId,
      }),
    });
    this.#logger = this.#loggerProvider.getLogger('fusion');
  }

  /** Maps an analytics event to an OTLP `LogRecord` and emits it via the logger. */
  registerAnalytic(event: T): Promise<void> | void {
    const logRecord: Partial<LogRecord> = {
      eventName: event.name,
      attributes: event.attributes as LogAttributes,
      body: event.value,
      severityNumber: SeverityNumber.INFO,
    };
    this.#logger.emit(logRecord);
  }

  /** Shuts down the log exporter and logger provider, flushing remaining records. */
  [Symbol.dispose]() {
    this.#logExporter.shutdown();
    this.#loggerProvider.shutdown();
  }
}

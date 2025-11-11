import type { IAnalyticsAdapter } from './AnalyticsAdapter.interface.js';
import type { AnalyticsEvent } from '../types.js';

import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import type { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import {
  SeverityNumber,
  type LogAttributes,
  type Logger,
  type LogRecord,
} from '@opentelemetry/api-logs';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { version } from '../version.js';
import { v7 as uuid } from 'uuid';

export class FusionAnalyticsAdapter<T extends AnalyticsEvent = AnalyticsEvent>
  implements IAnalyticsAdapter
{
  #logExporter: OTLPLogExporter;
  #loggerProvider: LoggerProvider;
  #logger: Logger;

  constructor(args?: { portalId: string; logExporterArgs?: OTLPExporterConfigBase }) {
    this.#logExporter = new OTLPLogExporter(args?.logExporterArgs);
    this.#loggerProvider = new LoggerProvider({
      processors: [new SimpleLogRecordProcessor(this.#logExporter)],
      resource: resourceFromAttributes({
        'module.version': version,
        'session.id': uuid(),
        'portal.id': args?.portalId,
      }),
    });
    this.#logger = this.#loggerProvider.getLogger('fusion');
  }

  registerAnalytic(event: T): Promise<void> | void {
    const logRecord: Partial<LogRecord> = {
      eventName: event.name,
      attributes: event.attributes as LogAttributes,
      body: event.value,
      severityNumber: SeverityNumber.INFO,
    };
    this.#logger.emit(logRecord);
  }

  [Symbol.dispose]() {
    this.#logExporter.shutdown();
    this.#loggerProvider.shutdown();
  }
}

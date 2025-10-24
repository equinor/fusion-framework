import type { IMetricsAdapter } from '../MetricsAdapter.interface.js';
import type { MetricEvent } from '../types.js';

import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import type { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import { SeverityNumber, type LogAttributes, type Logger, type LogRecord } from '@opentelemetry/api-logs';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { version } from '../version.js';

export class FusionMetricsAdapter<T extends MetricEvent = MetricEvent> implements IMetricsAdapter {
  #logExporter: OTLPLogExporter;
  #loggerProvider: LoggerProvider;
  #logger: Logger;

  constructor(args?: { logExporterArgs?: OTLPExporterConfigBase}) {
    this.#logExporter = new OTLPLogExporter(args?.logExporterArgs);
    this.#loggerProvider = new LoggerProvider({
      processors: [new SimpleLogRecordProcessor(this.#logExporter)],
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'Fusion',
        [ATTR_SERVICE_VERSION]: version,
      })
    });
    this.#logger = this.#loggerProvider.getLogger('fusion');
  }

  registerMetric(event: T): Promise<void> | void {
    const logRecord: Partial<LogRecord> = {
      eventName: event.name,
      attributes: event.metadata as LogAttributes,
      body: event.value,
      severityNumber: SeverityNumber.INFO,
    }
    this.#logger.emit(logRecord);
  }

  [Symbol.dispose]() {
    this.#logExporter.shutdown();
    this.#loggerProvider.shutdown();
  }
}

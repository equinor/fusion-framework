import type { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';

import { JsonLogsSerializer } from '@opentelemetry/otlp-transformer';

import {
  createOtlpNetworkExportDelegate,
  OTLPExporterBase,
  type OtlpSharedConfiguration,
} from '@opentelemetry/otlp-exporter-base';

import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import { HttpClientExporterTransport } from './HttpClientExporterTransport.js';

// The shared default configuration needed for the OTLPNetworkExportDelegate
function getSharedConfigurationDefaults(): OtlpSharedConfiguration {
  return {
    timeoutMillis: 10000,
    concurrencyLimit: 30,
    compression: 'none',
  };
}

/**
 * A log exporter extending OTLPExporterBase but substitute the normal transport
 * with a HttpClientExporterTransport. This will use the provided httpClient to
 * emit the event.
 */
export class FusionOTLPLogExporter
  extends OTLPExporterBase<ReadableLogRecord[]>
  implements LogRecordExporter
{
  constructor(httpClient: IHttpClient) {
    super(
      createOtlpNetworkExportDelegate(
        getSharedConfigurationDefaults(),
        JsonLogsSerializer,
        new HttpClientExporterTransport(httpClient),
      ),
    );
  }
}

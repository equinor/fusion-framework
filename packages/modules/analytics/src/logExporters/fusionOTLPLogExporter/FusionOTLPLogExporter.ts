import type { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';

import { JsonLogsSerializer } from '@opentelemetry/otlp-transformer';

import {
  createOtlpNetworkExportDelegate,
  OTLPExporterBase,
  type OtlpSharedConfiguration,
} from '@opentelemetry/otlp-exporter-base';

import type { IHttpClient } from '@equinor/fusion-framework-react/http';
import { HttpClientExporterTransport } from './HttpClientExporterTransport.js';

function getSharedConfigurationDefaults(): OtlpSharedConfiguration {
  return {
    timeoutMillis: 10000,
    concurrencyLimit: 30,
    compression: 'none',
  };
}

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

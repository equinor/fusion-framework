import type { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';

import { JsonLogsSerializer } from '@opentelemetry/otlp-transformer';

import {
  createOtlpNetworkExportDelegate,
  OTLPExporterBase,
  type OtlpSharedConfiguration,
} from '@opentelemetry/otlp-exporter-base';

import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import { HttpClientExporterTransport } from './HttpClientExporterTransport.js';

/**
 * Returns shared default OTLP exporter configuration values.
 *
 * @returns Default timeout, concurrency limit, and compression settings.
 */
function getSharedConfigurationDefaults(): OtlpSharedConfiguration {
  return {
    timeoutMillis: 10000,
    concurrencyLimit: 30,
    compression: 'none',
  };
}

/**
 * OTLP log exporter that uses a Fusion `IHttpClient` as its HTTP transport.
 *
 * @remarks
 * Extends `OTLPExporterBase` and substitutes the default `fetch`-based transport
 * with {@link HttpClientExporterTransport}, routing log record payloads
 * through the Fusion HTTP module’s configured client (which may include
 * authentication headers, interceptors, and service‑discovery routing).
 *
 * Typically used with {@link FusionAnalyticsAdapter} when the portal provides
 * an HTTP client via service discovery.
 *
 * @example
 * ```ts
 * import { FusionOTLPLogExporter } from '@equinor/fusion-framework-module-analytics/logExporters';
 *
 * const httpClient = await serviceDiscovery.createClient('analytics');
 * const exporter = new FusionOTLPLogExporter(httpClient);
 * ```
 */
export class FusionOTLPLogExporter
  extends OTLPExporterBase<ReadableLogRecord[]>
  implements LogRecordExporter
{
  /**
   * @param httpClient - A Fusion `IHttpClient` used for outbound HTTP transport.
   */
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

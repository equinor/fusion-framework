import { ProxyTracerProvider, trace, type Span } from '@opentelemetry/api';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchSpanProcessor, WebTracerProvider } from '@opentelemetry/sdk-trace-web';

/**
 * Tags browser spans with the current app route without coupling tracing to app initialization.
 * @param span - Document or HTTP span being created by browser instrumentation.
 */
function annotateSpan(span: Span): void {
  const appKey = window.location.pathname.match(/^\/apps\/([^/]+)/)?.[1];
  span.setAttribute('source', appKey ? 'app' : 'framework');
  // Framework requests outside an app route must not acquire a misleading app identity.
  if (appKey) {
    span.setAttribute('fusion.app.key', decodeURIComponent(appKey));
  }
}

/**
 * Connects browser requests and logs to backend traces during development.
 *
 * Uses standard fetch/XHR instrumentation, W3C traceparent/tracestate propagation and
 * a zone context manager to preserve active spans across callbacks and promise chains.
 * Document-load instrumentation continues a server trace supplied in a traceparent meta tag.
 * Existing global tracing providers are never overwritten.
 *
 * @param endpoint - Absolute same-origin dev-server OTLP traces route.
 * @returns The installed provider, or undefined when tracing was already configured.
 * @example
 * ```ts
 * enableDevServerTracing('http://localhost:3000/@fusion-telemetry/v1/traces');
 * ```
 */
export function enableDevServerTracing(endpoint: string): WebTracerProvider | undefined {
  const existing = trace.getTracerProvider();
  // Application-owned global tracing must remain authoritative.
  if (
    !(existing instanceof ProxyTracerProvider) ||
    existing.getDelegateTracer('fusion.dev-server')
  ) {
    return undefined;
  }
  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({ 'service.name': 'fusion.dev-server' }),
    spanProcessors: [
      // Page-load bursts should share requests rather than exhaust exporter concurrency.
      new BatchSpanProcessor(new OTLPTraceExporter({ url: endpoint, timeoutMillis: 5_000 }), {
        scheduledDelayMillis: 1_000,
        maxExportBatchSize: 128,
        maxQueueSize: 2_048,
      }),
    ],
  });
  provider.register({
    contextManager: new ZoneContextManager(),
    propagator: new W3CTraceContextPropagator(),
  });
  const ignoreUrls = [
    /\/@fusion-telemetry\//,
    /\/@vite\//,
    /\/@id\//,
    /\/@fs\//,
    /\/node_modules\//,
  ];
  const fetchInstrumentation = new FetchInstrumentation({
    enabled: false,
    ignoreUrls,
    requestHook: annotateSpan,
  });
  const xhrInstrumentation = new XMLHttpRequestInstrumentation({
    enabled: false,
    ignoreUrls,
    applyCustomAttributesOnSpan: annotateSpan,
  });
  const documentInstrumentation = new DocumentLoadInstrumentation({
    enabled: false,
    applyCustomAttributesOnSpan: {
      documentLoad: annotateSpan,
      documentFetch: annotateSpan,
    },
  });
  // Bind instruments before enabling so startup requests use this provider immediately.
  for (const instrumentation of [
    fetchInstrumentation,
    xhrInstrumentation,
    documentInstrumentation,
  ]) {
    instrumentation.setTracerProvider(provider);
    instrumentation.enable();
  }
  return provider;
}

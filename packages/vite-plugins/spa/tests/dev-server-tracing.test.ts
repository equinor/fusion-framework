// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { context, propagation, ROOT_CONTEXT, trace } from '@opentelemetry/api';
import { otperformance } from '@opentelemetry/core';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import { enableTelemetry, type TelemetryModule } from '@equinor/fusion-framework-module-telemetry';
import { enableDevServerTracing } from '../src/html/enable-dev-server-tracing.js';
import { OtlpAdapter } from '@equinor/fusion-framework-module-telemetry/otlp-adapter';

const providers: WebTracerProvider[] = [];

beforeEach(() => {
  // Unit tests isolate context handling from actual browser networking and navigation timing.
  vi.spyOn(FetchInstrumentation.prototype, 'enable').mockImplementation(() => {});
  vi.spyOn(XMLHttpRequestInstrumentation.prototype, 'enable').mockImplementation(() => {});
  vi.spyOn(DocumentLoadInstrumentation.prototype, 'enable').mockImplementation(() => {});
  vi.spyOn(OTLPTraceExporter.prototype, 'export').mockImplementation((_spans, callback) =>
    callback({ code: 0 }),
  );
});

afterEach(async () => {
  // Restore global APIs so app-owned and dev-owned provider cases remain independent.
  for (const provider of providers.splice(0)) {
    await provider.shutdown();
  }
  context.disable();
  propagation.disable();
  trace.disable();
  vi.restoreAllMocks();
});

describe('dev-server distributed tracing', () => {
  it('continues a backend document trace from the HTML traceparent meta tag', async () => {
    document.head.innerHTML =
      '<meta name="traceparent" content="00-11111111111111111111111111111111-2222222222222222-01">';
    const navigation: PerformanceEntry & Partial<PerformanceNavigationTiming> = {
      name: 'http://localhost/apps/example-app',
      entryType: 'navigation',
      startTime: 0,
      duration: 10,
      fetchStart: 1,
      responseEnd: 5,
      loadEventEnd: 10,
      toJSON: () => ({}),
    };
    vi.spyOn(otperformance, 'getEntriesByType').mockImplementation((type) =>
      type === 'navigation' ? [navigation] : [],
    );
    const provider = enableDevServerTracing('http://localhost/@fusion-telemetry/v1/traces');
    // Fail explicitly if the test is running against a no-op provider.
    if (!provider) {
      throw new Error('Expected dev-server tracing to register');
    }
    providers.push(provider);
    const documentInstrumentation = new DocumentLoadInstrumentation({ enabled: false });
    documentInstrumentation.setTracerProvider(provider);
    vi.mocked(DocumentLoadInstrumentation.prototype.enable).mockRestore();
    documentInstrumentation.enable();
    window.dispatchEvent(new Event('load'));
    await vi.waitFor(async () => {
      // Document-load instrumentation finishes asynchronously before spans can be flushed.
      await provider.forceFlush();
      const spans = vi
        .mocked(OTLPTraceExporter.prototype.export)
        .mock.calls.flatMap(([spans]) => spans);
      // Identify the document root separately from its resource and fetch children.
      const documentSpan = spans.find((span) => span.name === 'documentLoad');
      expect(documentSpan?.spanContext().traceId).toBe('11111111111111111111111111111111');
      expect(documentSpan?.parentSpanContext?.spanId).toBe('2222222222222222');
    });
    documentInstrumentation.disable();
    document.head.innerHTML = '';
  });

  it('keeps an application-owned tracer provider instead of registering twice', () => {
    const existing = new WebTracerProvider();
    providers.push(existing);
    existing.register();
    expect(enableDevServerTracing('http://localhost/@fusion-telemetry/v1/traces')).toBeUndefined();
    expect(FetchInstrumentation.prototype.enable).not.toHaveBeenCalled();
  });

  it('shares trace context between outgoing headers, incoming backend context, and async app logs', async () => {
    const send = vi
      .spyOn(OTLPLogExporter.prototype, 'export')
      .mockImplementation((_records, callback) => callback({ code: 0 }));
    const provider = enableDevServerTracing('http://localhost/@fusion-telemetry/v1/traces');
    // Missing registration would otherwise make the correlation assertions pass with no-op spans.
    if (!provider) {
      throw new Error('Expected dev-server tracing to register');
    }
    providers.push(provider);
    const adapter = new OtlpAdapter({ url: 'http://localhost/@fusion-telemetry/v1/logs' });
    const configuration = new ModulesConfigurator();
    enableTelemetry(configuration, {
      configure: (builder) => {
        builder.setAdapter('otlp', adapter);
        builder.setMetadata(async () => ({ fusion: { app: { key: 'example-app' } } }));
      },
    });
    const modules = await configuration.initialize<[TelemetryModule]>();
    const received = vi.fn();
    const subscription = modules.telemetry.items.subscribe(received);
    const incoming = propagation.extract(ROOT_CONTEXT, {
      traceparent: '00-11111111111111111111111111111111-2222222222222222-01',
      tracestate: 'backend=test',
    });
    const span = provider
      .getTracer('correlation-test')
      .startSpan('frontend operation', {}, incoming);
    const headers: Record<string, string> = {};
    context.with(trace.setSpan(incoming, span), () => {
      propagation.inject(context.active(), headers);
      modules.telemetry.trackEvent({ name: 'frontend log' });
    });
    // Metadata resolves asynchronously before the record enters the batch queue.
    await vi.waitFor(() => expect(received).toHaveBeenCalledTimes(1));
    await adapter.forceFlush();
    expect(send).toHaveBeenCalledTimes(1);
    const [record] = send.mock.calls[0][0];
    expect(record.spanContext?.traceId).toBe('11111111111111111111111111111111');
    expect(record.spanContext?.spanId).toBe(span.spanContext().spanId);
    expect(headers.traceparent).toBe(
      `00-${span.spanContext().traceId}-${span.spanContext().spanId}-01`,
    );
    expect(headers.tracestate).toBe('backend=test');
    const backendContext = trace.getSpanContext(propagation.extract(ROOT_CONTEXT, headers));
    expect(backendContext?.traceId).toBe(record.spanContext?.traceId);
    expect(backendContext?.spanId).toBe(record.spanContext?.spanId);
    expect(backendContext?.isRemote).toBe(true);
    expect(record.attributes['fusion.app.key']).toBe('example-app');
    span.end();
    await provider.forceFlush();
    expect(OTLPTraceExporter.prototype.export).toHaveBeenCalled();
    expect(FetchInstrumentation.prototype.enable).toHaveBeenCalledTimes(1);
    expect(XMLHttpRequestInstrumentation.prototype.enable).toHaveBeenCalledTimes(1);
    expect(DocumentLoadInstrumentation.prototype.enable).toHaveBeenCalledTimes(1);
    expect(enableDevServerTracing('http://localhost/@fusion-telemetry/v1/traces')).toBeUndefined();
    await adapter.shutdown();
    subscription.unsubscribe();
  });
});

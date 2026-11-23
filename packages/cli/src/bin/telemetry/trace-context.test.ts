import { afterEach, describe, expect, it } from 'vitest';

import { telemetryExportRequest } from '@equinor/fusion-framework-module';

import { setInvocationTraceContext } from './set-invocation-trace-context.js';
import { traceRequest } from './trace-request.js';

const context = { traceId: '0af7651916cd43dd8448eb211c80319c', spanId: 'b7ad6b7169203331' };

afterEach(() => setInvocationTraceContext(undefined));

describe('traceRequest', () => {
  it('parents Fusion requests on the invocation request', () => {
    setInvocationTraceContext(context);
    const request = traceRequest({ headers: { accept: 'application/json' } });

    const headers = new Headers(request.headers);
    expect(headers.get('traceparent')).toBe(`00-${context.traceId}-${context.spanId}-01`);
    expect(headers.get('accept')).toBe('application/json');
  });

  it('leaves requests untouched without an invocation, for exporter traffic or existing traces', () => {
    const plain = { headers: {} };
    expect(traceRequest(plain)).toBe(plain);

    setInvocationTraceContext(context);
    const exporter = { headers: {}, [telemetryExportRequest]: true };
    expect(traceRequest(exporter)).toBe(exporter);
    const traced = { headers: { traceparent: '00-existing' } };
    expect(traceRequest(traced)).toBe(traced);
  });
});

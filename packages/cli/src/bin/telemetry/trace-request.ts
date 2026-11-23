import { telemetryExportRequest } from '@equinor/fusion-framework-module';

import { getInvocationTraceContext } from './get-invocation-trace-context.js';

/**
 * Adds a W3C `traceparent` header that joins an outgoing request to the CLI invocation, so
 * service-side records share the invocation's `operation_Id`.
 *
 * Requests marked as telemetry exports are left untouched so exporter traffic is never traced,
 * and an existing `traceparent` is kept. Without an active invocation the request is unchanged.
 *
 * @template TRequest - Request shape carrying an optional `headers` init.
 * @param request - Outgoing request processed by the HTTP module.
 * @returns The request, with `traceparent` when it joins the invocation.
 */
export const traceRequest = <TRequest extends { headers?: HeadersInit }>(
  request: TRequest,
): TRequest => {
  const context = getInvocationTraceContext();
  // Opted-out invocations and exporter traffic must not propagate a CLI trace.
  if (!context || telemetryExportRequest in request) {
    return request;
  }
  const headers = new Headers(request.headers);
  // Keep a parent supplied by the caller rather than replacing its trace.
  if (headers.has('traceparent')) {
    return request;
  }
  // The invocation request is the parent, so service requests nest under it in the trace.
  headers.set('traceparent', `00-${context.traceId}-${context.spanId}-01`);
  return { ...request, headers };
};

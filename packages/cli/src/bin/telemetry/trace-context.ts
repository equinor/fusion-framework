import { randomBytes } from 'node:crypto';

import { telemetryExportRequest } from '@equinor/fusion-framework-module';

/** W3C trace identity of the current CLI invocation. */
export interface InvocationTraceContext {
  /** 32 lowercase hex characters; exported as the invocation's `operation_Id`. */
  traceId: string;
  /** 16 lowercase hex characters; id of the invocation request and parent of outgoing requests. */
  spanId: string;
}

let current: InvocationTraceContext | undefined;

/**
 * Creates a random W3C trace identity for one invocation.
 * @returns A fresh trace id and root span id.
 */
export const createInvocationTraceContext = (): InvocationTraceContext => ({
  traceId: randomBytes(16).toString('hex'),
  spanId: randomBytes(8).toString('hex'),
});

/**
 * Sets, or clears with `undefined`, the trace identity that outgoing Fusion requests join.
 * The CLI sets it only while telemetry is enabled, so opted-out runs send no `traceparent`.
 *
 * @param context - Trace identity of the running invocation.
 */
export const setInvocationTraceContext = (context: InvocationTraceContext | undefined): void => {
  current = context;
};

/**
 * Returns the trace identity of the running invocation, when telemetry is enabled.
 * @returns The trace identity, or `undefined`.
 */
export const getInvocationTraceContext = (): InvocationTraceContext | undefined => current;

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
  const context = current;
  if (!context || telemetryExportRequest in request) {
    return request;
  }
  const headers = new Headers(request.headers);
  if (headers.has('traceparent')) {
    return request;
  }
  // The invocation request is the parent, so service requests nest under it in the trace.
  headers.set('traceparent', `00-${context.traceId}-${context.spanId}-01`);
  return { ...request, headers };
};

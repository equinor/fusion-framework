/** W3C trace identity of the current CLI invocation. */
export interface InvocationTraceContext {
  /** 32 lowercase hex characters; exported as the invocation's `operation_Id`. */
  traceId: string;
  /** 16 lowercase hex characters; id of the invocation request and parent of outgoing requests. */
  spanId: string;
}

interface InvocationTraceState {
  current?: InvocationTraceContext;
}

/** Shared trace state used by the invocation lifecycle and outgoing request handler. */
export const invocationTraceState: InvocationTraceState = {};

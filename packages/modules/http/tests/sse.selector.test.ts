import { describe, it, expect } from 'vitest';
import { ServerSentEventResponseError } from '../src/errors.js';
import { createSseSelector } from '../src/lib/selectors/sse-selector.js'; // Adjust the import path as needed
import { of, lastValueFrom } from 'rxjs';
import { concatMap, scan } from 'rxjs/operators';
import { set } from 'zod';

// Helper to create a mock Response
function createMockResponse(
  bodyChunks: (Uint8Array | null)[],
  headers: Record<string, string> = { 'Content-Type': 'text/event-stream' },
  status = 200,
): Response {
  const body = new ReadableStream({
    start(controller) {
      for (const chunk of bodyChunks) {
        if (chunk === null) {
          controller.close();
          break;
        }
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
  return new Response(body, { status, headers });
}

describe('createSseSelector', () => {
  it('emits parsed events from a valid SSE response', async () => {
    const chunks = [new Uint8Array(new TextEncoder().encode('data: {"key": "value"}\n\n'))];
    const response = createMockResponse(chunks);
    const selector = createSseSelector();
    const events = await lastValueFrom(
      of(response).pipe(
        concatMap(selector),
        scan((acc, event) => [...acc, event], [] as any[]),
      ),
    );
    expect(events).toEqual([{ data: { key: 'value' } }]);
  });

  it('throws on non-200 response', () => {
    const response = createMockResponse([], {}, 500);
    const selector = createSseSelector();

    expect(() => selector(response)).toThrowError(
      new ServerSentEventResponseError('HTTP error! Status: 500', response),
    );
  });

  it('throws on missing body', () => {
    const response = new Response(null, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
    const selector = createSseSelector();

    expect(() => selector(response)).toThrowError(
      new ServerSentEventResponseError('Response body is not readable', response),
    );
  });

  it('throws on invalid Content-Type', () => {
    const response = createMockResponse([], { 'Content-Type': 'application/json' });
    const selector = createSseSelector();

    expect(() => selector(response)).toThrowError(
      new ServerSentEventResponseError('Response is not a text/event-stream', response),
    );
  });

  it('filters events by event type', async () => {
    const chunks = [
      new Uint8Array(new TextEncoder().encode('event: message\ndata: {"key": "value"}\n\n')),
      new Uint8Array(new TextEncoder().encode('event: other\ndata: {"other": "data"}\n\n')),
    ];
    const response = createMockResponse(chunks);
    const selector = createSseSelector({ eventFilter: 'message' });
    const events = await lastValueFrom(
      of(response).pipe(
        concatMap(selector),
        scan((acc, event) => [...acc, event], [] as any[]),
      ),
    );

    expect(events).toEqual([{ event: 'message', data: { key: 'value' } }]);
  });

  it('skips heartbeat events when skipHeartbeats is true', async () => {
    const chunks = [
      new Uint8Array(new TextEncoder().encode(':heartbeat\n\n')), // Heartbeat
      new Uint8Array(new TextEncoder().encode('event: heartbeat\n\n')), // Heartbeat
      new Uint8Array(new TextEncoder().encode('event: ping\n\n')), // Heartbeat
      new Uint8Array(new TextEncoder().encode('data: {"key": "value"}\n\n')),
    ];
    const response = createMockResponse(chunks);
    const selector = createSseSelector({ skipHeartbeats: true });
    const events = await lastValueFrom(
      of(response).pipe(
        concatMap(selector),
        scan((acc, event) => [...acc, event], [] as any[]),
      ),
    );

    expect(events).toEqual([{ data: { key: 'value' } }]);
  });

  it('retries on retry event with specified delay', async () => {
    const chunks = [
      new Uint8Array(new TextEncoder().encode('data: {"foo": "value1"}\n\n')),
      new Uint8Array(new TextEncoder().encode('retry: 100\n\n')),
      new Uint8Array(new TextEncoder().encode('data: {"bar": "value2"}\n\n')),
    ];
    const response = createMockResponse(chunks);
    const selector = createSseSelector();

    const events = await lastValueFrom(
      of(response).pipe(
        concatMap(selector),
        scan((acc, event) => [...acc, event], [] as any[]),
      ),
    );

    expect(events).toEqual([{ data: { foo: 'value1' } }, { data: { bar: 'value2' } }]);
  });

  it('stops on abort signal', async () => {
    const abortController = new AbortController();
    const chunks = [
      new Uint8Array(new TextEncoder().encode('data: {"key": "value"}\n\n')),
      new Uint8Array(new TextEncoder().encode('retry: 100\n\n')),
      new Uint8Array(new TextEncoder().encode('data: {"next": "event"}\n\n')),
    ];
    const response = createMockResponse(chunks);
    const selector = createSseSelector({ abortSignal: abortController.signal });
    const eventsPromise = lastValueFrom(
      of(response).pipe(
        concatMap(selector),
        scan((acc, event) => [...acc, event], [] as any[]),
      ),
    );

    await new Promise((resolve) => setTimeout(resolve, 50));
    abortController.abort();

    const events = await eventsPromise;

    expect(events).toEqual([{ data: { key: 'value' } }]);
  });
});

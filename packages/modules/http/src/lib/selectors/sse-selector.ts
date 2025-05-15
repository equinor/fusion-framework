import { EMPTY, from, fromEvent, type Observable } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import type { ResponseSelector } from '../client/types.js';
import { ServerSentEventResponseError } from '../../errors.js';

/**
 * A type representing a function that parses a string into a specific data type.
 *
 * @typeParam TData - The type of the parsed data. Defaults to `unknown` if not specified.
 * @param data - The string input to be parsed.
 * @returns The parsed data of type `TData`.
 */
export type DataParser<TData = unknown> = (data: string) => TData;

const defaultDataParser: DataParser = (data: string) => {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

/**
 * Represents a Server-Sent Event (SSE) with optional fields.
 */
export type ServerSentEvent<TData = unknown> = {
  id?: string;
  event?: string;
  data?: TData;
  retry?: string;
};

/**
 * Parses a string containing Server-Sent Events (SSE) data into individual event objects.
 *
 * @template TData - The type of the parsed `data` field in the event.
 * @param text - The raw SSE data as a string, where events are separated by double newlines.
 * @param options - Optional configuration for parsing the events.
 * @param options.dataParser - A custom parser function for the `data` field. Defaults to JSON parsing,
 *                             falling back to returning the raw string if parsing fails.
 *
 * @returns A generator that yields `ServerSentEvent` objects parsed from the input string.
 *
 * @remarks
 * - Empty lines and events with no fields are ignored.
 * - If the `data` field cannot be parsed as JSON, it is returned as a plain string.
 * - Fields other than `data` are stored as strings in the resulting `ServerSentEvent` object.
 *
 * @example
 * ```typescript
 * const sseData = `
 * id: 1
 * event: message
 * data: {"key":"value"}
 *
 * id: 2
 * event: update
 * data: plain text
 * `;
 *
 * for (const event of parseEvents(sseData)) {
 *   console.log(event);
 * }
 * // Output:
 * // { id: "1", event: "message", data: { key: "value" } }
 * // { id: "2", event: "update", data: "plain text" }
 * ```
 */
function* parseEvents<TData = unknown>(
  text: string,
  options?: { dataParser?: DataParser<TData> },
): Generator<ServerSentEvent<TData>> {
  // Split the input string into individual event strings using double newline as separator
  const eventStrings = text.split('\n\n');

  const dataParser = options?.dataParser || (defaultDataParser as DataParser<TData>);

  // Iterate through each event string
  for (const eventStr of eventStrings) {
    // Skip empty event strings (after trimming whitespace)
    if (!eventStr.trim()) continue;

    // Split the event string into lines (fields) using single newline
    const lines = eventStr.split('\n');

    // Use reduce to process each line in the event string
    const event = lines.reduce(
      (event, line) => {
        // Skip empty lines
        if (!line) return event;

        // Find the index of the first colon, which separates field name and value
        const colonIndex = line.indexOf(':');

        // Skip lines without a colon (invalid format)
        if (colonIndex === -1) return event;

        // Extract the field name (before colon) and trim whitespace
        const field = line.slice(0, colonIndex).trim();
        // Extract the field value (after colon) and trim whitespace
        const value = line.slice(colonIndex + 1).trim();

        // Handle the 'data' field specially, attempting JSON parsing
        if (field === 'data') {
          event.data = dataParser(value);
        } else {
          // For non-data fields, assign the value as a string to the event object
          (event as Record<string, unknown>)[field] = value;
        }

        return event;
      },
      {} as ServerSentEvent<TData>,
    );

    // Only emit the event to the results if it has at least one field
    if (Object.keys(event).length) {
      yield event;
    }
  }
}

async function* readStream<TData>(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  options?: {
    dataParser?: DataParser<TData>;
    skipHeartbeats?: boolean;
    eventFilter?: string | string[];
  },
): AsyncGenerator<ServerSentEvent<TData>> {
  const skipHeartbeats = !!options?.skipHeartbeats;

  const eventFilter = options?.eventFilter
    ? Array.isArray(options.eventFilter)
      ? options.eventFilter
      : [options.eventFilter]
    : null;

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    const text = decoder.decode(value, { stream: true });
    const events = parseEvents<TData>(text, { dataParser: options?.dataParser });
    for (const event of events) {
      if (event.retry) {
        await new Promise((resolve) =>
          setTimeout(resolve, Number.parseInt(event.retry ?? '300', 10)),
        );
        continue;
      }
      if (skipHeartbeats) {
        // Skip comment-based heartbeats (no event, data, or id)
        if (!event.event && !event.data && !event.id) {
          continue;
        }
        // Skip named heartbeat events (e.g., event: heartbeat or event: ping)
        if (event.event && ['heartbeat', 'ping'].includes(event.event)) {
          continue;
        }
      }
      if (!eventFilter || (event.event && eventFilter.includes(event.event))) {
        yield event as ServerSentEvent<TData>;
      }
    }
  }
}

/**
 * Options for configuring the SSE (Server-Sent Events) selector.
 */
export type SseSelectorOptions<TData = unknown> = {
  dataParser?: DataParser<TData>;
  /**
   * A string or an array of strings specifying the events to filter.
   * Only events matching the filter will be processed. If not provided,
   * all events will be processed.
   */
  eventFilter?: string | string[];

  /**
   * A boolean indicating whether to skip processing heartbeat events.
   * Defaults to `false` if not specified.
   */
  skipHeartbeats?: boolean;

  /**
   * An `AbortSignal` that can be used to abort the SSE operation.
   * Useful for managing the lifecycle of the SSE connection.
   */
  abortSignal?: AbortSignal | null;
};

/**
 * A type alias for selecting and transforming Server-Sent Events (SSE) from an HTTP response.
 *
 * @template TData - The type of the data contained within the Server-Sent Event. Defaults to `unknown`.
 * @template TResponse - The type of the HTTP response object. Defaults to `Response`.
 *
 * This selector is used to process and extract `ServerSentEvent<TData>` objects
 * from an HTTP `Response` object, enabling custom handling of SSE data streams.
 */
export type SseSelector<TData = unknown, TResponse extends Response = Response> = ResponseSelector<
  ServerSentEvent<TData>,
  TResponse
>;

/**
 * Transforms an SSE response into an Observable stream of parsed events.
 * @param response - The HTTP response with Content-Type: text/event-stream.
 * @param options - Optional configuration for event filtering and heartbeat handling.
 * @param options.eventFilter - Filter events by type (single string or array).
 * @param options.skipHeartbeats - Skip empty/heartbeat events if true.
 * @param options.dataParser - Custom parser for the data field.
 * @param options.abortSignal - Abort signal to cancel the stream.
 * @returns An Observable emitting parsed ServerSentEvent objects.
 * @throws ServerSentEventResponseError if response is invalid or stream fails.
 */
export const createSseSelector = <TData = unknown, TResponse extends Response = Response>(
  options?: SseSelectorOptions<TData>,
): SseSelector<TData, TResponse> => {
  return (response: TResponse): Observable<ServerSentEvent<TData>> => {
    if (!response.ok) {
      throw new ServerSentEventResponseError(`HTTP error! Status: ${response.status}`, response);
    }

    if (!response.body) {
      throw new ServerSentEventResponseError('Response body is not readable', response);
    }

    if (!response.headers.get('Content-Type')?.includes('text/event-stream')) {
      throw new ServerSentEventResponseError('Response is not a text/event-stream', response);
    }

    const reader = response.body.getReader();

    return from(
      readStream<TData>(reader, {
        dataParser: options?.dataParser,
        skipHeartbeats: options?.skipHeartbeats,
        eventFilter: options?.eventFilter,
      }),
    ).pipe(
      // Stop reading if the abort signal is triggered
      takeUntil(options?.abortSignal ? fromEvent(options.abortSignal, 'abort') : EMPTY),
      finalize(async () => {
        // cancel just in case of a pre-mature exit
        await reader.cancel().catch(() => {
          /** ignore cancellation errors */
        });
        reader.releaseLock();
      }),
    );
  };
};

export default createSseSelector;

import type { OperatorFunction } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  createSseSelector,
  type ServerSentEvent,
  type SseSelectorOptions,
} from '../selectors/sse-selector';

/**
 * An operator function for handling Server-Sent Events (SSE) in an RxJS pipeline.
 *
 * @template R - The type of the parsed data from the SSE.
 * @template T - The type of the input `Response` object, defaults to `Response`.
 *
 * @param options - Configuration options for the SSE selector.
 *
 * @returns An `OperatorFunction` that transforms a stream of `Response` objects
 * into a stream of `ServerSentEvent` objects containing parsed data of type `R`.
 *
 * @example
 * ```typescript
 * import { sseMap } from '@equinor/fusion-framework-module-http/operators';
 * import { fromFetch } from 'rxjs/fetch';
 *
 * const response$ = fromFetch('https://example.com/sse', {
 *   method: 'GET',
 *   headers: {
 *     'Accept': 'text/event-stream',
 *   },
 * }).pipe(
 *   sseMap( { /* SSE selector options *\/ })
 * ).subscribe((event) => {
 *   console.log(event.data); // Process the parsed SSE data
 * });
 * ```
 */
export const sseMap =
  <R = unknown, T extends Response = Response>(
    options?: SseSelectorOptions<R>,
  ): OperatorFunction<T, ServerSentEvent<R>> =>
  (source) =>
    source.pipe(switchMap(createSseSelector<R, T>(options)));

export default sseMap;

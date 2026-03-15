import { filter } from 'rxjs';
import type { FrameworkEventMap, IFrameworkEvent } from './event';

/**
 * Creates an RxJS `filter` operator that narrows the observable stream to a
 * specific registered event type from {@link FrameworkEventMap}.
 *
 * Use this with `event$` to subscribe to a single event type while
 * preserving the concrete event type in the resulting observable.
 *
 * @template TType - A registered event name from {@link FrameworkEventMap}.
 * @param type - The event name to filter for.
 * @returns An RxJS operator that passes only events matching `type`.
 *
 * @example
 * ```ts
 * provider.event$.pipe(
 *   filterEvent('onModulesLoaded'),
 * ).subscribe((event) => {
 *   // event is typed as FrameworkEventMap['onModulesLoaded']
 *   console.log(event.detail);
 * });
 * ```
 */
export const filterEvent = <TType extends keyof FrameworkEventMap>(type: TType) =>
  filter((x: IFrameworkEvent): x is FrameworkEventMap[TType] => x.type === type);

export default filterEvent;

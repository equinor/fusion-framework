import { useEffect } from 'react';

import type {
  FrameworkEventMap,
  FrameworkEventHandler,
  FrameworkEvent,
  IFrameworkEvent,
} from '@equinor/fusion-framework-module-event';

import { useEventProvider } from './useEventProvider';

/**
 * hook for subscribing to framework events
 *
 * @template TKey name of the event to subscribe too
 * @template TType event type
 */
export interface useEventHandler<
  TKey extends keyof FrameworkEventMap = keyof FrameworkEventMap,
  TType extends IFrameworkEvent = FrameworkEventMap[TKey],
> {
  (key: TKey, cb: FrameworkEventHandler<TType>): void;
  (key: string, cb: FrameworkEventHandler<TType>): void;
}

/**
 * Hook for subscribing to framework events.
 *
 * @param name - Name of the event to subscribe to
 * @param cb - Callback invoked with the event when it is dispatched
 */
export const useEventHandler: useEventHandler = <
  TType extends FrameworkEvent = FrameworkEvent,
  TKey extends string = keyof FrameworkEventMap,
>(
  name: TKey,
  cb: TKey extends keyof FrameworkEventMap
    ? FrameworkEventHandler<FrameworkEventMap[TKey]>
    : FrameworkEventHandler<TType>,
): void => {
  const provider = useEventProvider();
  useEffect(() => provider.addEventListener(name, cb), [provider, name, cb]);
};

export default useEventHandler;

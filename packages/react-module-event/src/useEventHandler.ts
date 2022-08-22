import { useModule } from '@equinor/fusion-framework-react-module';
import {
    eventModuleKey,
    FrameworkEventMap,
    IEventModuleProvider,
    FrameworkEventHandler,
    FrameworkEvent,
    IFrameworkEvent,
} from '@equinor/fusion-framework-module-event';
import { useEffect } from 'react';

export interface useEventHandler<
    TKey extends keyof FrameworkEventMap = keyof FrameworkEventMap,
    TType extends IFrameworkEvent = FrameworkEventMap[TKey]
> {
    (key: TKey, cb: FrameworkEventHandler<TType>): void;
    (key: string, cb: FrameworkEventHandler<TType>): void;
}

export const useEventHandler: useEventHandler = <
    TType extends FrameworkEvent = FrameworkEvent,
    TKey extends string = keyof FrameworkEventMap
>(
    name: TKey,
    cb: TKey extends keyof FrameworkEventMap
        ? FrameworkEventHandler<FrameworkEventMap[TKey]>
        : FrameworkEventHandler<TType>
): void => {
    const module = useModule<{ [eventModuleKey]: IEventModuleProvider }>(eventModuleKey);
    useEffect(
        () =>
            module.addEventListener<TType>(
                name as unknown as string,
                cb as unknown as FrameworkEventHandler<TType>
            ),
        [name, cb]
    );
};

export default useEventHandler;
